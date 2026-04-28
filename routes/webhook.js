const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /webhook  (raw body set in server.js)
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const { orderId, customerEmail } = pi.metadata;

    try {
      // Mark order paid
      const { data: order, error } = await supabase
        .from('orders')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Confirmation email to customer
      await resend.emails.send({
        from: 'SpeedyBanner <orders@speedybanner.com>',
        to: customerEmail,
        subject: 'Your SpeedyBanner order is confirmed!',
        html: buildCustomerEmail(order),
      });

      // Internal notification
      await resend.emails.send({
        from: 'SpeedyBanner <orders@speedybanner.com>',
        to: process.env.NOTIFY_EMAIL,
        subject: `New order #${order.id} — $${(order.amount_cents / 100).toFixed(2)}`,
        html: buildAdminEmail(order),
      });
    } catch (err) {
      console.error('Post-payment processing error:', err);
      // Still return 200 so Stripe doesn't retry
    }
  }

  res.json({ received: true });
});

function buildCustomerEmail(order) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a3fa8">Order Confirmed!</h2>
      <p>Thanks for your order. We'll start printing right away and ship it overnight.</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Total:</strong> $${(order.amount_cents / 100).toFixed(2)}</p>
      <p><strong>Shipping to:</strong><br>
        ${order.shipping_address?.name}<br>
        ${order.shipping_address?.street}<br>
        ${order.shipping_address?.city}, ${order.shipping_address?.state} ${order.shipping_address?.zip}
      </p>
      <p style="color:#6b7280;font-size:13px">Questions? Reply to this email or visit speedybanner.com</p>
    </div>
  `;
}

function buildAdminEmail(order) {
  return `
    <div style="font-family:sans-serif">
      <h3>New Order #${order.id}</h3>
      <p><strong>Customer:</strong> ${order.customer_email}</p>
      <p><strong>Amount:</strong> $${(order.amount_cents / 100).toFixed(2)}</p>
      <p><strong>Ship to:</strong> ${JSON.stringify(order.shipping_address)}</p>
      <p><strong>Items:</strong> ${JSON.stringify(order.items, null, 2)}</p>
      ${order.file_key ? `<p><strong>File:</strong> ${process.env.R2_PUBLIC_URL}/${order.file_key}</p>` : ''}
    </div>
  `;
}

module.exports = router;
