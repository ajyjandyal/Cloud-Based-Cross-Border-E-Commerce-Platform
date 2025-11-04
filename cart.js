// cart.js - render cart page and handle checkout

let cart = [];
let exchangeRate = 83.25;

async function renderCart(){
  cart = JSON.parse(localStorage.getItem('cart')||'[]');
  const cartContainer = document.getElementById('cart-items-container');
  const summaryContainer = document.getElementById('cart-summary-container');
  if(!cartContainer) return;

  if(cart.length === 0){
    cartContainer.innerHTML = '<p id="empty-cart-msg">Your cart is empty. <a href="index.html">Go shopping!</a></p>';
    summaryContainer.style.display = 'none';
    updateCartCount();
    return;
  }

  // get exchange rate
  try{
    const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=INR');
    const data = await res.json();
    exchangeRate = data.rates?.INR || 83.25;
  }catch(e){ console.error(e); }

  cartContainer.innerHTML = '';
  summaryContainer.style.display = 'block';
  let subtotalUSD = 0;

  cart.forEach(item => {
    subtotalUSD += item.price * item.qty;
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/100x100/e0e0e0/777?text=Image+Missing'">
      <div style="flex:1; margin-left:12px;">
        <h3>${item.name}</h3>
        <p>$${item.price.toFixed(2)}</p>
        <div class="cart-item-controls">
          <label>Qty: <input type="number" class="cart-item-qty" min="1" value="${item.qty}" data-id="${item.id}" style="width:60px"></label>
          <button class="btn small" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `;
    cartContainer.appendChild(itemEl);
  });

  document.querySelectorAll('.cart-item-qty').forEach(input=>{
    input.addEventListener('change', (e)=>{
      const id = e.target.dataset.id;
      const v = parseInt(e.target.value) || 1;
      updateQuantity(id, v);
    });
  });

  const subtotalINR = (subtotalUSD * exchangeRate).toFixed(2);
  document.getElementById('subtotal-usd').innerText = `$${subtotalUSD.toFixed(2)}`;
  document.getElementById('subtotal-inr').innerText = `₹${subtotalINR}`;
  document.getElementById('total-usd').innerText = `$${subtotalUSD.toFixed(2)}`;
  updateCartCount();
}

function updateQuantity(productId, newQuantity){
  cart = cart.map(i => i.id === productId ? {...i, qty: newQuantity} : i);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  window.dispatchEvent(new Event('storage'));
}

function removeFromCart(productId){
  if(!confirm('Remove this item?')) return;
  cart = cart.filter(i => i.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  window.dispatchEvent(new Event('storage'));
}

function handleCheckout(event){
  event.preventDefault();
  cart = JSON.parse(localStorage.getItem('cart')||'[]');
  if(cart.length === 0){ alert('Your cart is empty.'); return; }

  const details = {
    email: document.getElementById('email').value,
    name: document.getElementById('name').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    zip: document.getElementById('zip').value,
    paymentMode: document.getElementById('payment-mode').value
  };

  for(const [k,v] of Object.entries(details)){ if(!v){ alert(`Please fill ${k}`); return; } }

  // compute totals
  const usdTotal = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  const inrTotal = (usdTotal * exchangeRate).toFixed(2);

  if(details.paymentMode === 'cod'){
    const orderId = 'ORD_' + Math.random().toString(36).slice(2,9).toUpperCase();
    alert(`Order placed (COD)\nOrder ID: ${orderId}\nAmount: ₹${inrTotal}\nConfirmation sent to ${details.email} (simulated).`);
    localStorage.removeItem('cart');
    window.location = 'index.html';
    return;
  } else {
    const proceed = confirm(`Proceed to Razorpay (simulated) and pay ₹${inrTotal}?`);
    if(!proceed) return;
    const paymentId = 'PAY_' + Math.random().toString(36).slice(2,10).toUpperCase();
    alert(`Payment Successful ✅\nPayment ID: ${paymentId}\nAmount: ₹${inrTotal}\nConfirmation sent to ${details.email} (simulated).`);
    localStorage.removeItem('cart');
    window.location = 'index.html';
    return;
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderCart();
  const form = document.getElementById('checkout-form');
  if(form) form.addEventListener('submit', handleCheckout);
});
