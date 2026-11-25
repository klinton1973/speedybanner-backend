// Cart-restore links for the abandoned-checkout reminder.
//
// Most storefronts keep the cart only in the open page, so the reminder's "Finish my order"
// button used to land on an empty site. The link now carries a signed token; the page trades it
// for the saved items (GET /checkout/restore) and refills the cart.
//
// The token is "<order id>.<hmac>", so order ids cannot be guessed or walked. It is signed with
// a server-only secret; nothing new has to be configured.

const crypto = require('crypto');

function secret() {
  return String(process.env.RESTORE_SECRET || process.env.SUPABASE_SERVICE_KEY || '');
}

function sign(id) {
  const body = String(id);
  const mac = crypto.createHmac('sha256', secret()).update('cart-restore:' + body).digest('base64url').slice(0, 32);
  return `${body}.${mac}`;
}

// Returns the order id as a string, or null when the token is not one of ours.
function verify(token) {
  const m = /^(\d{1,15})\.([A-Za-z0-9_-]{32})$/.exec(String(token || ''));
  if (!m || !secret()) return null;
  const expected = sign(m[1]);
  const a = Buffer.from(expected), b = Buffer.from(String(token));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return m[1];
}

// Fees the checkout page adds by itself. Restoring them as cart lines would charge them twice.
const CHECKOUT_ADDED = new Set(['Saturday Delivery Upgrade']);

// The items a cart can be rebuilt from, or [] when the row cannot be restored. A row is only
// restorable when every line says whether it has a print file (the `fileKey` key is present,
// null or not). Rows saved before that was recorded would come back without their artwork.
function restorableItems(items) {
  const list = (Array.isArray(items) ? items : []).filter(i => i && i.name && !CHECKOUT_ADDED.has(i.name));
  if (!list.length) return [];
  if (!list.every(i => Object.prototype.hasOwnProperty.call(i, 'fileKey'))) return [];
  return list.map(i => {
    const total = Number(i.totalPrice) || 0;
    const qty = Number.isInteger(i.qty) && i.qty > 0 ? i.qty : 1;
    const unit = Number(i.unitPrice);
    return {
      name: String(i.name),
      details: String(i.details || ''),
      totalPrice: total,
      qty,
      unitPrice: Number.isFinite(unit) && unit >= 0 ? unit : total,
      fileKey: i.fileKey || null,
      thumbUrl: i.thumbUrl || null,
      hasDesign: !!(i.hasDesign || i.fileKey),
    };
  });
}

// Where the reminder button should land for a site. The two sports sites keep their cart on a
// separate cart page, and Overnight's homepage has no cart (its product pages do); every other
// storefront opens the cart on its homepage.
const CART_PAGE = {
  'varsitybanner.com': '/order/cart/',
  'gamefacebanners.com': '/order/cart/',
  'overnightbanner.com': '/vinyl-banners.html',
};

function restoreUrl(site, order) {
  const host = String(site || 'SpeedyBanner.com').toLowerCase();
  const home = `https://${host}/`;
  if (!order || order.id == null || !restorableItems(order.items).length || !secret()) return home;
  return `https://${host}${CART_PAGE[host] || '/'}?restore=${encodeURIComponent(sign(order.id))}`;
}

module.exports = { sign, verify, restorableItems, restoreUrl };
