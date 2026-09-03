const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { siteNameFromOrigin } = require('../sites');

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

// POST /checkout/create-payment-intent
// Body: { items, customerEmail, shippingAddress, fileKey, discountCents }
// Returns: { clientSecret, orderId } for paid orders
//          { free: true, orderId }   for $0 coupon orders
router.post('/create-payment-intent', async (req, res) => {
  const { items, customerEmail, shippingAddress, fileKey, discountCents = 0 } = req.body;
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
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      receipt_email: customerEmail,
      metadata: { customerEmail },
    });

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
  try {
    const { buildCustomerEmail, buildAdminEmail, buildAttachmentsForOrder } = require('./webhook');

    await resend.emails.send({
      from: `${order.site || 'SpeedyBanner'} <orders@speedybanner.com>`,
      replyTo: 'info@speedybanner.com',
      to: order.customer_email,
      subject: `Order Confirmed — ${order.site || 'SpeedyBanner'} #${order.id}`,
      html: buildCustomerEmail(order),
    });

    const notifyTo = process.env.NOTIFY_EMAIL;
    if (notifyTo) {
      const attachments = await buildAttachmentsForOrder(order);
      await resend.emails.send({
        from: 'SpeedyBanner Orders <orders@speedybanner.com>',
        to: notifyTo,
        subject: `🖨️ NEW ORDER #${order.id} — [${order.site || 'SpeedyBanner'}] — FREE (coupon) — ${order.customer_email}`,
        html: buildAdminEmail(order),
        attachments,
      });
    }
  } catch (err) {
    console.error('Free order email error:', err);
  }
}

module.exports = router;
