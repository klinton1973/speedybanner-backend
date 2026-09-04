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
      if (/^\d{10,15}$/.test(lines[i])) { trackingNumber = lines[i]; break; }
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

function buildShippedEmail(order, trackingNumber) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
      <div style="background:#1a3fa8;padding:28px 32px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fbbf24;margin:0;font-size:26px;letter-spacing:1px">${order.site || 'SpeedyBanner.com'}</h1>
        <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px">Banners · Signs · Overnight Shipping</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:#15803d;margin:0 0 8px">📦 Your order has shipped!</h2>
        <p style="color:#374151;margin:0 0 24px">Order #${order.id} is on its way via FedEx.</p>
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

function buildNoMatchAlertEmail({ recipientName, recipientZip, trackingNumber, matchCount }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
      <div style="background:#1a3fa8;padding:28px 32px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fbbf24;margin:0;font-size:22px;letter-spacing:1px">⚠️ Tracking Needs Manual Match</h1>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none">
        <p style="color:#374151;margin:0 0 20px">A FedEx tracking email came in that couldn't be automatically matched to an open order.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b7280;width:150px">Tracking Number</td><td style="padding:8px 0;font-weight:700">${trackingNumber}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Recipient Name</td><td style="padding:8px 0;font-weight:700">${recipientName}</td></tr>
          ${recipientZip ? `<tr><td style="padding:8px 0;color:#6b7280">Zip Code</td><td style="padding:8px 0;font-weight:700">${recipientZip}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#6b7280">Matching Orders Found</td><td style="padding:8px 0;font-weight:700">${matchCount}</td></tr>
        </table>
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:14px 18px">
          <strong>Next step:</strong> Find the matching order and add this tracking number manually via the admin panel.
        </div>
      </div>
      <div style="background:#f8fafc;padding:16px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;text-align:center;font-size:12px;color:#9ca3af">
        Automated tracking-match alert · SpeedyBanner Backend
      </div>
    </div>
  `;
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

    const { data: candidates, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['paid', 'printing']);
    if (error) throw error;

    let matches = (candidates || []).filter(
      o => normalizeName((o.shipping_address || {}).name) === normalizeName(recipientName)
    );
    if (matches.length > 1 && recipientZip) {
      const zipMatches = matches.filter(o => String((o.shipping_address || {}).zip || '').slice(0, 5) === recipientZip);
      if (zipMatches.length >= 1) matches = zipMatches;
    }

    if (matches.length === 1) {
      const order = matches[0];

      await resend.emails.send({
        from: `${order.site || 'SpeedyBanner'} <orders@speedybanner.com>`,
        replyTo: replyToForSite(order.site),
        to: order.customer_email,
        subject: `Your Order Has Shipped — ${order.site || 'SpeedyBanner'} #${order.id}`,
        html: buildShippedEmail(order, trackingNumber),
      });

      await supabase
        .from('orders')
        .update({ status: 'shipped', tracking_number: trackingNumber, updated_at: new Date().toISOString() })
        .eq('id', order.id);
    } else {
      const notifyTo = process.env.NOTIFY_EMAIL;
      if (notifyTo) {
        await resend.emails.send({
          from: 'SpeedyBanner Orders <orders@speedybanner.com>',
          to: notifyTo,
          subject: `⚠️ Tracking email couldn't be auto-matched — ${trackingNumber}`,
          html: buildNoMatchAlertEmail({ recipientName, recipientZip, trackingNumber, matchCount: matches.length }),
        });
      }
    }
  } catch (err) {
    console.error('Tracking webhook processing error:', err);
  }
});

module.exports = router;
