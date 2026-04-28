const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Simple password auth middleware
function requireAdmin(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(requireAdmin);

// GET /admin/orders?status=paid&limit=50
router.get('/orders', async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /admin/orders/:id
router.get('/orders/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Order not found' });
  res.json(data);
});

// PATCH /admin/orders/:id
// Body: { status } — e.g. 'printing', 'shipped', 'delivered'
router.patch('/orders/:id', async (req, res) => {
  const { status, tracking_number } = req.body;
  const allowed = ['pending', 'paid', 'printing', 'shipped', 'delivered', 'refunded'];

  if (status && !allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }

  const updates = {};
  if (status) updates.status = status;
  if (tracking_number) updates.tracking_number = tracking_number;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
