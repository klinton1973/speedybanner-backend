// Offline tests for cart-restore links (lib/restore.js) and the item cleaning in routes/started.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');

process.env.SUPABASE_URL = 'http://fake';
process.env.SUPABASE_SERVICE_KEY = 'test-secret';

const realLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === '@supabase/supabase-js') return { createClient: () => ({}) };
  return realLoad.call(this, request, ...rest);
};

const { sign, verify, restorableItems, restoreUrl } = require('../lib/restore');
const { cleanItems } = require('../routes/started')._test;

test('a signed token verifies and gives back the order id', () => {
  assert.equal(verify(sign(1234)), '1234');
});

test('tampered, re-targeted and junk tokens are refused', () => {
  const t = sign(1234);
  const mac = t.split('.')[1];
  assert.equal(verify(t.slice(0, -1) + (t.endsWith('A') ? 'B' : 'A')), null);
  assert.equal(verify('1235.' + mac), null);
  assert.equal(verify('abc'), null);
  assert.equal(verify(''), null);
  assert.equal(verify(undefined), null);
});

test('cleanItems keeps what a cart needs and always writes fileKey', () => {
  const out = cleanItems([
    { name: 'Banner', details: '2x4', totalPrice: 40, qty: 2, unitPrice: 20, fileKey: 'uploads/abc-1.pdf', thumbUrl: 'https://cdn.example.com/a.jpg' },
    { name: 'Note', totalPrice: '0', fileKey: '../secrets', thumbUrl: 'javascript:alert(1)', qty: -3 },
  ]);
  assert.deepEqual(out[0], { name: 'Banner', details: '2x4', totalPrice: 40, qty: 2, unitPrice: 20, fileKey: 'uploads/abc-1.pdf', thumbUrl: 'https://cdn.example.com/a.jpg', hasDesign: true });
  assert.equal(out[1].fileKey, null);
  assert.equal(out[1].thumbUrl, null);
  assert.equal(out[1].qty, 1);
  assert.ok(Object.prototype.hasOwnProperty.call(out[1], 'fileKey'));
});

test('rows saved without fileKey are not restorable', () => {
  assert.deepEqual(restorableItems([{ name: 'Banner', totalPrice: 20 }]), []);
});

test('the Saturday fee line is dropped so checkout does not charge it twice', () => {
  const items = restorableItems([
    { name: 'Banner', totalPrice: 20, fileKey: 'uploads/a.pdf' },
    { name: 'Saturday Delivery Upgrade', totalPrice: 35, fileKey: null },
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].name, 'Banner');
  assert.equal(items[0].hasDesign, true);
});

test('restoreUrl falls back to the plain homepage when the cart cannot be rebuilt', () => {
  assert.equal(restoreUrl('SpeedyBanner.com', { id: 7, items: [{ name: 'Banner' }] }), 'https://speedybanner.com/');
});

test('restoreUrl carries a valid token, and sports sites land on their cart page', () => {
  const items = [{ name: 'Banner', totalPrice: 20, fileKey: null }];
  const home = new URL(restoreUrl('SpeedyBanner.com', { id: 7, items }));
  assert.equal(home.pathname, '/');
  assert.equal(verify(home.searchParams.get('restore')), '7');
  const cart = new URL(restoreUrl('VarsityBanner.com', { id: 8, items }));
  assert.equal(cart.pathname, '/order/cart/');
  assert.equal(verify(cart.searchParams.get('restore')), '8');
});
