const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { siteNameFromOrigin, replyToForSite } = require('../sites');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Server-side price catalog — minimum floor prices to catch tampering
const PRICES = {
  'vinyl-banner':        { min: 19 },
  'yard-sign':           { min: 14 },
  'retractable-banner':  { min: 69 },
  'table-cover':         { min: 49 },
  'step-repeat':         { min: 89 },
  'car-magnet':          { min: 19 },
  'foam-board':          { min: 24 },
  'corrugated-sign':     { min: 14 },
  'tshirt':              { min: 45 },
  'polo':                { min: 55 },
  'hoodie':              { min: 65 },
  'business-card':       { min:  9 },
  'canvas-print':        { min: 39 },
  'poster':              { min: 12 },
  'window-cling':        { min: 14 },
  'door-hanger':         { min:  9 },
};

// Finds the existing Stripe Customer for an email, or creates one.
// Used only when a customer opts in to saving their card, or is paying with
// one already saved — never created for ordinary guest checkouts.
async function findOrCreateStripeCustomer(email) {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0];
  return stripe.customers.create({ email });
}

// GET /checkout/saved-cards?email=...
// Returns the masked saved cards (if any) for a returning customer, so the
// checkout form can offer "pay with card ending in ####" instead of asking
// them to re-enter their card. Returns an empty list for guests / no match —
// this never reveals whether an email has ever placed an order, only whether
// it has a saved card, which the customer themselves opted into saving.
router.get('/saved-cards', async (req, res) => {
  const email = (req.query.email || '').trim().toLowerCase();
  if (!email) return res.json({ cards: [] });

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) return res.json({ cards: [] });

    const customer = customers.data[0];
    const methods = await stripe.paymentMethods.list({ customer: customer.id, type: 'card' });
    const cards = methods.data.map(pm => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
    }));
    res.json({ cards });
  } catch (err) {
    console.error('[checkout] saved-cards lookup error:', err?.message || err);
    // Fail soft — a lookup error should never block checkout, just fall back to a fresh card
    res.json({ cards: [] });
  }
});

// POST /checkout/create-payment-intent
// Body: { items, customerEmail, shippingAddress, fileKey, discountCents,
//          saveCard, savedPaymentMethodId }
// Returns: { clientSecret, orderId } for paid orders
//          { free: true, orderId }   for $0 coupon orders
router.post('/create-payment-intent', async (req, res) => {
  const { items, customerEmail, shippingAddress, fileKey, discountCents = 0, saveCard, savedPaymentMethodId } = req.body;
  const site = siteNameFromOrigin(req.headers.origin);

  console.log(`[checkout] request from ${customerEmail} on ${site}, items: ${items?.length}, discountCents: ${discountCents}`);

  if (!items || !Array.isArray(items) || items.length === 0 || !customerEmail) {
    return res.status(400).json({ error: 'items and customerEmail are required' });
  }

  // Validate each item's price against server-side minimums
  for (const item of items) {
    const rule = PRICES[item.id];
    if (rule && item.totalPrice < rule.min) {
      console.warn(`Price tampering detected: ${item.id} sent $${item.totalPrice}, min is $${rule.min}`);
      return res.status(400).json({ error: 'Invalid item price' });
    }
  }

  const subtotalCents = Math.round(items.reduce((sum, item) => sum + item.totalPrice, 0) * 100);
  // Cap discount at subtotal so amount never goes negative
  const discount = Math.min(Math.round(discountCents), subtotalCents);
  const amount = subtotalCents - discount;

  try {
    // ── Free order (100% coupon) ─────────────────────────────────────────────
    if (amount === 0) {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          stripe_payment_intent_id: null,
          customer_email: customerEmail,
          shipping_address: shippingAddress,
          items,
          file_key: fileKey || null,
          amount_cents: 0,
          status: 'paid',
          paid_at: new Date().toISOString(),
          site,
        })
        .select()
        .single();

      if (error) { console.error('[checkout] free order insert error:', JSON.stringify(error)); throw error; }
      console.log(`[checkout] free order saved: ${order.id}`);

      // Send emails immediately (no webhook needed for free orders)
      await sendOrderEmails(order);

      return res.json({ free: true, orderId: order.id });
    }

    // ── Paid order ───────────────────────────────────────────────────────────
    // A Stripe Customer is only created when the shopper opts in to saving their
    // card (saveCard) or is paying with one they saved on a prior order
    // (savedPaymentMethodId) — plain guest checkouts never get one.
    let stripeCustomerId;
    if (saveCard || savedPaymentMethodId) {
      const customer = await findOrCreateStripeCustomer(customerEmail);
      stripeCustomerId = customer.id;
    }

    // A saved-card ID is client-supplied, so it must be confirmed to actually
    // belong to this customer before it can be charged — otherwise a forged
    // ID could be used to attempt a charge against a stranger's saved card.
    if (savedPaymentMethodId) {
      const pm = await stripe.paymentMethods.retrieve(savedPaymentMethodId);
      if (pm.customer !== stripeCustomerId) {
        console.warn(`[checkout] rejected savedPaymentMethodId ${savedPaymentMethodId}: not owned by customer for ${customerEmail}`);
        return res.status(400).json({ error: 'Invalid saved card' });
      }
    }

    const paymentIntentParams = {
      amount,
      currency: 'usd',
      receipt_email: customerEmail,
      metadata: { customerEmail },
    };
    if (stripeCustomerId) paymentIntentParams.customer = stripeCustomerId;
    if (saveCard) paymentIntentParams.setup_future_usage = 'off_session';
    if (savedPaymentMethodId) paymentIntentParams.payment_method = savedPaymentMethodId;

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        customer_email: customerEmail,
        shipping_address: shippingAddress,
        items,
        file_key: fileKey || null,
        amount_cents: amount,
        status: 'pending',
        site,
      })
      .select()
      .single();

    if (error) { console.error('[checkout] paid order insert error:', JSON.stringify(error)); throw error; }
    console.log(`[checkout] paid order saved: ${order.id}`);

    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: { customerEmail, orderId: order.id },
    });

    res.json({ clientSecret: paymentIntent.client_secret, orderId: order.id });
  } catch (err) {
    console.error('[checkout] ERROR:', err?.message || err);
    console.error('[checkout] ERROR detail:', JSON.stringify(err));
    res.status(500).json({ error: err?.message || 'Failed to create payment intent' });
  }
});

// Shared email sending used by free orders (paid orders use the webhook)
async function sendOrderEmails(order) {
  const { buildCustomerEmail, buildAdminEmail, buildAttachmentsForOrder } = require('./webhook');

  try {
    const { error } = await resend.emails.send({
      from: `${order.site || 'SpeedyBanner'} <orders@speedybanner.com>`,
      replyTo: replyToForSite(order.site),
      to: order.customer_email,
      subject: `Order Confirmed — ${order.site || 'SpeedyBanner'} #${order.id}`,
      html: buildCustomerEmail(order),
    });
    // The Resend SDK resolves (does not throw) on API-level failures like validation
    // errors — it reports them via this `error` field, so it must be checked explicitly.
    if (error) throw error;
  } catch (err) {
    console.error(`Free order customer email failed for order #${order.id}:`, err);
  }

  const notifyTo = process.env.NOTIFY_EMAIL;
  if (notifyTo) {
    try {
      const attachments = await buildAttachmentsForOrder(order);
      const { error } = await resend.emails.send({
        from: 'SpeedyBanner Orders <orders@speedybanner.com>',
        to: notifyTo,
        subject: `🖨️ NEW ORDER #${order.id} — [${order.site || 'SpeedyBanner'}] — FREE (coupon) — ${order.customer_email}`,
        html: buildAdminEmail(order),
        attachments,
      });
      if (error) throw error;
    } catch (err) {
      console.error(`Free order admin notification failed for order #${order.id}:`, err);
    }
  }
}

module.exports = router;
