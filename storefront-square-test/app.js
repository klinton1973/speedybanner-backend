// ===== DESIGNER PANEL SWITCHER =====
function dsShowPanel(panel) {
  const panels = ['text','image','bg','emoji','size','canva','qr','shapes'];
  const tp = document.getElementById('ds-tools-panel');
  const isMobile = window.innerWidth <= 600;
  const activeBtn = document.getElementById('dsb-' + panel);
  const alreadyActive = activeBtn && activeBtn.classList.contains('active');

  panels.forEach(p => {
    const el = document.getElementById('dsp-' + p);
    const btn = document.getElementById('dsb-' + p);
    if (el) el.style.display = p === panel ? 'flex' : 'none';
    if (btn) btn.classList.toggle('active', p === panel);
  });

  if (tp) {
    if (isMobile && alreadyActive) {
      // Tap same tab again — toggle drawer closed
      tp.classList.add('collapsed');
      panels.forEach(p => {
        const btn = document.getElementById('dsb-' + p);
        if (btn) btn.classList.remove('active');
      });
    } else {
      tp.classList.remove('collapsed');
    }
  }
}

// ===== BANNER TAB SWITCHER =====
function switchBannerTab(tab) {
  ['13oz','18oz','custom'].forEach(t => {
    const panel = document.getElementById('panel-'+t);
    const btn   = document.getElementById('tab-'+t);
    if (!panel || !btn) return;
    const isActive = t === tab;
    panel.style.display = isActive ? 'block' : 'none';
    btn.style.background = isActive ? 'var(--blue)' : '#fff';
    btn.style.color = isActive ? '#fff' : 'var(--blue-dark)';
    btn.style.borderColor = isActive ? 'var(--blue)' : '#e8eaf6';
  });
}

// ===== CAROUSEL SCROLLER =====
function scrollCarousel(trackId, dir) {
  const track = document.getElementById(trackId);
  if (!track) return;
  track.scrollBy({left: dir * 300, behavior: 'smooth'});
}

// ===== MOBILE MENU =====
function openMobileMenu(){
  document.getElementById('mobile-drawer').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeMobileMenu(){
  document.getElementById('mobile-drawer').classList.remove('open');
  document.body.style.overflow='';
}
function mdwGo(pageId){
  closeMobileMenu();
  showPage(pageId);
}

// ===== LOGO =====
// Embed logo as base64 — set both header and hero
const LOGO_B64 = '/images/logo.webp';
const MAGNET_B64 = '/images/magnet-infographic.webp';
const YARDSIGN_B64 = '/images/yardsign-bulk.webp';
const YS_18X24_B64 = '/images/ys-18x24.webp';
const YS_24X24_B64 = '/images/ys-24x24.webp';
const YS_16X24_B64 = '/images/ys-16x24.webp';
const YS_EX1_B64 = '/images/ys-example-1.webp';
const YS_EX2_B64 = '/images/ys-example-2.webp';
const YS_EX3_B64 = '/images/ys-example-3.webp';
const TSHIRT2_B64 = '/images/tshirt-2.webp';
const TSHIRT_B64 = '/images/tshirt-1.webp';
const FEDEX_B64 = '/images/fedex-logo.webp';
const STAND_B64 = '/images/banner-stand.webp';
const TENT_B64 = '/images/tent-banner.webp';

function initImages() {
  const headerLogo = document.getElementById('header-logo'); if(headerLogo) headerLogo.src = LOGO_B64;
  const heroLogo = document.getElementById('hero-logo'); if(heroLogo) heroLogo.src = LOGO_B64;
  const tentImg = document.getElementById('tent-example-img'); if(tentImg) tentImg.src = TENT_B64;
  // stand-example-img replaced by inline img tags
  document.querySelectorAll('.fedex-logo-inline').forEach(el => el.src = FEDEX_B64);
  const fedexTop = document.getElementById('fedex-topbar'); if(fedexTop) fedexTop.src = FEDEX_B64;
  const fedexFoot = document.getElementById('fedex-footer'); if(fedexFoot) fedexFoot.src = FEDEX_B64;
  const tshirtImg = document.getElementById('tshirt-example-img'); if(tshirtImg) tshirtImg.src = TSHIRT_B64;
  const tshirt2Img = document.getElementById('tshirt2-example-img'); if(tshirt2Img) tshirt2Img.src = TSHIRT2_B64;
  const magnetImg = document.getElementById('magnet-example-img'); if(magnetImg) magnetImg.src = MAGNET_B64;
  const yardsignImg = document.getElementById('yardsign-example-img'); if(yardsignImg) yardsignImg.src = YARDSIGN_B64;
  const ys18 = document.getElementById('ys-18x24-img'); if(ys18) ys18.src = YS_18X24_B64;
  const ys24 = document.getElementById('ys-24x24-img'); if(ys24) ys24.src = YS_24X24_B64;
  const ysIndiv24 = document.getElementById('ys-indiv-24x24-img'); if(ysIndiv24) ysIndiv24.src = YS_24X24_B64;
  const ys16 = document.getElementById('ys-16x24-img'); if(ys16) ys16.src = YS_16X24_B64;
  const ysEx1 = document.getElementById('ys-ex1-img'); if(ysEx1) ysEx1.src = YS_EX1_B64;
  const ysEx2 = document.getElementById('ys-ex2-img'); if(ysEx2) ysEx2.src = YS_EX2_B64;
  const ysEx3 = document.getElementById('ys-ex3-img'); if(ysEx3) ysEx3.src = YS_EX3_B64;
}
document.addEventListener('DOMContentLoaded', () => {
  initImages();
  // Sync FedEx logos in active carousel slide
  setTimeout(() => {
    const fl = document.getElementById('header-logo');
    if (fl && fl.src) {
      document.querySelectorAll('.slide-fedex-logo').forEach(el => el.src = fl.src);
    }
  }, 100);
});

// ===== PAGE ROUTING =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({top:0, behavior:'smooth'});
    // recalc prices when page shown
    const calcs = {
      'banner-13oz': calc13oz, 'banner-18oz': calc18oz, 'banner-mesh': calcMesh,
      'banner-table': calcRunner, 'banner-backdrop': calcBackdrop, 'graduation-banners': calcGraduation, 'player-banners': calcPlayer, 'banner-custom': calcCustom,
      'yard-signs': ()=>{calcYardSign();calcYardSignPkg();},
      'banner-stands': calcStand, 'magnets': ()=>{calcMagnet();calcMagnetSingle();},
      'tent-banners': ()=>{calcTent();calcTentSkirt();},
      'tshirts': calcTshirt, 'biz-cards': calcBizCard, 'realtor-signs': function(){calcRealtorPanel();calcRealtorRider();}
    };
    if (calcs[pageId]) calcs[pageId]();
  }
  if (typeof initSatDeliveryPanels === 'function') setTimeout(initSatDeliveryPanels, 50);
}

// ===== DEEP LINK: allow external pages (e.g. /yard-signs.html,
// /vinyl-banners.html, /car-magnets.html, etc.) to open a specific product
// panel via ?open=<pageId> or ?product=<pageId>, e.g. /?product=banner-custom
// (the existing landing pages already link using ?product=) =====
document.addEventListener('DOMContentLoaded', () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const pageId = params.get('open') || params.get('product');
    if (pageId && document.getElementById('page-' + pageId)) {
      showPage(pageId);
    }
  } catch (e) {}
});

// ===== FILE UPLOAD =====
let checkoutFileKey = null;

async function handleCheckoutFile(input) {
  const file = input.files[0];
  if (!file) return;
  const statusEl = document.getElementById('co-file-status');
  statusEl.style.color = '#1a3fa8';
  statusEl.textContent = '⏳ Uploading ' + file.name + '...';
  try {
    const uploadRes = await fetch(BACKEND_URL + '/upload/file', {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Filename': file.name },
      body: file,
    });
    if (!uploadRes.ok) throw new Error('Upload failed');
    const { fileKey } = await uploadRes.json();
    checkoutFileKey = fileKey;
    statusEl.style.color = '#16a34a';
    statusEl.textContent = '✅ ' + file.name + ' uploaded successfully';
  } catch (err) {
    statusEl.style.color = '#d42020';
    statusEl.textContent = '⚠️ Upload failed — please try again';
    checkoutFileKey = null;
  }
}

// ===== STRIPE =====
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SyWLSL6J7dz7njioBjju5TzqFeZxHy0YbHYQpvyPOmpgqIr3sAcu3TOlHT05a5nV0Oc11QlHAKvkMJZdp0XNr2D00wIDmJfGU';
const BACKEND_URL = location.origin; // TEST COPY: talk to the local test server
function trackPurchase(total, clientSecretOrId) {
  try {
    if (!window.gtag) return;
    var raw = clientSecretOrId || '';
    var txId = raw.indexOf('_secret_') !== -1 ? raw.split('_secret_')[0] : (raw || ('order_' + Date.now()));
    var itemsArr = (typeof cart !== 'undefined' ? cart : []).map(function(i) {
      return { item_name: i.name, price: i.price, quantity: i.qty || 1 };
    });
    gtag('event', 'purchase', { transaction_id: txId, value: total, currency: 'USD', items: itemsArr });
  } catch (e) { console.error('GA4 purchase tracking error:', e); }
}
function trackFunnel(eventName, itemList) {
  try {
    if (!window.gtag) return;
    var src = itemList || (typeof cart !== 'undefined' ? cart : []);
    var total = 0;
    var itemsArr = src.map(function(i) {
      var q = i.qty || 1;
      total += (i.price || 0);
      return { item_name: i.name, price: i.unitPrice || i.price, quantity: q };
    });
    gtag('event', eventName, { value: total, currency: 'USD', items: itemsArr });
  } catch (e) { console.error('GA4 ' + eventName + ' tracking error:', e); }
}
let stripe, stripeCardElement;

// ===== SQUARE (test copy) =====

// Stripe Link only (Stripe's express button with every other wallet turned off)
function sqInitStripeLink() {
  try {
    loadStripeAndInit(() => {
      try {
        if (!stripe) stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    // ── Apple Pay / Google Pay / Link / Cash App ────────────────────────────
    const totalCents = Math.round(getCheckoutTotal() * 100);
    if (totalCents > 0) {
      const expressElements = stripe.elements({ mode: 'payment', amount: totalCents, currency: 'usd' });
      const expressCheckout = expressElements.create('expressCheckout', {
        buttonHeight: 48,
        paymentMethods: { applePay: 'never', googlePay: 'never', link: 'auto', cashApp: 'never', amazonPay: 'never', paypal: 'never' }
      });
      expressCheckout.mount('#sq-link-slot');
      expressCheckout.on('loaderror', () => {});
      expressCheckout.on('ready', ({ availablePaymentMethods }) => {
        if (availablePaymentMethods && Object.values(availablePaymentMethods).some(Boolean)) {
          document.getElementById('payment-request-container').style.display = 'block'; var _s=document.getElementById('sq-link-slot'); if(_s) _s.style.display='block';
        }
      });
      expressCheckout.on('confirm', async (ev) => {
        if (typeof coValidateCheckout === 'function' && !coValidateCheckout(true)) { try { ev.paymentFailed({ reason: 'fail' }); } catch (e) {} return; }
        if (!(document.getElementById('terms-ack') || {}).checked) { try { ev.paymentFailed({ reason: 'fail' }); } catch (e) {} coTermsMsg(); return; }
        try {
          const emailVal = document.getElementById('co-email')?.value.trim() || ev.billingDetails?.email || '';
          const nameVal  = document.getElementById('co-first')?.value.trim() + ' ' + document.getElementById('co-last')?.value.trim();
          const expSatCb = document.getElementById('saturday-delivery-cb');
          const expSatFee = expSatCb && expSatCb.checked && !cartHasSatDelivery() ? 35 : 0;
          const expDiscount = getCouponDiscount();
          const res = await fetch(BACKEND_URL + '/checkout/create-payment-intent', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              termsAccepted: !!(document.getElementById('terms-ack') || {}).checked,
              termsVersion: '2026-09-22',
              items: expSatFee > 0 ? [...cart.map(i => ({ name: i.name, details: i.details, totalPrice: i.price, fileKey: i.fileKey || null })), { name: 'Saturday Delivery Upgrade', details: 'Weekend rush delivery add-on', totalPrice: expSatFee, qty: 1 }] : cart.map(i => ({ name: i.name, details: i.details, totalPrice: i.price, fileKey: i.fileKey || null })),
              customerEmail: emailVal,
              shippingAddress: {
                name: nameVal.trim() || ev.billingDetails?.name,
                street: coFullStreet('co-address'),
                city: document.getElementById('co-city')?.value.trim(),
                state: document.getElementById('co-state')?.value.trim(),
                zip: document.getElementById('co-zip')?.value.trim(),
                phone: document.getElementById('co-phone')?.value.trim()
              },
              fileKey: checkoutFileKey || null,
              discountCents: Math.round(expDiscount * 100)
            })
          });
          const data = await res.json();
          if (!res.ok) { expressCheckout.update({}); return; }
          const { error } = await stripe.confirmPayment({
            elements: expressElements,
            clientSecret: data.clientSecret,
            confirmParams: { return_url: window.location.href },
            redirect: 'if_required'
          });
          if (error) { document.getElementById('stripe-card-errors').textContent = error.message; return; }
          document.getElementById('payment-processing').style.display = 'none';
          document.getElementById('payment-success').style.display = 'block';
          if (window.fbq) fbq('track', 'Purchase', { value: getCheckoutTotal(), currency: 'USD', num_items: cart.length });
          trackPurchase(getCheckoutTotal(), data.clientSecret);
          startPrintProgress();
        } catch(err) { document.getElementById('stripe-card-errors').textContent = '⚠️ Payment failed — please try again.'; }
      });
    }

      } catch (e) { console.warn('Stripe Link unavailable:', e && e.message); }
    });
  } catch (e) { console.warn('Stripe Link unavailable:', e && e.message); }
}

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
  sqInitStripeLink(); // Link does not depend on the Square wallets loading
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
}
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
      sqInitWallets();
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
function loadStripeAndInit(callback) {
  if (window.Stripe) { callback(); return; }
  const s = document.createElement('script');
  s.src = 'https://js.stripe.com/v3/';
  s.onload = callback;
  document.head.appendChild(s);
}
async function initStripe() {
  const _cfg = await sqLoadConfig();
  if (_cfg && _cfg.square)  /* TEST COPY: always use Square when the test server has Square configured */ { return initSquare(_cfg.square); }
  // If already mounted, just clear the error div and return
  if (stripeCardElement) {
    const errEl = document.getElementById('stripe-card-errors');
    if (errEl) errEl.textContent = '';
    return;
  }
  loadStripeAndInit(() => {
  try {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    const elements = stripe.elements();
    stripeCardElement = elements.create('card',{style:{base:{fontFamily:'"Nunito",sans-serif',fontSize:'16px',color:'#1a1a2e','::placeholder':{color:'#9ca3af'}},invalid:{color:'#d42020'}}});
    stripeCardElement.mount('#stripe-card-element');
    stripeCardElement.on('change',e=>{document.getElementById('stripe-card-errors').textContent=e.error?e.error.message:'';});

    // ── Apple Pay / Google Pay / Link / Cash App ────────────────────────────
    const totalCents = Math.round(getCheckoutTotal() * 100);
    if (totalCents > 0) {
      const expressElements = stripe.elements({ mode: 'payment', amount: totalCents, currency: 'usd' });
      const expressCheckout = expressElements.create('expressCheckout', {
        buttonHeight: 48,
        paymentMethods: { applePay: 'always', googlePay: 'always', link: 'auto', cashApp: 'always' }
      });
      expressCheckout.mount('#payment-request-button');
      expressCheckout.on('loaderror', () => {});
      expressCheckout.on('ready', ({ availablePaymentMethods }) => {
        if (availablePaymentMethods && Object.values(availablePaymentMethods).some(Boolean)) {
          document.getElementById('payment-request-container').style.display = 'block';
        }
      });
      expressCheckout.on('confirm', async (ev) => {
        if (typeof coValidateCheckout === 'function' && !coValidateCheckout(true)) { try { ev.paymentFailed({ reason: 'fail' }); } catch (e) {} return; }
        if (!(document.getElementById('terms-ack') || {}).checked) { try { ev.paymentFailed({ reason: 'fail' }); } catch (e) {} coTermsMsg(); return; }
        try {
          const emailVal = document.getElementById('co-email')?.value.trim() || ev.billingDetails?.email || '';
          const nameVal  = document.getElementById('co-first')?.value.trim() + ' ' + document.getElementById('co-last')?.value.trim();
          const expSatCb = document.getElementById('saturday-delivery-cb');
          const expSatFee = expSatCb && expSatCb.checked && !cartHasSatDelivery() ? 35 : 0;
          const expDiscount = getCouponDiscount();
          const res = await fetch(BACKEND_URL + '/checkout/create-payment-intent', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              termsAccepted: !!(document.getElementById('terms-ack') || {}).checked,
              termsVersion: '2026-09-22',
              items: expSatFee > 0 ? [...cart.map(i => ({ name: i.name, details: i.details, totalPrice: i.price, fileKey: i.fileKey || null })), { name: 'Saturday Delivery Upgrade', details: 'Weekend rush delivery add-on', totalPrice: expSatFee, qty: 1 }] : cart.map(i => ({ name: i.name, details: i.details, totalPrice: i.price, fileKey: i.fileKey || null })),
              customerEmail: emailVal,
              shippingAddress: {
                name: nameVal.trim() || ev.billingDetails?.name,
                street: coFullStreet('co-address'),
                city: document.getElementById('co-city')?.value.trim(),
                state: document.getElementById('co-state')?.value.trim(),
                zip: document.getElementById('co-zip')?.value.trim(),
                phone: document.getElementById('co-phone')?.value.trim()
              },
              fileKey: checkoutFileKey || null,
              discountCents: Math.round(expDiscount * 100)
            })
          });
          const data = await res.json();
          if (!res.ok) { expressCheckout.update({}); return; }
          const { error } = await stripe.confirmPayment({
            elements: expressElements,
            clientSecret: data.clientSecret,
            confirmParams: { return_url: window.location.href },
            redirect: 'if_required'
          });
          if (error) { document.getElementById('stripe-card-errors').textContent = error.message; return; }
          document.getElementById('payment-processing').style.display = 'none';
          document.getElementById('payment-success').style.display = 'block';
          if (window.fbq) fbq('track', 'Purchase', { value: getCheckoutTotal(), currency: 'USD', num_items: cart.length });
          trackPurchase(getCheckoutTotal(), data.clientSecret);
          startPrintProgress();
        } catch(err) { document.getElementById('stripe-card-errors').textContent = '⚠️ Payment failed — please try again.'; }
      });
    }
  } catch(e) {
    stripeCardElement = null;
    const el=document.getElementById('stripe-card-element');
    if(el) el.innerHTML='<div style="padding:12px;background:#fef3cd;border-radius:6px;font-size:12px;font-weight:700;color:#92400e">⚠️ Payment system unavailable. Please call or email us to place your order.<br><a href="tel:+13474226637" style="color:#1a3fa8">(347) 422-6637</a><br><small style="font-weight:400;color:#6b7280">Error: '+e.message+'</small></div>';
    console.error('Stripe init error:', e);
  }
  }); // end loadStripeAndInit
}
// ===== COUPON SYSTEM =====
let couponApplied = false;
const VALID_COUPONS = {
  '8592306969': { type: 'first_item_free', label: '100% off your first item' }
};
function applyCoupon() {
  const code = (document.getElementById('coupon-input').value || '').trim().toUpperCase();
  const normalCode = (document.getElementById('coupon-input').value || '').trim();
  const msg = document.getElementById('coupon-msg');
  const match = VALID_COUPONS[normalCode] || VALID_COUPONS[code];
  if (!match) {
    msg.style.color = '#d42020';
    msg.textContent = '✕ Invalid coupon code.';
    couponApplied = false;
    updateCheckoutTotal();
    return;
  }
  couponApplied = true;
  msg.style.color = '#16a34a';
  msg.textContent = '✅ Coupon applied — ' + match.label + '!';
  updateCheckoutTotal();
}
function getCouponDiscount() {
  if (!couponApplied || !cart.length) return 0;
  // 100% off first item (cheapest price in cart)
  const prices = cart.map(i => i.price).sort((a, b) => b - a);
  return prices[0]; // discount the highest-priced (first added = biggest value)
}

// ===== ORDER SUBMISSION =====
async function processPayment() {
  if (typeof coValidateCheckout === 'function' && !coValidateCheckout()) return;
  const required = ['co-first','co-last','co-email','co-phone','co-address','co-city','co-state','co-zip'];
  for (const id of required) {
    if (!document.getElementById(id)?.value.trim()) {
      alert('Please fill in all required fields including phone number.');
      return;
    }
  }
  if (!(document.getElementById('terms-ack') || {}).checked) { coTermsMsg(); var tw = document.getElementById('terms-ack-wrap'); if (tw) tw.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  const btn = document.getElementById('place-order-btn');
  const proc = document.getElementById('payment-processing');
  const errEl = document.getElementById('stripe-card-errors');
  btn.style.display = 'none';
  proc.style.display = 'block';

  const name = document.getElementById('co-first').value.trim() + ' ' + document.getElementById('co-last').value.trim();
  const email = document.getElementById('co-email').value.trim();
  const phone = document.getElementById('co-phone').value.trim();
  const address = coFullStreet('co-address') + ', ' +
                  document.getElementById('co-city').value.trim() + ', ' +
                  document.getElementById('co-state').value.trim() + ' ' +
                  document.getElementById('co-zip').value.trim();
  const notes = document.getElementById('co-notes')?.value.trim() || '';
  const couponCode = document.getElementById('coupon-input')?.value.trim() || 'None';
  const discount = getCouponDiscount();
  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const emailOptIn = document.getElementById('email-optin-cb')?.checked ? 'YES - Send deals & coupons' : 'No';
  const satCb = document.getElementById('saturday-delivery-cb');
  const satFee = satCb && satCb.checked && !cartHasSatDelivery() ? 35 : 0;
  const total = Math.max(0, subtotal - discount + satFee);

  const orderLines = cart.map((i, idx) =>
    (idx === 0 && couponApplied ? '[FREE - COUPON] ' : '') +
    i.name + ' — ' + i.details + ' — $' + i.price.toFixed(2)
  ).join('\n');

  const NL = '\n';
  const orderText = '=== NEW ORDER - SPEEDYBANNER.COM ===' + NL + NL +
    'CUSTOMER' + NL +
    'Name: ' + name + NL +
    'Email: ' + email + NL +
    'Phone: ' + phone + NL +
    'Ship To: ' + address + NL + NL +
    'ORDER ITEMS' + NL + orderLines + NL + NL +
    'Subtotal: $' + subtotal.toFixed(2) + NL +
    (discount > 0 ? 'Coupon (' + couponCode + '): -$' + discount.toFixed(2) + NL : '') +
    (satFee > 0 ? 'Saturday Delivery: +$35.00' + NL : '') +
    'ORDER TOTAL: $' + total.toFixed(2) + NL + NL +
    'Placed: ' + new Date().toLocaleString() + NL +
    'Email Marketing: ' + emailOptIn;

  // ── Free order (100% coupon) — save to backend then show success ─────────
  if (total === 0) {
    try {
      await fetch(BACKEND_URL + '/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termsAccepted: !!(document.getElementById('terms-ack') || {}).checked,
          termsVersion: '2026-09-22',
          items: cart.map(i => ({ name: i.name, details: i.details, totalPrice: i.price, fileKey: i.fileKey || null, qty: i.qty || 1 })),
          customerEmail: email,
          shippingAddress: {
            name, street: coFullStreet('co-address'),
            city: document.getElementById('co-city').value.trim(),
            state: document.getElementById('co-state').value.trim(),
            zip: document.getElementById('co-zip').value.trim(),
            phone,
            notes: notes || undefined
          },
          fileKey: checkoutFileKey || null,
          discountCents: Math.round(discount * 100)
        })
      });
    } catch(e) { console.error('Free order save error:', e); }
    proc.style.display = 'none';
    document.getElementById('payment-success').style.display = 'block';
    if (window.fbq) fbq('track', 'Purchase', { value: total, currency: 'USD', num_items: cart.length });
    trackPurchase(total, null);
    const summaryEl = document.getElementById('order-confirm-summary');
    if (summaryEl) {
      summaryEl.innerHTML =
        '<div style="font-weight:800;margin-bottom:8px;font-size:13px;color:#1a3fa8">📋 Your Order Summary</div>' +
        '<div><strong>Name:</strong> ' + name + '</div>' +
        '<div><strong>Email:</strong> ' + email + '</div>' +
        '<div><strong>Phone:</strong> ' + phone + '</div>' +
        '<div><strong>Ship To:</strong> ' + address + '</div>' +
        '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e8eaf6"><strong>Items:</strong><br>' +
        cart.map((i,idx)=>(idx===0&&couponApplied?'<span style="color:#16a34a;font-weight:800">[FREE]</span> ':'')+i.name+' — '+i.details).join('<br>') +
        '</div>' +
        '<div style="color:#16a34a;font-weight:800;margin-top:4px">Coupon applied — 100% off!</div>' +
        '<div style="font-size:15px;font-weight:900;margin-top:8px;padding-top:8px;border-top:1px solid #e8eaf6;color:#16a34a">Total: $0.00 (FREE)</div>';
    }
    const saveInfoCb = document.getElementById('save-info-cb');
    if (saveInfoCb && saveInfoCb.checked) saveInfoToStorage();
    cart = []; couponApplied = false; updateCartUI();
    startPrintProgress();
    return;
  }

  // ── Call backend to create Stripe PaymentIntent (or charge via Square) ─────
  let clientSecret;
  try {
    if (SQ_ACTIVE && !selectedSavedCardId) { if (sqPreset) { sqSourceId = sqPreset; sqPreset = null; } else { sqSourceId = await sqTokenize(); } }
    const res = await fetch(BACKEND_URL + (SQ_ACTIVE ? '/checkout/square-pay' : '/checkout/create-payment-intent'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        termsAccepted: !!(document.getElementById('terms-ack') || {}).checked,
        termsVersion: '2026-09-22',
        items: satFee > 0 ? [...cart.map(i => ({ name: i.name, details: i.details, totalPrice: i.price, fileKey: i.fileKey || null, qty: i.qty || 1 })), { name: 'Saturday Delivery Upgrade', details: 'Weekend rush delivery add-on', totalPrice: satFee, qty: 1 }] : cart.map(i => ({ name: i.name, details: i.details, totalPrice: i.price, fileKey: i.fileKey || null, qty: i.qty || 1 })),
        customerEmail: email,
        shippingAddress: {
          name, street: coFullStreet('co-address'),
          city: document.getElementById('co-city').value.trim(),
          state: document.getElementById('co-state').value.trim(),
          zip: document.getElementById('co-zip').value.trim(),
          phone,
          notes: notes || undefined
        },
        fileKey: checkoutFileKey || null,
        discountCents: Math.round(discount * 100),
        saveCard: !selectedSavedCardId && !!document.getElementById('save-card-cb')?.checked,
        savedPaymentMethodId: selectedSavedCardId || undefined,
        sourceId: SQ_ACTIVE ? (selectedSavedCardId ? undefined : sqSourceId) : undefined,
        savedCardId: SQ_ACTIVE ? (selectedSavedCardId || undefined) : undefined
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment setup failed');
    if (data.free) {
      // Free order (100% coupon) — already saved & emails sent by backend
      proc.style.display = 'none';
      document.getElementById('payment-success').style.display = 'block';
      if (window.fbq) fbq('track', 'Purchase', { value: total, currency: 'USD', num_items: cart.length });
      trackPurchase(total, null);
      cart = []; couponApplied = false; updateCartUI();
      return;
    }
    clientSecret = SQ_ACTIVE ? ('square_' + (data.paymentId || data.orderId)) : data.clientSecret;
  } catch(err) {
    proc.style.display = 'none';
    btn.style.display = 'block';
    errEl.textContent = '⚠️ ' + err.message;
    console.error('Payment error:', err.message);
    return;
  }

  // ── Confirm card payment via Stripe ───────────────────────────────────────
  const { error: stripeError } = SQ_ACTIVE ? {} : selectedSavedCardId
    ? await stripe.confirmCardPayment(clientSecret, { payment_method: selectedSavedCardId })
    : await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: stripeCardElement,
          billing_details: { name, email }
        }
      });

  if (stripeError) {
    proc.style.display = 'none';
    btn.style.display = 'block';
    errEl.textContent = stripeError.message;
    return;
  }

  // ── Payment succeeded ─────────────────────────────────────────────────────
  proc.style.display = 'none';
  document.getElementById('payment-success').style.display = 'block';
  if (window.fbq) fbq('track', 'Purchase', { value: total, currency: 'USD', num_items: cart.length });
  trackPurchase(total, clientSecret);

  const summaryEl = document.getElementById('order-confirm-summary');
  if (summaryEl) {
    summaryEl.innerHTML =
      '<div style="font-weight:800;margin-bottom:8px;font-size:13px;color:#1a3fa8">📋 Your Order Summary</div>' +
      '<div><strong>Name:</strong> ' + name + '</div>' +
      '<div><strong>Email:</strong> ' + email + '</div>' +
      '<div><strong>Phone:</strong> ' + phone + '</div>' +
      '<div><strong>Ship To:</strong> ' + address + '</div>' +
      '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e8eaf6"><strong>Items:</strong><br>' +
      cart.map((i, idx) => (idx===0&&couponApplied?'<span style="color:#16a34a;font-weight:800">[FREE]</span> ':'')+i.name+' — '+i.details+' — <strong>$'+i.price.toFixed(2)+'</strong>').join('<br>') +
      '</div>' +
      (discount > 0 ? '<div style="color:#16a34a;font-weight:800;margin-top:4px">Coupon savings: -$'+discount.toFixed(2)+'</div>' : '') +
      '<div style="font-size:15px;font-weight:900;margin-top:8px;padding-top:8px;border-top:1px solid #e8eaf6;color:#1a3fa8">Total: $'+total.toFixed(2)+'</div>';
  }

  // Save info if checkbox checked
  const saveInfoCb = document.getElementById('save-info-cb');
  if (saveInfoCb && saveInfoCb.checked) saveInfoToStorage();

  startPrintProgress();
  cart = [];
  couponApplied = false;
  selectedSavedCardId = null;
  updateCartUI();
}

// ===== CART =====
let cart=[];
function toggleCart(){const s=document.getElementById('cart-sidebar');const o=document.getElementById('overlay');s.classList.toggle('open');o.classList.toggle('show');}
// ===== DESIGN TRACKING =====
// Tracks which products have had a design approved via the designer
const designApproved = {}; // keyed by product name

function addToCart(name,priceStr,details,hasDesign,fileKey,thumbUrl){
  const price=parseFloat(priceStr.replace(/[^0-9.]/g,''))||0;
  const activePage=document.querySelector('.page.active');
  const shipExtras=[];
  if(activePage){
    if(activePage.querySelector('.ship-opt.sel-rush'))shipExtras.push('🚨 SAME-DAY / RUSH SHIPPING');
    if(activePage.querySelector('.sat-cb:checked'))shipExtras.push('📦 Saturday Delivery (+$35)');
  }
  const fullDetails=shipExtras.length?details+' · '+shipExtras.join(' · '):details;
  cart.push({name,price,unitPrice:price,qty:1,details:fullDetails,id:Date.now(),hasDesign:!!hasDesign,fileKey:fileKey||null,thumbUrl:thumbUrl||null});
  trackFunnel('add_to_cart', cart.slice(-1));
  updateCartUI();
  toggleCart();
  if (window.fbq) fbq('track', 'AddToCart', { content_name: name, value: price, currency: 'USD' });
}

// Products that require a design/upload before adding to cart
const DESIGN_REQUIRED_PRODUCTS = [
  'Mesh Banner','Table Runner Banner','Backdrop Vinyl Banner','Graduation Banner','Player Banner',
  '13oz Vinyl Banner','18oz Vinyl Banner','Custom Vinyl Banner','Yard Sign Package',
  'Yard Signs 18×24','Realtor Panel Sign','Realtor Rider Sign',
  'Tent Valance Banner','Tent Side Skirt Banner','Custom T-Shirts','Business Cards',
  'Vehicle Magnets (Set)','Vehicle Magnet (Single)','Retractable Banner Stand'
];

function requireDesign(productName, priceElId, detailsFn, openDesignerFn) {
  // Check if this product already has design approved in this session
  if (designApproved[productName]) {
    const priceEl = document.getElementById(priceElId);
    const priceStr = priceEl ? priceEl.textContent : '$0.00';
    const details = typeof detailsFn === 'function' ? detailsFn() : detailsFn;
    addToCart(productName, priceStr, details, true);
    return;
  }
  // No design — show feedback and prompt them
  showDesignRequiredFeedback(productName, openDesignerFn);
}

function showDesignRequiredFeedback(productName, openDesignerFn) {
  // Remove any existing feedback
  document.querySelectorAll('.design-required-msg').forEach(el => el.remove());

  // Find the add-to-cart button for this product and insert message near it
  const msg = document.createElement('div');
  msg.className = 'design-required-msg';
  msg.style.cssText = 'background:#fef2f2;border:2px solid #fca5a5;border-radius:10px;padding:14px 16px;margin:12px 0 0;display:flex;align-items:flex-start;gap:12px;animation:shake .4s ease';
  msg.innerHTML = `
    <span style="font-size:22px;flex-shrink:0">🎨</span>
    <div style="flex:1">
      <div style="font-family:'Oswald',sans-serif;font-size:16px;color:#991b1b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Design Required Before Checkout</div>
      <div style="font-size:13px;color:#7f1d1d;line-height:1.5;margin-bottom:10px">Please upload your artwork or use our designer tool before adding this item to your cart. We need your design to print your order!</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="drm-start-btn" style="background:#1a3fa8;color:#fff;border:none;border-radius:7px;padding:8px 16px;font-family:'Oswald',sans-serif;font-size:14px;letter-spacing:.5px;cursor:pointer;text-transform:uppercase">✏️ Start Designing</button>
        <button class="drm-upload-btn" style="background:#065f46;color:#fff;border:none;border-radius:7px;padding:8px 16px;font-family:'Oswald',sans-serif;font-size:14px;letter-spacing:.5px;cursor:pointer;text-transform:uppercase">⬆️ Upload File</button>
        <button onclick="this.closest('.design-required-msg').remove();" style="background:#e5e7eb;color:#374151;border:none;border-radius:7px;padding:8px 14px;font-family:'Oswald',sans-serif;font-size:14px;cursor:pointer">Dismiss</button>
      </div>
    </div>`;

  const drmStartBtn = msg.querySelector('.drm-start-btn');
  if (drmStartBtn) drmStartBtn.addEventListener('click', function(){ openDesignerFn(); msg.remove(); });
  const drmUploadBtn = msg.querySelector('.drm-upload-btn');
  if (drmUploadBtn) drmUploadBtn.addEventListener('click', function(){ openDesignerFn(); setTimeout(()=>{const fi=document.getElementById('d-file');if(fi)fi.click();},400); msg.remove(); });

  // Find the active page's add-to-cart button area
  const activePage = document.querySelector('.page.active');
  if (activePage) {
    const btns = activePage.querySelectorAll('.add-to-cart-btn');
    if (btns.length > 0) {
      btns[0].closest('div').parentElement.appendChild(msg);
      msg.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
  }
}

// CSS for shake animation
(function(){
  if (document.getElementById('design-req-style')) return;
  const s = document.createElement('style');
  s.id = 'design-req-style';
  s.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}';
  document.head.appendChild(s);
})();
function removeFromCart(id){cart=cart.filter(i=>i.id!==id);updateCartUI();}
function getCheckoutTotal(){let t=cart.reduce((s,i)=>s+i.price,0);t-=getCouponDiscount();const cb=document.getElementById('saturday-delivery-cb');if(cb&&cb.checked&&!cartHasSatDelivery())t+=35;return Math.max(0,t);}
function cartChangeQty(id,delta){
  const item=cart.find(i=>i.id===id);
  if(!item)return;
  item.qty=Math.max(1,(item.qty||1)+delta);
  item.price=+((item.unitPrice!=null?item.unitPrice:item.price)*item.qty).toFixed(2);
  updateCartUI();
}
function updateCartUI(){
  document.getElementById('cart-count').textContent=cart.length;
  document.getElementById('cart-total-price').textContent='$'+cart.reduce((s,i)=>s+i.price,0).toFixed(2);
  const c=document.getElementById('cart-items');
  if(!cart.length){c.innerHTML='<div class="cart-empty"><p>Your cart is empty.<br>Add some products to get started!</p></div>';return;}
  c.innerHTML=cart.map(i=>`<div class="cart-item">${i.thumbUrl?`<img loading="lazy" decoding="async" src="${i.thumbUrl}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;flex-shrink:0" onerror="this.style.display='none'">`:`<div style="width:48px;height:48px;border-radius:6px;background:#f1f1f1;flex-shrink:0"></div>`}<div class="cart-item-info" style="flex:1;min-width:0"><h4>${i.name}</h4><p>${i.details}</p><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><button onclick="cartChangeQty(${i.id},-1)" style="width:24px;height:24px;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer;font-weight:800;line-height:1">−</button><span style="min-width:18px;text-align:center;font-weight:700">${i.qty||1}</span><button onclick="cartChangeQty(${i.id},1)" style="width:24px;height:24px;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer;font-weight:800;line-height:1">+</button></div></div><div style="display:flex;align-items:center;gap:8px;flex-shrink:0"><span class="cart-item-price">$${i.price.toFixed(2)}</span><button class="cart-remove" onclick="removeFromCart(${i.id})">✕</button></div></div>`).join('');
}
let selectedSavedCardId = null;

async function checkSavedCards() {
  const email = document.getElementById('co-email')?.value.trim();
  const box = document.getElementById('saved-cards-box');
  const listEl = document.getElementById('saved-cards-list');
  if (!email || !box || !listEl) return;
  try {
    const res = await fetch(BACKEND_URL + (SQ_ACTIVE ? '/checkout/square-saved-cards' : '/checkout/saved-cards') + '?email=' + encodeURIComponent(email));
    const data = await res.json();
    if (!data.cards || data.cards.length === 0) { box.style.display = 'none'; return; }
    listEl.innerHTML = data.cards.map(function(c, idx) {
      var brand = c.brand.charAt(0).toUpperCase() + c.brand.slice(1);
      var exp = String(c.expMonth).padStart(2, '0') + '/' + String(c.expYear).slice(-2);
      return '<label style="display:flex;align-items:center;gap:10px;padding:8px 0;cursor:pointer">' +
        '<input type="radio" name="saved-card-radio"' + (idx === 0 ? ' checked' : '') + ' onchange="selectSavedCard(\'' + c.id + '\')">' +
        '<span style="font-weight:700;font-size:14px">' + brand + ' \u2022\u2022\u2022\u2022 ' + c.last4 + '</span>' +
        '<span style="color:#6b7280;font-size:12px">Exp ' + exp + '</span></label>';
    }).join('');
    box.style.display = 'block';
    selectSavedCard(data.cards[0].id);
  } catch (e) {
    console.error('Saved cards lookup failed:', e);
    box.style.display = 'none';
  }
}

function selectSavedCard(id) {
  selectedSavedCardId = id;
  const newCardBox = document.getElementById('new-card-box');
  if (newCardBox) newCardBox.style.display = 'none';
}

function useNewCard() {
  selectedSavedCardId = null;
  const newCardBox = document.getElementById('new-card-box');
  if (newCardBox) newCardBox.style.display = 'block';
  document.querySelectorAll('input[name="saved-card-radio"]').forEach(function(r) { r.checked = false; });
}

function openCheckout(){
  if(!cart.length){alert('Your cart is empty!');return;}
  trackFunnel('begin_checkout');
  toggleCart();
  openCheckoutModal();
  useNewCard();
  const box = document.getElementById('saved-cards-box');
  if (box) box.style.display = 'none';
}
function openCheckoutModal(){
  resetPrintProgress();
  document.getElementById('payment-success').style.display='none';
  const placeBtn = document.getElementById('place-order-btn');
  const procEl = document.getElementById('payment-processing');
  if (placeBtn) placeBtn.style.display = 'block';
  if (procEl) procEl.style.display = 'none';
  const est=getESTDate();
  const isThu=est.getDay()===4;
  const satOpt=document.getElementById('saturday-delivery-option');
  if(satOpt) satOpt.style.display=isThu?'block':'none';
  const sumEl=document.getElementById('checkout-items-summary');
  if(sumEl){
    if(cart.length){
      sumEl.innerHTML=cart.map(i=>`<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;margin-bottom:6px">${i.thumbUrl?`<img loading="lazy" decoding="async" src="${i.thumbUrl}" alt="" style="width:32px;height:32px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;flex-shrink:0" onerror="this.style.display='none'">`:''}<span style="flex:1;min-width:0">${i.name} — ${i.details.substring(0,50)} ${(i.qty||1)>1?'× '+i.qty:''}</span><span style="font-weight:700;white-space:nowrap;margin-left:8px">$${i.price.toFixed(2)}</span></div>`).join('');
    } else {
      sumEl.innerHTML='<div style="display:flex;justify-content:space-between"><span>4×8 ft Vinyl Banner (Custom Design) — Full Color</span><span style="font-weight:700">$89.00</span></div><div style="display:flex;justify-content:space-between"><span>Business Cards (500) — Glossy · Double Sided</span><span style="font-weight:700">$39.99</span></div>';
    }
  }
  updateCheckoutTotal();
  // Auto-populate file from designer upload if available
  const cartFileKey = cart.find(i => i.fileKey)?.fileKey || null;
  if (cartFileKey) {
    checkoutFileKey = cartFileKey;
    const fileStatus = document.getElementById('co-file-status');
    if (fileStatus) { fileStatus.style.color='#16a34a'; fileStatus.textContent='✅ Design file attached from your upload'; }
  }
  document.getElementById('checkout-modal').classList.add('active');
  document.body.style.overflow='hidden';
  initStripe();
  // Load saved info and wire save-info checkbox
  setTimeout(() => {
    loadSavedInfo();
    const cb = document.getElementById('save-info-cb');
    const badge = document.getElementById('saved-info-badge');
    if (cb) {
      cb.onchange = () => {
        if (!cb.checked) { clearSavedInfo(); if (badge) badge.style.display = 'none'; }
      };
    }
  }, 50);
}
function previewCheckout(){
  // Temporarily add demo items so totals show correctly
  const hadItems = cart.length > 0;
  if(!hadItems){
    cart.push({name:'4×8 ft Vinyl Banner', details:'Custom Design · Full Color · Single Sided', price:89.00});
    cart.push({name:'Business Cards (500)', details:'Glossy · Double Sided — FREE!', price:39.99});
  }
  openCheckoutModal();
  if(!hadItems){
    // Mark modal as preview so we can clean up on close
    document.getElementById('checkout-modal').setAttribute('data-preview','1');
  }
}
function updateCheckoutTotal(){const t=getCheckoutTotal();const el=document.getElementById('checkout-total');const amtEl=document.getElementById('place-order-amount');const satRow=document.getElementById('checkout-saturday-row');const satCb=document.getElementById('saturday-delivery-cb');if(el)el.textContent='$'+t.toFixed(2);if(amtEl)amtEl.textContent='$'+t.toFixed(2);if(satRow)satRow.style.display=(satCb&&satCb.checked)?'flex':'none';}
function closeCheckout(){
  const modal=document.getElementById('checkout-modal');
  if(modal && modal.getAttribute('data-preview')==='1'){
    cart=[];
    modal.removeAttribute('data-preview');
  }
  modal.classList.remove('active');
  document.body.style.overflow='';
  checkoutFileKey = null;
  const fileStatus = document.getElementById('co-file-status');
  if (fileStatus) fileStatus.textContent = '';
  const fileInput = document.getElementById('co-file-input');
  if (fileInput) fileInput.value = '';
  resetPrintProgress();
}

// ===== SAVE MY INFO =====
const SAVED_INFO_KEY = 'sb_saved_info';
function loadSavedInfo() {
  try {
    const raw = localStorage.getItem(SAVED_INFO_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    const fields = ['co-first','co-last','co-email','co-phone','co-address','co-city','co-state','co-zip'];
    let anyFilled = false;
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el && d[id]) { el.value = d[id]; anyFilled = true; }
    });
    if (anyFilled) {
      const cb = document.getElementById('save-info-cb');
      const badge = document.getElementById('saved-info-badge');
      if (cb) cb.checked = true;
      if (badge) badge.style.display = 'inline-block';
    }
  } catch(e) {}
}
function saveInfoToStorage() {
  try {
    const fields = ['co-first','co-last','co-email','co-phone','co-address','co-city','co-state','co-zip'];
    const d = {};
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) d[id] = el.value.trim();
    });
    localStorage.setItem(SAVED_INFO_KEY, JSON.stringify(d));
  } catch(e) {}
}
function clearSavedInfo() {
  try { localStorage.removeItem(SAVED_INFO_KEY); } catch(e) {}
}

// ===== PRICING =====
function calc13oz(){const sel=document.getElementById('b13-size');const s=sel&&sel.value==='custom'?parseFloat(document.getElementById('b13-custom-sqft')?.value||8):parseFloat(sel?.value)||8;const q=parseInt(document.getElementById('b13-qty').value)||1;const u=getUrgentMult('page-banner-custom');document.getElementById('b13-price').textContent='$'+((s*3.75+10)*q*u+getSatFee('page-banner-custom')).toFixed(2);}
function calc18oz(){
  // Custom size: price the entered dimensions (b18-custom-sqft), not the 32 sq ft fallback.
  const sel=document.getElementById('b18-size');
  const s=sel&&sel.value==='custom'?parseFloat(document.getElementById('b18-custom-sqft')?.value||8):parseFloat(sel?.value)||32;
  const q=parseInt(document.getElementById('b18-qty').value)||1;
  const sides=document.getElementById('b18-sides')?.value||'1';
  const u=getUrgentMult('page-banner-custom');
  const perUnit=sides==='2'?s*14.50:s*8;
  document.getElementById('b18-price').textContent='$'+(perUnit*q*u+getSatFee('page-banner-custom')).toFixed(2);
}
function toggleB18DupFront(val){
  const wrap=document.getElementById('b18-dup-front-wrap');
  if(wrap) wrap.style.display=val==='2'?'block':'none';
  const cb=document.getElementById('b18-dup-front');
  if(cb && val!=='2') cb.checked=false;
}
function calcMesh(){
  const sel=document.getElementById('mesh-size');
  const s=sel&&sel.value==='custom'?parseFloat(document.getElementById('mesh-custom-sqft')?.value||8):parseFloat(sel?.value)||32;
  const q=parseInt(document.getElementById('mesh-qty').value)||1;
  const u=getUrgentMult('page-banner-mesh');
  const rate=s<=8?8:7;
  document.getElementById('mesh-price').textContent='$'+(s*rate*q*u+getSatFee('page-banner-mesh')).toFixed(2);
}
function toggleMeshCustom(){
  const sel=document.getElementById('mesh-size');
  const row=document.getElementById('mesh-custom-row');
  if(!sel||!row)return;
  row.style.display=sel.value==='custom'?'grid':'none';
  if(sel.value==='custom')calcMeshCustomSize();
}
function calcMeshCustomSize(){
  const wIn=parseFloat(document.getElementById('mesh-custom-w')?.value)||48;
  const hIn=parseFloat(document.getElementById('mesh-custom-h')?.value)||24;
  const wFt=Math.ceil(wIn/12);
  const hFt=Math.ceil(hIn/12);
  const sqft=wFt*hFt;
  const sqftEl=document.getElementById('mesh-custom-sqft');
  const infoEl=document.getElementById('mesh-custom-info');
  if(sqftEl)sqftEl.value=sqft;
  const rate=sqft<=8?8:7;
  if(infoEl)infoEl.textContent='Billed as '+wFt+'\'×'+hFt+'\' ('+sqft+' sq ft) @ $'+rate+'/sq ft';
  calcMesh();
}
function calcRunner(){const b=parseFloat(document.getElementById('runner-size').value)||40;const q=parseInt(document.getElementById('runner-qty').value)||1;const u=getUrgentMult('page-banner-table');document.getElementById('runner-price').textContent='$'+(b*q*u+getSatFee('page-banner-table')).toFixed(2);}
function calcBackdrop(){const s=parseFloat(document.getElementById('backdrop-size').value)||64;const e=parseFloat(document.getElementById('backdrop-finish').value)||0;const q=parseInt(document.getElementById('backdrop-qty').value)||1;const u=getUrgentMult('page-banner-backdrop');document.getElementById('backdrop-price').textContent='$'+((s*4+e)*q*u+getSatFee('page-banner-backdrop')).toFixed(2);}


// ===== BANNER CUSTOM SIZE (CEILING ROUNDING) =====
function toggleBannerCustom(prefix) {
  const sel = document.getElementById(prefix + '-size');
  const row = document.getElementById(prefix + '-custom-row');
  if (!sel || !row) return;
  row.style.display = sel.value === 'custom' ? 'grid' : 'none';
  if (sel.value === 'custom') calcBannerCustomSize(prefix);
}

function calcBannerCustomSize(prefix) {
  const wIn = parseFloat(document.getElementById(prefix + '-custom-w')?.value) || 48;
  const hIn = parseFloat(document.getElementById(prefix + '-custom-h')?.value) || 24;
  const infoEl = document.getElementById(prefix + '-custom-info');
  const wOver = wIn > 120, hOver = hIn > 120;
  if (wOver && hOver) {
    if (infoEl) { infoEl.textContent = '⚠ Both sides exceed 120". Max is 120"\xd7120", or one long side as a strip banner.'; infoEl.style.color = '#dc2626'; }
    return;
  }
  const areaSqFt = (wIn * hIn) / 144;
  if (areaSqFt > 1000) {
    if (infoEl) { infoEl.textContent = '⚠ Banner area (' + areaSqFt.toFixed(0) + ' sq ft) exceeds the 1,000 sq ft maximum.'; infoEl.style.color = '#dc2626'; }
    return;
  }
  if (infoEl) infoEl.style.color = '';
  // ALWAYS ceil — 33" becomes 3ft, 43" becomes 4ft
  const wFt = Math.ceil(wIn / 12);
  const hFt = Math.ceil(hIn / 12);
  const sqft = wFt * hFt;
  const sqftEl = document.getElementById(prefix + '-custom-sqft');
  if (sqftEl) sqftEl.value = sqft;
  if (infoEl) infoEl.textContent = 'Billed as ' + wFt + '\' \xd7 ' + hFt + '\' (' + sqft + ' sq ft)';
  if (prefix === 'b13') calc13oz();
  else if (prefix === 'b18') calc18oz();
}

// ===== GRADUATION CUSTOM SIZE =====
function toggleGradCustom() {
  const sel = document.getElementById('grad-size');
  const row = document.getElementById('grad-custom-size-row');
  if (!sel || !row) return;
  row.style.display = sel.value === 'custom' ? 'grid' : 'none';
  if (sel.value === 'custom') calcGradCustom();
}

function calcGradCustom() {
  const wIn = parseFloat(document.getElementById('grad-custom-w')?.value) || 48;
  const hIn = parseFloat(document.getElementById('grad-custom-h')?.value) || 24;
  // ALWAYS round UP to nearest foot (ceiling)
  const wFt = Math.ceil(wIn / 12);
  const hFt = Math.ceil(hIn / 12);
  const sqft = wFt * hFt;
  const sqftEl = document.getElementById('grad-custom-sqft');
  const infoEl = document.getElementById('grad-custom-info');
  if (sqftEl) sqftEl.value = sqft;
  if (infoEl) infoEl.textContent = 'Billed as ' + wFt + '\' × ' + hFt + '\' (' + sqft + ' sq ft) @ $3.75/sq ft + $10 base';
  calcGraduation();
}

function calcGraduation(){const sel=document.getElementById('grad-size');const s=sel&&sel.value==='custom'?parseFloat(document.getElementById('grad-custom-sqft').value||0):parseFloat(sel?.value)||12;const q=parseInt(document.getElementById('grad-qty').value)||1;const u=getUrgentMult('page-graduation-banners');document.getElementById('grad-price').textContent='$'+((s*3.75+10)*q*u+getSatFee('page-graduation-banners')).toFixed(2);}

function togglePlyrCustom() {
  const sel = document.getElementById('plyr-size');
  const row = document.getElementById('plyr-custom-size-row');
  if (!sel || !row) return;
  row.style.display = sel.value === 'custom' ? 'grid' : 'none';
  if (sel.value !== 'custom') { const o = sel.options[sel.selectedIndex], w = document.getElementById('plyr-custom-w'), h = document.getElementById('plyr-custom-h'); if (o && o.dataset.w && w && h) { w.value = o.dataset.w; h.value = o.dataset.h; } }
  if (sel.value === 'custom') calcPlyrCustom();
}

function calcPlyrCustom() {
  const wIn = parseFloat(document.getElementById('plyr-custom-w')?.value) || 36;
  const hIn = parseFloat(document.getElementById('plyr-custom-h')?.value) || 48;
  // ALWAYS round UP to nearest foot (ceiling)
  const wFt = Math.ceil(wIn / 12);
  const hFt = Math.ceil(hIn / 12);
  const sqft = wFt * hFt;
  const sqftEl = document.getElementById('plyr-custom-sqft');
  const infoEl = document.getElementById('plyr-custom-info');
  if (sqftEl) sqftEl.value = sqft;
  if (infoEl) infoEl.textContent = 'Billed as ' + wFt + '\' × ' + hFt + '\' (' + sqft + ' sq ft) @ $3.75/sq ft + $10 base';
  calcPlayer();
}

function calcPlayer(){const sel=document.getElementById('plyr-size');const s=sel&&sel.value==='custom'?parseFloat(document.getElementById('plyr-custom-sqft').value||0):parseFloat(sel?.value)||12;const q=parseInt(document.getElementById('plyr-qty').value)||1;const u=getUrgentMult('page-player-banners');document.getElementById('plyr-price').textContent='$'+((s*3.75+10)*q*u+getSatFee('page-player-banners')).toFixed(2);}
function sizeLabel(prefix){const sel=document.getElementById(prefix+'-size');if(!sel)return '';if(sel.value==='custom'){const w=document.getElementById(prefix+'-custom-w')?.value;const h=document.getElementById(prefix+'-custom-h')?.value;return 'Custom '+(w||'?')+'"×'+(h||'?')+'"';}const o=sel.options[sel.selectedIndex];return o?o.text:'';}
function setCustomSize(v){if(!v)return;const[w,h]=v.split('x');document.getElementById('custom-w').value=w;document.getElementById('custom-h').value=h;calcCustom();}
function calcCustom(){
  const wi=parseFloat(document.getElementById('custom-w').value)||48;
  const hi=parseFloat(document.getElementById('custom-h').value)||24;
  const infoEl=document.getElementById('custom-size-info');
  const wOver=wi>120, hOver=hi>120;
  if(wOver&&hOver){
    if(infoEl){infoEl.textContent='⚠ Both sides exceed 120”. Max is 120”\xd7120”, or one long side as a strip banner.';infoEl.style.color='#dc2626';}
    document.getElementById('custom-price').textContent='—';
    return;
  }
  const areaSqFt=(wi*hi)/144;
  if(areaSqFt>1000){
    if(infoEl){infoEl.textContent='⚠ Banner area ('+areaSqFt.toFixed(0)+' sq ft) exceeds the 1,000 sq ft maximum.';infoEl.style.color='#dc2626';}
    document.getElementById('custom-price').textContent='—';
    return;
  }
  if(infoEl)infoEl.style.color='';
  const q=parseInt(document.getElementById('custom-qty').value)||1;
  const wf=Math.ceil(wi/12);const hf=Math.ceil(hi/12);const sf=wf*hf;
  const mat=document.getElementById('custom-material');
  const is18oz=mat&&mat.value==='18oz';
  const u=getUrgentMult('page-banner-custom');
  const base13=(sf*(sf<4?5:3.75)+10)*q*u;
  const t=is18oz?(base13*1.8+getSatFee('page-banner-custom')):(base13+getSatFee('page-banner-custom'));
  if(infoEl)infoEl.textContent=`Billed as ${wf}′ \xd7 ${hf}′ (${sf} sq ft)`;
  document.getElementById('custom-price').textContent='$'+t.toFixed(2);
}
function calcYardSign(){const u=getUrgentMult('page-yard-signs');const base=parseFloat(document.getElementById('ys-qty').value)||60;const ds=document.getElementById('ys-double')?.checked?11:0;document.getElementById('ys-price').textContent='$'+((base+ds)*u+getSatFee('page-yard-signs')).toFixed(2);}
const YS_SIZE_PRICES={'18x24':[[1,60],[2,80],[3,90],[4,100],[5,120],[10,140]],'24x24':[[1,65],[2,89],[3,113],[4,137],[5,161],[6,185],[7,209],[8,233]]};
function ysProductLabel(){const s=(document.getElementById('ys-size')&&document.getElementById('ys-size').value)||'18x24';return 'Yard Signs '+s.replace('x','×');}
function updateYsSizeOptions(){
  const size=document.getElementById('ys-size').value;
  const table=YS_SIZE_PRICES[size]||YS_SIZE_PRICES['18x24'];
  const sel=document.getElementById('ys-qty');
  sel.innerHTML=table.map(function(row,idx){
    var qty=row[0], price=row[1];
    var badge=(size==='18x24'&&qty===10)?' ⭐ Best Value':((size==='24x24'&&qty===8)?' ⭐ Max Qty':'');
    var label=qty+' Sign'+(qty>1?'s':'')+' — $'+price+badge;
    return '<option value="'+price+'"'+(idx===0?' selected':'')+'>'+label+'</option>';
  }).join('');
  calcYardSign();
}
function calcYardSignPkg(){const u=getUrgentMult('page-yard-signs');const base=parseFloat((document.getElementById('yspkg-sel').value).split(',')[0])||140;document.getElementById('yspkg-price').textContent='$'+(base*u+getSatFee('page-yard-signs')).toFixed(2);}
function calcStand(){const u=getUrgentMult('page-banner-stands');document.getElementById('stand-price').textContent='$'+(189*(parseInt(document.getElementById('stand-qty').value)||1)*u+getSatFee('page-banner-stands')).toFixed(2);}
function calcMagnet(){const u=getUrgentMult('page-magnets');document.getElementById('mag-price').textContent='$'+((parseFloat(document.getElementById('mag-size').value)||98)*(parseInt(document.getElementById('mag-qty').value)||1)*u+getSatFee('page-magnets')).toFixed(2);}
function calcMagnetSingle(){const u=getUrgentMult('page-magnets');document.getElementById('mag-single-price').textContent='$'+((parseFloat(document.getElementById('mag-single-size').value)||40)*(parseInt(document.getElementById('mag-single-qty').value)||1)*u+getSatFee('page-magnets')).toFixed(2);}
function calcTent(){const p=parseFloat(document.getElementById('tent-size').value)||40;const q=parseInt(document.getElementById('tent-qty').value)||1;const u=getUrgentMult('page-tent-banners');document.getElementById('tent-price').textContent='$'+(p*q*u+getSatFee('page-tent-banners')).toFixed(2);}
function calcTentSkirt(){const p=parseFloat(document.getElementById('tent-skirt-size').value)||170;const q=parseInt(document.getElementById('tent-skirt-qty').value)||1;const u=getUrgentMult('page-tent-banners');document.getElementById('tent-skirt-price').textContent='$'+(p*q*u+getSatFee('page-tent-banners')).toFixed(2);}
const bcDA={'24.99':5,'34.99':7,'39.99':8,'79.99':16,'119.00':24,'249.99':50};
function calcBizCard(){const v=document.getElementById('bc-qty').value;const u=getUrgentMult('page-biz-cards');document.getElementById('bc-price').textContent='$'+((parseFloat(v)||39.99)*u+getSatFee('page-biz-cards')).toFixed(2);}
function calcTshirt(){
  const se = parseFloat(document.getElementById('ts-side').value) || 0;
  const firstPrice = 45 + se;
  const addlPrice  = 25 + se;
  const u = getUrgentMult('page-tshirts');
  const UPSIZE_SURCHARGE = 3; // extra per 2XL or 3XL shirt
  const UPSIZE_SIZES = ['2XL','3XL'];

  let total = 0, shirts = 0, upsizeCount = 0;
  const sum = [];

  document.querySelectorAll('.ts-size-input').forEach(i => {
    const q = parseInt(i.value) || 0;
    if (q > 0) {
      shirts += q;
      sum.push(`${q} ${i.dataset.size}`);
      if (UPSIZE_SIZES.includes(i.dataset.size)) upsizeCount += q;
    }
  });

  if (shirts > 0) {
    // First shirt at firstPrice, rest at addlPrice, then upsize surcharge on all 2XL/3XL
    total = (firstPrice + (shirts - 1) * addlPrice + upsizeCount * UPSIZE_SURCHARGE) * u + getSatFee('page-tshirts');
  }

  document.getElementById('ts-price').textContent = '$' + total.toFixed(2);

  let summaryParts = [];
  if (shirts > 0) {
    summaryParts.push(`${shirts} shirt${shirts !== 1 ? 's' : ''}: ${sum.join(', ')}`);
    summaryParts.push(`$${firstPrice} first + $${addlPrice} ea additional`);
    if (upsizeCount > 0) summaryParts.push(`+$3 each for ${upsizeCount} upsize shirt${upsizeCount > 1 ? 's' : ''}`);
  }
  document.getElementById('ts-summary').textContent = shirts > 0 ? summaryParts.join(' — ') : 'Enter quantities above';
}
function calcRealtor(){
  // Legacy — kept for compatibility
  calcRealtorPanel();
}
function calcRealtorPanel(){
  const sel = document.getElementById('re-panel-size');
  if(!sel) return;
  const p = sel.value.split(',');
  const u = getUrgentMult('page-realtor-signs');
  const el = document.getElementById('re-panel-price');
  if(el) el.textContent='$'+((parseFloat(p[1])||48)*(parseInt(document.getElementById('re-panel-qty')?.value)||1)*u+getSatFee('page-realtor-signs')).toFixed(2);
}
function calcRealtorRider(){
  const sel = document.getElementById('re-rider-size');
  if(!sel) return;
  const p = sel.value.split(',');
  const u = getUrgentMult('page-realtor-signs');
  const el = document.getElementById('re-rider-price');
  if(el) el.textContent='$'+((parseFloat(p[1])||26)*(parseInt(document.getElementById('re-rider-qty')?.value)||1)*u+getSatFee('page-realtor-signs')).toFixed(2);
}


// =============================================
// DESIGNER — clean rewrite
// =============================================
let dsProduct='', dsType='banner', dsBold=false, dsItalic=false, dsUnder=false, dsPrice='$0.00', dsPriceDetails='';
let dsTextAlign='center', dsTextColor='#000000', dsBgColor='#ffffff';
let dsSelectedEl=null, dsZoomLevel=1, dsArtboardRotated=false, dsCurrentDims={w:0,h:0}, dsMinFontPx=6;
// Dual artboard bg colors
let dsBgColorBack='#ffffff';

// ── Canvas getter helpers (single artboard — always the front/primary canvas) ──
function dsGetElements() {
  // Return the layer for the CURRENT side
  if (dsCurrentSide === 'back') return document.getElementById('d-elements-back');
  return document.getElementById('d-elements');
}
function dsGetCanvas() {
  if (dsCurrentSide === 'back') return document.getElementById('d-canvas-back');
  return document.getElementById('d-canvas');
}
function dsGetPlaceholder() {
  if (dsCurrentSide === 'back') return document.getElementById('d-placeholder-back');
  return document.getElementById('d-placeholder');
}
function dsGetOverlay()      { return document.getElementById('d-overlay'); }
function dsGetCanvasWrap()   { return document.getElementById('d-canvas-wrap'); }
function dsGetGrommets()     { return document.getElementById('d-grommet-overlay'); }

// ── Resize handles ──

// ── Dual artboard panel switching ──
function dsSwitchSidePanel(side) {
  if (!dsIsDoubleSided()) return;
  dsSwitchSide(side);
  // Update panel active classes
  const fp = document.getElementById('ds-front-panel');
  const bp = document.getElementById('ds-back-panel');
  if (fp) { fp.classList.toggle('active-panel', side==='front'); }
  if (bp) { bp.classList.toggle('active-panel', side==='back'); }
}

// ── Single artboard only — back panel never shown simultaneously ──
function dsShowDualArtboard(show) {
  const frontPanel  = document.getElementById('ds-front-panel');
  const backPanel   = document.getElementById('ds-back-panel');
  const switcher    = document.getElementById('ds-side-switcher');
  if (!show) {
    if (frontPanel) frontPanel.style.display = 'block';
    if (backPanel)  backPanel.style.display  = 'none';
    if (switcher)   switcher.classList.remove('visible');
    const copyBtnH = document.getElementById('ds-copy-front-btn');
    const copyBtnM = document.getElementById('ds-mob-copy');
    if (copyBtnH) copyBtnH.style.display = 'none';
    if (copyBtnM) copyBtnM.style.display = 'none';
  } else {
    // Show front by default; switcher lets user toggle
    if (frontPanel) frontPanel.style.display = 'block';
    if (backPanel)  backPanel.style.display  = 'none';
    if (switcher)   switcher.classList.add('visible');
    // Reset to front
    const swFront = document.getElementById('ds-sw-front');
    const swBack  = document.getElementById('ds-sw-back');
    if (swFront) swFront.classList.add('active');
    if (swBack)  swBack.classList.remove('active');
    const copyBtn = document.getElementById('ds-copy-front-btn');
    const copyBtnM = document.getElementById('ds-mob-copy');
    if (copyBtn) copyBtn.style.display = 'inline-flex';
    if (copyBtnM) copyBtnM.style.display = 'inline-block';
  }
}

const DS_COLORS=['#ffffff','#1a3fa8','#d42020','#111827','#22c55e','#fbbf24',
                 '#6b7280','#7c3aed','#0891b2','#ea580c','#f9fafb','#000000'];

function dsNormalizeSizeLabel(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/⭐/g, '')
    .replace(/[’']/g, "'")
    .replace(/×/g, 'x')
    .replace(/ft/g, '')
    .replace(/\s+/g, '');
}

// Product sizes: [label, widthInches, heightInches]
// w/h in real inches so we can compute exact aspect ratio
const DS_SIZES = {
  player: { label:'Banner Size', items:[['24 × 36 in',24,36],['30 × 45 in',30,45],['36 × 48 in',36,48],['48 × 48 in',48,48],['48 × 72 in',48,72],['Custom (enter inches)',36,48]] },
  banner: { label:'Banner Size', items:[
    ['1×2 ft',24,12],['1×4 ft',48,12],['1×8 ft',96,12],['1×9 ft',108,12],['1×10 ft',120,12],
    ['2×2 ft',24,24],['2×3 ft',36,24],['2×4 ft',48,24],['2×6 ft',72,24],['2×8 ft',96,24],['2×10 ft',120,24],
    ['3×3 ft',36,36],['3×4 ft',48,36],['3×5 ft',60,36],['3×6 ft',72,36],['3×8 ft',96,36],['3×10 ft',120,36],
    ['4×4 ft',48,48],['4×5 ft',60,48],['4×6 ft',72,48],['4×8 ft ⭐',96,48],['4×10 ft',120,48],['4×12 ft',144,48],
    ['5×5 ft',60,60],['5×8 ft',96,60],['5×10 ft ⭐',120,60],['5×12 ft',144,60],
    ['6×6 ft',72,72],['6×8 ft',96,72],['6×10 ft',120,72],['6×12 ft',144,72],['6×15 ft',180,72],
    ['8×8 ft',96,96],['8×10 ft',120,96],['8×12 ft',144,96],['8×15 ft',180,96],['8×20 ft',240,96],
    ['10×10 ft',120,120],['10×20 ft',240,120],
    ['Custom (enter inches)',48,24]
  ]},
  backdrop: { label:'Backdrop Size', items:[
    ['6×8 ft',96,72],['7×8 ft',96,84],['8×8 ft ⭐',96,96],['8×10 ft',120,96],['9×9 ft',108,108]
  ]},
  tent: { label:'Tent Banner Size', items:[
    ['1×5 ft',60,12],['1×6 ft',72,12],['1×8 ft',96,12],['1×9 ft (10ft Tent)',108,12],['1×10 ft',120,12],
    ['10×3 ft Side Skirt',120,36],['10×4 ft Side Skirt',120,48]
  ]},
  yardsign: { label:'Sign Size', items:[
    ['24"×18" Standard ⭐',24,18],['24"×24" Square',24,24],['24"×16" Economy',24,16]
  ]},
  bannerstand: { label:'Stand Size', items:[
    ['80"×33.5" Retractable',33.5,80]
  ]},
  magnet: { label:'Magnet Size', items:[
    ['18"×12"',18,12],['24"×12"',24,12],['24"×18" ⭐',24,18],['42"×12"',42,12],['72"×24"',72,24]
  ]},
  bizcard: { label:'Card Size', items:[
    ['3.5"×2" Standard',3.5,2]
  ]},
  tshirt: { label:'Print Area', items:[
    ['Front Only — Center Chest',13.6,13.6],
    ['Back Only — Center Back',13.6,13.6],
    ['Front & Back',13.6,13.6]
  ]},
  realtor: { label:'Sign Size', items:[
    ['Panel 24"×18"',24,18],['Panel 36"×24"',36,24],
    ['Rider 24"×6"',24,6],['Rider 36"×6"',36,6]
  ]},
  realtorRider: { label:'Rider Size', items:[
    ['Rider 24"×6"',24,6],['Rider 36"×6"',36,6]
  ]},
  realtorPanel: { label:'Panel Size', items:[
    ['Panel 24"×18"',24,18],['Panel 36"×24"',36,24]
  ]}
};
// 18oz banner uses the same sizes as regular banner but enables double-sided tabs
DS_SIZES.banner18oz = DS_SIZES.banner;

function openDesigner(product, type, price, details) {
  // On mobile phones, show simple options sheet instead of complex designer
  if (window.innerWidth <= 600) {
    window._mdsProduct = product;
    window._mdsType = type;
    window._mdsPrice = price;
    window._mdsDetails = details;
    const sheet = document.getElementById('mobile-design-sheet');
    const title = document.getElementById('mds-title');
    if (title) title.textContent = product || 'Add Your Design';
    if (sheet) { sheet.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
    return;
  }
  _openDesignerFull(product, type, price, details);
}
function _openDesignerFull(product, type, price, details) {
  dsProduct = product;
  dsType = type || 'banner';
  dsPrice = price || '$0.00';
  dsPriceDetails = details || '';
  dsZoomLevel = 1;
  dsArtboardRotated = false;
  dsSizeType = null;
  dsSetLivePrice(dsPrice);
  const dCW = document.getElementById('d-custom-w-in'); if (dCW) dCW.value = '';
  const dCH = document.getElementById('d-custom-h-in'); if (dCH) dCH.value = '';

  // Update Canva template links to match this product type
  dsUpdateCanvaLinks(dsType);

  // Set title
  document.getElementById('modal-title').textContent = '✏️ ' + product + ' Designer';

  // Populate size dropdown
  // For realtor type, pick rider or panel sizes based on product name
  let effectiveType = dsType;
  if (dsProduct === 'Player Banner') effectiveType = 'player';
  if (dsType === 'realtor') {
    effectiveType = (dsProduct && dsProduct.toLowerCase().includes('rider')) ? 'realtorRider' : 'realtorPanel';
  }
  dsSizeType = effectiveType;
  const sizeData = DS_SIZES[effectiveType] || DS_SIZES[dsType] || DS_SIZES.banner;
  const sel = document.getElementById('d-size-select');
  sel.innerHTML = sizeData.items.map(([label]) =>
    `<option value="${label.replace(/"/g, '&quot;')}">${label}</option>`
  ).join('');
  document.getElementById('d-size-label').textContent = sizeData.label;

  // Auto-select size matching current product page selection
  if (dsType === 'realtor') {
    const isRider = dsProduct && dsProduct.toLowerCase().includes('rider');
    const pageSel = document.getElementById(isRider ? 're-rider-size' : 're-panel-size');
    if (pageSel) {
      const parts = pageSel.value.split(','); // e.g. "ss,26,6x24" or "ds,28,6x24"
      const dims = parts[2] || ''; // "6x24"
      const [w, h] = dims.split('x').map(Number);
      // Find matching option in designer dropdown
      const opts = sel.options;
      for (let i = 0; i < opts.length; i++) {
        const [, ow, oh] = sizeData.items[i];
        if (ow === h && oh === w || ow === w && oh === h) { sel.selectedIndex = i; break; }
      }
    }
  }

  // Auto-select size to match the originating product panel.
  // If that panel is currently on its own "custom" size entry, its details
  // text has no numbers in it (e.g. "Custom Size (enter inches below)"), so
  // text matching below can never find it — explicitly land on the
  // designer's "Custom (enter inches)" entry instead, which then pulls the
  // real typed inches straight from that panel's own fields.
  let dsAutoSelectedCustom = false;
  if (sel && sel.options && sel.options.length) {
    const customIdx = Array.from(sel.options).findIndex(o => o.value === 'Custom (enter inches)');
    if (customIdx >= 0) {
      if (product === 'Custom Vinyl Banner') {
        sel.selectedIndex = customIdx; dsAutoSelectedCustom = true;
      } else if (DS_BANNER_ORIGIN[product]) {
        const originSel = document.getElementById(DS_BANNER_ORIGIN[product].prefix + '-size');
        if (originSel && originSel.value === 'custom') { sel.selectedIndex = customIdx; dsAutoSelectedCustom = true; }
      }
    }
  }

  // Inch-based details (e.g. table runner '24"×72" — Standard — $50'): the
  // preset labels are in feet, so text matching can never hit. Match the
  // inch pair numerically against the preset list; if no preset has those
  // exact dimensions, land on the Custom entry with the inches pre-filled
  // (banner convention: first number is height, second is width).
  if (!dsAutoSelectedCustom && details && sel && sel.options && sel.options.length) {
    const im = String(details).match(/(\d+(?:\.\d+)?)\s*(?:"|\u2033|in\b)\s*[\u00d7x]\s*(\d+(?:\.\d+)?)\s*(?:"|\u2033|in\b)/i);
    if (im) {
      const a = parseFloat(im[1]), b = parseFloat(im[2]);
      let hit = -1;
      for (let i = 0; i < sizeData.items.length && i < sel.options.length; i++) {
        const [, ow, oh] = sizeData.items[i];
        if ((ow === a && oh === b) || (ow === b && oh === a)) { hit = i; break; }
      }
      if (hit >= 0) { sel.selectedIndex = hit; dsAutoSelectedCustom = true; }
      else {
        const ci = Array.from(sel.options).findIndex(o => o.value === 'Custom (enter inches)');
        if (ci >= 0) {
          sel.selectedIndex = ci; dsAutoSelectedCustom = true;
          const wEl = document.getElementById('d-custom-w-in'), hEl = document.getElementById('d-custom-h-in');
          if (wEl) wEl.value = b;
          if (hEl) hEl.value = a;
        }
      }
    }
  }

  // Auto-select size from the provided details text (e.g. "Mesh · 4×8 ft")
  // Avoids defaulting to the first option (1×2 ft) when the product page size is different.
  if (!dsAutoSelectedCustom && details && sel && sel.options && sel.options.length) {
    const desired = dsNormalizeSizeLabel(details);
    let bestIndex = -1;
    for (let i = 0; i < sel.options.length; i++) {
      const optVal = sel.options[i].value || sel.options[i].textContent || '';
      const optNorm = dsNormalizeSizeLabel(optVal);
      if (!optNorm) continue;
      if (desired.includes(optNorm) || optNorm.includes(desired)) { bestIndex = i; break; }
    }
    if (bestIndex >= 0) sel.selectedIndex = bestIndex;
  }

  // Show/hide tshirt scale
  const tss = document.getElementById('d-tshirt-scale');
  if (tss) tss.style.display = dsType === 'tshirt' ? 'block' : 'none';
  const canRotate = dsType !== 'bannerstand';
  const rotateBtn = document.getElementById('d-rotate-artboard-btn');
  if (rotateBtn) rotateBtn.style.display = canRotate ? 'block' : 'none';
  const grommetPanel = document.getElementById('d-grommet-strip');
  if (grommetPanel) grommetPanel.style.display = ['banner','banner18oz','backdrop','tent'].includes(dsType) ? 'flex' : 'none';
  const grommetSelect = document.getElementById('d-grommet-style');
  // Table runners are straight-cut / no-hem: grommets are an opt-in choice, not the default.
  if (grommetSelect) grommetSelect.value = dsType === 'tent' ? '15' : (/table\s*runner/i.test(product || '') ? 'none' : 'standard');

  // Show modal FIRST
  document.getElementById('design-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
  // Default to text panel
  dsShowPanel('text');
  dsUndoStack = [];
  setTimeout(dsPushUndo, 200);

  try { dsPopulateEmojis(); } catch(e) {}

  // Init swatches
  dsInitSwatches();

  // Reset approval
  const cb = document.getElementById('d-approved');
  const btn = document.getElementById('d-approve-btn');
  if (cb) cb.checked = false;
  if (btn) btn.disabled = true;

  // Reset front/back side data
  dsCurrentSide = 'front';
  dsSideData = { front: { elements: [], bgColor: '#ffffff' }, back: { elements: [], bgColor: '#ffffff' } };
  dsBgColorBack = '#ffffff';
  const showTabs = dsIsDoubleSided();
  dsShowSideTabs(showTabs);
  dsShowDualArtboard(showTabs);
  const frontTab = document.getElementById('ds-tab-front');
  const backTab = document.getElementById('ds-tab-back');
  if (frontTab) frontTab.classList.add('active');
  if (backTab) backTab.classList.remove('active');
  const sideLabel = document.getElementById('ds-side-label');
  if (sideLabel) sideLabel.textContent = 'Front';

  // Clear both artboards
  const layer = document.getElementById('d-elements');
  if (layer) layer.querySelectorAll('div:not(#d-placeholder):not(.ds-resize-handle):not(.ds-element-toolbar), img').forEach(el => el.remove());
  if (layer) layer.querySelectorAll('.ds-resize-handle, .ds-element-toolbar').forEach(h => h.remove());
  const ph = document.getElementById('d-placeholder');
  if (ph) ph.style.display = 'block';
  const layerB = document.getElementById('d-elements-back');
  if (layerB) layerB.querySelectorAll('div:not(#d-placeholder-back), img').forEach(el => el.remove());
  const phB = document.getElementById('d-placeholder-back');
  if (phB) phB.style.display = 'block';
  dsSelectedEl = null;
  dsBgColor = '#ffffff';

  // Use rAF so the browser paints the modal before we draw to canvas
  requestAnimationFrame(function() {
    dsUpdateCanvas(sel.value);
    // Second rAF ensures canvas is visible after first paint
    requestAnimationFrame(function() { dsRedrawCanvas(); });
  });
}

// Products whose designer size can be synced back to an authoritative
// storefront price calculator (reuses the same formula the panel uses —
// never re-derives pricing independently).
const DS_BANNER_ORIGIN = {
  'Player Banner': { prefix: 'plyr' },
  '13oz Vinyl Banner': { prefix: 'b13' },
  '18oz Vinyl Banner': { prefix: 'b18' }
};

function dsSetLivePrice(priceStr) {
  if (!priceStr) return;
  dsPrice = priceStr;
  const el = document.getElementById('d-live-price');
  if (el) el.textContent = priceStr;
}

function dsSyncBannerPriceFromArtboard(wIn, hIn, isCustomEntry) {
  if (dsProduct === 'Player Banner') {
    const sel = document.getElementById('plyr-size');
    const w = Math.round(wIn), h = Math.round(hIn);
    let hit = false;
    if (sel) for (const o of sel.options) { if (+o.dataset.w === w && +o.dataset.h === h) { sel.value = o.value; hit = true; break; } }
    if (!hit && sel) { sel.value = 'custom'; const wEl = document.getElementById('plyr-custom-w'), hEl = document.getElementById('plyr-custom-h'); if (wEl) wEl.value = w; if (hEl) hEl.value = h; }
    if (typeof togglePlyrCustom === 'function') togglePlyrCustom();
    if (typeof calcPlayer === 'function') calcPlayer();
    const pEl = document.getElementById('plyr-price'); if (pEl) dsSetLivePrice(pEl.textContent);
    return;
  }
  if (dsProduct === 'Custom Vinyl Banner') {
    const wEl = document.getElementById('custom-w');
    const hEl = document.getElementById('custom-h');
    if (wEl) wEl.value = Math.round(wIn);
    if (hEl) hEl.value = Math.round(hIn);
    if (typeof calcCustom === 'function') calcCustom();
    const priceEl = document.getElementById('custom-price');
    if (priceEl) dsSetLivePrice(priceEl.textContent);
    return;
  }
  const origin = DS_BANNER_ORIGIN[dsProduct];
  if (!origin) return;
  const { prefix } = origin;
  const sel = document.getElementById(prefix + '-size');
  const row = document.getElementById(prefix + '-custom-row');
  if (isCustomEntry) {
    const wEl = document.getElementById(prefix + '-custom-w');
    const hEl = document.getElementById(prefix + '-custom-h');
    if (sel) sel.value = 'custom';
    if (row) row.style.display = 'block';
    if (wEl) wEl.value = Math.round(wIn);
    if (hEl) hEl.value = Math.round(hIn);
    if (typeof calcBannerCustomSize === 'function') calcBannerCustomSize(prefix);
  } else {
    if (sel) {
      const sqft = Math.ceil(wIn / 12) * Math.ceil(hIn / 12);
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value !== 'custom' && parseFloat(sel.options[i].value) === sqft) { sel.selectedIndex = i; break; }
      }
    }
    if (row) row.style.display = 'none';
    if (prefix === 'b13' && typeof calc13oz === 'function') calc13oz();
    if (prefix === 'b18' && typeof calc18oz === 'function') calc18oz();
  }
  const priceEl = document.getElementById(prefix + '-price');
  if (priceEl) dsSetLivePrice(priceEl.textContent);
}

function dsUpdateCanvas(sizeLabel) {
  const sizeData = DS_SIZES[dsSizeType || dsType] || DS_SIZES[dsType] || DS_SIZES.banner;
  let item = sizeData.items.find(([label]) => label === sizeLabel);
  if (!item) {
    const want = dsNormalizeSizeLabel(sizeLabel);
    item = sizeData.items.find(([label]) => dsNormalizeSizeLabel(label) === want) ||
           sizeData.items.find(([label]) => {
             const have = dsNormalizeSizeLabel(label);
             return have.includes(want) || want.includes(have);
           }) ||
           sizeData.items[0];
  }
  const [label, baseWIn, baseHIn] = item;
  const isCustomEntry = label === 'Custom (enter inches)';
  const customInputsRow = document.getElementById('d-custom-size-inputs');
  let effWIn = baseWIn, effHIn = baseHIn;
  if (isCustomEntry) {
    if (customInputsRow) customInputsRow.style.display = 'flex';
    const wInput = document.getElementById('d-custom-w-in');
    const hInput = document.getElementById('d-custom-h-in');
    if (wInput && hInput && !wInput.value && !hInput.value) {
      let prefillW = null, prefillH = null;
      // Prefer reading the true typed inches straight from the originating
      // panel's own fields — far more reliable than parsing display text.
      if (dsProduct === 'Custom Vinyl Banner') {
        const srcW = document.getElementById('custom-w'), srcH = document.getElementById('custom-h');
        if (srcW && parseFloat(srcW.value) > 0) prefillW = srcW.value;
        if (srcH && parseFloat(srcH.value) > 0) prefillH = srcH.value;
      } else if (DS_BANNER_ORIGIN[dsProduct]) {
        const p = DS_BANNER_ORIGIN[dsProduct].prefix;
        const srcW = document.getElementById(p + '-custom-w'), srcH = document.getElementById(p + '-custom-h');
        if (srcW && parseFloat(srcW.value) > 0) prefillW = srcW.value;
        if (srcH && parseFloat(srcH.value) > 0) prefillH = srcH.value;
      }
      if (prefillW == null || prefillH == null) {
        const m = (dsPriceDetails || '').match(/(\d+(?:\.\d+)?)\s*[″"]\s*[×xX]\s*(\d+(?:\.\d+)?)\s*[″"]/);
        if (prefillW == null) prefillW = m ? m[1] : baseWIn;
        if (prefillH == null) prefillH = m ? m[2] : baseHIn;
      }
      wInput.value = prefillW;
      hInput.value = prefillH;
    }
    const typedW = wInput ? parseFloat(wInput.value) : NaN;
    const typedH = hInput ? parseFloat(hInput.value) : NaN;
    if (typedW > 0) effWIn = Math.min(typedW, 1200);
    if (typedH > 0) effHIn = Math.min(typedH, 1200);
  } else if (customInputsRow) {
    customInputsRow.style.display = 'none';
  }
  const wIn = dsArtboardRotated ? effHIn : effWIn;
  const hIn = dsArtboardRotated ? effWIn : effHIn;
  dsCurrentDims = { w:wIn, h:hIn };
  dsSyncBannerPriceFromArtboard(wIn, hIn, isCustomEntry);
  const maxWIn = Math.max(...sizeData.items.map(([,w,h]) => Math.max(w,h)));
  const maxHIn = Math.max(...sizeData.items.map(([,w,h]) => Math.min(w,h)));

  // Update dimension labels
  function fmtDim(inches, forceInches) {
    if (forceInches || inches < 12) return inches + '"';
    const ft = inches / 12;
    return (ft % 1 === 0 ? ft : ft.toFixed(1)) + ' ft';
  }
  const showInches = (dsType === 'bannerstand' || dsType === 'bizcard' || 
                      dsType === 'magnet' || dsType === 'yardsign' || 
                      dsType === 'realtor' || wIn < 12 || hIn < 12);
  ['d-lbl-w','d-lbl-w2','d-lbl-w-back','d-lbl-w2-back'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = fmtDim(wIn, showInches);
  });
  ['d-lbl-h-left','d-lbl-h-right','d-lbl-h-left-back','d-lbl-h-right-back'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = fmtDim(hIn, showInches);
  });
  const badge = document.getElementById('d-size-badge');
  if (badge) badge.textContent = label.replace(' ⭐','');

  // Single artboard — always full size
  const canvas = document.getElementById('d-canvas');
  const wrap   = document.getElementById('d-canvas-wrap');
  const elLayer= document.getElementById('d-elements');
  const overlay= document.getElementById('d-overlay');
  if (!canvas) return;

  const canvasArea = document.getElementById('ds-canvas-area');
  const isPortraitNarrow = (window.matchMedia && window.matchMedia('(max-width: 768px) and (orientation: portrait)').matches);
  const MAX_CONTAINER_W = isPortraitNarrow ? 520 : 580;
  const MAX_CONTAINER_H = isPortraitNarrow ? 480 : 520;
  const availW = canvasArea ? canvasArea.clientWidth : MAX_CONTAINER_W;
  const availH = canvasArea ? canvasArea.clientHeight : MAX_CONTAINER_H;
  const CONTAINER_W = Math.max(260, Math.min(MAX_CONTAINER_W, Math.floor(availW - 16)));
  const CONTAINER_H = Math.max(240, Math.min(MAX_CONTAINER_H, Math.floor(availH - 16)));
  let canvasW, canvasH;
  const ratio = hIn / wIn;
  if (ratio >= 1) {
    canvasH = Math.min(CONTAINER_H, 500);
    canvasW = Math.round(canvasH / ratio);
  } else {
    canvasW = CONTAINER_W;
    canvasH = Math.round(canvasW * ratio);
    if (canvasH < 60) canvasH = 60;
  }

  canvas.width = canvasW;
  canvas.height = canvasH;
  canvas.style.width = canvasW + 'px';
  canvas.style.height = canvasH + 'px';
  [elLayer, overlay].forEach(el => {
    if (el) { el.style.width = canvasW + 'px'; el.style.height = canvasH + 'px'; }
  });
  if (wrap) wrap.style.width = canvasW + 'px';

  // SIZE THE BACK CANVAS IDENTICALLY
  const canvasBack = document.getElementById('d-canvas-back');
  const wrapBack   = document.getElementById('d-canvas-wrap-back');
  const layerBack  = document.getElementById('d-elements-back');
  const overlayBack= document.getElementById('d-overlay-back');
  if (canvasBack) {
    canvasBack.width  = canvasW;
    canvasBack.height = canvasH;
    canvasBack.style.width  = canvasW + 'px';
    canvasBack.style.height = canvasH + 'px';
    const ctxB = canvasBack.getContext('2d');
    if (ctxB) { ctxB.fillStyle = dsBgColorBack || '#ffffff'; ctxB.fillRect(0,0,canvasW,canvasH); }
  }
  if (wrapBack)   wrapBack.style.width   = canvasW + 'px';
  [layerBack, overlayBack].forEach(el => {
    if (el) { el.style.width = canvasW + 'px'; el.style.height = canvasH + 'px'; }
  });

  const cornersEl = document.getElementById('mag-corners') || document.getElementById('mag-single-corners');
  const hasRoundedCorners = dsType === 'magnet' && cornersEl && cornersEl.value !== '0' && cornersEl.selectedIndex > 0;
  canvas.style.borderRadius = hasRoundedCorners ? '12px' : '0';

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = dsBgColor;
  ctx.fillRect(0, 0, canvasW, canvasH);
  dsRenderGrommets();

  // Tie the minimum font size to real print size (points), not raw on-screen
  // pixels — a 6px floor is fine on a banner but prints unreadably small
  // (~3pt) on a 3.5" business card at this canvas's on-screen scale.
  const pxPerInch = canvasW / Math.max(wIn, 0.1);
  dsMinFontPx = Math.max(4, Math.round(6 * pxPerInch / 72));
  const fsInput = document.getElementById('d-fontsize');
  if (fsInput) {
    fsInput.min = dsMinFontPx;
    if (parseInt(fsInput.value) < dsMinFontPx) fsInput.value = dsMinFontPx;
  }
  dsRenderSafeZone();
}

function dsSetBg(color) {
  dsBgColor = color;
  dsRedrawCanvas();
}


function dsRedrawBackCanvas() {
  const c = document.getElementById('d-canvas-back');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = dsBgColorBack || '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
}

function dsRedrawCanvas() {
  const canvas = dsGetCanvas();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = dsBgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  dsRenderGrommets();
  dsRenderSafeZone();
}

function dsRotateArtboard() {
  if (dsType === 'bannerstand') return;
  dsArtboardRotated = !dsArtboardRotated;
  const sel = document.getElementById('d-size-select');
  if (sel) dsUpdateCanvas(sel.value);
}

function dsRenderGrommets() {
  const overlay = dsGetGrommets();
  const canvas = dsGetCanvas();
  if (!overlay || !canvas) return;
  if (!['banner','banner18oz','backdrop','tent'].includes(dsType)) { overlay.innerHTML = ''; return; }
  const style = document.getElementById('d-grommet-style')?.value || 'standard';
  if (style === 'none') { overlay.innerHTML = ''; return; }

  const w = canvas.width;
  const h = canvas.height;
  const pad = 10;
  let spacingInches = 24;
  if (style === '15') spacingInches = 15;
  if (style === '24' || style === 'standard') spacingInches = 24;
  const xStep = Math.max(36, (spacingInches / Math.max(dsCurrentDims.w,1)) * w);
  const yStep = Math.max(36, (spacingInches / Math.max(dsCurrentDims.h,1)) * h);
  const points = [];
  const addPoint = (x, y) => {
    if (!points.some(p => Math.abs(p.x - x) < 1 && Math.abs(p.y - y) < 1)) points.push({x,y});
  };
  const evenPositions = (length, spacing) => {
    const available = Math.max(0, length - pad * 2);
    const intervals = Math.max(1, Math.round(available / Math.max(spacing, 1)));
    const actualGap = available / intervals;
    return Array.from({length: intervals + 1}, (_, i) => pad + i * actualGap);
  };
  const addHorizontal = y => evenPositions(w, xStep).forEach(x => addPoint(x, y));
  const addVertical = x => evenPositions(h, yStep).forEach(y => addPoint(x, y));

  if (style === 'corners') {
    addPoint(pad,pad); addPoint(w-pad,pad); addPoint(pad,h-pad); addPoint(w-pad,h-pad);
  } else if (style === 'topbottom') {
    addHorizontal(pad); addHorizontal(h-pad);
  } else if (style === 'top') {
    addHorizontal(pad);
  } else if (style === 'sides') {
    addVertical(pad); addVertical(w-pad);
  } else {
    addHorizontal(pad); addHorizontal(h-pad); addVertical(pad); addVertical(w-pad);
  }

  overlay.innerHTML = points.map(p =>
    `<span style="position:absolute;left:${p.x - 5}px;top:${p.y - 5}px;width:10px;height:10px;border-radius:50%;background:#cbd5e1;border:2px solid rgba(15,37,117,.55);box-shadow:0 0 0 2px rgba(255,255,255,.85)"></span>`
  ).join('');
}

// Business-card-only print guide: text, logos, and photo edges need to stay
// inside this line, or normal +/-1/16" trim variance can cut them off.
// 0.125" is the standard safe-margin used industry-wide for a 3.5x2 card
// (Vistaprint, Moo, GotPrint, UPrinting all use the same spec).
function dsRenderSafeZone() {
  const front = document.getElementById('d-safezone-overlay');
  const back  = document.getElementById('d-safezone-overlay-back');
  const canvas = document.getElementById('d-canvas');
  if (!front || !canvas) return;
  if (dsType !== 'bizcard') {
    front.innerHTML = '';
    if (back) back.innerHTML = '';
    return;
  }
  const w = canvas.width, h = canvas.height;
  const wIn = (dsCurrentDims && dsCurrentDims.w) || 3.5;
  const hIn = (dsCurrentDims && dsCurrentDims.h) || 2;
  const SAFE_MARGIN_IN = 0.125;
  const mx = Math.round((SAFE_MARGIN_IN / wIn) * w);
  const my = Math.round((SAFE_MARGIN_IN / hIn) * h);
  const labelTop = Math.max(2, my - 16);
  const html = `<div style="position:absolute;left:${mx}px;top:${my}px;right:${mx}px;bottom:${my}px;border:2px dashed #1d4ed8;pointer-events:none;z-index:999"></div>
    <div style="position:absolute;left:${mx}px;top:${labelTop}px;font-size:9px;font-weight:800;color:#1d4ed8;letter-spacing:.3px;background:rgba(255,255,255,.9);padding:1px 5px;border-radius:3px;white-space:nowrap;pointer-events:none;z-index:999">KEEP TEXT &amp; LOGOS INSIDE THIS LINE</div>`;
  front.innerHTML = html;
  if (back) back.innerHTML = html;
}

function dsInitSwatches() {
  ['d-bg-swatches', 'd-text-swatches'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = DS_COLORS.map(c =>
      `<div onclick="${id==='d-bg-swatches'?'dsSetBg':'dsSetTextColor'}('${c}')" title="${c}"
        style="width:18px;height:18px;border-radius:4px;background:${c};border:2px solid ${c==='#ffffff'||c==='#f9fafb'?'#ccc':'transparent'};cursor:pointer;transition:transform .15s"
        onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform=''"></div>`
    ).join('');
  });
}

function dsSetTextColor(c) {
  dsTextColor = c;
  if (dsSelectedEl && dsSelectedEl.tagName !== 'IMG') {
    dsSelectedEl.style.color = c;
  }
}

function dsToggle(style) {
  if (style === 'bold') { dsBold = !dsBold; document.getElementById('d-btn-bold').classList.toggle('active', dsBold); }
  if (style === 'italic') { dsItalic = !dsItalic; document.getElementById('d-btn-italic').classList.toggle('active', dsItalic); }
  if (style === 'under') { dsUnder = !dsUnder; document.getElementById('d-btn-under').classList.toggle('active', dsUnder); }
  if (dsSelectedEl && dsSelectedEl.tagName !== 'IMG') {
    dsSelectedEl.style.fontWeight = dsBold ? '700' : '400';
    dsSelectedEl.style.fontStyle = dsItalic ? 'italic' : 'normal';
    dsSelectedEl.style.textDecoration = dsUnder ? 'underline' : 'none';
  }
}

function dsAlign(a) {
  dsTextAlign = a;
  if (dsSelectedEl && dsSelectedEl.tagName !== 'IMG') dsSelectedEl.style.textAlign = a;
}






// ===== SHIPPING-OPTION COUNTDOWN TIMERS (built into the Standard/Same-Day boxes) =====
function tickProductClocks() {
  const now = getESTDate();
  const day = now.getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  const pad = n => String(n).padStart(2,'0');

  // Standard cutoff — 9PM EST
  const cut = new Date(now); cut.setHours(21,0,0,0);
  const sl  = Math.max(0, Math.floor((cut - now) / 1000));
  const isSat = day === 6;
  const pastCutoff = sl <= 0;

  let stdH, stdM, stdS;
  if (isSat) {
    // Saturday — show hours until Sunday 9PM
    const sunCut = new Date(now);
    const daysUntilSun = (7 - day) % 7 || 7;
    sunCut.setDate(sunCut.getDate() + daysUntilSun);
    sunCut.setHours(21,0,0,0);
    const sunSl = Math.max(0, Math.floor((sunCut - now) / 1000));
    stdH = Math.floor(sunSl/3600); stdM = Math.floor((sunSl%3600)/60); stdS = sunSl%60;
  } else if (pastCutoff) {
    stdH = 0; stdM = 0; stdS = 0;
  } else {
    stdH = Math.floor(sl/3600); stdM = Math.floor((sl%3600)/60); stdS = sl%60;
  }
  document.querySelectorAll('.ship-cd-std-h').forEach(el => el.textContent = pad(stdH));
  document.querySelectorAll('.ship-cd-std-m').forEach(el => el.textContent = pad(stdM));
  document.querySelectorAll('.ship-cd-std-s').forEach(el => el.textContent = pad(stdS));

  // Same-day / rush cutoff — 1PM EST, Mon-Fri only (uses the same availability
  // check as the shipping-option widget so both stay perfectly in sync)
  const rushCut = new Date(now); rushCut.setHours(13,0,0,0);
  const rushActive = _shipRushAvail(day);
  const rushSl = Math.max(0, Math.floor((rushCut - now) / 1000));
  if (rushActive) {
    const rh = Math.floor(rushSl/3600), rm = Math.floor((rushSl%3600)/60), rs = rushSl%60;
    document.querySelectorAll('.ship-cd-rush-h').forEach(el => el.textContent = pad(rh));
    document.querySelectorAll('.ship-cd-rush-m').forEach(el => el.textContent = pad(rm));
    document.querySelectorAll('.ship-cd-rush-s').forEach(el => el.textContent = pad(rs));
    document.querySelectorAll('.ship-opt-cd-rush').forEach(el => el.classList.remove('ship-cd-disabled'));
  } else {
    document.querySelectorAll('.ship-cd-rush-h,.ship-cd-rush-m,.ship-cd-rush-s').forEach(el => el.textContent = '--');
    document.querySelectorAll('.ship-opt-cd-rush').forEach(el => el.classList.add('ship-cd-disabled'));
  }
}

// ===== SEASONAL CAROUSEL =====
let seasonalIdx = 3;
let seasonalTimer = null;

function seasonalGoTo(idx) {
  const slides = document.querySelectorAll('.seasonal-slide');
  const dots   = document.querySelectorAll('.seasonal-dot');
  slides.forEach((s,i) => s.classList.toggle('active', i===idx));
  dots.forEach((d,i)   => d.classList.toggle('active', i===idx));
  seasonalIdx = idx;
  // Sync fedex logo in active slide
  // Sync all fedex logos
  const fl = document.getElementById('header-logo');
  if (fl && fl.src) document.querySelectorAll('.slide-fedex-logo').forEach(el => el.src = fl.src);
}

function seasonalNext() {
  const slides = document.querySelectorAll('.seasonal-slide');
  seasonalGoTo((seasonalIdx + 1) % slides.length);
}

function seasonalPrev() {
  const slides = document.querySelectorAll('.seasonal-slide');
  seasonalGoTo((seasonalIdx - 1 + slides.length) % slides.length);
}

function seasonalStartAuto() {
  clearInterval(seasonalTimer);
  seasonalTimer = setInterval(seasonalNext, 5000);
}

// Pause on hover, restart on leave
document.addEventListener('DOMContentLoaded', () => {
  const car = document.getElementById('seasonal-carousel');
  if (car) {
    car.addEventListener('mouseenter', () => clearInterval(seasonalTimer));
    car.addEventListener('mouseleave', seasonalStartAuto);
    // Swipe support
    let touchX0 = 0;
    car.addEventListener('touchstart', e => { touchX0 = e.touches[0].clientX; }, {passive:true});
    car.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchX0;
      if (Math.abs(dx) > 40) { dx < 0 ? seasonalNext() : seasonalPrev(); seasonalStartAuto(); }
    });
  }
  seasonalStartAuto();

  tickProductClocks();
  setInterval(tickProductClocks, 1000);
  initSatDeliveryPanels();
});

// ===== SHAPES =====
// SVG path/shapes rendered onto a canvas element so they behave like images
// (draggable, resizable with corner handles, deletable)

const DS_SHAPE_DEFS = {
  rect:        (w,h,fill,stroke,sw) => `<rect x="${sw/2}" y="${sw/2}" width="${w-sw}" height="${h-sw}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
  rounded:     (w,h,fill,stroke,sw) => `<rect x="${sw/2}" y="${sw/2}" width="${w-sw}" height="${h-sw}" rx="${Math.round(h*0.18)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
  circle:      (w,h,fill,stroke,sw) => `<ellipse cx="${w/2}" cy="${h/2}" rx="${w/2-sw/2}" ry="${h/2-sw/2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
  triangle:    (w,h,fill,stroke,sw) => `<polygon points="${w/2},${sw} ${w-sw},${h-sw} ${sw},${h-sw}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`,
  star:        (w,h,fill,stroke,sw) => { const cx=w/2,cy=h/2,r1=Math.min(w,h)/2-sw,r2=r1*0.42,pts=[]; for(let i=0;i<10;i++){const a=Math.PI/5*i-Math.PI/2,r=i%2===0?r1:r2;pts.push((cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1));} return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`; },
  diamond:     (w,h,fill,stroke,sw) => `<polygon points="${w/2},${sw} ${w-sw},${h/2} ${w/2},${h-sw} ${sw},${h/2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`,
  'arrow-right':(w,h,fill,stroke,sw)=> { const ah=h*0.38,ay=(h-ah)/2,ax=w*0.62; return `<polygon points="${sw},${ay+ah*0.15} ${ax},${ay+ah*0.15} ${ax},${sw} ${w-sw},${h/2} ${ax},${h-sw} ${ax},${ay+ah*0.85} ${sw},${ay+ah*0.85}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`; },
  line:        (w,h,fill,stroke,sw) => `<rect x="0" y="${h/2-Math.max(sw,3)/2}" width="${w}" height="${Math.max(sw,3)}" fill="${fill}"/>`,
  pentagon:    (w,h,fill,stroke,sw) => { const cx=w/2,top=sw,pts=[]; const angles=[-90,-18,54,126,198]; angles.forEach(a=>{const r=Math.min(w,h)/2-sw;pts.push((cx+r*Math.cos(a*Math.PI/180)).toFixed(1)+','+(h/2+r*Math.sin(a*Math.PI/180)).toFixed(1));}); return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`; }
};

function dsShapeSVGtoDataURL(type, w, h, fill, stroke, sw) {
  const shapeFn = DS_SHAPE_DEFS[type];
  if (!shapeFn) return null;
  const inner = shapeFn(w, h, fill, stroke, sw);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function dsAddShape(type) {
  const canvas = dsGetCanvas();
  const layer  = dsGetElements();
  const ph     = dsGetPlaceholder();
  if (!canvas || !layer) return;

  const fill   = document.getElementById('shape-fill-color')?.value   || '#1a3fa8';
  const stroke = document.getElementById('shape-stroke-color')?.value || '#1a3fa8';
  const sw     = parseInt(document.getElementById('shape-stroke-width')?.value) || 0;
  const opPct  = parseInt(document.getElementById('shape-opacity')?.value) || 100;

  // Default size ~25% of canvas
  const defW = Math.round(canvas.width  * 0.28);
  const defH = type === 'line' ? 8 : Math.round(canvas.height * 0.28);

  const dataURL = dsShapeSVGtoDataURL(type, 200, type==='line'?20:200, fill, stroke, sw);
  if (!dataURL) return;

  const img = document.createElement('img');
  img.src = dataURL;
  img.alt = 'Design shape element';
  img.setAttribute('data-shape-type', type);
  img.setAttribute('data-shape-fill', fill);
  img.setAttribute('data-shape-stroke', stroke);
  img.setAttribute('data-shape-sw', sw);
  img.setAttribute('data-aspect', type==='line' ? (defW/8).toFixed(4) : '1');
  img.style.cssText = [
    'position:absolute',
    'width:' + defW + 'px',
    'height:' + (type==='line' ? '8' : defH) + 'px',
    'left:' + Math.round((canvas.width  - defW) / 2) + 'px',
    'top:'  + Math.round((canvas.height - (type==='line'?8:defH)) / 2) + 'px',
    'cursor:move',
    'pointer-events:all',
    'outline:2px dashed transparent',
    'z-index:10',
    'opacity:' + (opPct/100)
  ].join(';');

  layer.style.pointerEvents = 'all';
  if (ph) ph.style.display = 'none';
  layer.appendChild(img);

  dsMakeDraggable(img);
  dsSelect(img);
  setTimeout(dsPushUndo, 50);
}

function dsUpdateSelectedShape() {
  const el = dsSelectedEl;
  if (!el || el.tagName !== 'IMG' || !el.getAttribute('data-shape-type')) return;

  const type   = el.getAttribute('data-shape-type');
  const fill   = document.getElementById('shape-fill-color')?.value   || '#1a3fa8';
  const stroke = document.getElementById('shape-stroke-color')?.value || '#1a3fa8';
  const sw     = parseInt(document.getElementById('shape-stroke-width')?.value) || 0;
  const opPct  = parseInt(document.getElementById('shape-opacity')?.value) || 100;

  const isLine = type === 'line';
  const dataURL = dsShapeSVGtoDataURL(type, 200, isLine?20:200, fill, stroke, sw);
  if (!dataURL) return;

  el.src = dataURL;
  el.setAttribute('data-shape-fill',   fill);
  el.setAttribute('data-shape-stroke', stroke);
  el.setAttribute('data-shape-sw',     sw);
  el.style.opacity = opPct / 100;
  dsPushUndo();
}




// ===== SATURDAY DELIVERY — PRODUCT PAGE =====
let satDeliveryExtra = 0;

function initSatDeliveryPanels() {
  const now = getESTDate();
  const isThu = now.getDay() === 4;
  document.querySelectorAll('.sat-opt-panel').forEach(el => {
    el.classList.toggle('visible', isThu);
  });
  // Uncheck all if not Thursday
  if (!isThu) {
    document.querySelectorAll('.sat-opt-cb').forEach(cb => { cb.checked = false; });
    satDeliveryExtra = 0;
  }
}

function updateSatDelivery(cb) {
  // Only one Saturday checkbox should be checked at a time
  document.querySelectorAll('.sat-opt-cb').forEach(other => {
    if (other !== cb) other.checked = false;
  });
  satDeliveryExtra = cb.checked ? 35 : 0;
}

// Saturday options are refreshed when pages change — hooked via existing showPage

// ===== QR CODE GENERATOR =====
let dsQRDataURL = null;

function dsGenerateQR() {
  const url   = (document.getElementById('qr-url-input').value || '').trim();
  if (!url) { alert('Enter a URL or text for the QR code.'); return; }

  const fg    = document.getElementById('qr-fg-color').value || '#000000';
  const bg    = document.getElementById('qr-bg-color').value || '#ffffff';
  const size  = parseInt(document.getElementById('qr-size-select').value) || 120;

  // Clear render box
  const box = document.getElementById('qr-render-box');
  box.innerHTML = '';

  try {
    new QRCode(box, {
      text:           url,
      width:          256,
      height:         256,
      colorDark:      fg,
      colorLight:     bg,
      correctLevel:   QRCode.CorrectLevel.H
    });
  } catch(e) {
    alert('QR generation failed: ' + e.message);
    return;
  }

  // QRCode.js renders async — grab canvas/img after short delay
  setTimeout(() => {
    const qrCanvas = box.querySelector('canvas');
    const qrImg    = box.querySelector('img');
    let dataURL    = null;

    if (qrCanvas) {
      dataURL = qrCanvas.toDataURL('image/png');
    } else if (qrImg) {
      // Some browsers render an img tag instead
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.drawImage(qrImg, 0, 0, 256, 256);
      dataURL = c.toDataURL('image/png');
    }

    if (!dataURL) { alert('QR render failed — try a different browser.'); return; }

    dsQRDataURL = dataURL;

    // Show preview
    const wrap = document.getElementById('qr-preview-wrap');
    wrap.innerHTML = '<img loading="lazy" decoding="async" src="' + dataURL + '" style="width:80px;height:80px;image-rendering:pixelated;border-radius:4px">';

    // Enable add button
    const addBtn = document.getElementById('qr-add-btn');
    if (addBtn) { addBtn.disabled = false; addBtn.style.opacity = '1'; }
  }, 150);
}

function dsAddQRToCanvas() {
  if (!dsQRDataURL) { alert('Generate a QR code first.'); return; }
  const canvas = dsGetCanvas();
  const layer  = dsGetElements();
  const ph     = dsGetPlaceholder();
  if (!canvas || !layer) return;

  const size = parseInt(document.getElementById('qr-size-select').value) || 120;

  const img = document.createElement('img');
  img.src = dsQRDataURL;
  img.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;cursor:move;pointer-events:all;outline:2px dashed transparent;z-index:10;image-rendering:pixelated;';
  img.setAttribute('data-aspect', '1');
  // Center on canvas
  img.style.left = Math.round((canvas.width  - size) / 2) + 'px';
  img.style.top  = Math.round((canvas.height - size) / 2) + 'px';

  layer.style.pointerEvents = 'all';
  if (ph) ph.style.display = 'none';
  layer.appendChild(img);

  dsMakeDraggable(img);
  dsSelect(img);
  setTimeout(dsPushUndo, 50);
}


// ===== UPLOAD DIRECT — opens designer in upload mode =====
function dsUploadDirect(type, price, product, details) {
  // Open the designer normally first
  openDesigner(product || 'Custom Design', type || 'banner', price, details);
  // Then trigger the file picker after designer is ready
  setTimeout(() => {
    dsShowPanel('image');
    const fileInput = document.getElementById('d-file');
    if (fileInput) fileInput.click();
  }, 400);
}


// ===== COPY FRONT DESIGN TO BACK =====
function dsCopyFrontToBack() {
  if (!dsIsDoubleSided()) return;
  const frontLayer = document.getElementById('d-elements');
  const backLayer  = document.getElementById('d-elements-back');
  const backPh     = document.getElementById('d-placeholder-back');
  if (!frontLayer || !backLayer) return;

  // Save current front state
  const curSide = dsCurrentSide;
  if (curSide === 'back') {
    // Switch to front first to get live elements
    dsSwitchSide('front');
  }

  const frontEls = [];
  frontLayer.querySelectorAll('div:not(#d-placeholder):not(.ds-resize-handle):not(.ds-element-toolbar), img').forEach(el => {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.ds-resize-handle,.ds-element-toolbar').forEach(h=>h.remove());
    frontEls.push(clone.outerHTML);
  });

  // Also copy to dsSideData.back so it persists on switch
  dsSideData.back = { elements: frontEls.map(h=>({html:h})), bgColor: dsBgColor };
  dsBgColorBack = dsBgColor;

  // Populate back layer visually
  backLayer.querySelectorAll('div:not(#d-placeholder-back):not(.ds-resize-handle):not(.ds-element-toolbar), img').forEach(el=>el.remove());
  frontEls.forEach(outerHTML => {
    const tmp = document.createElement('div');
    tmp.innerHTML = outerHTML;
    const el = tmp.firstChild;
    backLayer.appendChild(el);
    dsMakeDraggable(el);
  });
  if (backPh) backPh.style.display = frontEls.length ? 'none' : 'block';
  dsRedrawBackCanvas();

  alert('✅ Front design copied to back! Switch to Back Side to review or edit it.');
  dsPushUndo();
}

// ===== UNDO SYSTEM =====
let dsUndoStack = [];
const DS_UNDO_MAX = 30;

function dsPushUndo() {
  const layer = dsGetElements();
  if (!layer) return;
  // Clone just the user elements (not handles/toolbar)
  const clone = layer.cloneNode(true);
  clone.querySelectorAll('.ds-resize-handle, .ds-element-toolbar').forEach(n => n.remove());
  dsUndoStack.push(clone.innerHTML);
  if (dsUndoStack.length > DS_UNDO_MAX) dsUndoStack.shift();
  dsUpdateUndoBtn();
}

function dsUndo() {
  if (dsUndoStack.length < 2) return;
  dsUndoStack.pop(); // discard current
  const prev = dsUndoStack[dsUndoStack.length - 1];
  const layer = dsGetElements();
  if (!layer) return;
  layer.innerHTML = prev;
  layer.style.pointerEvents = 'all';
  // Re-wire drag on restored elements
  layer.querySelectorAll('div[style*="cursor:move"], img').forEach(el => {
    dsMakeDraggable(el);
    el.addEventListener('click', e => { e.stopPropagation(); dsSelect(el); });
  });
  dsSelectedEl = null;
  const ph = dsGetPlaceholder();
  const hasContent = layer.querySelectorAll('div:not(#d-placeholder), img').length > 0;
  if (ph) ph.style.display = hasContent ? 'none' : 'block';
  dsUpdateUndoBtn();
}

function dsUpdateUndoBtn() {
  const btn = document.getElementById('ds-undo-btn');
  if (btn) btn.style.opacity = dsUndoStack.length > 1 ? '1' : '0.4';
}

// ===== STYLED TEXT QUICK-ADD (Heading / Sub Heading / Body) =====
function dsAddStyledText(style) {
  const styles = {
    heading:    { text: 'Heading',    font: 'Bebas Neue',     size: 64, color: '#1a3fa8', bold: false, italic: false },
    subheading: { text: 'Sub Heading', font: 'Dancing Script', size: 40, color: '#6d28d9', bold: false, italic: true  },
    body:       { text: 'Body Text',  font: 'Nunito',          size: 22, color: '#374151', bold: false, italic: false }
  };
  const s = styles[style] || styles.heading;

  // If a text element is selected, apply the style to it instead of creating new
  if (dsSelectedEl && dsSelectedEl.tagName !== 'IMG') {
    dsSelectedEl.style.fontFamily = s.font + ',sans-serif';
    dsSelectedEl.style.fontSize   = s.size + 'px';
    dsSelectedEl.style.color      = s.color;
    dsSelectedEl.style.fontWeight = s.bold ? '900' : '400';
    dsSelectedEl.style.fontStyle  = s.italic ? 'italic' : 'normal';
    const fontSel = document.getElementById('d-font');
    const sizeInp = document.getElementById('d-fontsize');
    if (fontSel) fontSel.value = s.font;
    if (sizeInp) sizeInp.value = s.size;
    dsPushUndo();
    return;
  }

  const canvas = dsGetCanvas();
  const layer  = dsGetElements();
  const ph     = dsGetPlaceholder();
  if (!layer || !canvas) return;
  if (ph) ph.style.display = 'none';
  layer.style.pointerEvents = 'all';

  const el = document.createElement('div');
  el.textContent = s.text;
  el.style.cssText = [
    'position:absolute',
    'cursor:move',
    'outline:2px dashed transparent',
    'z-index:10',
    'pointer-events:all',
    'user-select:none',
    'white-space:nowrap',
    'font-family:' + s.font + ',sans-serif',
    'font-size:' + s.size + 'px',
    'color:' + s.color,
    'font-weight:' + (s.bold ? '900' : '400'),
    'font-style:' + (s.italic ? 'italic' : 'normal'),
    'line-height:1.2',
    'text-align:center'
  ].join(';');

  // Store style metadata
  el.dataset.fontFamily = s.font;
  el.dataset.fontSize   = s.size;
  el.dataset.color      = s.color;
  el.dataset.bold       = s.bold;
  el.dataset.italic     = s.italic;
  el.dataset.under      = false;
  el.dataset.align      = 'center';

  layer.style.pointerEvents = 'all';
  layer.appendChild(el);

  // Center after measuring — also lock in explicit width/height so corner-drag resize works
  setTimeout(() => {
    const w = Math.max(el.offsetWidth || 0, 40);
    const h = Math.max(el.offsetHeight || 0, 20);
    el.style.width  = w + 'px';
    el.style.height = h + 'px';
    el.style.left = Math.round((canvas.width  - w) / 2) + 'px';
    el.style.top  = Math.round((canvas.height - h) / 2) + 'px';
    dsMakeDraggable(el);
    dsSelect(el);
    // Sync font picker to match
    const fontSel = document.getElementById('d-font');
    const sizeInp = document.getElementById('d-fontsize');
    if (fontSel) fontSel.value = s.font;
    if (sizeInp) sizeInp.value = s.size;
  }, 30);
}

function dsUpdateAddTextBtn() {
  const btn = document.getElementById('d-add-text-btn');
  if (btn) btn.textContent = (dsSelectedEl && dsSelectedEl.tagName !== 'IMG') ? '✎ Update Text' : '+ Add Text';
}

function dsAddText() {
  const t = document.getElementById('d-text-input').value.trim();
  if (!t) return;

  // If a text element is selected, update it instead of creating a new one
  if (dsSelectedEl && dsSelectedEl.tagName !== 'IMG') {
    const fs = Math.max(parseInt(document.getElementById('d-fontsize').value) || 32, dsMinFontPx || 6);
    const ff = document.getElementById('d-font').value;
    dsSelectedEl.textContent = t;
    dsSelectedEl.style.fontFamily = `'${ff}',sans-serif`;
    dsSelectedEl.style.fontSize = fs + 'px';
    dsSelectedEl.style.fontWeight = dsBold ? '700' : '400';
    dsSelectedEl.style.fontStyle = dsItalic ? 'italic' : 'normal';
    dsSelectedEl.style.textDecoration = dsUnder ? 'underline' : 'none';
    dsSelectedEl.style.textAlign = dsTextAlign;
    dsSelectedEl.style.color = dsTextColor;
    // Re-measure and update handles so corners stay at the right spots
    setTimeout(() => {
      if (dsSelectedEl) {
        dsSelectedEl.style.width  = Math.max(dsSelectedEl.offsetWidth,  40) + 'px';
        dsSelectedEl.style.height = Math.max(dsSelectedEl.offsetHeight, 20) + 'px';
        dsAddResizeHandles(dsSelectedEl);
      }
    }, 20);
    dsPushUndo();
    return;
  }

  const canvas = dsGetCanvas();
  const layer  = dsGetElements();
  const ph     = dsGetPlaceholder();
  if (!layer || !canvas) return;
  if (ph) ph.style.display = 'none';

  const fs = Math.max(parseInt(document.getElementById('d-fontsize').value) || 32, dsMinFontPx || 6);
  const ff = document.getElementById('d-font').value;
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;left:0;top:0;color:${dsTextColor};font-family:'${ff}',sans-serif;font-size:${fs}px;font-weight:${dsBold?'700':'400'};font-style:${dsItalic?'italic':'normal'};text-decoration:${dsUnder?'underline':'none'};text-align:${dsTextAlign};padding:4px 8px;cursor:move;user-select:none;pointer-events:all;line-height:1.2;white-space:pre-wrap;outline:2px dashed transparent;z-index:10;`;
  el.textContent = t;
  layer.style.pointerEvents = 'all';
  layer.appendChild(el);
  // Small timeout lets browser calculate offsetWidth before we read it
  setTimeout(() => {
    const w = Math.max(el.offsetWidth  || 0, 40);
    const h = Math.max(el.offsetHeight || 0, fs + 16);
    el.style.width  = w + 'px';
    el.style.height = h + 'px';
    el.style.left   = Math.max(0, (canvas.width  - w) / 2) + 'px';
    el.style.top    = Math.max(0, (canvas.height - h) / 2) + 'px';
    dsMakeDraggable(el);
    dsSelect(el);
  }, 30);
  document.getElementById('d-text-input').value = '';
}

let dsCurrentUploadedFile = null;
let dsCurrentFileKey = null;
let dsCurrentThumbUrl = null;
const DS_MIN_DPI = 100; // soft threshold — existing UI copy elsewhere recommends 300 DPI
function showDsWarningBanner(msg) {
  const el = document.getElementById('ds-dpi-warning');
  if (!el) return;
  if (!msg) { el.style.display = 'none'; el.textContent = ''; return; }
  el.textContent = '⚠️ ' + msg;
  el.style.display = 'block';
}
let dsUploadPromise = Promise.resolve(null);

async function dsUploadToR2(file) {
  try {
    const res = await fetch(BACKEND_URL + '/upload/file', {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Filename': file.name },
      body: file
    });
    if (!res.ok) throw new Error('Upload failed');
    const { fileKey, publicUrl } = await res.json();
    dsCurrentThumbUrl = publicUrl || null;
    return fileKey;
  } catch (err) {
    console.error('R2 upload error:', err);
    return null;
  }
}

// ===== PDF UPLOADS =====
// PDFs can't be drawn as an <img loading="lazy" decoding="async">, so page 1 is rendered to a PNG for the on-canvas preview
// (PDF.js, loaded on first use). The original PDF is still saved to the cloud, and its link is
// added to the order line so production prints from the original file, not the preview.
const DS_PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const DS_R2_PUBLIC = 'https://pub-ee241234085044a48028aeda30369ae2.r2.dev/';
window.dsCurrentPdfUrl = null;
function dsIsPdfFile(file) {
  return !!file && (/pdf/i.test(file.type || '') || /\.pdf$/i.test(file.name || ''));
}
function dsLoadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = DS_PDFJS + 'pdf.min.js';
    s.onload = () => {
      try { window.pdfjsLib.GlobalWorkerOptions.workerSrc = DS_PDFJS + 'pdf.worker.min.js'; } catch (e) {}
      resolve(window.pdfjsLib);
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
function dsPdfPlaceholder(name) {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 800;
  const x = c.getContext('2d');
  x.fillStyle = '#f3f4f6'; x.fillRect(0, 0, 1200, 800);
  x.strokeStyle = '#9ca3af'; x.lineWidth = 8; x.strokeRect(20, 20, 1160, 760);
  x.textAlign = 'center'; x.fillStyle = '#111827';
  x.font = 'bold 64px sans-serif'; x.fillText('File uploaded', 600, 330);
  x.font = '36px sans-serif'; x.fillText(String(name || '').slice(0, 48), 600, 410);
  x.fillStyle = '#4b5563'; x.font = '30px sans-serif';
  x.fillText('We will print your file exactly as provided', 600, 500);
  return c.toDataURL('image/png');
}
async function dsPdfPreview(file) {
  try {
    const lib = await dsLoadPdfJs();
    const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
    const page = await pdf.getPage(1);
    const v1 = page.getViewport({ scale: 1 });
    const scale = Math.min(3000 / Math.max(v1.width, v1.height), 6);
    const vp = page.getViewport({ scale });
    const c = document.createElement('canvas');
    c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    return c.toDataURL('image/png');
  } catch (err) {
    console.warn('PDF preview failed, showing placeholder:', err);
    return dsPdfPlaceholder(file.name);
  }
}
function dsWithPdfNote(details) {
  return window.dsCurrentPdfUrl ? details + ' · 📄 Original file: ' + window.dsCurrentPdfUrl : details;
}

function dsUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  dsCurrentUploadedFile = file;
  // Upload to R2 — store the promise so Approve can wait for it to finish
  dsCurrentFileKey = null;
  dsCurrentThumbUrl = null;
  showDsWarningBanner(null);
  const statusEl = document.getElementById('ds-upload-status');
  if (statusEl) { statusEl.style.color = '#1a3fa8'; statusEl.textContent = '⏳ Saving file to cloud...'; }
  window.dsCurrentPdfUrl = null;
  dsUploadPromise = dsUploadToR2(file).then(key => {
    dsCurrentFileKey = key;
    window.dsOrigUploadKey = key;
    if (key && (dsIsPdfFile(file) || dsIsRawPrintFile(file))) window.dsCurrentPdfUrl = (typeof dsCurrentThumbUrl !== 'undefined' && dsCurrentThumbUrl) || (DS_R2_PUBLIC + key);
    if (statusEl) {
      if (key) { statusEl.style.color = '#16a34a'; statusEl.textContent = '✅ File saved — ready to approve'; }
      else { statusEl.style.color = '#d42020'; statusEl.textContent = '⚠️ Cloud save failed — contact us with your file'; }
    }
    return key;
  });
  // Reset file input so same file can be re-uploaded
  e.target.value = '';
  const reader = new FileReader();
  const dsIsPdf = dsIsPdfFile(file) || dsIsRawPrintFile(file);
  reader.onload = ev => {
    const canvas = dsGetCanvas();
    const layer  = dsGetElements();
    const ph     = dsGetPlaceholder();
    if (!layer || !canvas) return;
    if (ph) ph.style.display = 'none';

    const img = document.createElement('img');
    img.style.cssText = 'position:absolute;left:0;top:0;cursor:move;pointer-events:all;outline:2px dashed transparent;z-index:10;';
    layer.style.pointerEvents = 'all';
    layer.appendChild(img);

    img.onload = () => {
      // Compute display size
      const maxW = canvas.width  * 0.75;
      const maxH = canvas.height * 0.75;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const w = Math.round(img.naturalWidth  * scale);
      const h = Math.round(img.naturalHeight * scale);
      img.style.width     = w + 'px';
      img.style.height    = h + 'px';
      img.style.left      = Math.round((canvas.width  - w) / 2) + 'px';
      img.style.top       = Math.round((canvas.height - h) / 2) + 'px';
      img.style.transform = 'none';
      img.setAttribute('data-aspect', (img.naturalWidth / img.naturalHeight).toFixed(6));
      // Soft resolution warning: compare uploaded pixel size against the physical
      // product size (in inches) already tracked in dsCurrentDims for this product.
      if (!dsIsPdf && dsCurrentDims && dsCurrentDims.w && dsCurrentDims.h) {
        const effDpi = Math.min(img.naturalWidth / dsCurrentDims.w, img.naturalHeight / dsCurrentDims.h);
        const minDpi = (dsCurrentDims.w <= 6 ? 200 : DS_MIN_DPI); // hand-held pieces need more than banners
        if (effDpi < minDpi) {
          showDsWarningBanner(`This image is about ${Math.round(effDpi)} DPI at ${dsCurrentDims.w}"×${dsCurrentDims.h}" — we recommend at least 300 DPI for sharp printing. You can still continue if you'd like.`);
        } else {
          showDsWarningBanner(null);
        }
      }
      // Wire up drag and select AFTER dimensions are fully set
      dsMakeDraggable(img);
      dsSelect(img);
      if (ph) ph.style.display = 'none';
      setTimeout(dsPushUndo, 50);
    };
    img.src = ev.target.result;
  };
  if (dsIsPdf) dsPdfPreview(file).then(url => reader.onload({ target: { result: url } }));
  else reader.readAsDataURL(file);
}

function dsSelect(el) {
  if (dsSelectedEl && dsSelectedEl !== el) {
    dsSelectedEl.style.outline = '2px dashed transparent';
    dsCleanupElement(dsSelectedEl);
  }
  dsSelectedEl = el;
  if (!el) return;
  el.style.outline = '2px dashed rgba(26,63,168,0.8)';
  el.style.outlineOffset = '1px';
  dsAddResizeHandles(el);
  dsAddToolbar(el);
  // Sync font controls to selected element
  if (el.tagName !== 'IMG') {
    const fs = parseInt(el.style.fontSize) || 32;
    const ff = (el.style.fontFamily || '').replace(/['"]/g,'').split(',')[0].trim();
    const fsInp = document.getElementById('d-fontsize');
    const ffSel = document.getElementById('d-font');
    if (fsInp) fsInp.value = fs;
    if (ffSel && ff) ffSel.value = ff;
    // Pre-fill text textarea and switch to text panel (only if not already active, to avoid mobile toggle-close)
    const textInp = document.getElementById('d-text-input');
    if (textInp) textInp.value = el.textContent || '';
    const textBtn = document.getElementById('dsb-text');
    if (!textBtn || !textBtn.classList.contains('active')) dsShowPanel('text');
    const addBtn = document.getElementById('d-add-text-btn');
    if (addBtn) addBtn.textContent = '✎ Update Text';
    // Sync color picker to the element's current color so it persists
    const rawColor = el.style.color;
    if (rawColor) {
      const hex = rawColor.startsWith('#') ? rawColor : (function(c){const m=c.match(/\d+/g);return m&&m.length>=3?'#'+m.slice(0,3).map(x=>parseInt(x).toString(16).padStart(2,'0')).join(''):''})(rawColor);
      if (hex) { dsTextColor = hex; const cp = document.getElementById('d-text-color-picker'); if (cp) cp.value = hex; }
    }
  }
  // Sync shape controls when a shape is selected
  if (el.tagName === 'IMG' && el.getAttribute('data-shape-type')) {
    const fillInp   = document.getElementById('shape-fill-color');
    const strokeInp = document.getElementById('shape-stroke-color');
    const swInp     = document.getElementById('shape-stroke-width');
    const swLbl     = document.getElementById('shape-stroke-label');
    const opInp     = document.getElementById('shape-opacity');
    const opLbl     = document.getElementById('shape-opacity-label');
    if (fillInp)   fillInp.value   = el.getAttribute('data-shape-fill')   || '#1a3fa8';
    if (strokeInp) strokeInp.value = el.getAttribute('data-shape-stroke') || '#1a3fa8';
    if (swInp)     { swInp.value = el.getAttribute('data-shape-sw') || 0; if(swLbl) swLbl.textContent = swInp.value; }
    if (opInp)     { opInp.value = Math.round((parseFloat(el.style.opacity)||1)*100); if(opLbl) opLbl.textContent = opInp.value; }
    dsShowPanel('shapes');
  }
}

function dsCleanupElement(el) {
  if (!el) return;
  // Handles and toolbar live on the LAYER, not the element
  const layer = dsGetElements();
  if (layer) layer.querySelectorAll('.ds-resize-handle, .ds-element-toolbar').forEach(h => h.remove());
  el.querySelectorAll('.ds-resize-handle, .ds-element-toolbar').forEach(h => h.remove());
}

function dsAddToolbar(el) {
  // Remove existing toolbars from LAYER
  const layer = dsGetElements();
  if (layer) layer.querySelectorAll('.ds-element-toolbar').forEach(t => t.remove());
  el.querySelectorAll('.ds-element-toolbar').forEach(t => t.remove());
  const parent = layer || el.parentElement;

  const elL = parseFloat(el.style.left) || el.offsetLeft;
  const elT = parseFloat(el.style.top)  || el.offsetTop;
  const elW = el.offsetWidth;

  const tb = document.createElement('div');
  tb.className = 'ds-element-toolbar';
  tb.style.cssText = 'position:absolute;left:'+elL+'px;top:'+(elT-42)+'px;pointer-events:all;z-index:10001;';
  tb.innerHTML = `
    <button class="ds-tb-del" onmousedown="event.stopPropagation()" onclick="event.stopPropagation();dsDelete()">✕ Delete</button>
    <div class="ds-tb-sep"></div>
    <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();dsCenter()">⊕ Center</button>
    <div class="ds-tb-sep"></div>
    <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();dsBringForward()">↑ Front</button>
    <div class="ds-tb-sep"></div>
    <button onmousedown="event.stopPropagation()" onclick="event.stopPropagation();dsFitToArtboard()">⤢ Fit</button>
  `;
  parent.appendChild(tb);
}

function dsBringForward() {
  if (!dsSelectedEl) return;
  const cur = parseInt(dsSelectedEl.style.zIndex) || 10;
  dsSelectedEl.style.zIndex = cur + 1;
}

function dsAddResizeHandles(el) {
  // Remove any existing handles from the LAYER (not the element)
  const layer = dsGetElements();
  if (layer) layer.querySelectorAll('.ds-resize-handle').forEach(h => h.remove());
  el.querySelectorAll('.ds-resize-handle').forEach(h => h.remove());

  // Append handles to the LAYER so they work on IMG elements too
  // (IMG ignores overflow:visible so child handles are clipped)
  const parent = layer || el.parentElement;
  const elL = parseFloat(el.style.left) || el.offsetLeft;
  const elT = parseFloat(el.style.top)  || el.offsetTop;
  const elW = el.offsetWidth;
  const elH = el.offsetHeight;

  const corners = [
    {l: elL - 10,       t: elT - 10,       cursor:'nw-resize', type:'nw'},
    {l: elL + elW - 10, t: elT - 10,       cursor:'ne-resize', type:'ne'},
    {l: elL - 10,       t: elT + elH - 10, cursor:'sw-resize', type:'sw'},
    {l: elL + elW - 10, t: elT + elH - 10, cursor:'se-resize', type:'se'},
  ];
  corners.forEach(({l, t, cursor, type}) => {
    const h = document.createElement('div');
    h.className = 'ds-resize-handle';
    h.setAttribute('data-resize-type', type);
    h.style.cssText = 'position:absolute;left:'+l+'px;top:'+t+'px;cursor:'+cursor+';pointer-events:all;z-index:10000;';
    h.addEventListener('mousedown',  e => { e.preventDefault(); e.stopPropagation(); dsStartResize(e, el, type); });
    h.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); dsStartResize(e, el, type); }, {passive:false});
    parent.appendChild(h);
  });
}

// Update handle positions after resize/move
function dsUpdateHandles(el) {
  const layer = dsGetElements();
  if (!layer || !el) return;
  const handles = layer.querySelectorAll('.ds-resize-handle');
  if (!handles.length) return;
  const elL = parseFloat(el.style.left) || el.offsetLeft;
  const elT = parseFloat(el.style.top)  || el.offsetTop;
  const elW = el.offsetWidth;
  const elH = el.offsetHeight;
  const positions = [
    {l: elL - 10,       t: elT - 10      },
    {l: elL + elW - 10, t: elT - 10      },
    {l: elL - 10,       t: elT + elH - 10},
    {l: elL + elW - 10, t: elT + elH - 10},
  ];
  handles.forEach((h, i) => {
    if (positions[i]) {
      h.style.left = positions[i].l + 'px';
      h.style.top  = positions[i].t + 'px';
    }
  });
}

function dsRemoveResizeHandles(el) {
  if (el) el.querySelectorAll('.ds-resize-handle').forEach(h => h.remove());
}

function dsStartResize(e, el, type) {
  e.preventDefault(); e.stopPropagation();
  const isTouchEvt = e.touches;
  const cx0   = isTouchEvt ? e.touches[0].clientX : e.clientX;
  const cy0   = isTouchEvt ? e.touches[0].clientY : e.clientY;
  const zoom  = dsZoomLevel || 1;
  // offsetWidth/Height gives actual CSS pixels (unscaled by zoom transform on parent)
  const startW    = el.offsetWidth;
  const startH    = el.offsetHeight;
  const startLeft = parseFloat(el.style.left) || 0;
  const startTop  = parseFloat(el.style.top)  || 0;
  const isImg  = el.tagName === 'IMG';
  const aspect = isImg ? (parseFloat(el.getAttribute('data-aspect')) || (startW / Math.max(startH, 1))) : null;
  const startFontSize = !isImg ? (parseFloat(el.style.fontSize) || 32) : null;
  const artboard = dsGetCanvas();
  const maxW = artboard ? artboard.width  : 9999;
  const maxH = artboard ? artboard.height : 9999;

  const onMove = ev => {
    ev.preventDefault();
    const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
    const dx = (cx - cx0) / zoom;
    const dy = (cy - cy0) / zoom;
    let w = startW, h = startH, l = startLeft, t = startTop;

    if (isImg && aspect) {
      const delta = type==='se'?(dx+dy)/2 : type==='sw'?(-dx+dy)/2 : type==='ne'?(dx-dy)/2 : (-dx-dy)/2;
      w = Math.max(30, startW + delta);
      h = w / aspect;
      if (type==='sw'||type==='nw') l = startLeft + (startW - w);
      if (type==='ne'||type==='nw') t = startTop  + (startH - h);
    } else {
      // Text / emoji: drive size via font-size only — let the element auto-size naturally
      if      (type==='se'||type==='ne'){w=Math.max(30,startW+dx);}
      else                             {w=Math.max(30,startW-dx);l=startLeft+(startW-w);}
      if      (type==='ne'||type==='nw'){t=startTop+(startH-(Math.max(30,startH-dy)));}
      // Scale font-size proportionally
      if (startFontSize) el.style.fontSize = Math.max(6, Math.round(startFontSize * (w / startW))) + 'px';
      // Clamp position only; width/height are left as auto so content drives the box
      l = Math.max(0, l);
      t = Math.max(0, t);
      el.style.width  = '';
      el.style.height = '';
      el.style.left   = l + 'px';
      el.style.top    = t + 'px';
      dsUpdateHandles(el);
      return;
    }
    // Images: clamp to artboard bounds and set explicit dimensions
    l = Math.max(0, l);
    t = Math.max(0, t);
    w = Math.min(w, maxW - l);
    h = Math.min(h, maxH - t);
    el.style.width  = w + 'px';
    el.style.height = h + 'px';
    el.style.left   = l + 'px';
    el.style.top    = t + 'px';
    dsUpdateHandles(el);
  };
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend',  onUp);
    dsUpdateHandles(el);
    dsPushUndo();
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
  document.addEventListener('touchmove', onMove, {passive:false});
  document.addEventListener('touchend',  onUp);
}

function dsMakeDraggable(el) {
  const onStart = function(e) {
    const tgt = e.target;
    if (tgt.classList && (tgt.classList.contains('ds-resize-handle') || tgt.closest('.ds-element-toolbar'))) return;
    if (e.type === 'mousedown' && e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    dsSelect(el);
    const isTouchEvt = e.touches;
    const cx0 = isTouchEvt ? e.touches[0].clientX : e.clientX;
    const cy0 = isTouchEvt ? e.touches[0].clientY : e.clientY;
    // Use CSS pixel positions directly — offsetLeft/offsetTop are unaffected by zoom transform
    el.style.transform = 'none';
    let curL = parseFloat(el.style.left) || el.offsetLeft;
    let curT = parseFloat(el.style.top)  || el.offsetTop;
    el.style.left = curL + 'px';
    el.style.top  = curT + 'px';
    let sx = cx0, sy = cy0;
    // Figure out the zoom scale of the canvas container
    const canvasEl = dsGetCanvas();
    const zoom = dsZoomLevel || 1;
    const onMove = ev => {
      ev.preventDefault();
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      curL += (cx - sx) / zoom;
      curT += (cy - sy) / zoom;
      // Clamp to artboard bounds
      const ab = dsGetCanvas();
      if (ab) {
        curL = Math.max(0, Math.min(ab.width  - (el.offsetWidth  || 10), curL));
        curT = Math.max(0, Math.min(ab.height - (el.offsetHeight || 10), curT));
      }
      el.style.left = curL + 'px';
      el.style.top  = curT + 'px';
      sx = cx; sy = cy;
      dsUpdateHandles(el);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend',  onUp);
      dsPushUndo();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    document.addEventListener('touchmove', onMove, {passive:false});
    document.addEventListener('touchend',  onUp);
  };
  el.addEventListener('mousedown',  onStart);
  el.addEventListener('touchstart', onStart, {passive:false});
  el.addEventListener('click', e => { e.stopPropagation(); dsSelect(el); });
}


function dsFitToArtboard() {
  const el = dsSelectedEl;
  const canvas = dsGetCanvas();
  if (!el || !canvas) { alert('Select an image first, then click Fit to Artboard.'); return; }
  el.style.width  = canvas.width  + 'px';
  el.style.height = canvas.height + 'px';
  el.style.left   = '0px';
  el.style.top    = '0px';
  el.style.transform = 'none';
  dsSelect(el);
}

function dsCenter() {
  if (!dsSelectedEl) return;
  const canvas = dsGetCanvas();
  if (!canvas) return;
  dsSelectedEl.style.transform = 'none';
  const w = dsSelectedEl.offsetWidth  || 100;
  const h = dsSelectedEl.offsetHeight || 100;
  dsSelectedEl.style.left = Math.max(0, (canvas.width  - w) / 2) + 'px';
  dsSelectedEl.style.top  = Math.max(0, (canvas.height - h) / 2) + 'px';
}

function dsDelete() {
  if (!dsSelectedEl) return;
  const dying = dsSelectedEl;
  dsSelectedEl = null;
  dsUpdateAddTextBtn();
  // Clear handles from BOTH layers to avoid orphans
  ['d-elements','d-elements-back'].forEach(id => {
    const l = document.getElementById(id);
    if (l) l.querySelectorAll('.ds-resize-handle,.ds-element-toolbar').forEach(h=>h.remove());
  });
  dying.remove();
  const layer = dsGetElements();
  const phId = dsCurrentSide === 'back' ? 'd-placeholder-back' : 'd-placeholder';
  if (layer) {
    const left = layer.querySelectorAll('div:not(#'+phId+'):not(.ds-resize-handle):not(.ds-element-toolbar), img');
    if (!left.length) { const ph = dsGetPlaceholder(); if (ph) ph.style.display='block'; }
  }
  dsPushUndo();
}

function dsClear() {
  const layer = dsGetElements();
  const phId = dsCurrentSide === 'back' ? 'd-placeholder-back' : 'd-placeholder';
  if (layer) layer.querySelectorAll('div:not(#'+phId+'):not(.ds-resize-handle):not(.ds-element-toolbar), img').forEach(el => el.remove());
  if (layer) layer.querySelectorAll('.ds-resize-handle, .ds-element-toolbar').forEach(h => h.remove());
  const ph = dsGetPlaceholder();
  if (ph) ph.style.display = 'block';
  dsSelectedEl = null;
  if (dsCurrentSide === 'back') { dsBgColorBack = '#ffffff'; } else { dsBgColor = '#ffffff'; }
  dsArtboardRotated = false;
  // Re-init canvas with current size
  const sel = document.getElementById('d-size-select');
  if (sel) dsUpdateCanvas(sel.value);
  const cb = document.getElementById('d-approved');
  const btn = document.getElementById('d-approve-btn');
  if (cb) cb.checked = false;
  if (btn) btn.disabled = true;
  dsZoomLevel = 1;
  const zl = document.getElementById('d-zoom-label');
  if (zl) zl.textContent = '100%';
  const canvas = dsGetCanvas();
  if (canvas) { canvas.style.transform = ''; }
  const elLayer = dsGetElements();
  const overlay = dsGetOverlay();
  if (elLayer) elLayer.style.transform = '';
  if (overlay) overlay.style.transform = '';
}

function dsZoom(delta) {
  dsZoomLevel = Math.max(0.3, Math.min(2, dsZoomLevel + delta));
  const canvas = dsGetCanvas();
  const layer = dsGetElements();
  const overlay = dsGetOverlay();
  if (canvas) canvas.style.transform = `scale(${dsZoomLevel})`;
  if (layer) layer.style.transform = `scale(${dsZoomLevel})`;
  if (overlay) overlay.style.transform = `scale(${dsZoomLevel})`;
  const lbl = document.getElementById('d-zoom-label');
  if (lbl) lbl.textContent = Math.round(dsZoomLevel * 100) + '%';
}

// The on-screen design canvas is sized to fit a small UI preview box (a few
// hundred px), completely decoupled from the banner's real physical size.
// Exporting with scale:1 (old behavior) captured only that tiny preview —
// e.g. a 3ft x 6ft banner exported at ~580x290px, well under 10 DPI at
// actual print size. This computes a scale factor that targets a real
// print-quality resolution (150 DPI) based on the true physical width,
// capped so exports stay fast and file sizes reasonable for very large signs.
function dsCalcExportScale(onScreenPx) {
  const MAX_EXPORT_PX = 6000;
  const physicalIn = Math.max((dsCurrentDims && dsCurrentDims.w) || 0, 1);
  // Small pieces are held in the hand and need true print resolution: a 3.5" business
  // card at 150 DPI is only ~525px and prints visibly pixelated. Large-format banners
  // are read from several feet away, so 150 DPI there keeps the exported PNG (and the
  // order-email attachment) a sane size.
  const TARGET_DPI = physicalIn <= 6 ? 300 : (physicalIn <= 14 ? 200 : 150);
  const desiredPx = Math.min(physicalIn * TARGET_DPI, MAX_EXPORT_PX);
  // iPhones refuse canvases over ~16.7 million pixels, which silently breaks the export.
  const physicalH = Math.max((dsCurrentDims && dsCurrentDims.h) || physicalIn, 1);
  const areaCapPx = Math.sqrt(16000000 * physicalIn / physicalH);
  return Math.max(1, Math.min(desiredPx, areaCapPx) / Math.max(onScreenPx || 1, 1));
}

async function dsExportCanvasToPNG() {
  const statusEl = document.getElementById('ds-upload-status');
  try {
    if (statusEl) { statusEl.style.color = '#1a3fa8'; statusEl.textContent = '⏳ Saving your design...'; }

    // Deselect elements to hide resize handles
    dsSelect(null);

    // Temporarily reset zoom to 1 and hide overlay guides for a clean capture
    const savedZoom = dsZoomLevel;
    dsZoomLevel = 1;
    const cvs = document.getElementById('d-canvas');
    const lyr = document.getElementById('d-elements');
    const ovl = document.getElementById('d-overlay');
    if (cvs) cvs.style.transform = 'scale(1)';
    if (lyr) lyr.style.transform = 'scale(1)';
    if (ovl) ovl.style.visibility = 'hidden';

    // Let DOM settle
    await new Promise(r => setTimeout(r, 80));

    const canvasWrap = document.getElementById('d-canvas-wrap');
    // The artboard's on-screen border is a UI edge drawn over the outer edge of the artwork:
    // switch it off for the capture so it never prints as a dark frame (a stylesheet rule forces it with !important).
    const savedEdges = [];
    [canvasWrap, cvs].forEach(el => { if (!el) return; savedEdges.push([el, el.style.cssText]); ['border', 'outline', 'box-shadow'].forEach(pr => el.style.setProperty(pr, 'none', 'important')); });
    const exportScale = dsCalcExportScale(cvs ? cvs.width : 580);
    const exported = await html2canvas(canvasWrap, {
      useCORS: true,
      allowTaint: true,
      scale: exportScale,
      logging: false,
      ignoreElements: el => el.id === 'd-overlay' || el.id === 'd-placeholder',
    });
    savedEdges.forEach(([el, css]) => { el.style.cssText = css; });

    // Restore zoom and overlay
    dsZoomLevel = savedZoom;
    if (cvs) cvs.style.transform = `scale(${savedZoom})`;
    if (lyr) lyr.style.transform = `scale(${savedZoom})`;
    if (ovl) ovl.style.visibility = '';

    const __up = await dsUploadPrintCanvas(exported, '');
    if (!__up) throw new Error('Upload failed');
    const fileKey = __up.key, publicUrl = __up.thumb;
    dsCurrentThumbUrl = publicUrl || null;
    if (statusEl) { statusEl.style.color = '#16a34a'; statusEl.textContent = '✅ Design saved'; }
    return fileKey;
  } catch (err) {
    console.error('Canvas export error:', err);
    if (statusEl) { statusEl.style.color = '#d42020'; statusEl.textContent = '⚠️ Design save failed — email your file to orders@speedybanner.com'; }
    return null;
  }
}

// Captures BOTH artboards (front + back) of a double-sided design and
// composites them into one labeled PNG so a single upload always carries
// both sides — used instead of dsExportCanvasToPNG for double-sided items.
async function dsExportBothSidesToPNG() {
  const statusEl = document.getElementById('ds-upload-status');
  try {
    if (statusEl) { statusEl.style.color = '#1a3fa8'; statusEl.textContent = '⏳ Saving your design...'; }
    dsSelect(null);
    const savedZoom = dsZoomLevel;
    dsZoomLevel = 1;
    const originalSide = dsCurrentSide;

    async function captureSide(side, wrapId, canvasId, overlayId) {
      if (dsCurrentSide !== side) dsSwitchSide(side);
      const cvs = document.getElementById(canvasId);
      const ovl = document.getElementById(overlayId);
      if (cvs) cvs.style.transform = 'scale(1)';
      if (ovl) ovl.style.visibility = 'hidden';
      await new Promise(r => setTimeout(r, 80));
      const wrap = document.getElementById(wrapId);
      const exportScale = dsCalcExportScale(cvs ? cvs.width : 580);
      const shot = await html2canvas(wrap, {
        useCORS: true,
        allowTaint: true,
        scale: exportScale,
        logging: false,
        ignoreElements: el => el.id === overlayId,
      });
      if (ovl) ovl.style.visibility = '';
      return shot;
    }

    const frontShot = await captureSide('front', 'd-canvas-wrap', 'd-canvas', 'd-overlay');
    const backShot  = await captureSide('back',  'd-canvas-wrap-back', 'd-canvas-back', 'd-overlay-back');

    if (dsCurrentSide !== originalSide) dsSwitchSide(originalSide);
    dsZoomLevel = savedZoom;
    const cvsFront = document.getElementById('d-canvas');
    if (cvsFront) cvsFront.style.transform = `scale(${savedZoom})`;

    // Stack front over back on one canvas, each clearly labeled.
    // Label sizing scales with the shots so it stays proportionate now that
    // exports are captured at print resolution instead of screen resolution.
    const labelScale = Math.max(1, frontShot.width / 580);
    const pad = Math.round(16 * labelScale), labelH = Math.round(26 * labelScale), gap = Math.round(24 * labelScale);
    const w = Math.max(frontShot.width, backShot.width) + pad * 2;
    const h = pad + labelH + frontShot.height + gap + labelH + backShot.height + pad;
    const combo = document.createElement('canvas');
    combo.width = w;
    combo.height = h;
    const ctx = combo.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1a3fa8';
    ctx.font = 'bold ' + Math.round(18 * labelScale) + 'px Arial, sans-serif';
    const labelBaseline = Math.round(18 * labelScale);
    ctx.fillText('FRONT', pad, pad + labelBaseline);
    ctx.drawImage(frontShot, Math.round((w - frontShot.width) / 2), pad + labelH);
    const backY = pad + labelH + frontShot.height + gap;
    ctx.fillText('BACK', pad, backY + labelBaseline);
    ctx.drawImage(backShot, Math.round((w - backShot.width) / 2), backY + labelH);

    const blob = await new Promise(resolve => combo.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Canvas export produced no data');

    const res = await fetch(BACKEND_URL + '/upload/file', {
      method: 'POST',
      headers: { 'Content-Type': 'image/png', 'X-Filename': 'design-front-and-back.png' },
      body: blob,
    });
    if (!res.ok) throw new Error('Upload failed');
    const { fileKey, publicUrl } = await res.json();
    dsCurrentThumbUrl = publicUrl || null;
    if (statusEl) { statusEl.style.color = '#16a34a'; statusEl.textContent = '✅ Design saved'; }
    return fileKey;
  } catch (err) {
    console.error('Canvas export error (both sides):', err);
    if (statusEl) { statusEl.style.color = '#d42020'; statusEl.textContent = '⚠️ Design save failed — email your file to orders@speedybanner.com'; }
    return null;
  }
}

// Product-page hem (and, for backdrop, finish) select IDs keyed by the exact
// dsProduct display name — the designer itself has no hem control, so hem
// must be read from the underlying product page's own dropdown.
const DS_PRODUCT_FIELD_IDS = {
  '13oz Vinyl Banner':      { hem: 'b13-hem' },
  '18oz Vinyl Banner':      { hem: 'b18-hem' },
  'Custom Vinyl Banner':    { hem: 'custom-hem' },
  'Mesh Banner':            { hem: 'mesh-hem' },
  'Backdrop Vinyl Banner':  { hem: 'backdrop-hem', finish: 'backdrop-finish' },
  'Graduation Banner':      { hem: 'grad-hem' },
  'Player Banner':          { hem: 'plyr-hem' },
  'Tent Valance Banner':    { hem: 'tent-hem' },
  'Tent Side Skirt Banner': { hem: 'tent-skirt-hem' },
};
const DS_GROMMET_LABELS = {
  standard:'Grommets Every 2 Feet', '15':'Grommets Every 15"', '24':'Grommets Every 24"',
  corners:'Grommets: Corners Only', topbottom:'Grommets: Top & Bottom Only',
  top:'Grommets: Top Only', sides:'Grommets: Sides Only', none:'No Grommets'
};
// Builds the grommet/hem (/finish) portion of the order details at the moment
// the customer approves their design — this is the customer's final,
// authoritative choice, so it's read live rather than relying on whatever
// was captured when the designer was first opened.
function dsGetOptionsSuffix() {
  const parts = [];
  if (['banner','banner18oz','backdrop','tent'].includes(dsType)) {
    const gSel = document.getElementById('d-grommet-style');
    if (gSel) parts.push(DS_GROMMET_LABELS[gSel.value] || gSel.value);
  }
  if (dsType === 'yardsign') {
    const stakesCb = document.getElementById(dsProduct === 'Yard Sign Package' ? 'yspkg-stakes' : 'ys-stakes');
    if (stakesCb) parts.push(stakesCb.checked ? 'FREE Economy Metal Stakes' : 'No Metal Stakes');
  }
  const fieldIds = DS_PRODUCT_FIELD_IDS[dsProduct];
  if (fieldIds) {
    if (fieldIds.finish) {
      const fEl = document.getElementById(fieldIds.finish);
      if (fEl) parts.push(fEl.options[fEl.selectedIndex]?.text || '');
    }
    if (fieldIds.hem) {
      const hEl = document.getElementById(fieldIds.hem);
      if (hEl) parts.push(hEl.options[hEl.selectedIndex]?.text || '');
    }
  }
  return parts.filter(Boolean).join(' · ');
}

// ===== DOUBLE-SIDED: ONE PRINT FILE PER SIDE =====
// Production needs each side full-size, so front and back are exported and uploaded
// as two separate PNGs. The back travels as its own $0 cart line, which is what makes
// the order email attach it as a second file (attachments are built per line item).
// ===== PRINT FILES AS PDF =====
// Designer exports used to reach the shop as PNG snapshots. They now go out as a PDF sized to
// the real product (inches), with a small JPEG preview for the cart. A customer's own print-ready
// file (PDF that fills the artboard, or AI/EPS/PSD/TIFF) is sent exactly as they uploaded it.
var DS_JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
function dsLoadJsPdf() {
  if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  return new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = DS_JSPDF;
    s.onload = function () { (window.jspdf && window.jspdf.jsPDF) ? resolve(window.jspdf.jsPDF) : reject(new Error('jsPDF missing')); };
    s.onerror = function () { reject(new Error('jsPDF failed to load')); };
    document.head.appendChild(s);
  });
}
function dsIsRawPrintFile(file) {
  return !!file && (/\.(ai|eps|psd|tif|tiff)$/i.test(file.name || '') || /postscript|illustrator|photoshop|tiff/i.test(file.type || ''));
}
function dsSafeName(s) {
  return String(s || 'design').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'design';
}
async function dsPostFile(blob, type, name) {
  var r = await fetch(BACKEND_URL + '/upload/file', { method: 'POST', headers: { 'Content-Type': type, 'X-Filename': name }, body: blob });
  if (!r.ok) throw new Error('Upload failed (' + r.status + ')');
  var j = await r.json();
  if (!j || !j.fileKey) throw new Error('Upload returned no key');
  return { key: j.fileKey, url: j.publicUrl || (typeof DS_R2_PUBLIC !== 'undefined' ? DS_R2_PUBLIC + j.fileKey : null) };
}
function dsPreviewBlob(source, w, h) {
  var max = 900, s = Math.min(1, max / Math.max(w, h));
  var c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
  var x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.drawImage(source, 0, 0, c.width, c.height);
  return new Promise(function (r) { c.toBlob(r, 'image/jpeg', 0.85); });
}
// Physical page size for this product, keeping the exported image's exact proportions.
function dsPrintPageInches(pxW, pxH) {
  var d = (typeof dsCurrentDims !== 'undefined' && dsCurrentDims) || {};
  var w = d.w > 0 ? d.w : pxW / 150;
  var hPx = w * pxH / pxW;
  var h = (d.h > 0 && Math.abs(d.h - hPx) / hPx < 0.02) ? d.h : hPx;
  var note = '';
  // PDF pages top out at 200 in; very large banners are saved at a stated scale (common practice).
  var big = Math.max(w, h);
  if (big > 200) { var f = Math.ceil(big / 200); w = w / f; h = h / f; note = '-SCALE-1to' + f; }
  return { w: w, h: h, note: note, realW: d.w > 0 ? d.w : null, realH: d.h > 0 ? d.h : null };
}
async function dsCanvasToPdfBlob(canvas) {
  var jsPDF = await dsLoadJsPdf();
  var pg = dsPrintPageInches(canvas.width, canvas.height);
  var doc = new jsPDF({ unit: 'in', format: [pg.w, pg.h], orientation: pg.w >= pg.h ? 'landscape' : 'portrait', compress: true });
  doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pg.w, pg.h, undefined, 'NONE');
  doc.setProperties({ title: (typeof dsProduct !== 'undefined' ? dsProduct : 'Design') + ' print file', creator: location.hostname });
  return { blob: doc.output('blob'), pg: pg };
}
// Upload a rendered design: PDF print file (PNG only if PDF creation fails) + JPEG preview.
async function dsUploadPrintCanvas(canvas, label) {
  var base = dsSafeName(typeof dsProduct !== 'undefined' ? dsProduct : 'design') + (label ? '-' + dsSafeName(label) : '');
  var print = null;
  try {
    var p = await dsCanvasToPdfBlob(canvas);
    var size = p.pg.realW ? '-' + Math.round(p.pg.realW) + 'x' + Math.round(p.pg.realH || p.pg.realW * canvas.height / canvas.width) + 'in' : '';
    print = await dsPostFile(p.blob, 'application/pdf', base + size + p.pg.note + '.pdf');
  } catch (e) {
    console.warn('PDF print file failed, sending PNG instead:', e);
  }
  if (!print) {
    var png = await new Promise(function (r) { canvas.toBlob(r, 'image/png'); });
    if (!png) return null;
    print = await dsPostFile(png, 'image/png', base + '.png');
  }
  var thumb = null;
  try { var tb = await dsPreviewBlob(canvas, canvas.width, canvas.height); if (tb) thumb = (await dsPostFile(tb, 'image/jpeg', base + '-preview.jpg')).url; } catch (e) {}
  return { key: print.key, url: print.url, thumb: thumb || print.url };
}
// The customer's own file goes to print untouched when it is clearly the finished design:
// AI/EPS/PSD/TIFF always (the designer can only show a placeholder for those), and a PDF when it
// is the only thing on the artboard, on a plain background, and matches the product's shape.
function dsOriginalPrintKey() {
  var f = typeof dsCurrentUploadedFile !== 'undefined' ? dsCurrentUploadedFile : null;
  var key = window.dsOrigUploadKey;
  if (!f || !key) return null;
  if (dsIsRawPrintFile(f)) return key;
  if (!dsIsPdfFile(f)) return null;
  var layer = dsGetElements();
  if (!layer) return null;
  var els = [].slice.call(layer.children).filter(function (e) {
    return e.id !== 'd-placeholder' && !/ds-resize-handle|ds-element-toolbar/.test(e.className || '') && getComputedStyle(e).display !== 'none';
  });
  if (els.length !== 1 || els[0].tagName !== 'IMG') return null;
  var bg = String(typeof dsBgColor !== 'undefined' && dsBgColor ? dsBgColor : '').toLowerCase().replace(/\s/g, '');
  if (bg && !/^(#fff|#ffffff|white|transparent|rgb\(255,255,255\)|rgba\(255,255,255,1\)|rgba\(0,0,0,0\))$/.test(bg)) return null;
  var ar = parseFloat(els[0].getAttribute('data-aspect')) || 0;
  var d = typeof dsCurrentDims !== 'undefined' ? dsCurrentDims : null;
  if (!ar || !d || !d.w || !d.h) return null;
  return Math.abs(ar / (d.w / d.h) - 1) <= 0.04 ? key : null;
}
async function dsLayerThumb() {
  try {
    var img = dsGetElements().querySelector('img');
    if (!img || !img.naturalWidth) return null;
    var b = await dsPreviewBlob(img, img.naturalWidth, img.naturalHeight);
    return b ? (await dsPostFile(b, 'image/jpeg', dsSafeName(typeof dsProduct !== 'undefined' ? dsProduct : 'design') + '-preview.jpg')).url : null;
  } catch (e) { return null; }
}
// Pages that don't load the designer's helper libraries themselves still need them for exports.
(function () {
  [['html2canvas', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'],
   ['QRCode', 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js']].forEach(function (n) {
    if (typeof window[n[0]] !== 'undefined' || document.querySelector('script[src="' + n[1] + '"]')) return;
    var s = document.createElement('script'); s.src = n[1]; document.head.appendChild(s);
  });
})();
(function () {
  var f = document.getElementById('d-file');
  if (f) f.setAttribute('accept', 'image/*,.pdf,application/pdf,.ai,.eps,.psd,.tif,.tiff,.svg');
})();

async function dsUploadShot(shot, filename) {
  try {
    var label = /BACK/i.test(filename) ? 'BACK' : (/FRONT/i.test(filename) ? 'FRONT' : '');
    var r = await dsUploadPrintCanvas(shot, label);
    return r ? { key: r.key, url: r.thumb } : null;
  } catch (err) {
    console.error('Side upload failed:', err);
    return null;
  }
}
async function dsExportSidesSeparately() {
  const statusEl = document.getElementById('ds-upload-status');
  try {
    if (statusEl) { statusEl.style.color = '#1a3fa8'; statusEl.textContent = '⏳ Saving front and back...'; }
    dsSelect(null);
    const savedZoom = dsZoomLevel;
    dsZoomLevel = 1;
    const originalSide = dsCurrentSide;
    async function captureSide(side, wrapId, canvasId, overlayId) {
      if (dsCurrentSide !== side) dsSwitchSide(side);
      const cvs = document.getElementById(canvasId);
      const ovl = document.getElementById(overlayId);
      const wrap = document.getElementById(wrapId);
      if (cvs) cvs.style.transform = 'scale(1)';
      if (ovl) ovl.style.visibility = 'hidden';
      // The artboard's on-screen edge (solid on front, dashed on back) is a UI guide,
      // not artwork — hide it so it can't print along the trim edge.
      await new Promise(r => setTimeout(r, 80));
      // Clear the artboard edge only now: switching sides triggers a redraw that
      // re-applies it, so doing this earlier would be undone before the capture.
      const savedEdges = [];
      [wrap, cvs].forEach(el => {
        if (!el) return;
        savedEdges.push([el, el.style.cssText]);
        ['border', 'outline', 'box-shadow'].forEach(pr => el.style.setProperty(pr, 'none', 'important'));
      });
      const exportScale = dsCalcExportScale(cvs ? cvs.width : 580);
      const shot = await html2canvas(wrap, {
        useCORS: true, allowTaint: true, scale: exportScale, logging: false,
        // Guides (top-of-image marker, safe-zone box) are UI helpers, never artwork.
        ignoreElements: el => el.id === overlayId || /safezone|safe-zone|guide/i.test(el.id || ''),
      });
      savedEdges.forEach(([el, css]) => { el.style.cssText = css; });
      if (ovl) ovl.style.visibility = '';
      // A redraw can re-apply the artboard's dashed edge while the capture is running,
      // so trim that guide ring off the finished image — print files must be artwork only.
      const edgePx = parseFloat(getComputedStyle(cvs).borderTopWidth) || 0;
      if (edgePx > 0) {
        const cut = Math.round(edgePx * exportScale);
        if (shot.width > cut * 2 + 8 && shot.height > cut * 2 + 8) {
          const trimmed = document.createElement('canvas');
          trimmed.width = shot.width - cut * 2;
          trimmed.height = shot.height - cut * 2;
          trimmed.getContext('2d').drawImage(shot, cut, cut, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);
          return trimmed;
        }
      }
      return shot;
    }
    const frontShot = await captureSide('front', 'd-canvas-wrap', 'd-canvas', 'd-overlay');
    const backShot  = await captureSide('back',  'd-canvas-wrap-back', 'd-canvas-back', 'd-overlay-back');
    if (dsCurrentSide !== originalSide) dsSwitchSide(originalSide);
    dsZoomLevel = savedZoom;
    const cvsFront = document.getElementById('d-canvas');
    if (cvsFront) cvsFront.style.transform = `scale(${savedZoom})`;
    const front = await dsUploadShot(frontShot, 'design-FRONT.png');
    const back  = await dsUploadShot(backShot,  'design-BACK.png');
    if (statusEl) {
      if (front && back) { statusEl.style.color = '#16a34a'; statusEl.textContent = '✅ Front and back saved as separate files'; }
      else { statusEl.style.color = '#d42020'; statusEl.textContent = '⚠️ Could not save both sides — using combined file'; }
    }
    return (front && back) ? { front, back } : null;
  } catch (err) {
    console.error('Separate side export failed:', err);
    return null;
  }
}
function dsAddSideFileItem(label, fileKey, thumbUrl) {
  cart.push({ name: '📎 ' + label, price: 0, unitPrice: 0, qty: 1,
    details: 'Print file for ' + (dsProduct || 'your order') + ' — no charge',
    id: Date.now() + 1, hasDesign: true, fileKey: fileKey || null, thumbUrl: thumbUrl || null });
  updateCartUI();
}

async function dsApprove() {
  // Building + uploading the print-resolution file takes several seconds. Show it on the
  // button itself and lock it, so the click doesn't look ignored and can't add the item twice.
  const _apBtn = document.getElementById('d-approve-btn');
  if (_apBtn && _apBtn.dataset.busy) return;
  const _apHtml = _apBtn ? _apBtn.innerHTML : '';
  if (_apBtn) {
    _apBtn.dataset.busy = '1';
    _apBtn.disabled = true;
    _apBtn.style.cursor = 'wait';
    _apBtn.innerHTML = '⏳ Preparing your print file…';
  }
  try {
    // Wait for any in-progress file upload to complete before proceeding
    if (dsUploadPromise) await dsUploadPromise;

    const sel = document.getElementById('d-size-select');
    const sz = sel ? sel.value.replace(' ⭐','') : '';
    const isDS = dsIsDoubleSided();

    // Mark this product as having an approved design
    if (dsProduct) designApproved[dsProduct] = true;

    if (isDS) {
      // Save current side before reading both
      const layer = dsGetElements();
      if (layer) {
        const savedEls = [];
        layer.querySelectorAll('div:not(#d-placeholder):not(.ds-resize-handle):not(.ds-element-toolbar), img').forEach(el => {
          const clone = el.cloneNode(true);
          clone.querySelectorAll('.ds-resize-handle,.ds-element-toolbar').forEach(h => h.remove());
          savedEls.push(clone.outerHTML);
        });
        dsSideData[dsCurrentSide] = { elements: savedEls.map(h=>({html:h})), bgColor: dsBgColor };
      }
      const frontData = dsSideData.front;
      const backData  = dsSideData.back;
      const frontHasDesign = frontData.elements && frontData.elements.length > 0;
      const backHasDesign  = backData.elements  && backData.elements.length  > 0;

      // Double-sided items must always carry BOTH sides in one file — a single
      // fileKey (whether from a raw upload or the front-only auto-export) can
      // only ever hold one side, silently dropping the other. Always composite
      // front+back into one labeled image instead of trusting dsCurrentFileKey.
      const optsSuffix = dsGetOptionsSuffix();
      const details = (dsPriceDetails || sz) + (optsSuffix ? ' · ' + optsSuffix : '') + ' · Double-Sided · ✅ Front + Back Design Approved';
      // Export each side as its own print file. If either upload fails, fall back to
      // the old combined front+back image so an order can never ship missing a side.
      const sides = await dsExportSidesSeparately();
      if (sides) {
        dsCurrentFileKey = sides.front.key;
        addToCart(dsProduct, dsPrice, dsWithPdfNote(details + ' · 🅰 FRONT print file attached'), true, sides.front.key, sides.front.url);
        dsAddSideFileItem('BACK side print file', sides.back.key, sides.back.url);
      } else {
        const comboKey = await dsExportBothSidesToPNG();
        dsCurrentFileKey = comboKey || dsCurrentFileKey;
        addToCart(dsProduct, dsPrice, dsWithPdfNote(details), true, dsCurrentFileKey, dsCurrentThumbUrl);
      }
      // Note in order if back is blank
      if (!backHasDesign) {
        addCartNote(dsProduct + ' — ⚠️ BACK SIDE: No design uploaded (will print blank or repeat front — contact us)');
      }
    } else {
      // Always export the current canvas state — even if a file was uploaded,
      // the customer may have moved/resized it since, and a stale raw upload
      // would silently ship instead of what they actually approved.
      const __orig = dsOriginalPrintKey();
      if (__orig) { dsCurrentFileKey = __orig; const __t = await dsLayerThumb(); if (__t) dsCurrentThumbUrl = __t; }
      else dsCurrentFileKey = await dsExportCanvasToPNG();
      const optsSuffix = dsGetOptionsSuffix();
      const sideLabel = dsType === 'yardsign' ? ' · Single-Sided' : '';
      const ysStakes = dsType === 'yardsign' ? ((document.getElementById('yspkg-stakes')?.checked || document.getElementById('ys-stakes')?.checked) ? ' · FREE Economy Metal Stakes' : ' · No Metal Stakes') : '';
      const details = (dsPriceDetails || sz) + sideLabel + ysStakes + (optsSuffix ? ' · ' + optsSuffix : '') + ' · ✅ Custom Design Approved';
      addToCart(dsProduct, dsPrice, dsWithPdfNote(details), true, dsCurrentFileKey, dsCurrentThumbUrl);
    }
    dsCurrentUploadedFile = null;
    dsCurrentFileKey = null;
    dsCurrentThumbUrl = null;
    closeDesigner();
  } finally {
    if (_apBtn) {
      delete _apBtn.dataset.busy;
      _apBtn.innerHTML = _apHtml;
      _apBtn.style.cursor = 'pointer';
      const _apCb = document.getElementById('d-approved');
      _apBtn.disabled = !(_apCb && _apCb.checked);
    }
  }
}

function addCartNote(note) {
  // Add an informational note item to the cart (zero price)
  cart.push({ name: '📋 Design Note', price: 0, details: note, id: Date.now() });
  updateCartUI();
}

function closeDesigner() {
  window.dsCurrentPdfUrl = null;
  // Clean up resize handles before closing
  if (dsSelectedEl) { dsRemoveResizeHandles(dsSelectedEl); dsSelectedEl = null; }
  document.getElementById('design-modal').classList.remove('active');
  document.getElementById('design-modal').scrollTop = 0;
  document.body.style.overflow = '';
}

// ===== MOBILE DESIGN SHEET =====
function closeMobileDesignSheet() {
  const sheet = document.getElementById('mobile-design-sheet');
  if (sheet) sheet.style.display = 'none';
  document.body.style.overflow = '';
}
function mdsUpload() {
  closeMobileDesignSheet();
  _openDesignerFull(window._mdsProduct, window._mdsType, window._mdsPrice, window._mdsDetails);
  dsShowPanel('image');
  setTimeout(() => {
    const fi = document.getElementById('d-file');
    if (fi) fi.click();
  }, 400);
}
function mdsOpenDesigner() {
  closeMobileDesignSheet();
  _openDesignerFull(window._mdsProduct, window._mdsType, window._mdsPrice, window._mdsDetails);
  // _openDesignerFull calls dsShowPanel('text') which on mobile may collapse the drawer
  // (toggle-close behavior triggers when text tab is already active).
  // Re-open drawer showing the Size panel so user can immediately confirm the transferred size.
  dsShowPanel('size');
}

function updateOrderDeadlines() {
  const msg = getUrgencyMessage();
  document.querySelectorAll('.order-panel-header').forEach(header => {
    let bar = header.querySelector('.panel-deadline');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'panel-deadline';
      header.appendChild(bar);
    }
    bar.innerHTML = msg;
  });
}

function getUrgencyMessage() {
  const now = getESTDate();
  const day = now.getDay();
  const cut = new Date(now);
  cut.setHours(21,0,0,0);
  const remaining = Math.floor((cut - now) / 1000);
  if (day === 5 || day === 6) return '⏰ Order before <strong>9PM Sunday</strong> for Tuesday delivery';
  if (remaining <= 0) return '⏰ Today&apos;s cutoff passed. Order early for the next production slot.';
  const h = String(Math.floor(remaining / 3600)).padStart(2,'0');
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2,'0');
  const s = String(remaining % 60).padStart(2,'0');
  return `⏰ Order before <strong>9PM EST</strong> • ${h}:${m}:${s} left`;
}

function startPrintProgress() {
  const wrap = document.getElementById('print-progress');
  const bar = document.getElementById('print-progress-bar');
  if (!wrap || !bar) return;
  // Reset steps
  ['pp-step1','pp-step2','pp-step3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.opacity = '.4'; el.style.color = '#166534'; }
  });
  bar.style.width = '0%';
  wrap.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Step 1: Queued
  setTimeout(() => {
    bar.style.width = '20%';
    const s1 = document.getElementById('pp-step1');
    if (s1) { s1.style.opacity = '1'; s1.style.color = '#15803d'; }
  }, 200);
  // Step 2: Proof Locked
  setTimeout(() => {
    bar.style.width = '55%';
    const s2 = document.getElementById('pp-step2');
    if (s2) { s2.style.opacity = '1'; s2.style.color = '#15803d'; }
  }, 1200);
  // Step 3: Sending to Print Queue
  setTimeout(() => {
    bar.style.width = '100%';
    const s3 = document.getElementById('pp-step3');
    if (s3) { s3.style.opacity = '1'; s3.style.color = '#166534'; }
  }, 2400);
}

function resetPrintProgress() {
  const wrap = document.getElementById('print-progress');
  const bar = document.getElementById('print-progress-bar');
  if (wrap) wrap.classList.remove('active');
  if (bar) bar.style.width = '0%';
  document.body.style.overflow = '';
}

// Click canvas background to deselect
document.addEventListener('DOMContentLoaded', () => {
  ['d-canvas-wrap','d-canvas-wrap-back'].forEach(wId => {
    const wrap = document.getElementById(wId);
    if (wrap) {
      wrap.addEventListener('click', e => {
        const tid = e.target.id;
        if (e.target === wrap || tid === 'd-canvas' || tid === 'd-canvas-back' || tid === 'd-elements' || tid === 'd-elements-back') {
          dsSelect(null);
          dsUpdateAddTextBtn();
          // On mobile, collapse the tools panel so the artboard is clear
          if (window.innerWidth <= 600) {
            const tp = document.getElementById('ds-tools-panel');
            if (tp) tp.classList.add('collapsed');
          }
        }
      });
    }
  });
});

// Dismiss toolbar when clicking anywhere outside the selected element or its toolbar/handles
document.addEventListener('mousedown', function(e) {
  if (!dsSelectedEl) return;
  if (dsSelectedEl.contains(e.target)) return;
  if (e.target.closest && e.target.closest('.ds-element-toolbar, .ds-resize-handle')) return;
  dsSelect(null);
  dsUpdateAddTextBtn();
});

// Swipe gestures for mobile bottom panel
document.addEventListener('DOMContentLoaded', () => {
  const panel  = document.getElementById('ds-tools-panel');
  const handle = document.getElementById('ds-drawer-handle');
  const sidebar = document.querySelector ? document.querySelector('.ds-sidebar') : null;
  if (!panel) return;

  // Swipe down on handle or panel header to close; swipe up on handle to reopen
  if (handle) {
    let hStartY = 0;
    handle.addEventListener('touchstart', e => { hStartY = e.touches[0].clientY; }, { passive: true });
    handle.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - hStartY;
      if (dy > 40)  panel.classList.add('collapsed');
      if (dy < -40) panel.classList.remove('collapsed');
    }, { passive: true });
  }

  // Swipe up on the bottom tab-bar sidebar to open the panel
  if (sidebar) {
    let sStartY = 0;
    sidebar.addEventListener('touchstart', e => { sStartY = e.touches[0].clientY; }, { passive: true });
    sidebar.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - sStartY;
      if (dy < -40) panel.classList.remove('collapsed');
    }, { passive: true });
  }
});


// ===== TIMER =====
const DELIVERY_MAP={0:'Tuesday',1:'Wednesday',2:'Thursday',3:'Friday',4:'Monday',5:null,6:null};
function getESTDate(){return new Date(new Date().toLocaleString('en-US',{timeZone:'America/New_York'}));}
function updateTimer(){const c=document.getElementById('timer-bar-container');if(!c)return;const now=getESTDate();const day=now.getDay();const del=DELIVERY_MAP[day];const cut=new Date(now);cut.setHours(21,0,0,0);const sl=Math.floor((cut-now)/1000);const pad=n=>String(n).padStart(2,'0');if(day===5||day===6){c.innerHTML='<div class="timer-bar-closed">📦 Weekend Orders — Order by 9PM Sunday for Tuesday delivery via FedEx Overnight</div>';updateOrderDeadlines();return;}if(sl<=0){const nm={0:'Monday (delivers Wednesday)',1:'Tuesday (delivers Thursday)',2:'Wednesday (delivers Friday)',3:'Thursday (delivers Monday)',4:'Sunday (delivers Tuesday)'};c.innerHTML=`<div class="timer-bar-closed">⏰ Today's 9PM EST cutoff has passed — Order ${nm[day]||'tomorrow'}.</div>`;updateOrderDeadlines();return;}const h=Math.floor(sl/3600),m=Math.floor((sl%3600)/60),s=sl%60;const sat=day===4?`<span class="timer-delivery-badge" style="background:rgba(251,191,36,.25);border:1px solid #fbbf24;color:#fbbf24">⚡ Add Saturday Delivery $35</span>`:'';c.innerHTML=`<div class="order-timer-bar"><span class="timer-icon">⚡</span><span class="timer-msg">ORDER IN THE NEXT</span><span class="timer-countdown">${pad(h)}:${pad(m)}:${pad(s)}</span><span class="timer-msg">FOR</span><span class="timer-delivery-badge">📦 FedEx Overnight — Delivery ${del}</span>${sat}</div>`;updateOrderDeadlines();}

// ===== INIT =====
document.addEventListener('DOMContentLoaded',function(){
  [calc13oz,calc18oz,calcMesh,calcRunner,calcBackdrop,calcGraduation,calcPlayer,calcCustom,
   calcYardSign,calcYardSignPkg,calcStand,calcMagnet,calcMagnetSingle,
   calcBizCard,calcTshirt,calcRealtor,calcTent,calcTentSkirt].forEach(function(fn){ try { fn(); } catch (e) {} });
  updateTimer();
  // d-elements sits on top of d-canvas with pointer-events:all, so empty-space clicks land there
  ['d-canvas','d-elements','d-canvas-back','d-elements-back'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', e => {
      if (e.target.id === id || e.target === el) {
        dsSelect(null); dsUpdateAddTextBtn();
        if(window.innerWidth<=600){const tp=document.getElementById('ds-tools-panel');if(tp)tp.classList.add('collapsed');}
      }
    });
  });
});
setInterval(updateTimer,1000);

// ===== FRONT/BACK SIDE SWITCHING =====
let dsCurrentSide = 'front';
let dsSideData = { front: { elements: [], bgColor: '#ffffff' }, back: { elements: [], bgColor: '#ffffff' } };
// Only these types show Front/Back tabs in the designer
const DS_DOUBLE_SIDED_TYPES = ['banner18oz', 'bizcard', 'realtor', 'yardsign', 'tshirt'];

function dsIsDoubleSided() {
  if (!DS_DOUBLE_SIDED_TYPES.includes(dsType)) return false;
  if (dsType === 'tshirt') {
    const sel = document.getElementById('ts-side');
    return sel && sel.value === '5'; // Front & Back option has value '5'
  }
  if (dsType === 'yardsign') {
    // Check either the individual or package double-sided checkbox
    const cb1 = document.getElementById('ys-double');
    const cb2 = document.getElementById('yspkg-double');
    return (cb1 && cb1.checked) || (cb2 && cb2.checked);
  }
  if (dsType === 'realtor') {
    // Use dsProduct to determine which sign is open
    const isRider = dsProduct && dsProduct.toLowerCase().includes('rider');
    const sel = isRider
      ? document.getElementById('re-rider-size')
      : document.getElementById('re-panel-size');
    if (sel) return sel.value.startsWith('ds,');
    // Fallback: check both
    const panelSel = document.getElementById('re-panel-size');
    const riderSel = document.getElementById('re-rider-size');
    const anySel = panelSel || riderSel;
    if (anySel) return anySel.value.startsWith('ds,');
    return false;
  }
  if (dsType === 'bizcard') {
    const sel = document.getElementById('bc-sides');
    return !sel || sel.value !== 'single';
  }
  return true; // banner18oz always double-sided
}

function dsShowSideTabs(show) {
  const tabs = document.getElementById('ds-side-tabs');
  const note = document.getElementById('ds-side-note');
  if (tabs) { tabs.classList.toggle('visible', show); }
  if (note) note.style.display = show ? 'block' : 'none';
}

// Called when a product-page checkbox/select changes while designer may be open
function dsRefreshDoubleSided() {
  const modal = document.getElementById('design-modal');
  if (!modal || !modal.classList.contains('active')) return;
  const show = dsIsDoubleSided();
  dsShowSideTabs(show);
  dsShowDualArtboard(show);
  if (!show && dsCurrentSide === 'back') {
    dsSwitchSide('front');
    const frontTab = document.getElementById('ds-tab-front');
    const backTab  = document.getElementById('ds-tab-back');
    if (frontTab) frontTab.classList.add('active');
    if (backTab)  backTab.classList.remove('active');
    const sideLabel = document.getElementById('ds-side-label');
    if (sideLabel) sideLabel.textContent = 'Front';
  }
}

function dsSwitchSide(side) {
  if (!dsIsDoubleSided()) return;
  if (dsCurrentSide === side) return;

  // Remove resize handles and deselect before saving
  if (dsSelectedEl) { dsRemoveResizeHandles(dsSelectedEl); dsSelectedEl = null; }

  // Save current side's elements + bg
  const curLayerId = dsCurrentSide === 'front' ? 'd-elements' : 'd-elements-back';
  const curPhId    = dsCurrentSide === 'front' ? 'd-placeholder' : 'd-placeholder-back';
  const layer = document.getElementById(curLayerId);
  const savedEls = [];
  if (layer) {
    layer.querySelectorAll('div:not(#'+curPhId+'):not(.ds-resize-handle):not(.ds-element-toolbar), img').forEach(el => {
      const clone = el.cloneNode(true);
      clone.querySelectorAll('.ds-resize-handle, .ds-element-toolbar').forEach(h => h.remove());
      savedEls.push({ html: clone.outerHTML });
    });
  }
  dsSideData[dsCurrentSide] = { elements: savedEls, bgColor: dsCurrentSide==='front' ? dsBgColor : dsBgColorBack };

  // Switch
  dsCurrentSide = side;
  const frontTab = document.getElementById('ds-tab-front');
  const backTab  = document.getElementById('ds-tab-back');
  const sideLabel = document.getElementById('ds-side-label');
  if (frontTab) frontTab.classList.toggle('active', side === 'front');
  if (backTab)  backTab.classList.toggle('active',  side === 'back');
  if (sideLabel) sideLabel.textContent = side.charAt(0).toUpperCase() + side.slice(1);

  // Show the correct artboard panel
  const frontPanel = document.getElementById('ds-front-panel');
  const backPanel  = document.getElementById('ds-back-panel');
  if (frontPanel) frontPanel.style.display = side === 'front' ? 'block' : 'none';
  if (backPanel)  backPanel.style.display  = side === 'back'  ? 'block' : 'none';
  // Update big switcher buttons
  const swFront = document.getElementById('ds-sw-front');
  const swBack  = document.getElementById('ds-sw-back');
  if (swFront) swFront.classList.toggle('active', side === 'front');
  if (swBack)  swBack.classList.toggle('active',  side === 'back');

  // Restore the target side's elements + bg
  const saved = dsSideData[side];
  const newLayerId = side === 'front' ? 'd-elements' : 'd-elements-back';
  const newPhId    = side === 'front' ? 'd-placeholder' : 'd-placeholder-back';
  const newLayer   = document.getElementById(newLayerId);
  // Clear orphaned handles/toolbar from both layers
  ['d-elements','d-elements-back'].forEach(id => {
    const l = document.getElementById(id);
    if (l) l.querySelectorAll('.ds-resize-handle,.ds-element-toolbar').forEach(h=>h.remove());
  });
  if (side === 'front') {
    dsBgColor = saved.bgColor;
    dsRedrawCanvas();
  } else {
    dsBgColorBack = saved.bgColor;
    dsRedrawBackCanvas();
  }
  if (newLayer) {
    newLayer.querySelectorAll('div:not(#'+newPhId+'):not(.ds-resize-handle):not(.ds-element-toolbar), img').forEach(el => el.remove());
    newLayer.style.pointerEvents = 'all';
    const ph = document.getElementById(newPhId);
    saved.elements.forEach(item => {
      const tmp = document.createElement('div');
      tmp.innerHTML = item.html;
      const el = tmp.firstChild;
      newLayer.appendChild(el);
      dsMakeDraggable(el);
    });
    if (ph) ph.style.display = saved.elements.length === 0 ? 'block' : 'none';
  }
  dsSelectedEl = null;
}

// ===== URGENT PRODUCTION =====
function calcUrgentMarkup(basePrice, urgentId) {
  const cb = document.getElementById(urgentId);
  return cb && cb.checked ? basePrice * 2 : basePrice;
}

// ===== FREQUENTLY PURCHASED TOGETHER =====
const FPT_MAP = {
  'banner-13oz':    [{ img:'/images/yardsign-bulk.webp',      name:'Yard Signs',       price:'from $60',    page:'yard-signs' },    { img:'/images/bc-nextday.webp',          name:'Business Cards',   price:'from $24.99', page:'biz-cards' },      { img:'/images/misc-tent.webp',           name:'Tent Banners',     price:'from $40',    page:'tent-banners' }],
  'banner-18oz':    [{ img:'/images/yardsign-bulk.webp',      name:'Yard Signs',       price:'from $60',    page:'yard-signs' },    { img:'/images/backdrop-02.webp',         name:'Backdrop Banner',  price:'from $192',   page:'banner-backdrop' },{ img:'/images/misc-stand.webp',          name:'Banner Stand',     price:'from $189',   page:'banner-stands' }],
  'banner-mesh':    [{ img:'/images/misc-01.webp',            name:'13oz Vinyl Banner',price:'from $17.50',  page:'banner-custom' }, { img:'/images/yardsign-bulk.webp',       name:'Yard Signs',       price:'from $60',    page:'yard-signs' },    { img:'/images/misc-tent.webp',           name:'Tent Banners',     price:'from $40',    page:'tent-banners' }],
  'banner-table':   [{ img:'/images/bc-nextday.webp',         name:'Business Cards',   price:'from $24.99', page:'biz-cards' },     { img:'/images/misc-tent.webp',           name:'Tent Banners',     price:'from $40',    page:'tent-banners' },  { img:'/images/misc-stand.webp',          name:'Banner Stand',     price:'from $189',   page:'banner-stands' }],
  'banner-backdrop':[{ img:'/images/misc-stand.webp',         name:'Banner Stand',     price:'from $189',   page:'banner-stands' }, { img:'/images/misc-01.webp',             name:'13oz Vinyl Banner',price:'from $17.50',  page:'banner-custom' }, { img:'/images/bc-nextday.webp',          name:'Business Cards',   price:'from $24.99', page:'biz-cards' }],
  'graduation-banners':[{ img:'/images/bc-nextday.webp',      name:'Business Cards',   price:'from $24.99', page:'biz-cards' },     { img:'/images/misc-01.webp',             name:'13oz Vinyl Banner',price:'from $17.50',  page:'banner-custom' }, { img:'/images/yardsign-bulk.webp',       name:'Yard Signs',       price:'from $60',    page:'yard-signs' }],
  'player-banners':   [{ img:'/images/bc-nextday.webp',      name:'Business Cards',   price:'from $24.99', page:'biz-cards' },     { img:'/images/misc-01.webp',             name:'13oz Vinyl Banner',price:'from $17.50',  page:'banner-custom' }, { img:'/images/yardsign-bulk.webp',       name:'Yard Signs',       price:'from $60',    page:'yard-signs' }],
  'yard-signs':     [{ img:'/images/misc-01.webp',            name:'13oz Vinyl Banner',price:'from $17.50',  page:'banner-custom' }, { img:'/images/bc-nextday.webp',          name:'Business Cards',   price:'from $24.99', page:'biz-cards' },     { img:'/images/magnet-infographic.webp',  name:'Vehicle Magnets',  price:'from $68',    page:'magnets' }],
  'realtor-signs':  [{ img:'/images/yardsign-bulk.webp',      name:'Yard Signs',       price:'from $60',    page:'yard-signs' },    { img:'/images/bc-nextday.webp',          name:'Business Cards',   price:'from $24.99', page:'biz-cards' },     { img:'/images/magnet-infographic.webp',  name:'Vehicle Magnets',  price:'from $68',    page:'magnets' }],
  'banner-stands':  [{ img:'/images/misc-01.webp',            name:'13oz Vinyl Banner',price:'from $17.50',  page:'banner-custom' }, { img:'/images/bc-nextday.webp',          name:'Business Cards',   price:'from $24.99', page:'biz-cards' },     { img:'/images/backdrop-02.webp',         name:'Backdrop Banner',  price:'from $192',   page:'banner-backdrop' }],
  'magnets':        [{ img:'/images/bc-nextday.webp',         name:'Business Cards',   price:'from $24.99', page:'biz-cards' },     { img:'/images/yardsign-bulk.webp',       name:'Yard Signs',       price:'from $60',    page:'yard-signs' },    { img:'/images/misc-01.webp',             name:'13oz Vinyl Banner',price:'from $17.50',  page:'banner-custom' }],
  'tent-banners':   [{ img:'/images/misc-01.webp',            name:'13oz Vinyl Banner',price:'from $17.50',  page:'banner-custom' }, { img:'/images/misc-tent.webp',           name:'Tent Side Skirt',  price:'from $130',   page:'tent-banners' },  { img:'/images/bc-nextday.webp',          name:'Business Cards',   price:'from $24.99', page:'biz-cards' }],
  'tshirts':        [{ img:'/images/bc-nextday.webp',         name:'Business Cards',   price:'from $24.99', page:'biz-cards' },     { img:'/images/misc-01.webp',             name:'13oz Vinyl Banner',price:'from $17.50',  page:'banner-custom' }, { img:'/images/yardsign-bulk.webp',       name:'Yard Signs',       price:'from $60',    page:'yard-signs' }],
  'biz-cards':      [{ img:'/images/misc-01.webp',            name:'13oz Vinyl Banner',price:'from $17.50',  page:'banner-custom' }, { img:'/images/yardsign-bulk.webp',       name:'Yard Signs',       price:'from $60',    page:'yard-signs' },    { img:'/images/magnet-infographic.webp',  name:'Vehicle Magnets',  price:'from $68',    page:'magnets' }],
  'banner-custom':  [{ img:'/images/yardsign-bulk.webp',      name:'Yard Signs',       price:'from $60',    page:'yard-signs' },    { img:'/images/backdrop-02.webp',         name:'Backdrop Banner',  price:'from $192',   page:'banner-backdrop' },{ img:'/images/bc-nextday.webp',          name:'Business Cards',   price:'from $24.99', page:'biz-cards' }],
};

function renderFPT(pageId) {
  const items = FPT_MAP[pageId];
  if (!items) return '';
  const cards = items.map(i => {
    const visual = `<img loading="lazy" decoding="async" class="fpt-thumb" src="${i.img}" alt="${i.name}" style="object-fit:cover">`;
    return `
    <div class="fpt-card" onclick="showPage('${i.page}')">
      ${visual}
      <div class="fpt-info"><div class="fpt-name">${i.name}</div><div class="fpt-price">${i.price}</div></div>
      <button class="fpt-btn">View →</button>
    </div>`;
  }).join('');
  return `<div class="fpt-section"><h3>🛍️ Frequently Purchased Together</h3><div class="fpt-grid">${cards}</div></div>`;
}

function injectFPT() {
  Object.keys(FPT_MAP).forEach(pageId => {
    const page = document.getElementById('page-' + pageId);
    if (!page) return;
    const section = page.querySelector('.order-section');
    if (!section) return;
    if (section.querySelector('.fpt-section')) return;
    section.insertAdjacentHTML('beforeend', renderFPT(pageId));
  });
}

document.addEventListener('DOMContentLoaded', injectFPT);

// ===== SHIPPING CHOICE INJECTION =====
const SHIP_CALC_MAP = {
  'page-banner-mesh':        ['calcMesh'],
  'page-banner-table':       ['calcRunner'],
  'page-banner-backdrop':    ['calcBackdrop'],
  'page-graduation-banners': ['calcGraduation'],
  'page-player-banners':     ['calcPlayer'],
  'page-yard-signs':         ['calcYardSign','calcYardSignPkg'],
  'page-realtor-signs':      ['calcRealtor'],
  'page-banner-stands':      ['calcStand'],
  'page-magnets':            ['calcMagnet','calcMagnetSingle'],
  'page-tent-banners':       ['calcTent','calcTentSkirt'],
  'page-biz-cards':          ['calcBizCard'],
  'page-banner-custom':      ['calcCustom','calc13oz','calc18oz'],
  'page-tshirts':            ['calcTshirt'],
};
// CSP on this site does not allow 'unsafe-eval', so shipping-option price
// recalculation must call these functions directly instead of eval()-ing a string.
function runShipCalc(pageId){
  (SHIP_CALC_MAP[pageId]||[]).forEach(name=>{
    const fn=window[name];
    if(typeof fn==='function'){try{fn();}catch(e){}}
  });
}

function _etHour(){try{return parseInt(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',hour12:false}).format(new Date()));}catch(e){return(new Date().getUTCHours()-5+24)%24;}}
function _shipNextBizDay(d){let n=(d+1)%7;if(n===0||n===6)n=1;return n;}
function _shipRushAvail(dow){return dow>=1&&dow<=5&&_etHour()<13;}
function _satShouldShow(sel,dow){return(dow===4&&sel==='std')||(dow===5&&sel==='rush')||(dow===5&&sel==='std');}
function _shipSubLabel(sel,dow){
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function nextBizStr(d){
    const t=new Date();t.setDate(t.getDate()+((7+d-dow)%7||7));
    return days[d]+' '+months[t.getMonth()]+' '+t.getDate();
  }
  const h=_etHour();
  if(sel==='rush'){
    if(!_shipRushAvail(dow))return'Available Mon–Fri before 1 PM ET';
    return'Orders accepted until 1:00PM EST · Ships today · Delivers '+nextBizStr(_shipNextBizDay(dow));
  }else{
    if(dow===0||dow===6){
      return'Ships '+nextBizStr(1)+' · Delivers '+nextBizStr(2);
    }else if(h<21){
      const shipDay=_shipNextBizDay(dow);
      return'Order by 9 PM ET · Ships '+nextBizStr(shipDay)+' · Delivers '+nextBizStr(_shipNextBizDay(shipDay));
    }else{
      const sd=_shipNextBizDay(dow);
      return'Ships '+nextBizStr(sd)+' · Delivers '+nextBizStr(_shipNextBizDay(sd));
    }
  }
}

function injectShippingChoice(){
  const dow=new Date().getDay();
  Object.keys(SHIP_CALC_MAP).forEach((pageId)=>{
    const page=document.getElementById(pageId);
    if(!page)return;
    page.querySelectorAll('.order-panel').forEach(panel=>{
      if(panel.querySelector('.ship-choice'))return;
      const anchor=panel.querySelector('.order-footer')||panel.querySelector('.shipping-note');
      if(!anchor)return;
      const rushAvail=_shipRushAvail(dow);
      const rushDisabled=rushAvail?'':'style="opacity:.45;pointer-events:none"';
      const defaultSel='std';
      const stdSub=_shipSubLabel('std',dow);
      const rushSub=_shipSubLabel('rush',dow);
      const satShow=_satShouldShow(defaultSel,dow);
      const satId='sat-'+pageId;
      const html=`
<div class="ship-choice" id="sc-${pageId}">
  <label class="ship-opt${defaultSel==='std'?' sel-std':''}" onclick="shipSelect(this,'std','${pageId}')">
    <input type="radio" class="ship-rb" name="ship-${pageId}" value="std"${defaultSel==='std'?' checked':''}>
    <div class="ship-rdot"></div>
    <div class="ship-opt-text">
      <div class="ship-opt-title">Standard Next Business Day Shipping</div>
      <div class="ship-opt-sub">${stdSub}</div>
    </div>
    <div class="ship-opt-cd ship-opt-cd-std">
      <div class="ship-cd-b ship-cd-std-h">--</div><span class="ship-cd-colon">:</span>
      <div class="ship-cd-b ship-cd-std-m">--</div><span class="ship-cd-colon">:</span>
      <div class="ship-cd-b ship-cd-std-s">--</div>
    </div>
    <div class="ship-badge-col">
      <div class="ship-opt-badge badge-free">Free Overnight Shipping</div>
    </div>
  </label>
  <label class="ship-opt rush-opt${defaultSel==='rush'?' sel-rush':''}" ${rushDisabled} onclick="shipSelect(this,'rush','${pageId}')">
    <input type="radio" class="ship-rb" name="ship-${pageId}" value="rush"${defaultSel==='rush'?' checked':''}>
    <div class="ship-rdot"></div>
    <div class="ship-opt-text">
      <div class="ship-opt-title"><span class="siren">🚨</span> SAME-DAY SHIPPING <span class="siren siren-r">🚨</span></div>
      <div class="ship-opt-sub">${rushSub}</div>
    </div>
    <div class="ship-opt-cd ship-opt-cd-rush">
      <div class="ship-cd-b ship-cd-rush-h">--</div><span class="ship-cd-colon">:</span>
      <div class="ship-cd-b ship-cd-rush-m">--</div><span class="ship-cd-colon">:</span>
      <div class="ship-cd-b ship-cd-rush-s">--</div>
    </div>
    <div class="ship-badge-col">
      <div class="ship-opt-badge badge-rush">RUSH FEE APPLIES</div>
      <div class="ship-badge-sub">Free Overnight Shipping</div>
    </div>
  </label>
</div>
<div class="sat-addon${satShow?'':' hidden'}" id="${satId}" style="${satShow?'':'display:none'}" onclick="satToggle('${pageId}')">
  <input type="checkbox" class="sat-cb">
  <div class="sat-cdot"></div>
  <div class="sat-addon-text">
    <div class="sat-addon-title">📦 Add Saturday Delivery</div>
    <div class="sat-addon-sub">Upgrade to Saturday delivery</div>
  </div>
  <div class="sat-addon-badge">+$35</div>
</div>`;
      anchor.insertAdjacentHTML('beforebegin',html);
      runShipCalc(pageId);
    });
  });
}

function shipSelect(labelEl,val,pageId){
  const page=document.getElementById(pageId);
  if(!page)return;
  const dow=new Date().getDay();
  // Sync ALL ship-opts across every panel in this page
  page.querySelectorAll('.ship-opt').forEach(o=>{
    o.classList.remove('sel-std','sel-rush');
    const rb=o.querySelector('.ship-rb');
    if(rb&&rb.value===val){
      o.classList.add(val==='rush'?'sel-rush':'sel-std');
      rb.checked=true;
      const sub=o.querySelector('.ship-opt-sub');
      if(sub)sub.textContent=_shipSubLabel(val,dow);
    }
  });
  // Sync ALL sat-addons in this page
  const show=_satShouldShow(val,dow);
  page.querySelectorAll('.sat-addon').forEach(satEl=>{
    satEl.style.display=show?'flex':'none';
    if(!show){const cb=satEl.querySelector('.sat-cb');if(cb)cb.checked=false;satEl.classList.remove('sat-on');}
  });
  runShipCalc(pageId);
}

function satToggle(pageId){
  const page=document.getElementById(pageId);
  if(!page)return;
  const firstSat=page.querySelector('.sat-addon');
  if(!firstSat)return;
  const firstCb=firstSat.querySelector('.sat-cb');
  const newChecked=firstCb?!firstCb.checked:true;
  page.querySelectorAll('.sat-addon').forEach(satEl=>{
    const cb=satEl.querySelector('.sat-cb');
    if(cb)cb.checked=newChecked;
    satEl.classList.toggle('sat-on',newChecked);
  });
  runShipCalc(pageId);
}

function getUrgentMult(pageId){
  const page=document.getElementById(pageId);
  if(!page)return 1;
  return page.querySelector('.ship-opt.sel-rush')?2:1;
}

function getSatFee(pageId){
  const page=document.getElementById(pageId);
  if(!page)return 0;
  return page.querySelector('.sat-addon .sat-cb:checked')?35:0;
}

document.addEventListener('DOMContentLoaded',injectShippingChoice);

// ===== LIGHTBOX =====
// To add a new example image later:
//   1. Give the <img loading="lazy" decoding="async"> the class "example-img"
//   2. Add onclick="openLightbox(this)" to the <img loading="lazy" decoding="async">
//   That's it — the lightbox handles the rest automatically.
let lbImages = [], lbIndex = 0, lbTouchX = 0;
function openLightbox(imgEl) {
  const lb = document.getElementById('lightbox-overlay');
  const lbImg = document.getElementById('lightbox-img');
  if (!lb || !lbImg) return;
  // Scope to the nearest container: carousel track → product-info → active page
  const track = imgEl.closest('.photo-carousel-track');
  const productInfo = imgEl.closest('.product-info, [style*="display:flex"][style*="gap"]');
  const activePage = imgEl.closest('.page.active') || imgEl.closest('.page');
  const scope = track || productInfo || activePage || imgEl.parentElement;
  lbImages = Array.from(scope.querySelectorAll('img.example-img, .photo-carousel-track img'));
  // Deduplicate (same element may match both selectors)
  lbImages = [...new Map(lbImages.map(el => [el, el])).values()];
  if (!lbImages.length) lbImages = [imgEl];
  lbIndex = lbImages.indexOf(imgEl);
  if (lbIndex < 0) lbIndex = 0;
  lbImg.style.opacity = '1';
  lbImg.src = lbImages[lbIndex].src;
  lbImg.alt = lbImages[lbIndex].alt;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
  updateLbNav();
}
function lightboxNav(dir) {
  // Arrow keys/swipes reach here even when the lightbox is closed (lbImages empty);
  // bail out so we don't throw and leave #lightbox-img stuck at opacity 0.
  if (!lbImages.length) return;
  lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
  const lbImg = document.getElementById('lightbox-img');
  if (lbImg) { lbImg.style.opacity='0'; setTimeout(()=>{ lbImg.src=lbImages[lbIndex].src; lbImg.style.opacity='1'; },150); }
  updateLbNav();
}
function updateLbNav() {
  const prev = document.getElementById('lightbox-prev');
  const next = document.getElementById('lightbox-next');
  if (prev) prev.style.display = lbImages.length > 1 ? 'flex' : 'none';
  if (next) next.style.display = lbImages.length > 1 ? 'flex' : 'none';
}
function closeLightbox() {
  const lb = document.getElementById('lightbox-overlay');
  if (lb) lb.classList.remove('active');
  document.body.style.overflow = '';
  lbImages = [];
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') lightboxNav(1);
  if (e.key === 'ArrowLeft') lightboxNav(-1);
});
// Tap on overlay background closes, swipe navigates
document.getElementById('lightbox-overlay') && (() => {
  const lb = document.getElementById('lightbox-overlay');
  lb.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - lbTouchX;
    if (Math.abs(dx) > 50) { lightboxNav(dx < 0 ? 1 : -1); }
    else if (e.target === lb) closeLightbox();
  });
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
})();
// Add transition to lightbox img
document.getElementById('lightbox-img') && (document.getElementById('lightbox-img').style.transition = 'opacity .15s');

// ===== CANVA TEMPLATE LINKS BY PRODUCT TYPE =====
const CANVA_LINKS = {
  banner:      [
    { icon:'📋', label:'Vinyl Banner Templates',         url:'https://www.canva.com/banners/templates/',                    bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
    { icon:'🎨', label:'Sign & Banner Templates',        url:'https://www.canva.com/signs/templates/',                      bg:'linear-gradient(90deg,#0891b2,#0e7490)' },
    { icon:'📣', label:'Event Banner Templates',         url:'https://www.canva.com/banners/templates/event/',              bg:'linear-gradient(90deg,#7c3aed,#6d28d9)' },
  ],
  banner18oz:  [
    { icon:'📋', label:'Vinyl Banner Templates',         url:'https://www.canva.com/banners/templates/',                    bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
    { icon:'🎨', label:'Sign & Banner Templates',        url:'https://www.canva.com/signs/templates/',                      bg:'linear-gradient(90deg,#0891b2,#0e7490)' },
    { icon:'📣', label:'Event Banner Templates',         url:'https://www.canva.com/banners/templates/event/',              bg:'linear-gradient(90deg,#7c3aed,#6d28d9)' },
  ],
  backdrop:    [
    { icon:'📸', label:'Photo Backdrop Templates',       url:'https://www.canva.com/banners/templates/step-repeat/',        bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
    { icon:'🎬', label:'Event Backdrop Templates',       url:'https://www.canva.com/banners/templates/event/',              bg:'linear-gradient(90deg,#7c3aed,#6d28d9)' },
    { icon:'🏢', label:'Corporate Banner Templates',     url:'https://www.canva.com/banners/templates/corporate/',          bg:'linear-gradient(90deg,#0891b2,#0e7490)' },
  ],
  tent:        [
    { icon:'⛺', label:'Tent Banner Templates',          url:'https://www.canva.com/banners/templates/',                    bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
    { icon:'📣', label:'Outdoor Event Templates',        url:'https://www.canva.com/banners/templates/event/',              bg:'linear-gradient(90deg,#15803d,#16a34a)' },
    { icon:'🏪', label:'Business Sign Templates',        url:'https://www.canva.com/signs/templates/',                      bg:'linear-gradient(90deg,#0891b2,#0e7490)' },
  ],
  yardsign:    [
    { icon:'🪧', label:'Yard Sign Templates',            url:'https://www.canva.com/yard-signs/templates/',                 bg:'linear-gradient(90deg,#15803d,#16a34a)' },
    { icon:'🏡', label:'Real Estate Sign Templates',     url:'https://www.canva.com/yard-signs/templates/real-estate/',     bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
    { icon:'🎓', label:'Event & Party Sign Templates',   url:'https://www.canva.com/yard-signs/templates/event/',           bg:'linear-gradient(90deg,#7c3aed,#6d28d9)' },
  ],
  realtor:     [
    { icon:'🏠', label:'Real Estate Sign Templates',     url:'https://www.canva.com/yard-signs/templates/real-estate/',     bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
    { icon:'🪧', label:'Yard Sign Templates',            url:'https://www.canva.com/yard-signs/templates/',                 bg:'linear-gradient(90deg,#15803d,#16a34a)' },
    { icon:'📋', label:'Real Estate Flyer Templates',    url:'https://www.canva.com/flyers/templates/real-estate/',         bg:'linear-gradient(90deg,#0891b2,#0e7490)' },
  ],
  bannerstand: [
    { icon:'🏙️', label:'Retractable Banner Templates',  url:'https://www.canva.com/banners/templates/retractable/',        bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
    { icon:'🏢', label:'Corporate Banner Templates',     url:'https://www.canva.com/banners/templates/corporate/',          bg:'linear-gradient(90deg,#0891b2,#0e7490)' },
    { icon:'🎪', label:'Exhibition Banner Templates',    url:'https://www.canva.com/banners/templates/',                    bg:'linear-gradient(90deg,#7c3aed,#6d28d9)' },
  ],
  magnet:      [
    { icon:'🚗', label:'Car Magnet Templates',           url:'https://www.canva.com/car-magnets/templates/',                bg:'linear-gradient(90deg,#d42020,#b91c1c)' },
    { icon:'🏷️', label:'Label & Sticker Templates',     url:'https://www.canva.com/labels/templates/',                     bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
    { icon:'📋', label:'Business Card Templates',        url:'https://www.canva.com/business-cards/templates/',             bg:'linear-gradient(90deg,#0891b2,#0e7490)' },
  ],
  tshirt:      [
    { icon:'👕', label:'T-Shirt Design Templates',       url:'https://www.canva.com/t-shirts/templates/',                   bg:'linear-gradient(90deg,#d42020,#b91c1c)' },
    { icon:'🎽', label:'Sports Apparel Templates',       url:'https://www.canva.com/t-shirts/templates/sports/',            bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
    { icon:'🎨', label:'Graphic Tee Templates',          url:'https://www.canva.com/t-shirts/templates/graphic/',           bg:'linear-gradient(90deg,#15803d,#16a34a)' },
  ],
  bizcard:     [
    { icon:'💼', label:'Business Card Templates',        url:'https://www.canva.com/business-cards/templates/',             bg:'linear-gradient(90deg,#7c3aed,#6d28d9)' },
    { icon:'🏢', label:'Corporate Card Templates',       url:'https://www.canva.com/business-cards/templates/corporate/',   bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
    { icon:'🎨', label:'Creative Card Templates',        url:'https://www.canva.com/business-cards/templates/creative/',    bg:'linear-gradient(90deg,#0891b2,#0e7490)' },
  ],
};
CANVA_LINKS.default = [
  { icon:'📋', label:'Banner Templates',               url:'https://www.canva.com/banners/templates/',                    bg:'linear-gradient(90deg,#1a3fa8,#2456c8)' },
  { icon:'🪧', label:'Sign Templates',                 url:'https://www.canva.com/signs/templates/',                      bg:'linear-gradient(90deg,#15803d,#16a34a)' },
];

function dsUpdateCanvaLinks(type) {
  const container = document.getElementById('canva-links-container');
  if (!container) return;
  const links = CANVA_LINKS[type] || CANVA_LINKS.default;
  container.innerHTML = links.map(l =>
    `<a href="${l.url}" target="_blank" style="display:flex;align-items:center;gap:8px;background:${l.bg};color:#fff;padding:7px 10px;border-radius:7px;font-size:12px;font-weight:700;text-decoration:none">${l.icon} ${l.label}</a>`
  ).join('') +
  `<a href="https://www.canva.com/templates/" target="_blank" style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.06);color:#475569;padding:5px 10px;border-radius:7px;font-size:11px;font-weight:700;text-decoration:none;border:1px solid #e2e8f0;margin-top:2px">📄 Browse All Free Templates</a>`;
}


function dsApplyFontPreview() {
  if (!dsSelectedEl || dsSelectedEl.tagName === 'IMG') return;
  const ff = document.getElementById('d-font').value;
  dsSelectedEl.style.fontFamily = "'" + ff + "',sans-serif";
  dsUpdateHandles(dsSelectedEl);
  dsPushUndo();
}

function dsApplyFontSize() {
  if (!dsSelectedEl || dsSelectedEl.tagName === 'IMG') return;
  let sz = parseInt(document.getElementById('d-fontsize').value);
  if (!sz) return;
  sz = Math.max(sz, dsMinFontPx || 4);
  document.getElementById('d-fontsize').value = sz;
  dsSelectedEl.style.fontSize = sz + 'px';
  // Widen text element to fit new size (don't clip)
  dsSelectedEl.style.width = 'auto';
  dsSelectedEl.style.height = 'auto';
  setTimeout(() => {
    dsUpdateHandles(dsSelectedEl);
    const toolbar = dsGetElements()?.querySelector('.ds-element-toolbar');
    if (toolbar && dsSelectedEl) {
      const elT = parseFloat(dsSelectedEl.style.top) || dsSelectedEl.offsetTop;
      toolbar.style.top = (elT - 42) + 'px';
    }
    dsPushUndo();
  }, 10);
}

function dsInsertEmoji(emoji) {
  const canvas = dsGetCanvas();
  const layer  = dsGetElements();
  const ph     = dsGetPlaceholder();
  if (!layer || !canvas) return;
  if (ph) ph.style.display = 'none';
  const el = document.createElement('div');
  el.style.cssText = 'position:absolute;left:0;top:0;font-size:48px;cursor:move;user-select:none;pointer-events:all;outline:2px dashed transparent;z-index:10;line-height:1;';
  el.textContent = emoji;
  layer.style.pointerEvents = 'all';
  layer.appendChild(el);
  setTimeout(() => {
    const w = Math.max(el.offsetWidth  || 0, 60);
    const h = Math.max(el.offsetHeight || 0, 60);
    el.style.width  = w + 'px';
    el.style.height = h + 'px';
    el.style.left   = Math.max(0, (canvas.width  - w) / 2) + 'px';
    el.style.top    = Math.max(0, (canvas.height - h) / 2) + 'px';
    dsMakeDraggable(el);
    dsSelect(el);
  }, 30);
}

function dsPopulateEmojis() {
  try {
    const grid = document.getElementById('ds-emoji-grid');
    if (!grid || grid.children.length > 0) return;
    const emojis = [
      '😀','😃','😄','😁','😆','🤣','😂','😊','😇','🙂','😉','😍','🥰','😎','🤩','🥳',
      '😢','😭','😤','😡','🤔','🤯','😱','🥶','😴','🤗','😏','🙄','😬','🤓','😘','😜',
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕','💞','💓','💗','💖','💘','💝',
      '🎉','🎊','🎈','🎁','🎀','🏆','🥇','🏅','🎯','🎨','🎬','🎤','🎧','🎸','🎺','🥁',
      '⭐','🌟','💫','✨','🌙','☀️','🌈','❄️','🌊','🔥','💧','🌸','🌺','🌻','🌹','🍀',
      '🍕','🍔','🌮','🍣','🍜','🍦','🎂','🍩','🍪','🍫','🍬','🍭','🥤','🍺','🥂','🍾',
      '🚀','✈️','🚗','🚢','🏎️','🚲','🚁','⛵','🛸','🚂','🚕','🏍️',
      '💪','👊','✊','👋','👍','👎','🙏','✌️','🤞','👌','🤙','☝️','👆','✍️',
      '🏠','🏢','🎭','🎪','🗼','🗽','🏰','💼','📱','💻','⌚','📷','📞','📧','📝','✏️',
      '📌','📍','🔑','🔒','💡','🌍','🌎','🌏','⚡','♻️','✅','🎵','🎶','🌴','🌵',
      '🦁','🐯','🦊','🐺','🐴','🦄','🐝','🦋','🐢','🦅','🦆','🦉','🐙','🦈','🐬','🐳'
    ];
    emojis.forEach(function(ch) {
      var span = document.createElement('span');
      span.textContent = ch;
      span.style.cssText = 'font-size:22px;cursor:pointer;padding:3px;border-radius:5px;line-height:1.3;display:inline-block';
      span.addEventListener('click', function(){ dsInsertEmoji(this.textContent); });
      span.addEventListener('mouseover', function(){ this.style.background='#e8eaf6'; });
      span.addEventListener('mouseout',  function(){ this.style.background=''; });
      grid.appendChild(span);
    });
  } catch(e) { console.warn('Emoji load error:', e); }
}

document.addEventListener('DOMContentLoaded', function(){
  // Delete key removes selected element
  document.addEventListener('keydown', function(e) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && dsSelectedEl) {
      // Only if designer modal is open and focus is NOT in a text input
      const modal = document.getElementById('design-modal');
      if (modal && modal.classList.contains('active')) {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          dsDelete();
        }
      }
    }
  });

  // Click on canvas background to deselect
  ['d-canvas-wrap', 'd-canvas-wrap-back'].forEach(id => {
    const wrap = document.getElementById(id);
    if (wrap) {
      wrap.addEventListener('click', function(e) {
        if (e.target === wrap || e.target.id === 'd-canvas' || e.target.id === 'd-canvas-back') {
          if (dsSelectedEl) {
            dsSelectedEl.style.outline = '2px dashed transparent';
            dsCleanupElement(dsSelectedEl);
            dsSelectedEl = null;
          }
        }
      });
    }
  });
});

// ===== CHECKOUT FIELD VALIDATION (email format + typo catcher, phone/ZIP/state) =====
// The required-field check only tested "not empty", so orders went through with
// undeliverable emails like name@yaho.com. coValidateCheckout() runs before payment.
const CO_EMAIL_DOMAINS = ['gmail.com','yahoo.com','hotmail.com','aol.com','outlook.com','icloud.com','live.com',
  'msn.com','comcast.net','att.net','sbcglobal.net','verizon.net','bellsouth.net','charter.net','cox.net',
  'me.com','mac.com','ymail.com','rocketmail.com','protonmail.com','windstream.net','frontier.com'];
const CO_TLD_FIXES = { con: 'com', cm: 'com', om: 'com', comm: 'com', cmo: 'com', ocm: 'com', vom: 'com', xom: 'com', co: 'com', nett: 'net', ner: 'net', nte: 'net' };
let coEmailOverride = '';   // email the customer confirmed is correct despite a suggestion

function coEditDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1] ? d[i - 2][j - 2] + 1 : Infinity);
  return d[a.length][b.length];
}
function coEmailFormatOk(v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) && !/\.\./.test(v); }
function coSuggestEmail(v) {
  const at = v.lastIndexOf('@'); if (at < 1) return '';
  const user = v.slice(0, at), dom = v.slice(at + 1).toLowerCase();
  if (CO_EMAIL_DOMAINS.includes(dom)) return '';
  let best = '', bestD = 3;
  for (const k of CO_EMAIL_DOMAINS) { const dd = coEditDistance(dom, k); if (dd < bestD) { bestD = dd; best = k; } }
  if (best && bestD <= (dom.length >= 11 ? 2 : 1)) return user + '@' + best;
  // Mistyped endings (name@company.con). ".co" is a real ending, so only fix it for known providers.
  const m = dom.match(/^(.*)\.([a-z]+)$/);
  if (m && CO_TLD_FIXES[m[2]]) {
    const fixed = m[1] + '.' + CO_TLD_FIXES[m[2]];
    if (m[2] !== 'co' || CO_EMAIL_DOMAINS.includes(fixed)) return user + '@' + fixed;
  }
  return '';
}
function coFieldMsg(id, html, kind) {
  const el = document.getElementById(id); if (!el) return;
  let box = document.getElementById(id + '-msg');
  if (!html) { if (box) box.remove(); el.style.borderColor = ''; return; }
  if (!box) { box = document.createElement('div'); box.id = id + '-msg'; (el.closest('#co-address-note, .form-group') || el.parentElement).appendChild(box); }
  box.style.cssText = 'margin-top:5px;font-size:12.5px;font-weight:700;line-height:1.4;color:' + (kind === 'warn' ? '#92400e' : '#c81e1e');
  box.innerHTML = html;
  el.style.borderColor = kind === 'warn' ? '#f59e0b' : '#dc2626';
}
function coCheckEmail(fromSubmit) {
  const el = document.getElementById('co-email'); if (!el) return true;
  const v = el.value.trim();
  if (!v) { coFieldMsg('co-email', ''); return true; }
  if (!coEmailFormatOk(v)) { coFieldMsg('co-email', 'Please enter a valid email address (like name@example.com).'); return false; }
  const s = coSuggestEmail(v);
  if (s && coEmailOverride !== v) {
    coFieldMsg('co-email', 'Did you mean <strong>' + s.replace(/</g, '&lt;') + '</strong>? ' +
      '<button type="button" onclick="coUseEmailSuggestion()" style="margin-left:4px;padding:3px 9px;border-radius:6px;border:none;background:#1a3fa8;color:#fff;font-weight:800;font-size:12px;cursor:pointer">Yes, fix it</button> ' +
      '<button type="button" onclick="coKeepEmail()" style="padding:3px 9px;border-radius:6px;border:1px solid #d1d5db;background:#fff;color:#374151;font-weight:700;font-size:12px;cursor:pointer">No, mine is correct</button>', 'warn');
    return false;
  }
  coFieldMsg('co-email', '');
  return true;
}
function coUseEmailSuggestion() {
  const el = document.getElementById('co-email'); const s = coSuggestEmail(el.value.trim());
  if (s) el.value = s;
  coFieldMsg('co-email', '');
  if (typeof checkSavedCards === 'function') checkSavedCards();
}
// Street line sent to the backend: "Company, 123 Main St, Suite 4" (company and line 2 are optional).
// Folded into the existing street field so order emails and FedEx tracking matching keep working.
function coFullStreet(id) {
  const v = x => (document.getElementById(x)?.value || '').trim();
  return [v('co-company'), v(id || 'co-address'), v('co-address2')].filter(Boolean).join(', ');
}
function coKeepEmail() { coEmailOverride = document.getElementById('co-email').value.trim(); coFieldMsg('co-email', ''); }
function coValidateCheckout(expressOnly) {
  let ok = true, first = null;
  const flag = (id, good, msg) => { coFieldMsg(id, good ? '' : msg); if (!good) { ok = false; first = first || id; } };
  if (!coCheckEmail(true)) { ok = false; first = 'co-email'; }
  if (!expressOnly) {
    const ph = (document.getElementById('co-phone')?.value || '').replace(/\D/g, '');
    flag('co-phone', ph.length === 10 || (ph.length === 11 && ph[0] === '1'), 'Please enter a 10-digit phone number.');
    const st = document.getElementById('co-state');
    if (st) st.value = st.value.trim().toUpperCase();
    flag('co-state', /^[A-Z]{2}$/.test(st ? st.value : ''), 'Use the 2-letter state code (like KY).');
    flag('co-zip', /^\d{5}(-\d{4})?$/.test((document.getElementById('co-zip')?.value || '').trim()), 'Please enter a 5-digit ZIP code.');
  }
  const cb = document.getElementById('co-confirm-info');
  if (cb && cb.dataset.merged !== '1') flag('co-confirm-info', cb.checked, 'Please check the box to confirm your information is correct.');
  if (!ok && first) { const f = document.getElementById(first); if (f) { f.scrollIntoView({ block: 'center', behavior: 'smooth' }); f.focus({ preventScroll: true }); } }
  return ok;
}
(function coEnhanceCheckoutFields() {
  const set = (id, attrs) => { const el = document.getElementById(id); if (el) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); };
  set('co-name', { autocomplete: 'name' });
  set('co-first', { autocomplete: 'given-name' });
  set('co-last', { autocomplete: 'family-name' });
  set('co-email', { inputmode: 'email', autocomplete: 'email', autocapitalize: 'off', spellcheck: 'false' });
  set('co-phone', { inputmode: 'tel', autocomplete: 'tel' });
  set('co-address', { autocomplete: 'address-line1' });
  set('co-street', { autocomplete: 'address-line1' });
  set('co-city', { autocomplete: 'address-level2' });
  set('co-state', { autocomplete: 'address-level1' });
  set('co-zip', { inputmode: 'numeric', autocomplete: 'postal-code' });
  const em = document.getElementById('co-email');
  if (em) { em.addEventListener('blur', () => coCheckEmail(false)); em.addEventListener('input', () => { coEmailOverride = ''; coFieldMsg('co-email', ''); }); }
  ['co-phone', 'co-state', 'co-zip'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', () => coFieldMsg(id, '')); });
  // Optional company name (above the street) and address line 2 (below it)
  const street = document.getElementById('co-address') || document.getElementById('co-street');
  const sRow = street && street.closest('.form-group, .field-row');
  if (sRow && !document.getElementById('co-address2')) {
    const mk = (id, label, ph, ac) => {
      const row = document.createElement('div');
      row.className = sRow.className; row.setAttribute('style', sRow.getAttribute('style') || '');
      const lab = document.createElement('label'); lab.setAttribute('for', id); lab.textContent = label;
      const inp = document.createElement('input'); inp.type = 'text'; inp.id = id; inp.placeholder = ph; inp.setAttribute('autocomplete', ac);
      if (sRow.classList.contains('field-row')) { const f = document.createElement('div'); f.className = 'field'; f.style.flex = '2'; f.append(lab, inp); row.append(f); }
      else row.append(lab, inp);
      return row;
    };
    sRow.before(mk('co-company', 'Company / Business Name (optional)', 'Business, school or organization', 'organization'));
    sRow.after(mk('co-address2', 'Apt, Suite, Unit, Building (optional)', 'Suite 200', 'address-line2'));
  }
  // Required "I've checked my info" box under the city/state/ZIP row
  const zip = document.getElementById('co-zip');
  const row = zip && zip.closest('div[style*="grid"], .field-row');
  if (row && !document.getElementById('co-address-note')) {
    const n = document.createElement('div');
    n.id = 'co-address-note';
    n.style.cssText = 'margin-top:10px;background:#fff7e6;border:1px solid #fcd34d;border-radius:8px;padding:10px 12px;font-size:12.5px;font-weight:700;color:#92400e;line-height:1.4';
    n.innerHTML = '<label for="co-confirm-info" style="display:flex;gap:10px;align-items:flex-start;cursor:pointer;margin:0;text-transform:none;letter-spacing:0;font-size:12.5px;font-weight:700;color:#92400e">' +
      '<input type="checkbox" id="co-confirm-info" style="width:18px;height:18px;flex-shrink:0;margin-top:1px;accent-color:#1a3fa8;cursor:pointer">' +
      '<span>&#128230; I have double-checked my name, email, phone and shipping address (including any suite or unit number) and everything is correct. ' +
      '<span style="font-weight:600">We ship overnight, so address errors can&rsquo;t always be fixed once your order ships.</span></span></label>';
    row.after(n);
    document.getElementById('co-confirm-info').addEventListener('change', () => coFieldMsg('co-confirm-info', ''));
  }
})();

// ===== GOOGLE ADDRESS AUTOCOMPLETE (Places API New) =====
// Suggests real addresses as the customer types the street line, then fills street,
// city, state, ZIP (and apt/suite into line 2). Browser key is restricted to our domains.
// Cost control: starts after 4 characters, waits for a 300 ms pause, one session per address.
const CO_GMAPS_KEY = 'AIzaSyDco9-RXOfqpeHR-CbRBmfCUY3BLmx48pU';
(function coAddressAutocomplete() {
  const street = document.getElementById('co-address') || document.getElementById('co-street');
  if (!street || street.dataset.coAc) return;
  street.dataset.coAc = '1';
  let lib = null, token = null, timer = null, seq = 0, items = [], active = -1, picking = false;
  const $ = id => document.getElementById(id);
  const load = () => {
    if (lib) return Promise.resolve(lib);
    if (window.google && google.maps && google.maps.importLibrary) return google.maps.importLibrary('places').then(l => (lib = l));
    return new Promise((res, rej) => {
      window.__coGmapsReady = () => google.maps.importLibrary('places').then(l => { lib = l; res(l); }).catch(rej);
      const s = document.createElement('script');
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + CO_GMAPS_KEY + '&loading=async&libraries=places&callback=__coGmapsReady';
      s.async = true; s.onerror = rej;
      document.head.appendChild(s);
    });
  };
  const wrap = street.parentElement;
  if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
  const box = document.createElement('div');
  box.id = 'co-ac-box';
  box.setAttribute('role', 'listbox');
  box.style.cssText = 'display:none;position:absolute;left:0;right:0;z-index:9999;background:#fff;border:1px solid #cbd5e1;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.18);margin-top:2px;overflow:hidden;text-align:left';
  street.after(box);
  street.setAttribute('aria-autocomplete', 'list');
  street.setAttribute('aria-controls', 'co-ac-box');
  const hide = () => { box.style.display = 'none'; items = []; active = -1; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function render(list) {
    items = list; active = -1;
    if (!list.length) return hide();
    box.innerHTML = list.map((s, i) => {
      const p = s.placePrediction;
      const main = p.mainText ? p.mainText.text : p.text.text, sec = p.secondaryText ? p.secondaryText.text : '';
      return '<div role="option" data-i="' + i + '" style="padding:9px 12px;cursor:pointer;font-size:14px;line-height:1.3;color:#111827;border-top:' + (i ? '1px solid #f1f5f9' : '0') + '">' +
        '<div style="font-weight:700">&#128205; ' + esc(main) + '</div>' + (sec ? '<div style="font-size:12px;color:#6b7280;margin-left:22px">' + esc(sec) + '</div>' : '') + '</div>';
    }).join('') + '<div style="padding:4px 10px;text-align:right;font-size:10.5px;color:#9ca3af;background:#f8fafc">powered by Google</div>';
    box.style.display = 'block';
    [...box.querySelectorAll('[data-i]')].forEach(el => {
      el.addEventListener('mousedown', e => { e.preventDefault(); pick(items[+el.dataset.i]); });
      el.addEventListener('mouseenter', () => highlight(+el.dataset.i));
    });
  }
  function highlight(i) {
    active = i;
    [...box.querySelectorAll('[data-i]')].forEach(el => { el.style.background = +el.dataset.i === i ? '#eff6ff' : '#fff'; });
  }
  async function suggest(q) {
    const my = ++seq;
    try {
      const l = await load();
      if (!token) token = new l.AutocompleteSessionToken();
      const { suggestions } = await l.AutocompleteSuggestion.fetchAutocompleteSuggestions({ input: q, sessionToken: token, includedRegionCodes: ['us'] });
      if (my !== seq || document.activeElement !== street) return;
      render(suggestions.filter(s => s.placePrediction).slice(0, 5));
    } catch (e) { hide(); }
  }
  async function pick(s) {
    hide(); picking = true;
    try {
      const place = s.placePrediction.toPlace();
      await place.fetchFields({ fields: ['addressComponents', 'displayName', 'types'] });
      token = null;
      const get = (type, short) => { const c = (place.addressComponents || []).find(c => c.types.includes(type)); return c ? (short ? c.shortText : c.longText) : ''; };
      const num = get('street_number'), route = get('route', true);
      const line1 = [num, route].filter(Boolean).join(' ');
      const city = get('locality') || get('postal_town') || get('sublocality_level_1') || get('administrative_area_level_3');
      const set = (id, v) => { const el = $(id); if (el && v) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } };
      set(street.id, line1 || s.placePrediction.mainText?.text || street.value);
      set('co-address2', get('subpremise') ? '#' + get('subpremise') : '');
      set('co-city', city);
      set('co-state', get('administrative_area_level_1', true));
      set('co-zip', get('postal_code'));
      // A business/school result: offer its name for the company field if that's empty
      const isBiz = (place.types || []).some(t => t === 'establishment' || t === 'point_of_interest');
      if (isBiz && $('co-company') && !$('co-company').value && place.displayName) set('co-company', place.displayName);
      if (typeof coFieldMsg === 'function') ['co-state', 'co-zip'].forEach(id => coFieldMsg(id, ''));
    } catch (e) { /* leave whatever the customer typed */ }
    picking = false;
  }
  street.addEventListener('input', () => {
    if (picking) return;
    clearTimeout(timer);
    const q = street.value.trim();
    if (q.length < 4) { seq++; return hide(); }
    timer = setTimeout(() => suggest(q), 300);
  });
  street.addEventListener('keydown', e => {
    if (box.style.display === 'none' || !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); highlight(Math.min(active + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(Math.max(active - 1, 0)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(items[active]); }
    else if (e.key === 'Escape') hide();
  });
  street.addEventListener('blur', () => setTimeout(hide, 150));
})();

// ===== KEEP ORDER DETAILS IN STEP WITH THE DESIGNER'S SIZE =====
// Changing size inside the designer re-priced the order (dsSyncBannerPriceFromArtboard) but the cart line /
// order email kept the size captured when the designer opened, e.g. "13oz · 2'×4'" while charging for 3'×6'.
// Swap just the size text inside dsPriceDetails so material/options text is preserved.
(function coDesignerDetailsSync() {
  if (typeof dsSyncBannerPriceFromArtboard !== 'function' || window.__coDetailsSync) return;
  window.__coDetailsSync = true;
  const sizeText = () => {
    const v = id => (document.getElementById(id) || {}).value;
    if (dsProduct === 'Player Banner') return sizeLabel('plyr');
    if (dsProduct === '13oz Vinyl Banner') return sizeLabel('b13');
    if (dsProduct === '18oz Vinyl Banner') return sizeLabel('b18');
    if (dsProduct === 'Custom Vinyl Banner') return v('custom-w') + '″×' + v('custom-h') + '″';
    return '';
  };
  const orig = dsSyncBannerPriceFromArtboard;
  dsSyncBannerPriceFromArtboard = function () {
    let before = '';
    try { before = sizeText(); } catch (e) {}
    const r = orig.apply(this, arguments);
    try {
      const after = sizeText();
      if (before && after && before !== after && typeof dsPriceDetails === 'string' && dsPriceDetails.includes(before)) {
        dsPriceDetails = dsPriceDetails.split(before).join(after);
      }
    } catch (e) {}
    return r;
  };
})();

// ===== CHECKOUT: ONE APPROVAL BOX + INLINE MESSAGE (replaces two stacked boxes + alert()) =====
// The "I've double-checked my info" box and the "I've checked my artwork / Terms" box are merged
// into the one box right above the pay buttons. #co-confirm-info stays in the DOM (hidden) and
// mirrors #terms-ack so every existing check/field keeps working.
function coTermsMsg() {
  const wrap = document.getElementById('terms-ack-wrap');
  const m = document.getElementById('terms-ack-msg');
  if (m) { m.style.display = 'block'; }
  if (wrap) {
    wrap.style.borderColor = '#dc2626';
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
(function coOneApprovalBox() {
  const ack = document.getElementById('terms-ack');
  const wrap = document.getElementById('terms-ack-wrap');
  if (!ack || !wrap || wrap.dataset.coOne) return;
  wrap.dataset.coOne = '1';
  const note = document.getElementById('co-address-note');
  const cb = document.getElementById('co-confirm-info');
  if (note) note.style.display = 'none';
  if (cb) cb.dataset.merged = '1';
  const strong = wrap.querySelector('span > strong');
  if (strong) strong.textContent = "I’ve checked my artwork, spelling, size, and my name, email, phone and shipping address (including any suite or unit)";
  const span = wrap.querySelector('span');
  if (span && !span.querySelector('.co-ship-note')) {
    const s = document.createElement('span');
    s.className = 'co-ship-note';
    s.style.cssText = 'display:block;margin-top:6px;font-weight:600;color:#92400e';
    s.textContent = "We ship overnight, so address errors can’t always be fixed once your order ships.";
    span.appendChild(s);
  }
  const msg = document.createElement('div');
  msg.id = 'terms-ack-msg';
  msg.setAttribute('role', 'alert');
  msg.style.cssText = 'display:none;margin:-6px 0 14px;font-size:13px;font-weight:700;color:#dc2626';
  msg.textContent = 'Please tick the box above to approve your order and continue.';
  const hint = document.createElement('div');
  hint.id = 'terms-ack-hint';
  hint.style.cssText = 'margin:-6px 0 12px;font-size:12px;color:#6b7280';
  hint.textContent = 'Tick the box above to unlock the payment buttons.';
  wrap.after(msg);
  msg.after(hint);
  const sync = () => {
    if (cb) cb.checked = ack.checked;
    if (ack.checked) { msg.style.display = 'none'; hint.style.display = 'none'; }
    else { hint.style.display = 'block'; wrap.style.borderColor = '#fbbf24'; }
    if (typeof coFieldMsg === 'function' && cb) coFieldMsg('co-confirm-info', '');
  };
  ack.addEventListener('change', sync);
  sync();
})();

// ===== CHECKOUT CLEANUP (2026-10-14): fold optional boxes behind links, calmer opt-ins, short save-card text =====
(function coCleanCheckout() {
  const q = id => document.getElementById(id);
  const fold = (el, label, openIf) => {
    if (!el || el.dataset.coFold) return;
    el.dataset.coFold = '1';
    el.classList.add('co-fold');
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'co-link'; b.textContent = label;
    b.addEventListener('click', () => { el.classList.add('open'); b.style.display = 'none'; const f = el.querySelector('input,textarea'); if (f) f.focus(); });
    el.before(b);
    if (openIf && openIf()) { el.classList.add('open'); b.style.display = 'none'; }
  };
  // coupon: the whole "Coupon Code" section (title + input row + message)
  const cin = q('coupon-input');
  if (cin) {
    const sec = cin.parentElement && cin.parentElement.parentElement;
    if (sec) { sec.classList.add('co-sec'); const t = sec.firstElementChild; if (t) t.style.display = 'none'; fold(sec, '＋ Have a coupon code?', () => cin.value); }
  }
  // special instructions
  const notes = q('co-notes');
  if (notes) { const g = notes.closest('.form-group'); if (g) { const l = g.querySelector('label'); if (l) l.style.display = 'none'; fold(g, '＋ Add special instructions', () => notes.value); } }
  // email opt-in row: give it an id so CSS can calm it down
  const opt = q('email-optin-cb');
  if (opt && opt.parentElement) opt.parentElement.id = 'co-email-optin-row';
  // save-card legal text: keep it, but tuck it behind a Details link
  const sc = q('save-card-box');
  if (sc && !sc.dataset.coFold) {
    sc.dataset.coFold = '1';
    const lab = sc.querySelector('label');
    const main = document.createTextNode('');
    const d = document.createElement('button');
    d.type = 'button'; d.className = 'co-link'; d.textContent = 'Details'; d.style.cssText = 'font-size:11px;margin-left:8px';
    d.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); sc.classList.toggle('open'); });
    sc.appendChild(d);
  }
  // tighten section spacing
  document.querySelectorAll('#checkout-modal .checkout-modal-inner > div:nth-child(2) > div').forEach(s => { if (s.style.marginBottom === '20px') s.classList.add('co-sec'); });
})();

// ===== GROMMET CHOICE (2026-10-14): designer follows the product page; order text never lists two grommet choices =====
(function coGrommetSync() {
  if (typeof _openDesignerFull !== 'function' || typeof DS_PRODUCT_FIELD_IDS === 'undefined') return;
  const toVal = function (t) {
    t = String(t || '').toLowerCase();
    if (/no grommets/.test(t)) return 'none';
    if (/every 2 feet|standard/.test(t)) return 'standard';
    if (/every 15/.test(t)) return '15';
    if (/every 24/.test(t)) return '24';
    if (/top and bottom|top & bottom/.test(t)) return 'topbottom';
    if (/corners/.test(t)) return 'corners';
    if (/top only/.test(t)) return 'top';
    if (/sides only/.test(t)) return 'sides';
    return '';
  };
  const origOpen = _openDesignerFull;
  window._openDesignerFull = function () {
    const r = origOpen.apply(this, arguments);
    try {
      const f = DS_PRODUCT_FIELD_IDS[dsProduct];
      const s = f && f.hem ? document.getElementById(f.hem.replace(/-hem$/, '-grommet')) : null;
      const g = document.getElementById('d-grommet-style');
      if (s && g && s.options[s.selectedIndex]) {
        const v = toVal(s.options[s.selectedIndex].text);
        if (v) { g.value = v; if (typeof dsRenderGrommets === 'function') dsRenderGrommets(); }
      }
    } catch (e) {}
    return r;
  };
  if (typeof dsGetOptionsSuffix === 'function' && typeof DS_GROMMET_LABELS !== 'undefined') {
    const origSuf = dsGetOptionsSuffix;
    window.dsGetOptionsSuffix = function () {
      let s = origSuf.apply(this, arguments);
      try {
        if (/grommet/i.test(dsPriceDetails || '')) {
          const labs = Object.values(DS_GROMMET_LABELS);
          s = s.split(' · ').filter(function (p) { return labs.indexOf(p) < 0; }).join(' · ');
        }
      } catch (e) {}
      return s;
    };
  }
})();

/* ===== UPLOAD PROGRESS + CLEAR ERRORS (2026-10-15) =====
   Big print files looked like a frozen "Saving file to cloud..." with no feedback. This shows a
   live percentage, times out instead of hanging forever, and says why a save failed. */
async function dsUploadToR2(file) {
  var MAX = 150 * 1024 * 1024;
  var statusEl = document.getElementById('ds-upload-status');
  var mb = function (n) { return (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB'; };
  var fail = function (msg) {
    // dsUpload() writes its own generic red text after this promise resolves; replace it right after.
    setTimeout(function () {
      if (statusEl) { statusEl.style.color = '#d42020'; statusEl.textContent = '⚠️ ' + msg; }
    }, 0);
    return null;
  };
  if (file.size > MAX) return fail('This file is ' + mb(file.size) + ' — our upload limit is 150 MB. Please save a smaller/compressed copy, or contact us and we will get it from you directly.');
  return new Promise(function (resolve) {
    var xhr = new XMLHttpRequest();
    var started = Date.now();
    xhr.open('POST', BACKEND_URL + '/upload/file');
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('X-Filename', file.name);
    xhr.timeout = 15 * 60 * 1000;
    xhr.upload.onprogress = function (e) {
      if (!statusEl || !e.lengthComputable) return;
      var pct = Math.min(99, Math.round(e.loaded / e.total * 100));
      statusEl.style.color = '#1a3fa8';
      statusEl.textContent = '⏳ Uploading ' + mb(file.size) + '… ' + pct + '%' + (file.size > 15728640 ? ' — large file, please keep this page open' : '');
    };
    xhr.upload.onload = function () {
      if (statusEl) { statusEl.style.color = '#1a3fa8'; statusEl.textContent = '⏳ Finishing up…'; }
    };
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var j = JSON.parse(xhr.responseText);
          dsCurrentThumbUrl = j.publicUrl || null;
          return resolve(j.fileKey);
        } catch (e) {}
      }
      console.error('R2 upload error:', xhr.status);
      resolve(fail(xhr.status === 413
        ? 'This file is too large for our uploader (' + mb(file.size) + '). Please send a smaller/compressed copy, or contact us and we will get it from you directly.'
        : 'Upload failed (error ' + xhr.status + '). Please try again, or contact us with your file.'));
    };
    xhr.onerror = function () {
      console.error('R2 upload error: network');
      resolve(fail('Connection dropped while uploading. Please check your connection and try again, or contact us with your file.'));
    };
    xhr.ontimeout = function () {
      resolve(fail('The upload is taking too long. Please try again on a faster connection, or contact us and we will get your file directly.'));
    };
    xhr.send(file);
  });
}

/* ===== CHECKOUT DELIVERY DEADLINE LINE (2026-10-16) =====
   One line above Place Order: live countdown to the 9 PM ET cutoff and the delivery day it earns.
   Same rules as the top timer bar (getESTDate / DELIVERY_MAP). */
(function () {
  function nextDeliveryAfterCutoff(day) {
    var n = (day + 1) % 7;                       // order placed after cutoff counts for tomorrow
    return DELIVERY_MAP[n] || DELIVERY_MAP[0];   // Fri/Sat have no slot -> Sunday's (Tuesday)
  }
  function deadlineHtml() {
    if (typeof getESTDate !== 'function' || typeof DELIVERY_MAP === 'undefined') return '';
    var now = getESTDate(), day = now.getDay();
    var cut = new Date(now); cut.setHours(21, 0, 0, 0);
    var left = Math.floor((cut - now) / 1000);
    if (day === 5 || day === 6) return '⏰ Order by <strong>9 PM Sunday</strong> &rarr; ships Monday, delivers <strong>Tuesday</strong> (FedEx Overnight)';
    if (left <= 0) return '📦 Order now &rarr; delivers <strong>' + nextDeliveryAfterCutoff(day) + '</strong> (FedEx Overnight)';
    var h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60);
    var t = h > 0 ? h + 'h ' + m + 'm' : m + ' min';
    return '⏰ Order in the next <strong>' + t + '</strong> &rarr; delivers <strong>' + DELIVERY_MAP[day] + '</strong> (FedEx Overnight)';
  }
  function tick() {
    var btn = document.getElementById('place-order-btn');
    if (!btn) return;
    var el = document.getElementById('co-ship-deadline');
    if (!el) {
      el = document.createElement('div');
      el.id = 'co-ship-deadline';
      el.style.cssText = 'margin:0 0 10px;padding:9px 12px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;color:#065f46;font-size:14px;font-weight:600;line-height:1.35;text-align:center';
      btn.parentNode.insertBefore(el, btn);
    }
    var html = deadlineHtml();
    if (el.innerHTML !== html) el.innerHTML = html;
    el.style.display = html ? '' : 'none';
  }
  tick();
  setInterval(function () { var m = document.getElementById('checkout-modal'); if (m && m.classList.contains('active')) tick(); }, 20000);
  document.addEventListener('click', function () { setTimeout(tick, 400); }, true);
})();

/* ===== DESIGN HELP TEXT/CALL BOX (2026-10-19): "Need help?" box pinned to the bottom of the designer tools panel on all shared sites ===== */
(function(){
  function dsAddHelpBox(){
    var panel=document.getElementById('ds-tools-panel');
    if(!panel||document.getElementById('ds-help-box')) return;
    if(!document.getElementById('ds-help-box-css')){
      var st=document.createElement('style'); st.id='ds-help-box-css';
      st.textContent='#ds-help-box{flex-shrink:0;margin:6px 10px 10px;padding:8px 10px;background:#fffbea;border:1px solid #f3c45b;border-left:5px solid #f3c45b;border-radius:8px;font-size:12px;line-height:1.4;color:#141416}'
        +'#ds-help-box strong{display:block;font-size:12px;margin-bottom:2px}'
        +'#ds-help-box a{color:#d42020;font-weight:800;text-decoration:underline;white-space:nowrap}';
      document.head.appendChild(st);
    }
    var box=document.createElement('div'); box.id='ds-help-box';
    box.innerHTML='<strong>Need help with your design or having issues with the site?</strong>We can help. <a href="sms:+13474226637">Text</a> or <a href="tel:+13474226637">call (347) 422-6637</a>.';
    panel.appendChild(box);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',dsAddHelpBox); else dsAddHelpBox();
})();

// ===== SATURDAY FEE ONCE (2026-10-22): the product-page "Add Saturday Delivery" box already puts +$35 into the item price; the checkout box must not add it a second time =====
function cartHasSatDelivery(){
  try { return Array.isArray(cart) && cart.some(function(i){ return /Saturday Delivery/i.test(i.details||''); }); } catch(e){ return false; }
}
(function(){
  function satSyncCheckout(){
    var has=cartHasSatDelivery();
    var opt=document.getElementById('saturday-delivery-option');
    var cb=document.getElementById('saturday-delivery-cb');
    var row=document.getElementById('checkout-saturday-row');
    var note=document.getElementById('checkout-saturday-included');
    if(has){
      if(cb) cb.checked=false;
      if(opt) opt.style.display='none';
      if(row) row.style.display='none';
      if(!note && opt && opt.parentNode){
        note=document.createElement('div'); note.id='checkout-saturday-included';
        note.style.cssText='background:#ecfdf5;border:2px solid #34d399;border-radius:10px;padding:12px 14px;margin-bottom:20px;font-size:13px;color:#065f46;font-weight:700;line-height:1.4';
        note.innerHTML='✅ Saturday Delivery is already added to this order. The $35 is included in your item price above and is only charged once.';
        opt.parentNode.insertBefore(note,opt);
      }
      if(note) note.style.display='block';
    } else if(note){ note.style.display='none'; }
  }
  if(typeof openCheckoutModal==='function'){
    var _satOpen=openCheckoutModal;
    openCheckoutModal=function(){ var r=_satOpen.apply(this,arguments); satSyncCheckout(); if(typeof updateCheckoutTotal==='function') updateCheckoutTotal(); return r; };
  }
  if(typeof updateCheckoutTotal==='function'){
    var _satUpd=updateCheckoutTotal;
    updateCheckoutTotal=function(){ if(cartHasSatDelivery()){ var cb=document.getElementById('saturday-delivery-cb'); if(cb) cb.checked=false; } return _satUpd.apply(this,arguments); };
  }
  // cart +/- : the $35 is per shipment, not per unit, so keep it out of the unit price
  if(typeof cartChangeQty==='function'){
    cartChangeQty=function(id,delta){
      var item=cart.find(function(i){ return i.id===id; });
      if(!item) return;
      if(item.satFee==null && /Saturday Delivery/i.test(item.details||'')){
        item.satFee=35;
        var u=(item.unitPrice!=null?item.unitPrice:item.price);
        item.unitPrice=+Math.max(0,u-35).toFixed(2);
      }
      item.qty=Math.max(1,(item.qty||1)+delta);
      item.price=+((item.unitPrice!=null?item.unitPrice:item.price)*item.qty+(item.satFee||0)).toFixed(2);
      updateCartUI();
    };
  }
  // the older "Saturday Delivery Available Today!" box under the buttons never charged anything; the shipping-choice add-on replaced it
  function satHideLegacyPanels(){
    document.querySelectorAll('.sat-opt-panel').forEach(function(el){ el.classList.remove('visible'); el.style.display='none'; });
    document.querySelectorAll('.sat-opt-cb').forEach(function(cb){ cb.checked=false; });
  }
  if(typeof initSatDeliveryPanels==='function'){ initSatDeliveryPanels=function(){ satHideLegacyPanels(); try{ satDeliveryExtra=0; }catch(e){} }; }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',satHideLegacyPanels); else satHideLegacyPanels();
})();

;(function(){ var _u = updateCheckoutTotal; updateCheckoutTotal = function(){ var r = _u.apply(this, arguments); try { sqRefreshWallets(); } catch(e){} return r; }; })();
