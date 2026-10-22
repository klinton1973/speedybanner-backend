// Offline tests for the Square backend. No network, no real database: Supabase, Resend and
// Square's API are all faked. Run with:  npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const http = require('http');
const Module = require('module');

process.env.SUPABASE_URL = 'http://fake'; process.env.SUPABASE_SERVICE_KEY = 'x';
process.env.RESEND_API_KEY = 're_x'; process.env.STRIPE_SECRET_KEY = 'sk_test_x';
process.env.SQUARE_ACCESS_TOKEN = 'sq_x'; process.env.SQUARE_LOCATION_ID = 'LOC1';
process.env.SQUARE_APPLICATION_ID = 'sandbox-sq0idb-x'; process.env.SQUARE_ENV = 'sandbox';
process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = 'sigkey'; process.env.SQUARE_WEBHOOK_URL = 'https://api.example.com/webhook/square';
process.env.NOTIFY_EMAIL = 'me@example.com';

// ── fakes ──────────────────────────────────────────────────────────────────
const db = { orders: [], nextId: 1 };
const sent = [];
function fakeSupabase() {
  return { from(table) {
    assert.equal(table, 'orders');
    let op, payload, filters = [];
    const exec = () => {
      let rows = db.orders.filter(r => filters.every(([k, v]) => r[k] === v));
      if (op === 'insert') { const row = { id: 'ord-' + db.nextId++, ...payload }; db.orders.push(row); return { data: row, error: null }; }
      if (op === 'update') { rows.forEach(r => Object.assign(r, payload)); return { data: rows[0] || null, error: null }; }
      return { data: rows[0] || null, error: null };
    };
    const q = {
      insert(p) { op = 'insert'; payload = p; return q; }, update(p) { op = 'update'; payload = p; return q; },
      select() { return q; }, eq(k, v) { filters.push([k, v]); return q; },
      single() { return Promise.resolve(exec()); }, maybeSingle() { return Promise.resolve(exec()); },
    };
    return q;
  } };
}
const realLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === '@supabase/supabase-js') return { createClient: fakeSupabase };
  if (request === 'resend') return { Resend: class { constructor() { this.emails = { send: async m => { sent.push(m); return { error: null }; } }; } } };
  if (request === 'stripe') return () => ({ webhooks: { constructEvent: (body) => JSON.parse(body.toString('utf8')) } });
  if (request === './upload') return { fetchFileFromR2: async () => { throw new Error('no r2 in tests'); } };
  return realLoad.call(this, request, ...rest);
};

// Square API fake, keyed on method+path. Anything else (our own localhost calls) goes through.
let squareScript = {};
const realFetch = global.fetch;
global.fetch = async (url, opts = {}) => {
  if (!String(url).includes('squareupsandbox.com')) return realFetch(url, opts);
  const path = new URL(url).pathname + new URL(url).search;
  const key = `${opts.method || 'GET'} ${path}`;
  const handler = squareScript[key];
  assert.ok(handler, 'unexpected Square call: ' + key);
  const body = opts.body ? JSON.parse(opts.body) : undefined;
  squareScript.calls = (squareScript.calls || []).concat({ key, body });
  const { status = 200, json } = handler(body);
  return { ok: status < 400, status, json: async () => json };
};

const express = require('express');
const app = express();
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use('/checkout', require('../routes/square'));
app.use('/webhook/square', require('../routes/square-webhook'));
app.use('/webhook', require('../routes/webhook'));
let server, base;
test.before(async () => { server = http.createServer(app); await new Promise(r => server.listen(0, r)); base = 'http://127.0.0.1:' + server.address().port; });
test.after(() => server.close());
test.beforeEach(() => { db.orders.length = 0; db.nextId = 1; sent.length = 0; squareScript = {}; });

const post = (path, body, headers = {}) => realFetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://speedybanner.com', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const order = (extra = {}) => ({ items: [{ name: 'Banner', details: '4x2', totalPrice: 40 }], customerEmail: 'a@b.com', shippingAddress: { name: 'A B' }, sourceId: 'cnon:card-nonce-ok', termsAccepted: true, termsVersion: 'v3', ...extra });

test('config defaults to stripe and exposes only public Square ids', async () => {
  const r = await (await realFetch(base + '/checkout/config')).json();
  assert.equal(r.provider, 'stripe');
  assert.deepEqual(r.square, { applicationId: 'sandbox-sq0idb-x', locationId: 'LOC1', environment: 'sandbox' });
  assert.ok(!JSON.stringify(r).includes('sq_x'));
});

test('successful charge: right amount, idempotent, order marked paid, both emails sent', async () => {
  squareScript['POST /v2/payments'] = () => ({ json: { payment: { id: 'PAY1', status: 'COMPLETED', receipt_url: 'https://sq/r' } } });
  const res = await post('/checkout/square-pay', order());
  const body = await res.json();
  assert.equal(res.status, 200); assert.equal(body.success, true); assert.equal(body.paymentId, 'PAY1');
  const call = squareScript.calls[0].body;
  assert.equal(call.amount_money.amount, 4000); assert.equal(call.idempotency_key, 'order-ord-1');
  assert.equal(call.reference_id, 'ord-1'); assert.equal(call.autocomplete, true);
  assert.match(call.note, /terms accepted/);
  const o = db.orders[0];
  assert.equal(o.status, 'paid'); assert.equal(o.square_payment_id, 'PAY1'); assert.equal(o.payment_provider, 'square');
  assert.equal(o.terms_version, 'v3'); assert.ok(o.paid_at);
  assert.equal(sent.length, 2);
  assert.match(sent[1].html, /Square Payment: PAY1/);
});

test('declined card: 402 with a friendly message, order stays pending, no emails', async () => {
  squareScript['POST /v2/payments'] = () => ({ status: 402, json: { errors: [{ category: 'PAYMENT_METHOD_ERROR', code: 'CVV_FAILURE' }] } });
  const res = await post('/checkout/square-pay', order());
  assert.equal(res.status, 402);
  assert.match((await res.json()).error, /security code/);
  assert.equal(db.orders[0].status, 'pending'); assert.equal(sent.length, 0);
});

test('price tampering and missing token are rejected before any charge', async () => {
  let r = await post('/checkout/square-pay', order({ items: [{ id: 'vinyl-banner', name: 'x', totalPrice: 5 }] }));
  assert.equal(r.status, 400);
  r = await post('/checkout/square-pay', order({ sourceId: undefined }));
  assert.equal(r.status, 400);
});

test('100% coupon order is saved paid with no Square call', async () => {
  const res = await post('/checkout/square-pay', order({ discountCents: 4000, sourceId: undefined }));
  assert.equal((await res.json()).free, true);
  assert.equal(db.orders[0].amount_cents, 0); assert.equal(db.orders[0].status, 'paid');
});

test('saved card owned by someone else is refused', async () => {
  squareScript['POST /v2/customers/search'] = () => ({ json: { customers: [{ id: 'CUST1' }] } });
  squareScript['GET /v2/cards/CARDX'] = () => ({ json: { card: { id: 'CARDX', customer_id: 'OTHER', enabled: true } } });
  const res = await post('/checkout/square-pay', order({ savedCardId: 'CARDX' }));
  assert.equal(res.status, 400);
  assert.equal(squareScript.calls.some(c => c.key === 'POST /v2/payments'), false);
});

test('save-card flow charges with customer id then stores the card from the payment', async () => {
  squareScript['POST /v2/customers/search'] = () => ({ json: {} });
  squareScript['POST /v2/customers'] = () => ({ json: { customer: { id: 'CUST1' } } });
  squareScript['POST /v2/payments'] = () => ({ json: { payment: { id: 'PAY2', status: 'COMPLETED' } } });
  squareScript['POST /v2/cards'] = () => ({ json: { card: { id: 'CARD1' } } });
  const res = await post('/checkout/square-pay', order({ saveCard: true }));
  assert.equal(res.status, 200);
  await new Promise(r => setTimeout(r, 20));
  const pay = squareScript.calls.find(c => c.key === 'POST /v2/payments').body;
  assert.equal(pay.customer_id, 'CUST1');
  const card = squareScript.calls.find(c => c.key === 'POST /v2/cards').body;
  assert.equal(card.source_id, 'PAY2'); assert.equal(card.card.customer_id, 'CUST1');
});

const sign = raw => crypto.createHmac('sha256', 'sigkey').update('https://api.example.com/webhook/square' + raw).digest('base64');

test('webhook: bad signature rejected', async () => {
  const raw = JSON.stringify({ type: 'payment.updated' });
  const res = await post('/webhook/square', raw, { 'x-square-hmacsha256-signature': 'nope' });
  assert.equal(res.status, 400);
});

test('webhook: completes a pending order once, and a repeat does not re-send emails', async () => {
  db.orders.push({ id: 'ord-9', status: 'pending', customer_email: 'a@b.com', amount_cents: 4000, items: [], site: 'SpeedyBanner.com' });
  const raw = JSON.stringify({ type: 'payment.updated', data: { object: { payment: { id: 'PAYW', status: 'COMPLETED', reference_id: 'ord-9' } } } });
  const h = { 'x-square-hmacsha256-signature': sign(raw) };
  assert.equal((await post('/webhook/square', raw, h)).status, 200);
  assert.equal(db.orders[0].status, 'paid'); assert.equal(db.orders[0].square_payment_id, 'PAYW');
  assert.equal(sent.length, 2);
  await post('/webhook/square', raw, h);
  assert.equal(sent.length, 2, 'duplicate webhook must not send emails again');
});

test('webhook: dispute.created emails the owner with the order and deadline', async () => {
  db.orders.push({ id: 'ord-5', status: 'paid', square_payment_id: 'PAYD', customer_email: 'x@y.com', site: 'SpeedyBanner.com' });
  const raw = JSON.stringify({ type: 'dispute.created', data: { object: { dispute: { id: 'D1', amount_money: { amount: 4000 }, reason: 'NO_KNOWLEDGE', due_at: '2026-11-01', disputed_payment: { payment_id: 'PAYD' } } } } });
  await post('/webhook/square', raw, { 'x-square-hmacsha256-signature': sign(raw) });
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /\$40\.00/); assert.match(sent[0].html, /x@y\.com/);
});

test('503 when Square is not configured (live Stripe-only deployments stay unaffected)', async () => {
  const saved = process.env.SQUARE_ACCESS_TOKEN; delete process.env.SQUARE_ACCESS_TOKEN;
  try { assert.equal((await post('/checkout/square-pay', order())).status, 503); }
  finally { process.env.SQUARE_ACCESS_TOKEN = saved; }
});

test('REGRESSION: the existing Stripe webhook still marks the order paid and sends both emails', async () => {
  db.orders.push({ id: 'ord-7', status: 'pending', customer_email: 'a@b.com', amount_cents: 4000, items: [], site: 'SpeedyBanner.com', stripe_payment_intent_id: 'pi_1' });
  const raw = JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { metadata: { orderId: 'ord-7', customerEmail: 'a@b.com' } } } });
  const res = await post('/webhook', raw, { 'stripe-signature': 'x' });
  assert.equal(res.status, 200);
  assert.equal(db.orders[0].status, 'paid');
  assert.equal(sent.length, 2);
  assert.match(sent[1].html, /Stripe Payment Intent: pi_1/);
});
