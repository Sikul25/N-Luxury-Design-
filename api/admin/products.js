const { requireAdmin } = require('../_auth');
const { serviceClient } = require('../_supabase');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const supabase = serviceClient();

  if (req.method === 'GET') {
    const { collection_id } = req.query;
    let query = supabase
      .from('products')
      .select('*, product_images(id, url, sort_order)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (collection_id) query = query.eq('collection_id', collection_id);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ products: data });
  }

  if (req.method === 'POST') {
    const { collection_id, name, description, price_cents, currency, sku, sort_order, is_active, image_urls } =
      req.body || {};
    if (!collection_id || !name || !Number.isFinite(price_cents)) {
      return res.status(400).json({ error: 'collection_id, name and price_cents are required' });
    }
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        collection_id,
        name,
        description: description || null,
        price_cents,
        currency: currency || 'eur',
        sku: sku || null,
        sort_order: Number.isFinite(sort_order) ? sort_order : 0,
        is_active: is_active !== false
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });

    if (Array.isArray(image_urls) && image_urls.length) {
      const rows = image_urls.map((url, i) => ({ product_id: product.id, url, sort_order: i }));
      const { error: imgErr } = await supabase.from('product_images').insert(rows);
      if (imgErr) return res.status(500).json({ error: imgErr.message });
    }

    return res.status(201).json({ product });
  }

  if (req.method === 'PUT') {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const fields = ['name', 'description', 'price_cents', 'currency', 'sku', 'sort_order', 'is_active', 'collection_id'];
    const update = {};
    for (const f of fields) {
      if (req.body && req.body[f] !== undefined) update[f] = req.body[f];
    }
    update.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('products').update(update).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ product: data });
  }

  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'method not allowed' });
};
