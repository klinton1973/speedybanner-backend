# Adds Square Apple Pay / Google Pay / Cash App Pay and keeps ONLY Stripe Link from Stripe's express checkout.
# Input: ./app.js (output of patch.py) and ./source/speedybanner-live-app.js. Output: ./app.js (in place).
import re
live=open('./source/speedybanner-live-app.js',encoding='utf-8').read() if False else open('/mnt/user-data/uploads/Downloads/speedybanner-live-app.js',encoding='utf-8').read()
js=open('app.js',encoding='utf-8').read()
def rep(s,o,n):
    assert s.count(o)==1,(o[:60],s.count(o)); return s.replace(o,n)

# Stripe express block from the original, link only
a=live.index("    // ── Apple Pay / Google Pay / Link / Cash App")
b=live.index("  } catch(e) {\n    stripeCardElement = null;")
block=live[a:b]
block=rep(block,"paymentMethods: { applePay: 'always', googlePay: 'always', link: 'auto', cashApp: 'always' }",
  "paymentMethods: { applePay: 'never', googlePay: 'never', link: 'auto', cashApp: 'never', amazonPay: 'never', paypal: 'never' }")
block=rep(block,"expressCheckout.mount('#payment-request-button');","expressCheckout.mount('#sq-link-slot');")
block=block.replace("document.getElementById('payment-request-container').style.display = 'block';","document.getElementById('payment-request-container').style.display = 'block'; var _s=document.getElementById('sq-link-slot'); if(_s) _s.style.display='block';")
LINK="""
// Stripe Link only (Stripe's express button with every other wallet turned off)
function sqInitStripeLink() {
  try {
    loadStripeAndInit(() => {
      try {
        if (!stripe) stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
"""+block+"""
      } catch (e) { console.warn('Stripe Link unavailable:', e && e.message); }
    });
  } catch (e) { console.warn('Stripe Link unavailable:', e && e.message); }
}
"""

WALLETS=r'''
// Square Apple Pay / Google Pay / Cash App Pay (all charge through /checkout/square-pay)
let sqPreset = null, sqWalletPR = null, sqWalletsInit = false;
function sqTotalStr() { return getCheckoutTotal().toFixed(2); }
function sqReqOptions() { return { countryCode: 'US', currencyCode: 'USD', total: { amount: sqTotalStr(), label: 'Total' } }; }
function sqRefreshWallets() { try { if (sqWalletPR && sqWalletPR.update) sqWalletPR.update(sqReqOptions()); } catch (e) {} }
function sqWalletGate() {
  if (typeof coValidateCheckout === 'function' && !coValidateCheckout(true)) return false;
  if (!(document.getElementById('terms-ack') || {}).checked) { coTermsMsg(); return false; }
  return true;
}
async function sqWalletPay(tokenizeFn) {
  if (!sqWalletGate()) return;
  try {
    useNewCard();
    const r = await tokenizeFn();
    if (r.status === 'OK') { sqPreset = r.token; processPayment(); }
    else if (r.status !== 'Cancel' && r.status !== 'Abort') {
      const m = (r.errors && r.errors[0] && r.errors[0].message) || 'That payment method could not be used.';
      const e = document.getElementById('stripe-card-errors'); if (e) e.textContent = '⚠️ ' + m;
    }
  } catch (e) { console.warn('Wallet payment error:', e && e.message); }
}
async function sqInitWallets() {
  if (sqWalletsInit || !sqPayments) return;
  const host = document.getElementById('payment-request-button');
  const cont = document.getElementById('payment-request-container');
  if (!host || !cont) return;
  sqWalletsInit = true;
  host.innerHTML = '<div id="sq-wallets" style="display:flex;flex-direction:column;gap:8px"></div><div id="sq-link-slot" style="display:none;margin-top:8px"></div>';
  const wrap = document.getElementById('sq-wallets');
  const pr = sqPayments.paymentRequest(sqReqOptions());
  sqWalletPR = pr;
  let shown = 0;
  const reveal = () => { shown++; cont.style.display = 'block'; };
  try {
    const g = await sqPayments.googlePay(pr);
    const d = document.createElement('div'); d.id = 'sq-gpay'; wrap.appendChild(d);
    await g.attach('#sq-gpay', { buttonSizeMode: 'fill', buttonColor: 'black' });
    d.addEventListener('click', (ev) => { ev.preventDefault(); sqWalletPay(() => g.tokenize()); });
    reveal();
  } catch (e) { console.info('Google Pay not available:', e && e.message); }
  try {
    const ap = await sqPayments.applePay(pr);
    const b = document.createElement('button'); b.type = 'button'; b.id = 'sq-apay';
    b.setAttribute('aria-label', 'Pay with Apple Pay');
    b.style.cssText = 'height:48px;border:0;border-radius:8px;background:#000;color:#fff;font-size:18px;font-weight:600;cursor:pointer;-webkit-appearance:-apple-pay-button;-apple-pay-button-type:plain;-apple-pay-button-style:black;';
    wrap.appendChild(b);
    b.addEventListener('click', () => sqWalletPay(() => ap.tokenize()));
    reveal();
  } catch (e) { console.info('Apple Pay not available:', e && e.message); }
  try {
    const cash = await sqPayments.cashAppPay(pr, { redirectURL: window.location.href, referenceId: 'sb-' + Date.now() });
    const d = document.createElement('div'); d.id = 'sq-cashapp'; wrap.appendChild(d);
    await cash.attach('#sq-cashapp', { shape: 'semiround', width: 'full' });
    cash.addEventListener('ontokenization', (ev) => {
      const t = ev.detail && ev.detail.tokenResult;
      if (t && t.status === 'OK') { if (!sqWalletGate()) return; useNewCard(); sqPreset = t.token; processPayment(); }
    });
    reveal();
  } catch (e) { console.info('Cash App Pay not available:', e && e.message); }
  sqInitStripeLink();
}
'''
js=rep(js,"// ===== SQUARE (test copy) =====\n","// ===== SQUARE (test copy) =====\n"+LINK+WALLETS)
# start wallets after the card form is attached
js=rep(js,"      await sqCard.attach('#stripe-card-element');\n","      await sqCard.attach('#stripe-card-element');\n      sqInitWallets();\n")
# use preset token from a wallet when present
js=rep(js,"if (SQ_ACTIVE && !selectedSavedCardId) { sqSourceId = await sqTokenize(); }",
 "if (SQ_ACTIVE && !selectedSavedCardId) { if (sqPreset) { sqSourceId = sqPreset; sqPreset = null; } else { sqSourceId = await sqTokenize(); } }")
# keep wallet total in sync with the checkout total
js+="\n;(function(){ var _u = updateCheckoutTotal; updateCheckoutTotal = function(){ var r = _u.apply(this, arguments); try { sqRefreshWallets(); } catch(e){} return r; }; })();\n"
open('app.js','w',encoding='utf-8').write(js)
print('ok')
