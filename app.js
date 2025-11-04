// app.js - main site logic (products, cart, auth, conversion, checkout)

// ========== Product Data ==========
const PRODUCTS = [
  { id: 'p1', name: 'Nike Air Max 2025', brand: 'Nike', priceUSD: 120, image: 'images/nike.png', desc: 'High performance running shoe with modern cushioning.' },
  { id: 'p2', name: 'Essentials Hoodie', brand: 'Essentials', priceUSD: 55, image: 'images/essentials.png', desc: 'Comfortable oversized hoodie, original quality.' },
  { id: 'p3', name: 'Samsung Case', brand: 'Samsung', priceUSD: 10, image: 'images/samsungcase.png', desc: 'Protective case compatible with latest phones.' },
  { id: 'p4', name: 'Adidas Runner', brand: 'Adidas', priceUSD: 90, image: 'images/adidas.png', desc: 'Lightweight running shoe for daily use.' }
];

// ========== Utilities ==========
function $(sel){return document.querySelector(sel)}
function $all(sel){return document.querySelectorAll(sel)}

// ========== Cart (localStorage) ==========
function loadCart(){ return JSON.parse(localStorage.getItem('cart') || '[]') }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); updateCartCount(); }
function updateCartCount(){ const c = loadCart(); const count = c.reduce((s,i)=>s+i.qty,0); const el = $('#cart-count'); if(el) el.innerText = count; }

// Add product to cart
function addToCart(prod){
  const cart = loadCart();
  const idx = cart.findIndex(it => it.id === prod.id);
  if(idx >= 0) cart[idx].qty++;
  else cart.push({ id: prod.id, name: prod.name, priceUSD: prod.price, image: prod.image, qty: 1 });
  saveCart(cart);
  alert(`${prod.name} added to cart`);
}

// Simple buy now (requires login)
function buyNow(name){
  if(!isLoggedIn()){ alert('Please login to buy.'); window.location='login.html'; return; }
  // simulate Razorpay/COD choice prompt
  const proceed = confirm(`Proceed to payment for ${name}?`);
  if(!proceed) return;
  // generate fake payment
  const paymentId = 'PAY_' + Math.random().toString(36).slice(2,10).toUpperCase();
  alert(`Payment Successful ✅\nPayment ID: ${paymentId}\nThis is a simulated payment (demo).`);
}

// ========== Rendering (index/product) ==========
function renderProductsGrid(){
  const container = $('#products');
  if(!container) return;
  container.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
      <h3>${p.name}</h3>
      <p class="brand">${p.brand}</p>
      <p>USD: $${p.priceUSD}</p>
      <p class="inr">INR: ₹--</p>
      <div class="product-actions">
        <a class="btn" href="product${p.id.slice(1)}.html">View</a>
        <button class="btn" onclick="convertCard(this, ${p.priceUSD})">Convert</button>
        <button class="btn primary" onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.priceUSD,image:p.image})})'>Add to Cart</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// convert for grid card
async function convertCard(btn, usd){
  const currency = document.getElementById('currency')?.value || 'USD';
  const product = btn.closest('.card');
  try{
    const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=INR`);
    const data = await res.json();
    const rate = data.rates?.INR || 83.25;
    const price = (usd * rate).toFixed(2);
    product.querySelector('.inr').innerText = `INR: ₹${price} (Updated ${data.date || new Date().toISOString().split('T')[0]})`;
  }catch(e){
    console.error(e);
    product.querySelector('.inr').innerText = 'Error fetching rate';
  }
}

// convert on single product page (button passes itself)
async function convertSingle(btn){
  const currency = document.getElementById('currency')?.value || 'USD';
  const product = btn.closest('.product-detail');
  const usd = product.querySelector('.usd').dataset.usd;
  try{
    const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=INR`);
    const data = await res.json();
    const rate = data.rates?.INR || 83.25;
    const price = (usd * rate).toFixed(2);
    product.querySelector('.inr').innerText = `Price (INR): ₹${price} (Updated ${data.date|| new Date().toISOString().split('T')[0]})`;
  }catch(e){
    product.querySelector('.inr').innerText = 'Error fetching rate';
  }
}

// ========== Cart Page Rendering ==========
function renderCartPage(){
  const container = $('#cart-contents');
  if(!container) return;
  const cart = loadCart();
  if(cart.length === 0){ container.innerHTML = '<p>Your cart is empty.</p>'; $('#checkout').style.display='none'; return; }
  container.innerHTML = '';
  let totalINR = 0;
  cart.forEach(item=>{
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `
      <img src="${item.image}" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
      <div style="flex:1">
        <strong>${item.name}</strong>
        <p>USD: $${item.priceUSD || item.price}</p>
        <div class="qty-controls">
          <button class="btn" onclick="changeQty('${item.id}', -1)">-</button>
          <span style="padding:0 8px">${item.qty}</span>
          <button class="btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <div>
        <button class="btn" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    `;
    container.appendChild(row);
    totalINR += (item.priceUSD || item.price) * item.qty * 83.25; // rough INR until conversion
  });
  // show rough total, final conversion will happen on checkout
  $('#cart-total').innerText = '₹' + totalINR.toFixed(2);
  $('#checkout').style.display = 'block';
}

// change qty
function changeQty(id, delta){
  const cart = loadCart();
  const idx = cart.findIndex(c => c.id === id);
  if(idx<0) return;
  cart[idx].qty += delta;
  if(cart[idx].qty <= 0) cart.splice(idx,1);
  saveCart(cart);
  renderCartPage();
}

// remove
function removeFromCart(id){
  let cart = loadCart();
  cart = cart.filter(c=>c.id !== id);
  saveCart(cart);
  renderCartPage();
}

// checkout - final conversion & simulated payment
async function checkout(){
  if(!isLoggedIn()){ alert('Please login to checkout.'); window.location='login.html'; return; }
  const mode = document.getElementById('payment-mode').value;
  const cart = loadCart();
  if(cart.length === 0){ alert('Cart empty'); return; }
  // compute USD total
  const usdTotal = cart.reduce((s,i)=>s + (i.priceUSD || i.price) * i.qty, 0);
  try{
    const currency = 'USD';
    const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=INR`);
    const data = await res.json();
    const rate = data.rates?.INR || 83.25;
    const inrTotal = (usdTotal * rate).toFixed(2);
    if(mode === 'cod'){
      // create fake order
      const orderId = 'ORD_' + Math.random().toString(36).slice(2,9).toUpperCase();
      alert(`Order Placed (Cash on Delivery)\nOrder ID: ${orderId}\nAmount: ₹${inrTotal}`);
      // clear cart
      localStorage.removeItem('cart'); updateCartCount(); renderCartPage();
      return;
    } else {
      // simulate Razorpay
      const pay = confirm(`Proceed to Razorpay (simulated)\nPay ₹${inrTotal}?`);
      if(!pay) return;
      const paymentId = 'PAY_' + Math.random().toString(36).slice(2,10).toUpperCase();
      alert(`Payment Successful ✅\nPayment ID: ${paymentId}\nAmount: ₹${inrTotal}\n(This is a simulated payment).`);
      // clear cart
      localStorage.removeItem('cart'); updateCartCount(); renderCartPage();
      return;
    }
  }catch(e){
    console.error(e); alert('Payment failed due to API error. Try again.');
  }
}

// ========== Simple Auth (localStorage) ==========
function doSignup(){
  const name = $('#signupName').value.trim();
  const email = $('#signupEmail').value.trim().toLowerCase();
  const pass = $('#signupPass').value;
  if(!name || !email || !pass){ $('#signupMsg').innerText='Please fill all fields'; return; }
  const users = JSON.parse(localStorage.getItem('users')||'{}');
  if(users[email]){ $('#signupMsg').innerText='Account exists. Please login.'; return; }
  users[email] = { name, email, pass }; localStorage.setItem('users', JSON.stringify(users));
  sessionStorage.setItem('user', email);
  window.location='index.html';
}
function doLogin(){
  const email = $('#loginEmail').value.trim().toLowerCase();
  const pass = $('#loginPass').value;
  const users = JSON.parse(localStorage.getItem('users')||'{}');
  if(users[email] && users[email].pass === pass){ sessionStorage.setItem('user', email); window.location='index.html'; }
  else $('#loginMsg').innerText = 'Invalid credentials';
}
function isLoggedIn(){ return !!sessionStorage.getItem('user'); }
function restoreAccountLink(){
  const email = sessionStorage.getItem('user');
  const link = $('#acctLink');
  if(link){
    if(email){ link.href=''; link.innerText = email.split('@')[0] + ' (Logout)'; link.onclick = ()=>{ sessionStorage.removeItem('user'); window.location='index.html';}; }
    else { link.href='login.html'; link.innerText='Account'; }
  }
}

// ========== Admin area filler ==========
function renderAdmin(){
  const a = $('#admin-area'); if(!a) return;
  const cart = loadCart();
  a.innerHTML = `<h3>Inventory</h3><pre>${JSON.stringify(PRODUCTS, null, 2)}</pre><h3>Orders (Simulated)</h3><p>Cart stored in localStorage (demo):</p><pre>${JSON.stringify(cart, null, 2)}</pre>`;
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount();
  restoreAccountLink();
  // dark toggle
  const toggle = document.getElementById('darkToggle');
  if(toggle){
    toggle.addEventListener('click', ()=>{ document.body.classList.toggle('dark'); toggle.innerText = document.body.classList.contains('dark')?'☀️':'🌙'; });
  }
  // render index products
  renderProductsGrid();
  // render cart page and admin if present
  renderCartPage();
  renderAdmin();
});
