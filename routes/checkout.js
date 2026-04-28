const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// POST /checkout/create-payment-intent
// Body: { items, customerEmail, shippingAddress, fileKey }
// Returns: { clientSecret, orderId }
router.post('/create-payment-intent', async (req, res) => {
  const { items, customerEmail, shippingAddress, fileKey } = req.body;

  if (!items || !customerEmail) {
    return res.status(400).json({ error: 'items and customerEmail are required' });
  }

  const amount = Math.round(
    items.reduce((sum, item) => sum + item.totalPrice, 0) * 100
  );

  try {
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
      })
      .select()
      .single();

    if (error) throw error;

    // Store orderId in payment intent metadata for webhook lookup
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: { customerEmail, orderId: order.id },
    });

    res.json({ clientSecret: paymentIntent.client_secret, orderId: order.id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

module.exports = router;
