const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { fetchFileFromR2 } = require('./upload');
const { replyToForSite } = require('../sites');

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
        from: `${order.site || 'SpeedyBanner'} <orders@speedybanner.com>`,
        replyTo: replyToForSite(order.site),
        to: customerEmail,
        subject: `Order Confirmed — ${order.site || 'SpeedyBanner'} #${order.id}`,
        html: buildCustomerEmail(order),
      });

      // Internal print/work order notification
      const notifyTo = process.env.NOTIFY_EMAIL;
      if (notifyTo) {
        const attachments = await buildAttachmentsForOrder(order);

        await resend.emails.send({
          from: 'SpeedyBanner Orders <orders@speedybanner.com>',
          to: notifyTo,
          subject: `🖨️ NEW ORDER #${order.id} — [${order.site || 'SpeedyBanner'}] — $${(order.amount_cents / 100).toFixed(2)} — ${order.customer_email}`,
          html: buildAdminEmail(order),
          attachments,
        });
      }
    } catch (err) {
      console.error('Post-payment processing error:', err);
      // Still return 200 so Stripe does not retry
    }
  }

  res.json({ received: true });
});

// Collects every distinct fileKey across the order's line items (plus the legacy
// top-level file_key, for orders placed before per-item fileKey was sent) and
// fetches each from R2 as a separate email attachment.
async function buildAttachmentsForOrder(order) {
  const keys = [];
  for (const item of order.items || []) {
    if (item.fileKey && !keys.includes(item.fileKey)) keys.push(item.fileKey);
  }
  if (order.file_key && !keys.includes(order.file_key)) keys.push(order.file_key);

  const MAX_ATTACH = 25 * 1024 * 1024; // 25 MB per file
  const attachments = [];
  for (const key of keys) {
    try {
      const file = await fetchFileFromR2(key);
      if (file.buffer.length <= MAX_ATTACH) {
        attachments.push({ filename: file.originalName, content: file.buffer });
      } else {
        console.log(`File ${key} is ${file.buffer.length} bytes — too large to attach, link included in email`);
      }
    } catch (fileErr) {
      console.error(`Could not fetch file ${key} for attachment:`, fileErr.message);
    }
  }
  return attachments;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function buildNotesSection(order) {
  const notes = (order.shipping_address || {}).notes;
  if (!notes) return '';
  return `<div style="background:#fef9c3;border:1px solid #fde68a;border-radius:6px;padding:14px 18px;margin-bottom:20px">
    <strong>📝 Special Instructions:</strong><br><span style="white-space:pre-wrap">${escapeHtml(notes)}</span>
  </div>`;
}

function buildCustomerEmail(order) {
  const addr = order.shipping_address || {};
  const items = (order.items || [])
    .map(i => `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#475569">${i.details || ''}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${i.qty || 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">$${Number(i.totalPrice).toFixed(2)}</td>
    </tr>`)
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
      <div style="background:#1a3fa8;padding:28px 32px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fbbf24;margin:0;font-size:26px;letter-spacing:1px">${order.site || 'SpeedyBanner.com'}</h1>
        <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px">Banners · Signs · Overnight Shipping</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:#15803d;margin:0 0 8px">✅ Your order is confirmed!</h2>
        <p style="color:#374151;margin:0 0 24px">Thanks for your order. We'll start printing right away and ship overnight via FedEx.</p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:14px 18px;margin-bottom:24px">
          <strong>Order #${order.id}</strong> &nbsp;·&nbsp; Paid $${(order.amount_cents / 100).toFixed(2)} &nbsp;·&nbsp; Ships next business day
        </div>

        <h3 style="color:#1a3fa8;margin:0 0 12px;font-size:15px;border-bottom:2px solid #e5e7eb;padding-bottom:6px">📦 What You Ordered</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-weight:600">Item</th>
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-weight:600">Details</th>
              <th style="padding:8px 12px;text-align:center;color:#6b7280;font-weight:600">Qty</th>
              <th style="padding:8px 12px;text-align:right;color:#6b7280;font-weight:600">Price</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:10px 12px;font-weight:700;font-size:15px">Total Paid</td>
              <td style="padding:10px 12px;font-weight:700;font-size:15px;text-align:right;color:#1a3fa8">$${(order.amount_cents / 100).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="color:#1a3fa8;margin:0 0 12px;font-size:15px;border-bottom:2px solid #e5e7eb;padding-bottom:6px">🚚 Shipping Address</h3>
        <p style="margin:0 0 24px;line-height:1.7">
          ${addr.name || ''}<br>
          ${addr.street || ''}<br>
          ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}
        </p>

        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:14px 18px;margin-bottom:24px;font-size:13px">
          <strong>🎨 Need to upload your design file?</strong><br>
          Visit <a href="https://${(order.site || 'SpeedyBanner.com').toLowerCase()}" style="color:#1a3fa8">${order.site || 'speedybanner.com'}</a> and use the Upload File button, or simply reply to this email and attach your file.
        </div>

        <p style="color:#6b7280;font-size:13px;margin:0">Questions? Call <a href="tel:+13474226637" style="color:#1a3fa8">(347) 422-6637</a> or reply to this email.</p>
      </div>
      <div style="background:#f8fafc;padding:16px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;text-align:center;font-size:12px;color:#9ca3af">
        © SpeedyBanner.com · Free Overnight Shipping on Every Order
      </div>
    </div>
  `;
}

// Shows a design-file link per line item when items carry their own fileKey,
// falling back to the legacy single order.file_key for older orders.
function buildFileSection(order) {
  const items = order.items || [];
  const perItem = items.filter(i => i.fileKey);

  if (perItem.length > 0) {
    const rows = items.map((i, idx) => i.fileKey
      ? `<div style="margin-bottom:6px"><strong>${idx + 1}. ${i.name}:</strong> <a href="${process.env.R2_PUBLIC_URL}/${i.fileKey}" style="color:#1a3fa8;word-break:break-all">${process.env.R2_PUBLIC_URL}/${i.fileKey}</a></div>`
      : `<div style="margin-bottom:6px;color:#dc2626"><strong>${idx + 1}. ${i.name}:</strong> ⚠️ No design file uploaded</div>`
    ).join('');
    return `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:14px 18px;margin-bottom:20px">
        <strong>📎 Design Files:</strong><br>${rows}
      </div>`;
  }

  return order.file_key
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:14px 18px;margin-bottom:20px">
        <strong>📎 Design File:</strong><br>
        <a href="${process.env.R2_PUBLIC_URL}/${order.file_key}" style="color:#1a3fa8;word-break:break-all">${process.env.R2_PUBLIC_URL}/${order.file_key}</a>
      </div>`
    : `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:14px 18px;margin-bottom:20px">
        ⚠️ <strong>No design file uploaded.</strong> Contact customer before printing.
      </div>`;
}

function buildAdminEmail(order) {
  const addr = order.shipping_address || {};
  const items = (order.items || [])
    .map(i => `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#475569">${i.details || ''}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${i.qty || 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">$${Number(i.totalPrice).toFixed(2)}</td>
    </tr>`)
    .join('');

  const fileSection = buildFileSection(order);

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1a1a2e">
      <div style="background:#dc2020;padding:20px 28px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">🖨️ NEW PRINT ORDER</h1>
        <p style="color:rgba(255,255,255,.9);margin:4px 0 0;font-size:14px">Order #${order.id} · $${(order.amount_cents / 100).toFixed(2)} · PAID</p>
      </div>
      <div style="background:#fff;padding:28px;border:1px solid #e5e7eb;border-top:none">

        <div style="display:flex;gap:20px;margin-bottom:24px;flex-wrap:wrap">
          <div style="flex:1;min-width:200px;background:#fef3cd;border-radius:6px;padding:14px 18px">
            <div style="font-size:11px;color:#92400e;text-transform:uppercase;font-weight:700;margin-bottom:6px">Site</div>
            <div style="font-weight:700;font-size:15px;color:#92400e">${order.site || 'SpeedyBanner.com'}</div>
          </div>
          <div style="flex:1;min-width:200px;background:#f8fafc;border-radius:6px;padding:14px 18px">
            <div style="font-size:11px;color:#6b7280;text-transform:uppercase;font-weight:700;margin-bottom:6px">Customer</div>
            <div style="font-weight:700;font-size:15px">${addr.name || 'N/A'}</div>
            <div style="color:#1a3fa8"><a href="mailto:${order.customer_email}" style="color:#1a3fa8">${order.customer_email}</a></div>
            <div>${addr.phone ? `<a href="tel:${addr.phone}" style="color:#374151">${addr.phone}</a>` : 'No phone'}</div>
          </div>
          <div style="flex:1;min-width:200px;background:#f8fafc;border-radius:6px;padding:14px 18px">
            <div style="font-size:11px;color:#6b7280;text-transform:uppercase;font-weight:700;margin-bottom:6px">Ship To</div>
            <div style="line-height:1.7">
              ${addr.street || ''}<br>
              ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}
            </div>
          </div>
        </div>

        <h3 style="margin:0 0 12px;font-size:15px;border-bottom:2px solid #e5e7eb;padding-bottom:6px;color:#1a3fa8">Items to Print</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-weight:600">Item</th>
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-weight:600">Details / Specs</th>
              <th style="padding:8px 12px;text-align:center;color:#6b7280;font-weight:600">Qty</th>
              <th style="padding:8px 12px;text-align:right;color:#6b7280;font-weight:600">Price</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
          <tfoot>
            <tr style="background:#1a3fa8">
              <td colspan="3" style="padding:10px 12px;font-weight:700;color:#fff">TOTAL CHARGED</td>
              <td style="padding:10px 12px;font-weight:700;color:#fbbf24;text-align:right;font-size:16px">$${(order.amount_cents / 100).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        ${fileSection}

        ${buildNotesSection(order)}

        <p style="font-size:12px;color:#9ca3af;margin:0">Stripe Payment Intent: ${order.stripe_payment_intent_id}</p>
      </div>
    </div>
  `;
}

module.exports = router;
module.exports.buildCustomerEmail = buildCustomerEmail;
module.exports.buildAdminEmail = buildAdminEmail;
module.exports.buildAttachmentsForOrder = buildAttachmentsForOrder;
