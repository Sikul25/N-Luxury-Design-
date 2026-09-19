const { requireAdmin } = require('../_auth');
const { serviceClient } = require('../_supabase');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9֐-׿]+/g, '-')
    .replace(/^-+|-+$/g, '') || `collection-${Date.now()}`;
}

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const supabase = serviceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ collections: data });
  }

  if (req.method === 'POST') {
    const { name, season, description, cover_image_url, sort_order, is_active } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    const slug = slugify(req.body.slug || name);
    const { data, error } = await supabase
      .from('collections')
      .insert({
        slug,
        name,
        season: season || null,
        description: description || null,
        cover_image_url: cover_image_url || null,
        sort_order: Number.isFinite(sort_order) ? sort_order : 0,
        is_active: is_active !== false
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ collection: data });
  }

  if (req.method === 'PUT') {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const fields = ['name', 'season', 'description', 'cover_image_url', 'sort_order', 'is_active', 'slug'];
    const update = {};
    for (const f of fields) {
      if (req.body && req.body[f] !== undefined) update[f] = req.body[f];
    }
    update.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('collections').update(update).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ collection: data });
  }

  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'method not allowed' });
};
