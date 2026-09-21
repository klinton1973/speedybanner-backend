const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { replyToForSite } = require('../sites');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Pulls the tracking number and "To" recipient name/zip out of a FedEx
// tracking-details email's plain-text body. FedEx renders each field as a
// label line followed by its value line(s), separated by blank lines — e.g.
// "Tracking ID\n\n    876727542344\n\n\nTo\n\n    Thomas Ziller\n...".
function parseFedExEmail(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').map(l => l.trim());

  let trackingNumber = null;
  const trackingIdx = lines.findIndex(l => /^tracking id$/i.test(l));
  if (trackingIdx !== -1) {
    for (let i = trackingIdx + 1; i < Math.min(trackingIdx + 6, lines.length); i++) {
      // The number is sometimes followed by a tracking-URL on the same line,
      // e.g. "876727542344 <https://www.fedex.com/apps/fedextrack?...>".
      const m = lines[i].match(/^(\d{10,15})\b/);
      if (m) { trackingNumber = m[1]; break; }
    }
  }

  let recipientName = null;
  let recipientZip = null;
  const toIdx = lines.findIndex(l => /^to$/i.test(l));
  if (toIdx !== -1) {
    const block = [];
    for (let i = toIdx + 1; i < lines.length && block.length < 8; i++) {
      const line = lines[i];
      if (/^(ship date|number of pieces|total shipment weight|service|reference)$/i.test(line)) break;
      if (line === '' && block.length >= 3) break;
      if (line !== '') block.push(line);
    }
    if (block.length > 0) recipientName = block[0];
    const zipLine = block.find(l => /^\d{5}(-\d{4})?$/.test(l));
    if (zipLine) recipientZip = zipLine.slice(0, 5);
  }

  return { trackingNumber, recipientName, recipientZip };
}

const normalizeName = s => (s || '').toLowerCase().replace(/[^a-z\s]/g, '').trim();
const nameWords = s => normalizeName(s).split(/\s+/).filter(Boolean);

// FedEx's "To" name is sometimes trimmed on the shipping label (middle
// initials, suffixes like "Jr" dropped), so require every word in FedEx's
// name to appear in the order's name rather than an exact match — e.g.
// "Gary Jones" matches an order placed under "Gary E Jones Jr".
function namesMatch(fedexName, orderName) {
  const fedexWords = nameWords(fedexName);
  const orderWords = new Set(nameWords(orderName));
  return fedexWords.length > 0 && fedexWords.every(w => orderWords.has(w));
}

const alnum = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Some customers check out under a handle (their email's local part) rather
// than their real name, and that's what ends up on the FedEx label instead
// of shipping_address.name — e.g. "KhleoXO" vs. an order shipping to
// "Karen Underwood" but placed from KhleoXO@gmail.com.
function emailHandleMatches(fedexName, customerEmail) {
  const local = alnum((customerEmail || '').split('@')[0]);
  return local.length > 0 && alnum(fedexName) === local;
}

function buildShippedEmail(order, trackingNumber, isAdditionalPackage) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
      <div style="background:#1a3fa8;padding:28px 32px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fbbf24;margin:0;font-size:26px;letter-spacing:1px">${order.site || 'SpeedyBanner.com'}</h1>
        <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px">Banners · Signs · Overnight Shipping</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:#15803d;margin:0 0 8px">📦 ${isAdditionalPackage ? 'Another package from your order has shipped!' : 'Your order has shipped!'}</h2>
        <p style="color:#374151;margin:0 0 24px">${isAdditionalPackage ? `A separate box from order #${order.id}` : `Order #${order.id}`} is on its way via FedEx.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:14px 18px;margin-bottom:24px">
          <strong>Tracking Number:</strong> ${trackingNumber}<br>
          <a href="https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}" style="color:#1a3fa8">Track your package →</a>
        </div>
        <p style="color:#6b7280;font-size:13px;margin:0">Questions? Call <a href="tel:+13474226637" style="color:#1a3fa8">(347) 422-6637</a> or reply to this email.</p>
      </div>
      <div style="background:#f8fafc;padding:16px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;text-align:center;font-size:12px;color:#9ca3af">
        © ${order.site || 'SpeedyBanner.com'} · Free Overnight Shipping on Every Order
      </div>
    </div>
  `;
}

// Returns the single order this FedEx shipment belongs to, or null if there's
// no match or it's ambiguous (different customers sharing a name/zip).
async function findSingleMatch({ recipientName, recipientZip }) {
  // Include already-'shipped' orders too — multi-item orders often ship as
  // separate FedEx packages, each with its own tracking number, arriving
  // as separate emails after the order's first package already matched.
  const { data: candidates, error } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['paid', 'printing', 'shipped']);
  if (error) throw error;

  let matches = (candidates || []).filter(
    o => namesMatch(recipientName, (o.shipping_address || {}).name)
  );
  if (matches.length === 0) {
    matches = (candidates || []).filter(o => emailHandleMatches(recipientName, o.customer_email));
  }
  if (matches.length > 1 && recipientZip) {
    const zipMatches = matches.filter(o => String((o.shipping_address || {}).zip || '').slice(0, 5) === recipientZip);
    if (zipMatches.length >= 1) matches = zipMatches;
  }
  // Still ambiguous, but every remaining candidate belongs to the same
  // customer (e.g. two simultaneous orders) — per Klinton, default to the
  // most recently placed one rather than alerting. Only different people
  // sharing a name/zip still falls through to the manual-match queue.
  if (matches.length > 1 && new Set(matches.map(o => o.customer_email)).size === 1) {
    matches = [matches.reduce((latest, o) => new Date(o.created_at) > new Date(latest.created_at) ? o : latest)];
  }
  return matches.length === 1 ? matches[0] : null;
}

// Emails the customer their tracking number and records it on the order.
async function applyTrackingToOrder(order, trackingNumber) {
  const existingTracking = (order.tracking_number || '').split(',').map(s => s.trim()).filter(Boolean);

  if (existingTracking.includes(trackingNumber)) {
    // Same tracking number already processed (e.g. a duplicate forward) — no-op.
    return;
  }

  const isAdditionalPackage = existingTracking.length > 0;

  await resend.emails.send({
    from: `${order.site || 'SpeedyBanner'} <orders@speedybanner.com>`,
    replyTo: replyToForSite(order.site),
    to: order.customer_email,
    subject: `${isAdditionalPackage ? 'Another Package From Your Order Has Shipped' : 'Your Order Has Shipped'} — ${order.site || 'SpeedyBanner'} #${order.id}`,
    html: buildShippedEmail(order, trackingNumber, isAdditionalPackage),
  });

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'shipped',
      tracking_number: [...existingTracking, trackingNumber].join(', '),
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);
  if (updateError) console.error('Tracking webhook: failed to update order after sending tracking email', updateError);
}

// POST /tracking/fedex?key=... — webhook target for MailerSend inbound routing.
// Klinton forwards FedEx tracking-details emails here (via an Outlook rule);
// MailerSend parses them to JSON and posts the result to this endpoint.
router.post('/fedex', async (req, res) => {
  if (req.query.key !== process.env.TRACKING_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Ack immediately — MailerSend only needs a 2xx, and matching/emailing can
  // take longer than it should have to wait on.
  res.json({ received: true });

  try {
    const text = req.body && req.body.data && req.body.data.text;
    if (!text) { console.error('Tracking webhook: no text body in payload'); return; }

    const { trackingNumber, recipientName, recipientZip } = parseFedExEmail(text);
    if (!trackingNumber || !recipientName) {
      console.error('Tracking webhook: could not parse tracking number/recipient from email', { trackingNumber, recipientName });
      return;
    }

    const order = await findSingleMatch({ trackingNumber, recipientName, recipientZip });
    if (order) {
      await applyTrackingToOrder(order, trackingNumber);
      return;
    }

    // No single match yet. Instead of alerting right away, park it: the
    // background check below retries the match for a few days (e.g. the order
    // gets entered later) and anything still unmatched goes out once a day in
    // a single summary email instead of one alert per package.
    const { error: queueError } = await supabase
      .from('unmatched_tracking')
      .upsert({
        tracking_number: trackingNumber,
        recipient_name: recipientName,
        recipient_zip: recipientZip,
      }, { onConflict: 'tracking_number', ignoreDuplicates: true });
    if (queueError) throw queueError;
  } catch (err) {
    console.error('Tracking webhook processing error:', err);
  }
});

// ---------------------------------------------------------------------------
// Unmatched-tracking queue: retry + once-a-day summary
// ---------------------------------------------------------------------------

const CHECK_EVERY_MS = 15 * 60 * 1000;                                 // re-check every 15 min
const HOLD_BEFORE_REPORTING_MS = 3 * 60 * 60 * 1000;                   // give it 3h before it can be reported
const GIVE_UP_AFTER_MS = 7 * 24 * 60 * 60 * 1000;                      // stop retrying after 7 days
const DIGEST_HOUR_ET = Number(process.env.TRACKING_DIGEST_HOUR_ET || 8); // summary goes out at 8 AM Eastern

// Date/hour in America/New_York, so the summary lands at the same local time
// year-round regardless of the server's timezone or DST.
function easternParts(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map(p => [p.type, p.value]));
  return { day: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

function buildDigestEmail(rows) {
  const trs = rows.map(r => `
          <tr>
            <td style="padding:8px;border:1px solid #e5e7eb;font-family:monospace">
              <a href="https://www.fedex.com/fedextrack/?trknbr=${r.tracking_number}" style="color:#1a3fa8">${r.tracking_number}</a>
            </td>
            <td style="padding:8px;border:1px solid #e5e7eb">${r.recipient_name || ''}</td>
            <td style="padding:8px;border:1px solid #e5e7eb">${r.recipient_zip || ''}</td>
            <td style="padding:8px;border:1px solid #e5e7eb">${new Date(r.received_at).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
          </tr>`).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#1a1a2e">
      <div style="background:#1a3fa8;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fbbf24;margin:0;font-size:22px">Daily Unmatched Tracking Summary</h1>
      </div>
      <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none">
        <p style="color:#374151;margin:0 0 18px">These FedEx shipments still didn't match an order after at least 3 hours. If any of them are manual orders you entered separately, you can ignore them &mdash; each one is only reported once.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
          <tr style="background:#f8fafc">
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Tracking</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Recipient</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Zip</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Received</th>
          </tr>${trs}
        </table>
        <p style="color:#6b7280;font-size:13px;margin:0">The backend keeps re-checking these for 7 days. If a matching order shows up in that time, the customer gets their tracking email automatically.</p>
      </div>
      <div style="background:#f8fafc;padding:14px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;text-align:center;font-size:12px;color:#9ca3af">
        Automated tracking-match summary · SpeedyBanner Backend
      </div>
    </div>
  `;
}

let checkRunning = false;
async function checkUnmatchedTracking(now = new Date()) {
  if (checkRunning) return;
  checkRunning = true;
  try {
    const { data: pending, error } = await supabase
      .from('unmatched_tracking')
      .select('*')
      .eq('status', 'pending')
      .order('received_at', { ascending: true });
    if (error) throw error;

    const stillUnmatched = [];
    for (const row of pending || []) {
      const order = await findSingleMatch({
        trackingNumber: row.tracking_number, recipientName: row.recipient_name, recipientZip: row.recipient_zip,
      });
      if (order) {
        await applyTrackingToOrder(order, row.tracking_number);
        await supabase.from('unmatched_tracking')
          .update({ status: 'matched', resolved_at: now.toISOString(), order_id: order.id })
          .eq('id', row.id);
      } else if (now - new Date(row.received_at) > GIVE_UP_AFTER_MS) {
        await supabase.from('unmatched_tracking')
          .update({ status: 'expired', resolved_at: now.toISOString() })
          .eq('id', row.id);
      } else {
        stillUnmatched.push(row);
      }
    }

    // Once a day, at/after the digest hour, report anything that's been
    // unmatched for 3h+ and hasn't been reported before.
    const { day, hour } = easternParts(now);
    if (hour < DIGEST_HOUR_ET) return;
    const toReport = stillUnmatched.filter(r => !r.notified_at && now - new Date(r.received_at) >= HOLD_BEFORE_REPORTING_MS);
    if (toReport.length === 0) return;

    const { data: recentlyNotified, error: recentError } = await supabase
      .from('unmatched_tracking')
      .select('notified_at')
      .not('notified_at', 'is', null)
      .order('notified_at', { ascending: false })
      .limit(1);
    if (recentError) throw recentError;
    const lastDigest = recentlyNotified && recentlyNotified[0] && recentlyNotified[0].notified_at;
    if (lastDigest && easternParts(new Date(lastDigest)).day === day) return; // already sent today

    const notifyTo = process.env.NOTIFY_EMAIL;
    if (!notifyTo) return;
    const { error: sendError } = await resend.emails.send({
      from: 'SpeedyBanner Orders <orders@speedybanner.com>',
      to: notifyTo,
      subject: `Tracking summary: ${toReport.length} shipment${toReport.length === 1 ? '' : 's'} not matched to an order`,
      html: buildDigestEmail(toReport),
    });
    if (sendError) throw sendError;

    await supabase.from('unmatched_tracking')
      .update({ notified_at: now.toISOString() })
      .in('id', toReport.map(r => r.id));
  } catch (err) {
    console.error('Unmatched tracking check error:', err);
  } finally {
    checkRunning = false;
  }
}

function startUnmatchedTrackingWorker() {
  setTimeout(checkUnmatchedTracking, 60 * 1000); // first pass shortly after boot
  setInterval(checkUnmatchedTracking, CHECK_EVERY_MS);
}

router.startUnmatchedTrackingWorker = startUnmatchedTrackingWorker;
router._test = { checkUnmatchedTracking, easternParts, buildDigestEmail, parseFedExEmail };

module.exports = router;
