import re,sys
src='./source/'
js=open(src+'speedybanner-live-app.js',encoding='utf-8').read()
html=open(src+'speedybanner-live.html',encoding='utf-8').read()
def rep(s,old,new,count=1):
    assert s.count(old)==count,(old[:60],s.count(old))
    return s.replace(old,new)

SQ_BLOCK = r'''
// ===== SQUARE (test copy) =====
let SQ_ACTIVE = false, sqPayments = null, sqCard = null, sqSourceId = null;
async function sqLoadConfig() {
  try { const r = await fetch(BACKEND_URL + '/checkout/config'); if (!r.ok) return null; return await r.json(); } catch (e) { return null; }
}
function sqLoadSdk(env, cb) {
  if (window.Square) { cb(); return; }
  const s = document.createElement('script');
  s.src = env === 'production' ? 'https://web.squarecdn.com/v1/square.js' : 'https://sandbox.web.squarecdn.com/v1/square.js';
  s.onload = cb;
  s.onerror = () => { const el = document.getElementById('stripe-card-element'); if (el) el.innerHTML = '<div style="padding:12px;background:#fef3cd;border-radius:6px;font-size:12px;font-weight:700;color:#92400e">⚠️ Payment system unavailable. Please call or email us to place your order.</div>'; };
  document.head.appendChild(s);
}
async function initSquare(cfg) {
  SQ_ACTIVE = true;
  document.querySelectorAll('div,span').forEach(function (n) {
    if (!n.children.length && /(Powered|Secured) by Stripe/.test(n.textContent)) n.textContent = n.textContent.replace('Stripe', 'Square');
  });
  const errEl = document.getElementById('stripe-card-errors');
  if (sqCard) { if (errEl) errEl.textContent = ''; return; }
  sqLoadSdk(cfg.environment, async function () {
    try {
      sqPayments = window.Square.payments(cfg.applicationId, cfg.locationId);
      sqCard = await sqPayments.card({ style: { input: { fontSize: '16px', color: '#1a1a2e' }, 'input::placeholder': { color: '#9ca3af' } } });
      await sqCard.attach('#stripe-card-element');
    } catch (e) {
      sqCard = null;
      console.error('Square init error:', e);
      const el = document.getElementById('stripe-card-element');
      if (el) el.innerHTML = '<div style="padding:12px;background:#fef3cd;border-radius:6px;font-size:12px;font-weight:700;color:#92400e">⚠️ Payment system unavailable. Please call or email us to place your order.</div>';
    }
  });
}
async function sqTokenize() {
  if (!sqCard) throw new Error('Card form is not ready. Please refresh and try again.');
  const r = await sqCard.tokenize();
  if (r.status !== 'OK') {
    const m = (r.errors && r.errors[0] && r.errors[0].message) || 'Please check your card details.';
    throw new Error(m);
  }
  return r.token;
}
'''
# 1. SDK helpers + async initStripe that diverts to Square
js=rep(js,"let stripe, stripeCardElement;\n", "let stripe, stripeCardElement;\n"+SQ_BLOCK)
js=rep(js,"function initStripe() {\n",
 "async function initStripe() {\n  const _cfg = await sqLoadConfig();\n  if (_cfg && _cfg.provider === 'square' && _cfg.square) { return initSquare(_cfg.square); }\n")
# 2. saved cards route
js=rep(js,"fetch(BACKEND_URL + '/checkout/saved-cards?email='","fetch(BACKEND_URL + (SQ_ACTIVE ? '/checkout/square-saved-cards' : '/checkout/saved-cards') + '?email='")
# 3. payment request in processPayment
marker="  // ── Call backend to create Stripe PaymentIntent ───────────────────────────\n  let clientSecret;\n  try {\n    const res = await fetch(BACKEND_URL + '/checkout/create-payment-intent', {"
new="""  // ── Call backend to create Stripe PaymentIntent (or charge via Square) ─────
  let clientSecret;
  try {
    if (SQ_ACTIVE && !selectedSavedCardId) { sqSourceId = await sqTokenize(); }
    const res = await fetch(BACKEND_URL + (SQ_ACTIVE ? '/checkout/square-pay' : '/checkout/create-payment-intent'), {"""
js=rep(js,marker,new)
old_tail="        saveCard: !selectedSavedCardId && !!document.getElementById('save-card-cb')?.checked,\n        savedPaymentMethodId: selectedSavedCardId || undefined\n"
js=rep(js,old_tail,old_tail.rstrip('\n')+",\n        sourceId: SQ_ACTIVE ? (selectedSavedCardId ? undefined : sqSourceId) : undefined,\n        savedCardId: SQ_ACTIVE ? (selectedSavedCardId || undefined) : undefined\n")
js=rep(js,"    clientSecret = data.clientSecret;\n  } catch(err) {","    clientSecret = SQ_ACTIVE ? ('square_' + (data.paymentId || data.orderId)) : data.clientSecret;\n  } catch(err) {")
# 4. skip Stripe confirm when Square
old="  const { error: stripeError } = selectedSavedCardId\n    ? await stripe.confirmCardPayment"
js=rep(js,old,"  const { error: stripeError } = SQ_ACTIVE ? {} : selectedSavedCardId\n    ? await stripe.confirmCardPayment")
js=rep(js,"const BACKEND_URL = 'https://speedybanner-backend-production.up.railway.app';","const BACKEND_URL = location.origin; // TEST COPY: talk to the local test server")
open('./app.js','w',encoding='utf-8').write(js)

# html: relative app.js so it loads the patched copy
html=rep(html,'src="/app.js?v=39f9382c"','src="app.js"')
open('./index.html','w',encoding='utf-8').write(html)
print('ok')
