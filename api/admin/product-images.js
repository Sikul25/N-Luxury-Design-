const { requireAdmin } = require('../_auth');
const { serviceClient } = require('../_supabase');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const supabase = serviceClient();

  if (req.method === 'POST') {
    const { product_id, url, sort_order } = req.body || {};
    if (!product_id || !url) return res.status(400).json({ error: 'product_id and url are required' });
    const { data, error } = await supabase
      .from('product_images')
      .insert({ product_id, url, sort_order: Number.isFinite(sort_order) ? sort_order : 0 })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ image: data });
  }

  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const { error } = await supabase.from('product_images').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'method not allowed' });
};
