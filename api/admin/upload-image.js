const crypto = require('crypto');
const { requireAdmin } = require('../_auth');
const { serviceClient } = require('../_supabase');

const BUCKET = 'product-images';

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { filename, contentType, dataBase64 } = req.body || {};
  if (!filename || !contentType || !dataBase64) {
    res.status(400).json({ error: 'filename, contentType and dataBase64 are required' });
    return;
  }

  const buffer = Buffer.from(dataBase64, 'base64');
  const ext = (filename.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;

  const supabase = serviceClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false
  });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  res.status(200).json({ url: data.publicUrl });
};

module.exports.config = {
  api: {
    bodyParser: { sizeLimit: '8mb' }
  }
};
