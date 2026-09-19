const crypto = require('crypto');
const { createSessionToken, setSessionCookie } = require('../_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD || '';

  if (!password || !expected) {
    res.status(401).json({ error: 'invalid credentials' });
    return;
  }

  const a = Buffer.from(String(password));
  const b = Buffer.from(expected);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!match) {
    res.status(401).json({ error: 'invalid credentials' });
    return;
  }

  setSessionCookie(res, createSessionToken());
  res.status(200).json({ ok: true });
};
