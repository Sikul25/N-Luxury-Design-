(function () {
  const sb = window.nluxSupabase;
  const i18n = window.nluxI18n;
  const CART_KEY = 'nlux_cart';

  let collections = [];
  let products = [];
  let cart = loadCart();

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
    renderCart();
  }

  function money(cents, currency) {
    try {
      return new Intl.NumberFormat(i18n.getLang(), { style: 'currency', currency: (currency || 'eur').toUpperCase() }).format(
        cents / 100
      );
    } catch {
      return `${(cents / 100).toFixed(2)} ${(currency || 'eur').toUpperCase()}`;
    }
  }

  function productImage(p) {
    const imgs = (p.product_images || []).slice().sort((a, b) => a.sort_order - b.sort_order);
    return imgs[0]?.url || '';
  }

  async function loadData() {
    const [{ data: cols }, { data: prods }] = await Promise.all([
      sb.from('collections').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      sb
        .from('products')
        .select('*, product_images(id, url, sort_order)')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
    ]);
    collections = cols || [];
    products = prods || [];
    renderCollectionsNav();
    renderCollections();
  }

  function renderCollectionsNav() {
    const nav = document.getElementById('collectionsNav');
    if (!collections.length) {
      nav.innerHTML = '';
      return;
    }
    nav.innerHTML = collections
      .map((c) => `<button data-scroll="${c.id}">${escapeHtml(c.name)}</button>`)
      .join('');
    nav.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById(`col-${btn.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function renderCollections() {
    const list = document.getElementById('collectionsList');
    if (!collections.length) {
      list.innerHTML = `<p style="text-align:center;color:var(--muted)" data-i18n="collections.empty">${i18n.t('collections.empty')}</p>`;
      return;
    }
    list.innerHTML = collections
      .map((c) => {
        const items = products.filter((p) => p.collection_id === c.id);
        if (!items.length) return '';
        return `
        <div class="collection-block" id="col-${c.id}">
          <div class="collection-header">
            ${c.season ? `<div class="season">${escapeHtml(c.season)}</div>` : ''}
            <h3>${escapeHtml(c.name)}</h3>
          </div>
          ${c.description ? `<p class="collection-desc">${escapeHtml(c.description)}</p>` : ''}
          <div class="product-grid">
            ${items.map(productCardHtml).join('')}
          </div>
        </div>`;
      })
      .join('');
    list.querySelectorAll('[data-add]').forEach((btn) => {
      btn.addEventListener('click', () => addToCart(btn.dataset.add));
    });
    list.querySelectorAll('[data-buy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        addToCart(btn.dataset.buy);
        openCart();
      });
    });
  }

  function productCardHtml(p) {
    const img = productImage(p);
    return `
    <div class="product-card">
      <div class="product-media">${img ? `<img src="${img}" alt="${escapeHtml(p.name)}" loading="lazy">` : ''}</div>
      <div class="product-body">
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-price">${money(p.price_cents, p.currency)}</div>
        <div class="product-actions">
          <button class="btn-outline" data-add="${p.id}" data-i18n="product.addToCart">${i18n.t('product.addToCart')}</button>
          <button class="btn-outline" data-buy="${p.id}" data-i18n="product.buyNow">${i18n.t('product.buyNow')}</button>
        </div>
      </div>
    </div>`;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function addToCart(productId) {
    const existing = cart.find((i) => i.id === productId);
    if (existing) existing.qty += 1;
    else cart.push({ id: productId, qty: 1 });
    saveCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter((i) => i.id !== productId);
    saveCart();
  }

  function cartProduct(id) {
    return products.find((p) => p.id === id);
  }

  function renderCart() {
    document.getElementById('cartCount').textContent = cart.reduce((n, i) => n + i.qty, 0);
    const itemsEl = document.getElementById('cartItems');
    const footEl = document.getElementById('cartFoot');

    const rows = cart
      .map((i) => ({ ...i, product: cartProduct(i.id) }))
      .filter((i) => i.product);

    if (!rows.length) {
      itemsEl.innerHTML = `<div class="cart-empty" data-i18n="cart.empty">${i18n.t('cart.empty')}</div>`;
      footEl.innerHTML = '';
      return;
    }

    itemsEl.innerHTML = rows
      .map(
        (i) => `
      <div class="cart-item">
        <img src="${productImage(i.product)}" alt="">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(i.product.name)} ${i.qty > 1 ? `× ${i.qty}` : ''}</div>
          <div class="cart-item-price">${money(i.product.price_cents * i.qty, i.product.currency)}</div>
          <button class="cart-item-remove" data-remove="${i.id}" data-i18n="cart.remove">${i18n.t('cart.remove')}</button>
        </div>
      </div>`
      )
      .join('');

    itemsEl.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
    });

    const total = rows.reduce((sum, i) => sum + i.product.price_cents * i.qty, 0);
    const currency = rows[0].product.currency;

    footEl.innerHTML = `
      <div class="cart-total-row"><span data-i18n="cart.total">${i18n.t('cart.total')}</span><span>${money(total, currency)}</span></div>
      <input type="email" class="cart-email" id="cartEmail" placeholder="${i18n.t('checkout.emailPlaceholder')}" data-i18n-placeholder="checkout.emailPlaceholder">
      <button class="cart-checkout-btn" id="checkoutBtn" data-i18n="checkout.pay">${i18n.t('checkout.pay')}</button>
    `;
    document.getElementById('checkoutBtn').addEventListener('click', startCheckout);
  }

  async function startCheckout() {
    const btn = document.getElementById('checkoutBtn');
    const email = document.getElementById('cartEmail').value.trim();
    btn.disabled = true;
    btn.textContent = i18n.t('checkout.processing');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({ product_id: i.id, quantity: i.qty })),
          email: email || undefined,
          lang: i18n.getLang()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'checkout failed');
      window.location.href = data.url;
    } catch (err) {
      alert(i18n.t('checkout.error'));
      btn.disabled = false;
      btn.textContent = i18n.t('checkout.pay');
    }
  }

  function openCart() {
    document.getElementById('cartOverlay').classList.add('open');
    document.getElementById('cartDrawer').classList.add('open');
  }
  function closeCart() {
    document.getElementById('cartOverlay').classList.remove('open');
    document.getElementById('cartDrawer').classList.remove('open');
  }

  function setupLangSelect() {
    const sel = document.getElementById('langSelect');
    sel.innerHTML = i18n.LANGS.map((l) => `<option value="${l.code}">${l.label}</option>`).join('');
    sel.value = i18n.getLang();
    sel.addEventListener('change', () => i18n.setLang(sel.value));
    document.addEventListener('nlux:langchange', () => {
      renderCollectionsNav();
      renderCollections();
      renderCart();
    });
  }

  function handlePaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment');
    if (!status) return;

    const main = document.querySelector('main');
    const banner = document.createElement('div');
    banner.className = 'payment-banner';

    if (status === 'success') {
      const sessionId = params.get('session_id');
      banner.innerHTML = `<h2>${i18n.t('payment.successTitle')}</h2><p>${i18n.t('payment.successBody')}</p><button class="btn-primary" id="backBtn">${i18n.t('payment.back')}</button>`;
      cart = [];
      saveCart();
      if (sessionId) fetch(`/api/verify-payment?session_id=${encodeURIComponent(sessionId)}`).catch(() => {});
    } else {
      banner.innerHTML = `<h2>${i18n.t('payment.cancelledTitle')}</h2><p>${i18n.t('payment.cancelledBody')}</p><button class="btn-primary" id="backBtn">${i18n.t('payment.back')}</button>`;
    }

    main.prepend(banner);
    banner.querySelector('#backBtn').addEventListener('click', () => {
      window.history.replaceState({}, '', window.location.pathname);
      banner.remove();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    setupLangSelect();
    document.getElementById('cartOpenBtn').addEventListener('click', openCart);
    document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
    document.getElementById('cartOverlay').addEventListener('click', closeCart);
    document.getElementById('heroCta').addEventListener('click', () => {
      document.getElementById('collections').scrollIntoView({ behavior: 'smooth' });
    });
    renderCart();
    handlePaymentReturn();
    loadData();
  });
})();
