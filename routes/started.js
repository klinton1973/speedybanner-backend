// Checkout-started tracking.
//
// Until now an `orders` row only existed once the customer pressed "Place Order"
// (routes/square.js inserts it just before charging). Someone who opened checkout,
// typed their details and left was invisible: nothing to count, nobody to remind.
//
//   POST /checkout/opened    the checkout form was opened. Anonymous: site + cart total only.
//                            Stored in `checkout_events`, used for the abandonment count.
//   POST /checkout/started   the customer has typed a valid email address. Saves the cart as an
//                            `orders` row with status 'started' so the abandoned-checkout worker
//                            (routes/abandoned.js) can send its one reminder if they never pay.
//
// Both are fire-and-forget from the page: they always answer quickly, never block checkout,
// and a failure here must never be visible to the customer.
//
// Requires checkout_started_migration.sql.

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { siteNameFromOrigin, allowedOrigins } = require('../sites');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const REUSE_WINDOW_MS = 6 * 60 * 60 * 1000; // same person, same site, same visit: update the row, don't add another
const MAX_ITEMS = 40;

// ── Small in-memory limiter. These routes are public and one of them leads to an email, so
// one address cannot be used to queue up reminders for many inboxes. Resets on redeploy.
const hits = new Map();
function allow(key, max, windowMs, now = Date.now()) {
  const list = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (list.length >= max) { hits.set(key, list); return false; }
  list.push(now); hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
  return true;
}
function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim() || 'unknown';
}

// Only our own storefronts. A request with no Origin, or someone else's, is ignored.
function fromStorefront(req) {
  return allowedOrigins.includes(String(req.headers.origin || ''));
}

function validEmail(s) {
  return typeof s === 'string' && s.length <= 254 && /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i.test(s);
}

// Keeps only what the reminder email shows, with sane limits.
function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, MAX_ITEMS).map(i => {
    const price = Number(i && i.totalPrice);
    return {
      name: String((i && i.name) || '').slice(0, 200),
      details: String((i && i.details) || '').slice(0, 600),
      totalPrice: Number.isFinite(price) && price >= 0 && price < 100000 ? Math.round(price * 100) / 100 : 0,
    };
  }).filter(i => i.name);
}

async function logEvent(site, event, amountCents) {
  const { error } = await supabase.from('checkout_events').insert({ site, event, amount_cents: amountCents });
  if (error) console.error(`[started] event insert failed (${event}):`, error.message || error);
}

router.post('/opened', async (req, res) => {
  res.status(204).end(); // answer first: the page never waits on this
  try {
    if (!fromStorefront(req)) return;
    if (!allow('o:' + clientIp(req), 30, 60 * 60 * 1000)) return;
    const cents = Math.round(Number(req.body && req.body.amountCents));
    await logEvent(siteNameFromOrigin(req.headers.origin), 'opened', Number.isFinite(cents) && cents >= 0 && cents < 10000000 ? cents : null);
  } catch (err) {
    console.error('[started] opened error:', err?.message || err);
  }
});

router.post('/started', async (req, res) => {
  res.status(204).end();
  try {
    if (!fromStorefront(req)) return;
    const email = String((req.body && req.body.customerEmail) || '').trim().toLowerCase();
    const items = cleanItems(req.body && req.body.items);
    if (!validEmail(email) || items.length === 0) return;
    if (!allow('s:' + clientIp(req), 12, 60 * 60 * 1000)) return;

    const site = siteNameFromOrigin(req.headers.origin);
    const amount = Math.round(items.reduce((s, i) => s + i.totalPrice, 0) * 100);
    const now = new Date();

    // Same person still in the same checkout (they edited the cart, or the field fired twice):
    // refresh the row they already have, and restart its clock, instead of stacking rows.
    const { data: existing, error: findError } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'started')
      .eq('site', site)
      .ilike('customer_email', email)
      .is('abandoned_email_sent_at', null)
      .gte('created_at', new Date(now - REUSE_WINDOW_MS).toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    if (findError) throw findError;

    if (existing && existing.length) {
      const { error } = await supabase.from('orders')
        .update({ items, amount_cents: amount, created_at: now.toISOString(), updated_at: now.toISOString() })
        .eq('id', existing[0].id)
        .eq('status', 'started');
      if (error) throw error;
      return;
    }

    const { error } = await supabase.from('orders').insert({
      stripe_payment_intent_id: null, payment_provider: 'square', customer_email: email, shipping_address: null,
      items, file_key: null, amount_cents: amount, status: 'started', site,
    });
    if (error) throw error;
    await logEvent(site, 'email_entered', amount);
  } catch (err) {
    console.error('[started] started error:', err?.message || err);
  }
});

module.exports = router;
module.exports._test = { validEmail, cleanItems, allow };
