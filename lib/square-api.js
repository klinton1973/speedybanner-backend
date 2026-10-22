// Thin Square REST client. Uses Node's built-in fetch (Node 18+), so there is no extra
// dependency and no SDK-version drift to maintain. All Square calls go through here.
//
// Environment:
//   SQUARE_ACCESS_TOKEN  server-side secret (sandbox token while testing)
//   SQUARE_ENV           'sandbox' (default) or 'production'
//   SQUARE_LOCATION_ID   the Square location that receives the money

const crypto = require('crypto');

const HOSTS = {
  sandbox: 'https://connect.squareupsandbox.com',
  production: 'https://connect.squareup.com',
};
const SQUARE_VERSION = '2025-01-23';

function squareEnv() {
  return process.env.SQUARE_ENV === 'production' ? 'production' : 'sandbox';
}

function isConfigured() {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

// Returns { ok, status, data, errors }. Never throws on an HTTP error response —
// a card decline is an expected outcome, not an exception. Network failures do throw.
async function squareRequest(method, path, body) {
  const res = await fetch(HOSTS[squareEnv()] + path, {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Square-Version': SQUARE_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, data, errors: data.errors || [] };
}

// Turns Square's error list into a message that is safe and useful to show a shopper.
function friendlyPaymentError(errors) {
  const e = (errors || [])[0] || {};
  const messages = {
    CVV_FAILURE: "The card's security code didn't match. Please check it and try again.",
    VERIFY_CVV_FAILURE: "The card's security code didn't match. Please check it and try again.",
    ADDRESS_VERIFICATION_FAILURE: "The billing ZIP code didn't match the card. Please check it and try again.",
    VERIFY_AVS_FAILURE: "The billing ZIP code didn't match the card. Please check it and try again.",
    INVALID_EXPIRATION: "The card's expiration date is invalid.",
    EXPIRATION_FAILURE: "The card has expired or the expiration date is wrong.",
    CARD_EXPIRED: 'That card has expired.',
    INSUFFICIENT_FUNDS: 'The card has insufficient funds. Please try another card.',
    CARD_NOT_SUPPORTED: 'That card type is not supported. Please try another card.',
    TRANSACTION_LIMIT: 'That card has reached its transaction limit. Please try another card.',
    PAYMENT_LIMIT_EXCEEDED: 'That payment is over the limit for this card. Please try another card.',
  };
  if (messages[e.code]) return messages[e.code];
  if (e.category === 'PAYMENT_METHOD_ERROR') return 'Your card was declined. Please try another card.';
  return 'Payment could not be completed. Please try again.';
}

// Square signs webhooks with HMAC-SHA256 over (notification URL + raw body), base64.
function verifyWebhookSignature(rawBody, signatureHeader) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const url = process.env.SQUARE_WEBHOOK_URL;
  if (!key || !url || !signatureHeader) return false;
  const expected = crypto.createHmac('sha256', key).update(url + rawBody.toString('utf8')).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signatureHeader));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ── Customers & cards on file (the "save my card" feature) ──────────────────

async function findCustomerByEmail(email) {
  const r = await squareRequest('POST', '/v2/customers/search', {
    query: { filter: { email_address: { exact: email } } },
    limit: 1,
  });
  return r.ok && r.data.customers && r.data.customers[0] ? r.data.customers[0] : null;
}

async function findOrCreateCustomer(email) {
  const existing = await findCustomerByEmail(email);
  if (existing) return existing;
  const key = 'cust-' + crypto.createHash('sha1').update(email.toLowerCase()).digest('hex').slice(0, 30);
  const r = await squareRequest('POST', '/v2/customers', { idempotency_key: key, email_address: email });
  if (!r.ok) throw new Error('Could not create Square customer: ' + JSON.stringify(r.errors));
  return r.data.customer;
}

module.exports = {
  squareEnv, isConfigured, squareRequest, friendlyPaymentError, verifyWebhookSignature,
  findCustomerByEmail, findOrCreateCustomer,
};
