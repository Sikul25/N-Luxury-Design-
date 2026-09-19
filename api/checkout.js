const { serviceClient } = require('./_supabase');

const LOCALE_BY_LANG = { en: 'en', ru: 'ru', fr: 'fr', es: 'es', it: 'it' };

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { items, email, lang } = req.body || {};
  if (!Array.isArray(items) || !items.length) {
    res.status(400).json({ error: 'items are required' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(503).json({ error: 'Stripe is not configured yet' });
    return;
  }

  const ids = [...new Set(items.map((i) => i.product_id).filter(Boolean))];
  if (!ids.length) {
    res.status(400).json({ error: 'no valid product ids' });
    return;
  }

  const supabase = serviceClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price_cents, currency, is_active')
    .in('id', ids);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const lineItems = [];
  for (const it of items) {
    const p = byId[it.product_id];
    if (!p || !p.is_active) continue;
    const qty = Math.max(1, Math.min(10, Number(it.quantity) || 1));
    lineItems.push({ product: p, quantity: qty });
  }
  if (!lineItems.length) {
    res.status(400).json({ error: 'no purchasable items' });
    return;
  }

  const currency = lineItems[0].product.currency || 'eur';
  const stripeLocale = LOCALE_BY_LANG[lang] || 'auto';
  const origin = req.headers.origin || `https://${req.headers.host}`;

  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('locale', stripeLocale);
  body.set('success_url', `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  body.set('cancel_url', `${origin}/?payment=cancelled`);
  if (email) {
    body.set('customer_email', String(email).slice(0, 200));
  }
  lineItems.forEach((li, idx) => {
    body.set(`line_items[${idx}][price_data][currency]`, currency);
    body.set(`line_items[${idx}][price_data][product_data][name]`, li.product.name);
    body.set(`line_items[${idx}][price_data][unit_amount]`, String(li.product.price_cents));
    body.set(`line_items[${idx}][quantity]`, String(li.quantity));
  });
  body.set(
    'metadata[items]',
    JSON.stringify(lineItems.map((li) => ({ id: li.product.id, qty: li.quantity }))).slice(0, 500)
  );

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const data = await response.json();
    if (!response.ok || !data.url) {
      res.status(502).json({ error: 'Stripe checkout failed' });
      return;
    }

    const amount = lineItems.reduce((sum, li) => sum + li.product.price_cents * li.quantity, 0);
    await supabase.from('orders').insert({
      stripe_session_id: data.id,
      customer_email: email || null,
      items: lineItems.map((li) => ({ id: li.product.id, name: li.product.name, qty: li.quantity })),
      amount_cents: amount,
      currency,
      status: 'pending'
    });

    res.status(200).json({ url: data.url });
  } catch (err) {
    res.status(500).json({ error: 'Checkout service error' });
  }
};
