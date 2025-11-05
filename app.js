// app.js - products, product page, conversions, add-to-cart (FIXED)

let PRODUCTS = [];

// fetch products.json and render grid
async function fetchProducts(){
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('products.json fetch failed: ' + res.status);
    PRODUCTS = await res.json();
  } catch(e){
    console.error('Failed to load products.json', e);
    PRODUCTS = [];
  }
}

// render products on index
async function renderProductsGrid(){
  await fetchProducts();
  const container = document.getElementById('products');
  if(!container) return; // Only run on index.html
  container.innerHTML = '';

  if (PRODUCTS.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Error: Could not load products. Check console.</p>';
    return;
  }

  PRODUCTS.forEach(p=>{
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x400?text=${encodeURIComponent(p.brand)}'">
      <h3>${p.name}</h3>
      <p class="brand">${p.brand}</p>
      <p>USD: $${p.priceUSD}</p>
      <p class="inr">INR: ₹--</p>
      <div class="product-actions">
        <a class="btn" href="product.html?id=${p.id}">View</a>
        <button class="btn" onclick="convertCard(this, ${p.priceUSD})">Convert</button>
        <button class="btn primary" onclick='addToCart("${p.id}")'>Add to Cart</button>
      </div>
    `;
    container.appendChild(card);
  });

  // listen to search event from common.js
  window.addEventListener('productSearch', (e)=>{
    const q = e.detail;
    filterProducts(q);
  });
}

// filter products by query
function filterProducts(q){
  const container = document.getElementById('products');
  if(!container) return;
  container.innerHTML = '';

  const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  const productsToShow = q ? filtered : PRODUCTS;

  if(productsToShow.length === 0) {
    container.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">No products found matching your search.</p>';
    return;
  }

  productsToShow.forEach(p=>{
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x400?text=${encodeURIComponent(p.brand)}'">
      <h3>${p.name}</h3>
      <p class="brand">${p.brand}</p>
      <p>USD: $${p.priceUSD}</p>
      <p class="inr">INR: ₹--</p>
      <div class="product-actions">
        <a class="btn" href="product.html?id=${p.id}">View</a>
        <button class="btn" onclick="convertCard(this, ${p.priceUSD})">Convert</button>
        <button class="btn primary" onclick='addToCart("${p.id}")'>Add to Cart</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// convert for grid card
async function convertCard(btn, usd){
  const currency = document.getElementById('currency')?.value || 'USD';
  const product = btn.closest('.card');
  const originalText = btn.innerText;
  btn.innerText = '...';
  btn.disabled = true;
  try{
    const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=INR`);
    const data = await res.json();
    const rate = data.rates?.INR || 83.25;
    const price = (usd * rate).toFixed(2);
    product.querySelector('.inr').innerText = `INR: ₹${price}`;
  }catch(e){
    console.error(e);
    product.querySelector('.inr').innerText = 'Error fetching rate';
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

// product page render
async function renderProductPage(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id) return; // Not on product page
  if(PRODUCTS.length === 0) await fetchProducts();
  const p = PRODUCTS.find(x => x.id === id);
  const container = document.getElementById('product-detail');
  if(!p || !container) { if(container) container.innerHTML = '<p>Product not found</p>'; return; }

  container.innerHTML = `
    <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x400?text=${encodeURIComponent(p.brand)}'">
    <div class="product-info">
      <h2>${p.name}</h2>
      <p class="brand">Brand: ${p.brand}</p>
      <p>Price (USD): <span class="usd" data-usd="${p.priceUSD}">$${p.priceUSD}</span></p>
      <p class="inr">Price (INR): ₹--</p>
      <div class="product-actions">
        <button class="btn" onclick="convertSingle(this)">Convert to INR</button>
        <button class="btn primary" onclick='addToCart("${p.id}")'>Add To Cart</button>
        <button class="btn" onclick='startPayment("${p.id}")'>Buy Now</button>
      </div>
      <h3>Description</h3>
      <p>${p.desc}</p>
    </div>
  `;
}

// convert on single product
async function convertSingle(btn){
  const currency = document.getElementById('currency')?.value || 'USD';
  const product = btn.closest('.product-detail');
  const usd = parseFloat(product.querySelector('.usd').dataset.usd);
  const originalText = btn.innerText;
  btn.innerText = '...';
  btn.disabled = true;
  try{
    const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=INR`);
    const data = await res.json();
    const rate = data.rates?.INR || 83.25;
    const price = (usd * rate).toFixed(2);
    product.querySelector('.inr').innerText = `Price (INR): ₹${price}`;
  }catch(e){
    product.querySelector('.inr').innerText = 'Error fetching rate';
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

// Add to cart by product id
function addToCart(id){
  if(!id) return alert('Invalid product');
  if(PRODUCTS.length === 0) {
    alert('Products still loading, please wait a moment.');
    return;
  }
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return alert('Product not found');
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  const idx = cart.findIndex(i => i.id === id);
  if(idx >= 0) cart[idx].qty += 1;
  else cart.push({ id: p.id, name: p.name, price: p.priceUSD, image: p.image, qty: 1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  // updateCartCount() is in common.js
  if (typeof updateCartCount === 'function') updateCartCount();
  alert(`${p.name} added to cart`);
}

// buy now (redirects to payment using startPayment)
function startPayment(productId){
  if(!sessionStorage.getItem('user')){ alert('Please login to buy.'); window.location='login.html'; return; }
  if(PRODUCTS.length === 0) { alert('Products loading, wait'); return; }
  const p = PRODUCTS.find(x=>x.id===productId);
  if(!p) return alert('Product not found');
  // For now we call startPaymentFlow which will handle payment (see payment section)
  if (typeof startPaymentFlow === 'function') {
    startPaymentFlow(p);
  } else {
    alert('Payment not configured yet.');
  }
}

// init on page load
document.addEventListener('DOMContentLoaded', async ()=>{
  if(document.getElementById('products')) await renderProductsGrid();
  if(document.getElementById('product-detail')) await renderProductPage();
});
