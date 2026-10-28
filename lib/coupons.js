// Server-side coupon rules. The storefront only *displays* a discount; the backend decides what the
// discount really is from the code the customer typed, so a crafted request can no longer name its
// own discount (before 2026-10-28, `discountCents` was taken from the browser as-is and a $0 "paid"
// order with print files was one POST away).
//
// COUPON_CODES env (optional) overrides the built-in list. Format: "CODE=rule,CODE=rule" where rule
// is `first_item_free` (the highest-priced line is free) or `pct:NN` (NN% off the subtotal).
// No built-in codes: the phone-number coupon was retired 2026-10-28. Add codes via COUPON_CODES.
const DEFAULT_CODES = '';

function rules() {
  const out = {};
  for (const pair of String(process.env.COUPON_CODES || DEFAULT_CODES).split(',')) {
    const [code, rule] = pair.split('=').map(s => (s || '').trim());
    if (code && rule) out[code.toUpperCase()] = rule;
  }
  return out;
}

// Returns the discount in cents for this code and cart (0 when the code is unknown or empty).
function computeCouponDiscount(code, items, subtotalCents) {
  const rule = rules()[String(code || '').trim().toUpperCase()];
  if (!rule || !Array.isArray(items) || !items.length || !subtotalCents) return 0;
  let cents = 0;
  if (rule === 'first_item_free') {
    cents = Math.max(...items.map(i => Math.round(Number(i.totalPrice || 0) * 100)));
  } else if (/^pct:\d+$/.test(rule)) {
    cents = Math.round(subtotalCents * Number(rule.slice(4)) / 100);
  }
  return Math.max(0, Math.min(cents, subtotalCents));
}

module.exports = { computeCouponDiscount };
