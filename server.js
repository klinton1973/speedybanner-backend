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
  app.get('/square-test', (req, res) => res.sendFile(require('path').join(__dirname, 'test', 'square-sandbox.html')));
}

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
