require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

// Log every incoming request so we can see if Railway receives anything
app.use((req, res, next) => {
  console.log(`[req] ${req.method} ${req.path} origin:${req.headers.origin || 'none'}`);
  next();
});

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
