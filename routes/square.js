// Square checkout — the Square counterpart of routes/checkout.js.
//
// Nothing here runs unless SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID are set, so deploying
// this file changes nothing for live Stripe checkout until those variables exist.
//
// The flow differs from Stripe in one important way. Stripe is two steps (server creates a
// PaymentIntent, browser confirms it). Square is one: the browser tokenizes the card with the
// Web Payments SDK and sends the token here, and this route charges it and replies with the result.
//
//   GET  /checkout/config               which processor the pages should use + public Square ids
//   GET  /checkout/square-saved-cards   masked cards on file for an email
//   POST /checkout/square-pay           charge a card token and create the order

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { siteNameFromOrigin } = require('../sites');
const { PRICES, sendOrderEmails } = require('./checkout');
const { finalizePaidOrder } = require('./webhook');
const sq = require('../lib/square-api');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function requireSquare(req, res, next) {
  if (!sq.isConfigured()) return res.status(503).json({ error: 'Square is not configured' });
  next();
}

// Which processor should the storefront use? One Railway variable flips every site at once,
// provided the pages read this endpoint. Defaults to Stripe.
router.get('/config', (req, res) => {
  const provider = process.env.PAYMENT_PROVIDER === 'square' ? 'square' : 'stripe';
  const out = { provider };
  if (sq.isConfigured() && process.env.SQUARE_APPLICATION_ID) {
    out.square = {
      applicationId: process.env.SQUARE_APPLICATION_ID,
      locationId: process.env.SQUARE_LOCATION_ID,
      environment: sq.squareEnv(),
    };
  }
  res.json(out);
});

router.get('/square-saved-cards', requireSquare, async (req, res) => {
  const email = (req.query.email || '').trim().toLowerCase();
  if (!email) return res.json({ cards: [] });
  try {
    const customer = await sq.findCustomerByEmail(email);
    if (!customer) return res.json({ cards: [] });
    const r = await sq.squareRequest('GET', `/v2/cards?customer_id=${encodeURIComponent(customer.id)}`);
    const cards = (r.data.cards || []).filter(c => c.enabled !== false).map(c => ({
      id: c.id, brand: c.card_brand, last4: c.last_4, expMonth: c.exp_month, expYear: c.exp_year,
    }));
    res.json({ cards });
  } catch (err) {
    console.error('[square] saved-cards lookup error:', err?.message || err);
    res.json({ cards: [] }); // fail soft, same as the Stripe route
  }
});

// Body: { items, customerEmail, shippingAddress, fileKey, discountCents,
//         sourceId, verificationToken, saveCard, savedCardId, termsAccepted, termsVersion }
// Returns: { success: true, orderId, paymentId, receiptUrl }   paid
//          { free: true, orderId }                             $0 coupon order
//          402 { error }                                       card declined / payment failed
router.post('/square-pay', requireSquare, async (req, res) => {
  const { items, customerEmail, shippingAddress, fileKey, discountCents = 0,
          sourceId, verificationToken, saveCard, savedCardId } = req.body;
  const site = siteNameFromOrigin(req.headers.origin);

  // Checkout agreement recorded with the order as dispute evidence (same fields as the Stripe route).
  const termsAcceptedAt = req.body.termsAccepted === true ? new Date().toISOString() : null;
  const termsRecord = {
    terms_accepted_at: termsAcceptedAt,
    terms_version: termsAcceptedAt ? String(req.body.termsVersion || '').slice(0, 40) || null : null,
    terms_ip: termsAcceptedAt ? String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim().slice(0, 64) || null : null,
    terms_user_agent: termsAcceptedAt ? String(req.headers['user-agent'] || '').slice(0, 300) || null : null,
  };
  const termsNote = termsAcceptedAt
    ? `terms accepted ${termsAcceptedAt} (v${termsRecord.terms_version || 'n/a'})`
    : 'terms not recorded';

  if (!items || !Array.isArray(items) || items.length === 0 || !customerEmail) {
    return res.status(400).json({ error: 'items and customerEmail are required' });
  }
  for (const item of items) {
    const rule = PRICES[item.id];
    if (rule && item.totalPrice < rule.min) {
      console.warn(`Price tampering detected: ${item.id} sent $${item.totalPrice}, min is $${rule.min}`);
      return res.status(400).json({ error: 'Invalid item price' });
    }
  }

  const subtotalCents = Math.round(items.reduce((sum, item) => sum + item.totalPrice, 0) * 100);
  const discount = Math.min(Math.round(discountCents), subtotalCents);
  const amount = subtotalCents - discount;

  try {
    // ── Free order (100% coupon) — identical to the Stripe route ────────────
    if (amount === 0) {
      const { data: order, error } = await supabase.from('orders').insert({
        stripe_payment_intent_id: null, payment_provider: 'square', customer_email: customerEmail,
        shipping_address: shippingAddress, items, file_key: fileKey || null, amount_cents: 0,
        status: 'paid', paid_at: new Date().toISOString(), site, ...termsRecord,
      }).select().single();
      if (error) { console.error('[square] free order insert error:', JSON.stringify(error)); throw error; }
      await sendOrderEmails(order);
      return res.json({ free: true, orderId: order.id });
    }

    if (!sourceId) return res.status(400).json({ error: 'sourceId (card token) is required' });

    // ── Saved cards need a Square customer; guests never get one ────────────
    let customerId;
    if (saveCard || savedCardId) {
      customerId = (await sq.findOrCreateCustomer(customerEmail)).id;
    }
    if (savedCardId) {
      // The card id is client-supplied: confirm it belongs to this customer before charging it.
      const c = await sq.squareRequest('GET', `/v2/cards/${encodeURIComponent(savedCardId)}`);
      if (!c.ok || !c.data.card || c.data.card.customer_id !== customerId || c.data.card.enabled === false) {
        console.warn(`[square] rejected savedCardId ${savedCardId} for ${customerEmail}`);
        return res.status(400).json({ error: 'Invalid saved card' });
      }
    }

    // ── Order row first, so every attempt is on record (and abandoned-checkout works) ──
    const { data: order, error: insertError } = await supabase.from('orders').insert({
      stripe_payment_intent_id: null, payment_provider: 'square', customer_email: customerEmail,
      shipping_address: shippingAddress, items, file_key: fileKey || null, amount_cents: amount,
      status: 'pending', site, ...termsRecord,
    }).select().single();
    if (insertError) { console.error('[square] order insert error:', JSON.stringify(insertError)); throw insertError; }

    // ── Charge ──────────────────────────────────────────────────────────────
    const payBody = {
      idempotency_key: `order-${order.id}`,           // a retry of this order can never double-charge
      source_id: sourceId,
      amount_money: { amount, currency: 'USD' },
      location_id: process.env.SQUARE_LOCATION_ID,
      autocomplete: true,
      reference_id: String(order.id).slice(0, 40),   // lets the webhook find the order again
      note: `${site} order ${order.id} | ${termsNote}`.slice(0, 500),
      buyer_email_address: customerEmail,
    };
    if (customerId) payBody.customer_id = customerId;
    if (verificationToken) payBody.verification_token = verificationToken;

    let pay = await sq.squareRequest('POST', '/v2/payments', payBody);
    let payment = pay.data.payment;

    // Buyer verification (3-D Secure) is best effort: if Square rejects the request itself
    // because of the verification token (expired, amount mismatch, malformed) rather than the
    // card being declined, charge once more without it so a verification hiccup never costs a sale.
    if ((!pay.ok || !payment) && verificationToken && (pay.errors || []).some(e => e.category === 'INVALID_REQUEST_ERROR')) {
      console.warn(`[square] retrying order ${order.id} without verification token:`, JSON.stringify(pay.errors));
      const retryBody = { ...payBody, idempotency_key: `order-${order.id}-noverify` };
      delete retryBody.verification_token;
      pay = await sq.squareRequest('POST', '/v2/payments', retryBody);
      payment = pay.data.payment;
    }

    if (!pay.ok || !payment || payment.status !== 'COMPLETED') {
      console.warn(`[square] payment not completed for order ${order.id}:`, JSON.stringify(pay.errors), payment && payment.status);
      return res.status(402).json({ error: sq.friendlyPaymentError(pay.errors) });
    }

    // ── Paid: mark the order and send the same emails the Stripe webhook sends ──
    await finalizePaidOrder(order.id, {
      customerEmail,
      onlyIfPending: true, // the Square webhook may get there first; whichever wins sends the emails once
      extraFields: { square_payment_id: payment.id },
    });

    // Optionally keep the card on file for next time (best effort — never fails the order).
    if (saveCard && customerId && !savedCardId) {
      sq.squareRequest('POST', '/v2/cards', {
        idempotency_key: `card-${order.id}`,
        source_id: payment.id,
        card: { customer_id: customerId },
      }).then(r => { if (!r.ok) console.warn('[square] save card failed:', JSON.stringify(r.errors)); })
        .catch(err => console.warn('[square] save card error:', err?.message || err));
    }

    res.json({ success: true, orderId: order.id, paymentId: payment.id, receiptUrl: payment.receipt_url || null });
  } catch (err) {
    console.error('[square] ERROR:', err?.message || err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

module.exports = router;
