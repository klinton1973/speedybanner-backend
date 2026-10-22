// POST /webhook/square — Square's counterpart of the Stripe webhook (raw body is set up in server.js).
//
// Subscribe the Square webhook to: payment.updated, dispute.created.
//   payment.updated  safety net: if a charge succeeded but our server died before saving it,
//                    this still marks the order paid and sends the emails.
//   dispute.created  emails you right away — Square gives only about 7 days to respond.

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { finalizePaidOrder } = require('./webhook');
const { verifyWebhookSignature } = require('../lib/square-api');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', async (req, res) => {
  if (!verifyWebhookSignature(req.body, req.headers['x-square-hmacsha256-signature'])) {
    console.error('Square webhook signature invalid');
    return res.status(400).send('Invalid signature');
  }

  let event;
  try { event = JSON.parse(req.body.toString('utf8')); }
  catch { return res.status(400).send('Bad JSON'); }

  try {
    if (event.type === 'payment.updated' || event.type === 'payment.created') {
      const payment = event.data?.object?.payment;
      if (payment && payment.status === 'COMPLETED' && payment.reference_id) {
        await finalizePaidOrder(payment.reference_id, {
          onlyIfPending: true,
          extraFields: { payment_provider: 'square', square_payment_id: payment.id },
        });
      }
    } else if (event.type === 'dispute.created') {
      await notifyDispute(event.data?.object?.dispute || {});
    }
  } catch (err) {
    console.error('Square webhook handling error:', err);
  }

  res.json({ received: true }); // always 200 once the signature checks out, so Square doesn't retry-storm
});

async function notifyDispute(d) {
  const paymentId = d.disputed_payment?.payment_id;
  let order = null;
  if (paymentId) {
    const { data } = await supabase.from('orders').select('id, order_number, customer_email, site, amount_cents')
      .eq('square_payment_id', paymentId).maybeSingle();
    order = data;
  }
  console.warn('[square] DISPUTE opened:', d.id, 'payment', paymentId, 'due', d.due_at);
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  const amount = d.amount_money ? `$${(d.amount_money.amount / 100).toFixed(2)}` : 'unknown amount';
  const { error } = await resend.emails.send({
    from: 'SpeedyBanner Orders <orders@speedybanner.com>',
    to,
    subject: `⚠️ Square dispute opened — ${amount}${d.due_at ? ` — respond by ${d.due_at}` : ''}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px">
      <h2 style="color:#b91c1c">A customer disputed a Square payment</h2>
      <p><strong>Amount:</strong> ${amount}<br>
      <strong>Reason:</strong> ${d.reason || 'n/a'}<br>
      <strong>Respond by:</strong> ${d.due_at || 'see Square dashboard'}<br>
      <strong>Dispute id:</strong> ${d.id || 'n/a'}<br>
      <strong>Payment id:</strong> ${paymentId || 'n/a'}</p>
      ${order ? `<p><strong>Order:</strong> ${order.order_number ? '#' + order.order_number : order.id} · ${order.site} · ${order.customer_email}<br>
      The order row holds the customer's recorded Terms/artwork approval (time, IP, browser) to use as evidence.</p>` : '<p>No matching order found.</p>'}
      <p>Respond in the Square Dashboard → Disputes. Funds for this payment are held until it resolves.</p></div>`,
  });
  if (error) console.error('Dispute notification email failed:', error);
}

module.exports = router;
