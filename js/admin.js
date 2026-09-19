(function () {
  const loginView = document.getElementById('loginView');
  const appView = document.getElementById('appView');
  const collectionsPanelEl = document.querySelector('.panel');
  const productsPanel = document.getElementById('productsPanel');

  let collections = [];
  let currentCollectionId = null;
  let pendingImages = []; // {file, dataUrl}

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }
    });
    if (res.status === 401) {
      showLogin();
      throw new Error('unauthorized');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'request failed');
    return data;
  }

  function showLogin() {
    loginView.hidden = false;
    appView.hidden = true;
  }
  function showApp() {
    loginView.hidden = true;
    appView.hidden = false;
  }

  async function checkSession() {
    try {
      await api('/api/admin/session');
      showApp();
      loadCollections();
    } catch {
      showLogin();
    }
  }

  document.getElementById('loginBtn').addEventListener('click', doLogin);
  document.getElementById('loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });

  async function doLogin() {
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    errEl.textContent = '';
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
      showApp();
      loadCollections();
    } catch (e) {
      errEl.textContent = 'Incorrect password';
    }
  }

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => {});
    showLogin();
  });

  // ---------- Collections ----------

  document.getElementById('collectionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('collectionFormStatus');
    const name = document.getElementById('cName').value.trim();
    const season = document.getElementById('cSeason').value.trim();
    const description = document.getElementById('cDescription').value.trim();
    if (!name) return;
    status.textContent = 'Saving...';
    try {
      await api('/api/admin/collections', {
        method: 'POST',
        body: JSON.stringify({ name, season: season || null, description: description || null })
      });
      document.getElementById('collectionForm').reset();
      status.textContent = 'Added successfully';
      loadCollections();
      setTimeout(() => (status.textContent = ''), 2000);
    } catch (err) {
      status.textContent = 'Error: ' + err.message;
    }
  });

  async function loadCollections() {
    const { collections: data } = await api('/api/admin/collections');
    collections = data;
    renderCollectionsTable();
  }

  function renderCollectionsTable() {
    const el = document.getElementById('collectionsTable');
    if (!collections.length) {
      el.innerHTML = '<div class="empty-hint">No collections yet. Add one above.</div>';
      return;
    }
    el.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Name</th><th>Season</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${collections
            .map(
              (c) => `
            <tr>
              <td>${escapeHtml(c.name)}</td>
              <td>${escapeHtml(c.season || '—')}</td>
              <td><span class="badge ${c.is_active ? 'active' : 'inactive'}">${c.is_active ? 'Active' : 'Hidden'}</span></td>
              <td>
                <div class="row-actions">
                  <button data-products="${c.id}">Products</button>
                  <button data-edit-col="${c.id}">Edit</button>
                  <button data-toggle-col="${c.id}">${c.is_active ? 'Hide' : 'Show'}</button>
                  <button class="danger" data-delete-col="${c.id}">Delete</button>
                </div>
              </td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>`;

    el.querySelectorAll('[data-products]').forEach((b) => b.addEventListener('click', () => openProducts(b.dataset.products)));
    el.querySelectorAll('[data-edit-col]').forEach((b) => b.addEventListener('click', () => editCollection(b.dataset.editCol)));
    el.querySelectorAll('[data-toggle-col]').forEach((b) => b.addEventListener('click', () => toggleCollection(b.dataset.toggleCol)));
    el.querySelectorAll('[data-delete-col]').forEach((b) => b.addEventListener('click', () => deleteCollection(b.dataset.deleteCol)));
  }

  async function editCollection(id) {
    const c = collections.find((x) => x.id === id);
    if (!c) return;
    const name = prompt('Collection name:', c.name);
    if (name === null) return;
    const season = prompt('Season:', c.season || '');
    if (season === null) return;
    const description = prompt('Description:', c.description || '');
    if (description === null) return;
    await api(`/api/admin/collections?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, season, description })
    });
    loadCollections();
  }

  async function toggleCollection(id) {
    const c = collections.find((x) => x.id === id);
    if (!c) return;
    await api(`/api/admin/collections?id=${id}`, { method: 'PUT', body: JSON.stringify({ is_active: !c.is_active }) });
    loadCollections();
  }

  async function deleteCollection(id) {
    if (!confirm('Delete this collection and all its products? This cannot be undone.')) return;
    await api(`/api/admin/collections?id=${id}`, { method: 'DELETE' });
    loadCollections();
  }

  // ---------- Products ----------

  document.getElementById('backToCollectionsBtn').addEventListener('click', () => {
    productsPanel.hidden = true;
    currentCollectionId = null;
  });

  async function openProducts(collectionId) {
    currentCollectionId = collectionId;
    const c = collections.find((x) => x.id === collectionId);
    document.getElementById('productsTitle').textContent = `Products · ${c ? c.name : ''}`;
    productsPanel.hidden = false;
    productsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    resetProductForm();
    loadProducts();
  }

  function resetProductForm() {
    document.getElementById('productForm').reset();
    pendingImages = [];
    document.getElementById('pImagePreview').innerHTML = '';
  }

  document.getElementById('pImages').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    const preview = document.getElementById('pImagePreview');
    for (const file of files) {
      const resized = await resizeImage(file);
      pendingImages.push(resized);
      const img = document.createElement('img');
      img.src = resized.dataUrl;
      preview.appendChild(img);
    }
  });

  function resizeImage(file, maxDim = 1600, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const scale = maxDim / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ dataUrl, filename: (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg', contentType: 'image/jpeg' });
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentCollectionId) return;
    const status = document.getElementById('productFormStatus');
    const btn = document.getElementById('pSubmitBtn');
    const name = document.getElementById('pName').value.trim();
    const description = document.getElementById('pDescription').value.trim();
    const priceInput = parseFloat(document.getElementById('pPrice').value);
    const currency = document.getElementById('pCurrency').value;
    if (!name || !Number.isFinite(priceInput)) return;

    btn.disabled = true;
    try {
      status.textContent = pendingImages.length ? `Uploading ${pendingImages.length} photo(s)...` : 'Saving...';
      const imageUrls = [];
      for (const img of pendingImages) {
        const base64 = img.dataUrl.split(',')[1];
        const { url } = await api('/api/admin/upload-image', {
          method: 'POST',
          body: JSON.stringify({ filename: img.filename, contentType: img.contentType, dataBase64: base64 })
        });
        imageUrls.push(url);
      }

      status.textContent = 'Saving product...';
      await api('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          collection_id: currentCollectionId,
          name,
          description: description || null,
          price_cents: Math.round(priceInput * 100),
          currency,
          image_urls: imageUrls
        })
      });

      status.textContent = 'Added successfully ✓';
      resetProductForm();
      loadProducts();
      setTimeout(() => (status.textContent = ''), 2000);
    } catch (err) {
      status.textContent = 'Error: ' + err.message;
    } finally {
      btn.disabled = false;
    }
  });

  async function loadProducts() {
    const { products } = await api(`/api/admin/products?collection_id=${currentCollectionId}`);
    renderProductsTable(products);
  }

  function renderProductsTable(products) {
    const el = document.getElementById('productsTable');
    if (!products.length) {
      el.innerHTML = '<div class="empty-hint">No products in this collection yet.</div>';
      return;
    }
    el.innerHTML = `
      <table class="data-table">
        <thead><tr><th></th><th>Name</th><th>Price</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${products
            .map((p) => {
              const img = (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order)[0];
              return `
              <tr>
                <td>${img ? `<img class="thumb" src="${img.url}">` : ''}</td>
                <td>${escapeHtml(p.name)}</td>
                <td>${(p.price_cents / 100).toFixed(2)} ${p.currency.toUpperCase()}</td>
                <td><span class="badge ${p.is_active ? 'active' : 'inactive'}">${p.is_active ? 'Active' : 'Hidden'}</span></td>
                <td>
                  <div class="row-actions">
                    <button data-edit-prod="${p.id}">Edit</button>
                    <button data-toggle-prod="${p.id}">${p.is_active ? 'Hide' : 'Show'}</button>
                    <button class="danger" data-delete-prod="${p.id}">Delete</button>
                  </div>
                </td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>`;

    el.querySelectorAll('[data-edit-prod]').forEach((b) => b.addEventListener('click', () => editProduct(b.dataset.editProd, products)));
    el.querySelectorAll('[data-toggle-prod]').forEach((b) => b.addEventListener('click', () => toggleProduct(b.dataset.toggleProd, products)));
    el.querySelectorAll('[data-delete-prod]').forEach((b) => b.addEventListener('click', () => deleteProduct(b.dataset.deleteProd)));
  }

  async function editProduct(id, products) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const name = prompt('Product name:', p.name);
    if (name === null) return;
    const priceStr = prompt('Price:', (p.price_cents / 100).toFixed(2));
    if (priceStr === null) return;
    const price = parseFloat(priceStr);
    if (!Number.isFinite(price)) return;
    await api(`/api/admin/products?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, price_cents: Math.round(price * 100) })
    });
    loadProducts();
  }

  async function toggleProduct(id, products) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    await api(`/api/admin/products?id=${id}`, { method: 'PUT', body: JSON.stringify({ is_active: !p.is_active }) });
    loadProducts();
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    await api(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    loadProducts();
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  checkSession();
})();
