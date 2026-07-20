require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { allowedOrigins } = require('./sites');

const app = express();

app.use(cors({ origin: allowedOrigins }));

// Stripe webhooks need raw body — must come BEFORE express.json()
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/upload',   require('./routes/upload'));
app.use('/checkout', require('./routes/checkout'));
app.use('/webhook',  require('./routes/webhook'));
app.use('/admin',    require('./routes/admin'));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
