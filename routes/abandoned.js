// Abandoned-checkout reminder.
//
// Every checkout attempt inserts an `orders` row with status 'pending' before the
// customer pays (see routes/checkout.js). When Stripe never confirms the payment the
// row stays pending with paid_at null — that is an abandoned checkout, and it already
// carries the customer's email, the cart and the site. This worker emails each of
// those customers one short reminder, once, about an hour after they walked away.
//
// Rules:
//   - one reminder per email address per 7 days, even if they abandoned several times
//     (every retry at checkout creates another pending row)
//   - never remind someone who has since completed a paid order on any site
//   - rows are claimed (abandoned_email_sent_at set) before the send, so two overlapping
//     passes can never double-send
//   - set ABANDONED_REMINDERS=off in the environment to pause it without a deploy
//
// Requires the two columns added by abandoned_email_migration.sql.

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { replyToForSite } = require('../sites');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const CHECK_EVERY_MS  = 15 * 60 * 1000;      // how often to look
const MIN_AGE_MS      = 60 * 60 * 1000;      // give Stripe / the customer an hour first
const MAX_AGE_MS      = 48 * 60 * 60 * 1000; // older than this is stale, not a lead
const REPEAT_GUARD_MS = 7 * 24 * 60 * 60 * 1000;
const BATCH = 25;

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function siteUrl(site) {
  return `https://${String(site || 'SpeedyBanner.com').toLowerCase()}/`;
}

function buildAbandonedEmail(order) {
  const site = order.site || 'SpeedyBanner.com';
  const items = (order.items || []).filter(i => i && i.name);
  const rows = items.map(i => `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${escapeHtml(i.name)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#475569">${escapeHtml(i.details || '')}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">$${Number(i.totalPrice || 0).toFixed(2)}</td>
    </tr>`).join('');
  const total = (Number(order.amount_cents) || 0) / 100;
  const url = siteUrl(site);

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
      <div style="background:#1a3fa8;padding:28px 32px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fbbf24;margin:0;font-size:26px;letter-spacing:1px">${escapeHtml(site)}</h1>
        <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px">Banners · Signs · Free Overnight Shipping</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:#1a3fa8;margin:0 0 8px">You were one step from done</h2>
        <p style="color:#374151;margin:0 0 20px">Your order at ${escapeHtml(site)} was never completed. Nothing was charged. Here is what you had picked out:</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-weight:600">Item</th>
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-weight:600">Details</th>
              <th style="padding:8px 12px;text-align:right;color:#6b7280;font-weight:600">Price</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          ${total > 0 ? `<tfoot><tr>
            <td colspan="2" style="padding:10px 12px;font-weight:700;font-size:15px">Total</td>
            <td style="padding:10px 12px;font-weight:700;font-size:15px;text-align:right;color:#1a3fa8">$${total.toFixed(2)}</td>
          </tr></tfoot>` : ''}
        </table>

        <div style="text-align:center;margin:0 0 24px">
          <a href="${url}" style="display:inline-block;background:#fbbf24;color:#1a1a2e;font-weight:700;font-size:16px;padding:14px 28px;border-radius:8px;text-decoration:none">Finish my order →</a>
        </div>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:12px 16px;margin:0 0 20px;font-size:13px;color:#166534">
          <strong>Free FedEx overnight shipping on every order.</strong> Place it today and it goes to print right away.
        </div>

        <p style="color:#374151;font-size:14px;margin:0 0 6px">Had trouble checking out, or have a question about sizes or artwork? Just reply to this email or call <a href="tel:+13474226637" style="color:#1a3fa8">(347) 422-6637</a>. A real person will help.</p>
      </div>
      <div style="background:#f8fafc;padding:16px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;text-align:center;font-size:12px;color:#9ca3af">
        You are getting this one-time note because a checkout was started at ${escapeHtml(site)} with this email address. If that was not you, you can ignore it. No further reminders will be sent.
      </div>
    </div>
  `;
}

function subjectFor(order) {
  const first = (order.items || []).find(i => i && i.name);
  const site = order.site || 'SpeedyBanner.com';
  return first ? `Still need your ${first.name}? — ${site}` : `Your order at ${site} was not completed`;
}

// Picks the rows to remind: pending, unpaid, 1h–48h old, not yet handled, newest
// per email address first so the duplicate check below keeps the latest cart.
async function fetchCandidates(now) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_email, items, amount_cents, site, created_at')
    .is('paid_at', null)
    .eq('status', 'pending')
    .is('abandoned_email_sent_at', null)
    .lt('created_at', new Date(now - MIN_AGE_MS).toISOString())
    .gt('created_at', new Date(now - MAX_AGE_MS).toISOString())
    .order('created_at', { ascending: false })
    .limit(BATCH);
  if (error) throw error;
  return data || [];
}

// Marks a row handled. Done with an "only if still null" condition, the same for a
// send and for a skip, so two overlapping passes never fight over a row.
async function claim(id, status, now) {
  const { data, error } = await supabase
    .from('orders')
    .update({ abandoned_email_sent_at: new Date(now).toISOString(), abandoned_email_status: status })
    .eq('id', id)
    .is('abandoned_email_sent_at', null)
    .select('id');
  if (error) throw error;
  return (data || []).length === 1;
}

async function setStatus(id, status) {
  const { error } = await supabase.from('orders').update({ abandoned_email_status: status }).eq('id', id);
  if (error) console.error(`[abandoned] status update failed for ${id}:`, error.message || error);
}

async function hasPaidSince(email, sinceIso) {
  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .ilike('customer_email', email)
    .not('paid_at', 'is', null)
    .gte('created_at', sinceIso)
    .limit(1);
  if (error) throw error;
  return (data || []).length > 0;
}

async function remindedRecently(email, now) {
  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .ilike('customer_email', email)
    .eq('abandoned_email_status', 'sent')
    .gte('abandoned_email_sent_at', new Date(now - REPEAT_GUARD_MS).toISOString())
    .limit(1);
  if (error) throw error;
  return (data || []).length > 0;
}

let passRunning = false;

async function runAbandonedPass() {
  if (passRunning) return;
  if (String(process.env.ABANDONED_REMINDERS || '').toLowerCase() === 'off') return;
  passRunning = true;
  const now = Date.now();
  try {
    const rows = await fetchCandidates(now);
    if (rows.length === 0) return;
    const seen = new Set();
    for (const order of rows) {
      const email = String(order.customer_email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) { await claim(order.id, 'skipped_no_email', now); continue; }
      if (seen.has(email)) { await claim(order.id, 'skipped_duplicate', now); continue; }
      seen.add(email);
      if (await hasPaidSince(email, order.created_at)) { await claim(order.id, 'skipped_paid', now); continue; }
      if (await remindedRecently(email, now)) { await claim(order.id, 'skipped_recent', now); continue; }
      if (!(order.items || []).some(i => i && i.name)) { await claim(order.id, 'skipped_empty', now); continue; }

      if (!(await claim(order.id, 'sending', now))) continue; // another pass got it first
      try {
        const { error } = await resend.emails.send({
          from: `${order.site || 'SpeedyBanner'} <orders@speedybanner.com>`,
          reply_to: replyToForSite(order.site), // resend v3 expects snake_case; `replyTo` is silently ignored
          to: email,
          subject: subjectFor(order),
          html: buildAbandonedEmail(order),
        });
        // The Resend SDK resolves (does not throw) on API-level failures — check `error`.
        if (error) throw error;
        await setStatus(order.id, 'sent');
        console.log(`[abandoned] reminder sent for ${order.id} (${order.site}, $${(order.amount_cents / 100).toFixed(2)})`);
      } catch (err) {
        console.error(`[abandoned] reminder failed for ${order.id}:`, err?.message || err);
        await setStatus(order.id, 'failed');
      }
    }
  } catch (err) {
    console.error('[abandoned] pass error:', err?.message || err);
  } finally {
    passRunning = false;
  }
}

function startAbandonedCheckoutWorker() {
  setTimeout(runAbandonedPass, 2 * 60 * 1000); // first pass shortly after boot
  setInterval(runAbandonedPass, CHECK_EVERY_MS);
}

module.exports = { startAbandonedCheckoutWorker, runAbandonedPass, buildAbandonedEmail, subjectFor };
