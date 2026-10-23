const RUN_ID = Date.now().toString(36); // unique per run so Square sandbox never sees a reused idempotency key
// Local sandbox-test mode (ALLOW_LOCAL_TEST=1). Replaces the database, email and Stripe clients
// with harmless stand-ins, so a test run on your own computer:
//   - never reads or writes the live Supabase database (orders live in memory and vanish on exit)
//   - never sends an email (it prints what it would have sent)
//   - never touches Stripe
// The only real network call left is to Square's SANDBOX, which moves no real money.
const Module = require('module');

const rows = [];
let nextId = 1;

function fakeSupabase() {
  return { from() {
    let op, payload; const filters = [];
    const exec = () => {
      const hit = rows.filter(r => filters.every(([k, v]) => r[k] === v));
      if (op === 'insert') { const row = { id: 'local-test-' + RUN_ID + '-' + nextId++, created_at: new Date().toISOString(), ...payload }; rows.push(row);
        console.log(`[test-mode] order saved in memory: ${row.id} status=${row.status} amount_cents=${row.amount_cents}`); return { data: row, error: null }; }
      if (op === 'update') { hit.forEach(r => Object.assign(r, payload)); if (hit[0]) console.log(`[test-mode] order ${hit[0].id} -> status=${hit[0].status}`); return { data: hit[0] || null, error: null }; }
      return { data: hit[0] || null, error: null };
    };
    const q = {
      insert(p) { op = 'insert'; payload = p; return q; }, update(p) { op = 'update'; payload = p; return q; },
      select() { return q; }, eq(k, v) { filters.push([k, v]); return q; },
      single() { return Promise.resolve(exec()); }, maybeSingle() { return Promise.resolve(exec()); },
    };
    return q;
  } };
}

class FakeResend {
  constructor() {
    this.emails = { send: async m => { console.log(`[test-mode] email NOT sent: to=${m.to} subject=${m.subject}`); return { error: null }; } };
  }
}

const realLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === '@supabase/supabase-js') return { createClient: fakeSupabase };
  if (request === 'resend') return { Resend: FakeResend };
  if (request === 'stripe') return () => ({});
  return realLoad.call(this, request, ...rest);
};
console.log('[test-mode] LOCAL TEST MODE: in-memory database, no emails, no Stripe. Square SANDBOX only.');
