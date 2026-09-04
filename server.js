require('dotenv').config();
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
app.use('/webhook',  require('./routes/webhook'));
app.use('/admin',    require('./routes/admin'));
app.use('/tracking', require('./routes/tracking'));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
