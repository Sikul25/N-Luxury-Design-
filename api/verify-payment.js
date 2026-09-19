const { serviceClient } = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const sessionId = req.query.session_id;
  if (!sessionId) {
    res.status(400).json({ error: 'session_id is required' });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(503).json({ error: 'Stripe is not configured' });
    return;
  }

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${secret}` }
    });
    const session = await response.json();
    if (!response.ok) {
      res.status(502).json({ error: 'Could not verify payment' });
      return;
    }

    const paid = session.payment_status === 'paid';
    const supabase = serviceClient();
    if (paid) {
      await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('stripe_session_id', sessionId);
    }

    res.status(200).json({ paid, email: session.customer_details?.email || null });
  } catch (err) {
    res.status(500).json({ error: 'Verification service error' });
  }
};
