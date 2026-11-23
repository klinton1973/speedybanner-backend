// Custom quote requests from a site's contact page (first used by LexingtonSign.com, 2026-11-22).
// POST /quote with JSON fields -> one email to the shop, reply-to set to the customer.
// No database row and no customer email: this is a lead notification only.
const express = require('express');
const { Resend } = require('resend');
const { SITES, siteNameFromOrigin } = require('../sites');

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Where quote requests land, per site. Anything not listed goes to NOTIFY_EMAIL.
const QUOTE_TO = {
  'LexingtonSign.com': 'info@lexingtonsign.com',
};

const FIELDS = [
  // [key, label, max length, required]
  ['product', 'Product', 120, true],
  ['bulk_item', 'Bulk item', 300, false],
  ['from_name', 'Name', 120, true],
  ['reply_to', 'Email', 200, true],
  ['phone', 'Phone', 40, true],
  ['company', 'Business', 160, false],
  ['size', 'Size', 120, true],
  ['quantity', 'Quantity', 20, true],
  ['needed_by', 'Needed by', 20, true],
  ['location_use', 'Indoor / outdoor', 40, true],
  ['artwork', 'Artwork', 120, true],
  ['message', 'Project details', 4000, true],
];

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const oneLine = s => String(s == null ? '' : s).replace(/[\r\n\t]+/g, ' ').trim();

// Small in-memory limit: 5 requests per IP per hour. Resets on redeploy, which is fine for this.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) { hits.set(ip, list); return true; }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k);
  return false;
}

function validate(body) {
  const data = {};
  for (const [key, label, max, required] of FIELDS) {
    const raw = body && typeof body[key] === 'string' ? body[key] : (body && typeof body[key] === 'number' ? String(body[key]) : '');
    const v = (key === 'message' ? raw.trim() : oneLine(raw)).slice(0, max);
    if (required && !v) return { error: `${label} is required.` };
    data[key] = v;
  }
  if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]{2,}$/.test(data.reply_to)) return { error: 'Please enter a valid email address.' };
  if (data.message.length < 40) return { error: 'Please add a little more detail about your project.' };
  return { data };
}

router.post('/', async (req, res) => {
  try {
    const origin = req.headers.origin || '';
    let host = '';
    try { host = new URL(origin).hostname; } catch { /* no usable origin */ }
    if (!SITES[host]) return res.status(403).json({ error: 'Not allowed.' });

    // Spam trap: real visitors never fill this. Pretend it worked.
    if (req.body && req.body.website) return res.json({ ok: true });

    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    if (limited(ip)) return res.status(429).json({ error: 'Too many requests. Please call or email us instead.' });

    const { data, error: invalid } = validate(req.body);
    if (invalid) return res.status(400).json({ error: invalid });

    const site = siteNameFromOrigin(origin);
    const to = QUOTE_TO[site] || process.env.NOTIFY_EMAIL;
    if (!to) return res.status(500).json({ error: 'Quote email is not set up.' });

    const td = 'padding:6px 10px;border-bottom:1px solid #eee;vertical-align:top';
    const rows = FIELDS.filter(([key]) => key !== 'message' && data[key])
      .map(([key, label]) => `<tr><td style="${td};font-weight:bold;width:150px">${label}</td><td style="${td}">${esc(data[key])}</td></tr>`)
      .join('');

    const { error } = await resend.emails.send({
      from: `${site} Quotes <orders@speedybanner.com>`,
      to,
      reply_to: data.reply_to, // resend v3 expects snake_case; `replyTo` is silently ignored
      subject: `Custom Quote: ${data.product} (${data.quantity}), needed ${data.needed_by} — ${data.from_name}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:640px">
        <h2 style="margin:0 0 12px;font-size:18px">New custom quote request (${esc(site)})</h2>
        <table role="presentation" style="border-collapse:collapse;width:100%">${rows}</table>
        <p style="margin:16px 0 4px;font-weight:bold">Project details</p>
        <div style="white-space:pre-wrap;padding:10px;background:#f6f6f6;border-radius:6px">${esc(data.message)}</div>
        <p style="margin:16px 0 0;color:#777;font-size:12px">Reply to this email to answer the customer directly.</p>
      </div>`,
    });
    if (error) throw error; // the Resend SDK returns errors instead of throwing

    res.json({ ok: true });
  } catch (err) {
    console.error('Quote request email failed:', err);
    res.status(500).json({ error: 'Could not send your request. Please call or email us.' });
  }
});

module.exports = router;
module.exports.validate = validate;
