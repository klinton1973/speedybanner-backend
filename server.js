require('dotenv').config();
if (process.env.ALLOW_LOCAL_TEST === '1') require('./lib/local-test-stubs'); // must run before any route loads
const express = require('express');
const cors = require('cors');

const { allowedOrigins } = require('./sites');

const app = express();

app.use(cors({ origin: allowedOrigins }));

// Stripe webhooks need raw body — must come BEFORE express.json()
app.use('/webhook', express.raw({ type: 'application/json' }));
// Default 100kb is too small for MailerSend's inbound webhook payloads,
// which include the full raw email (headers, HTML, base64 attachments).
app.use(express.json({ limit: '10mb' }));

app.use('/upload',   require('./routes/upload'));
app.use('/checkout', require('./routes/checkout'));
app.use('/checkout', require('./routes/square'));       // Square checkout (inert until SQUARE_* env vars are set)
app.use('/webhook/square', require('./routes/square-webhook'));
app.use('/webhook',  require('./routes/webhook'));
app.use('/admin',    require('./routes/admin'));
const trackingRouter = require('./routes/tracking');
app.use('/tracking', trackingRouter);
// Background workers email real customers. Never start them in local test mode, so a test
// run against the live database cannot send reminders or digests.
if (process.env.ALLOW_LOCAL_TEST !== '1') {
  trackingRouter.startUnmatchedTrackingWorker();
  require('./routes/abandoned').startAbandonedCheckoutWorker();
}

// Local sandbox test page — only served when you run the server yourself with ALLOW_LOCAL_TEST=1.
if (process.env.ALLOW_LOCAL_TEST === '1') {
  app.use('/store-test', express.static(require('path').join(__dirname, 'storefront-square-test'), { index: 'index.html' }));
  // Test copy only: pull images/fonts the page asks for (e.g. /images/...) from the live site so it looks right.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || !/\/store-test\//.test(req.headers.referer || '')) return next();
    if (/^\/(checkout|upload|webhook|admin|tracking|store-test|square-test)/.test(req.path)) return next();
    fetch('https://speedybanner.com' + req.originalUrl).then(async r => {
      res.status(r.status); const ct = r.headers.get('content-type'); if (ct) res.type(ct);
      res.send(Buffer.from(await r.arrayBuffer()));
    }).catch(() => next());
  });
  app.get('/square-test', (req, res) => res.sendFile(require('path').join(__dirname, 'test', 'square-sandbox.html')));
}

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
