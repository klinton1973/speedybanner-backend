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
//   GET  /checkout/restore   trades the signed token from the reminder's button for the saved
//                            cart lines, so the page can refill the cart (lib/restore.js).
//
// Both are fire-and-forget from the page: they always answer quickly, never block checkout,
// and a failure here must never be visible to the customer.
//
// Requires checkout_started_migration.sql.

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { siteNameFromOrigin, allowedOrigins } = require('../sites');
const { verify, restorableItems } = require('../lib/restore');

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

// Keeps what the reminder email shows and what a cart needs to be rebuilt, with sane limits.
// `fileKey` is always written (null when the line has no print file): its presence is what
// marks the row as restorable (lib/restore.js).
function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, MAX_ITEMS).map(i => {
    const price = Number(i && i.totalPrice);
    const total = Number.isFinite(price) && price >= 0 && price < 100000 ? Math.round(price * 100) / 100 : 0;
    const unit = Number(i && i.unitPrice);
    const qty = Math.round(Number(i && i.qty));
    const fileKey = i && typeof i.fileKey === 'string' && /^[\w./-]{1,300}$/.test(i.fileKey) && !i.fileKey.includes('..') ? i.fileKey : null;
    const thumbUrl = i && typeof i.thumbUrl === 'string' && /^https:\/\/[^\s"'<>]{1,500}$/.test(i.thumbUrl) ? i.thumbUrl : null;
    return {
      name: String((i && i.name) || '').slice(0, 200),
      details: String((i && i.details) || '').slice(0, 600),
      totalPrice: total,
      qty: Number.isFinite(qty) && qty >= 1 && qty <= 9999 ? qty : 1,
      unitPrice: Number.isFinite(unit) && unit >= 0 && unit < 100000 ? Math.round(unit * 10000) / 10000 : total,
      fileKey,
      thumbUrl,
      hasDesign: !!(i && (i.hasDesign || fileKey)),
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

// The reminder email's button lands on the storefront with ?restore=<token>. The page calls this
// to get the cart lines back. Only our own storefronts may ask, only for a row that belongs to
// the asking site, and only while the row is still unpaid and recent.
const RESTORE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
router.get('/restore', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    if (!fromStorefront(req)) return res.status(404).json({ error: 'not found' });
    if (!allow('r:' + clientIp(req), 40, 60 * 60 * 1000)) return res.status(429).json({ error: 'try again later' });
    const id = verify(req.query.t);
    if (!id) return res.status(404).json({ error: 'not found' });
    const { data, error } = await supabase
      .from('orders')
      .select('id, items, status, site, created_at, paid_at')
      .eq('id', id)
      .limit(1);
    if (error) throw error;
    const row = data && data[0];
    if (!row || row.paid_at || !['pending', 'started'].includes(row.status)) return res.status(404).json({ error: 'not found' });
    if (row.site !== siteNameFromOrigin(req.headers.origin)) return res.status(404).json({ error: 'not found' });
    if (Date.now() - new Date(row.created_at).getTime() > RESTORE_MAX_AGE_MS) return res.status(404).json({ error: 'not found' });
    const items = restorableItems(row.items);
    if (!items.length) return res.status(404).json({ error: 'not found' });
    res.json({ items });
  } catch (err) {
    console.error('[started] restore error:', err?.message || err);
    res.status(500).json({ error: 'unavailable' });
  }
});

module.exports = router;
module.exports._test = { validEmail, cleanItems, allow };
