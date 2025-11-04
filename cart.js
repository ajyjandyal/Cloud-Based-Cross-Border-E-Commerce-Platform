// ===================================
// 🌍 GLOABALSTORE - CART.JS
// (Logic for cart.html)
// ===================================

let cart = [];
let exchangeRate = 83.25; // Default fallback

// --- Render Cart Items ---
async function renderCart() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  const cartContainer = document.getElementById("cart-items-container");
  const summaryContainer = document.getElementById("cart-summary-container");

  if (!cartContainer) return; // Exit if not on cart page

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p id="empty-cart-msg">Your cart is empty. <a href="index.html">Go shopping!</a></p>';
    summaryContainer.style.display = "none";
    return;
  }

  // Fetch rate to show correct INR
  try {
    const res = await fetch(`https://api.exchangerate.host/latest?base=USD&symbols=INR`);
    const data = await res.json();
    exchangeRate = data.rates.INR || 83.25;
  } catch (e) {
    console.error("Failed to fetch exchange rate", e);
  }

  cartContainer.innerHTML = ""; // Clear
  summaryContainer.style.display = "block";
  let subtotalUSD = 0;

  cart.forEach(item => {
    subtotalUSD += item.price * item.quantity;
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/100x100/e0e0e0/777?text=Image+Missing'">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>$${item.price.toFixed(2)}</p>
        <div class="cart-item-controls">
          <input type="number" class="cart-item-qty" min="1" value="${item.quantity}" data-id="${item.id}">
          <button class="btn small danger" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    `;
    cartContainer.appendChild(itemEl);
  });
  
  // Add event listeners to quantity inputs
  document.querySelectorAll('.cart-item-qty').forEach(input => {
    input.addEventListener('change', (e) => {
      updateQuantity(parseInt(e.target.dataset.id), e.target.value);
    });
  });

  // Update summary
  const subtotalINR = (subtotalUSD * exchangeRate).toFixed(2);
  document.getElementById("subtotal-usd").innerText = `$${subtotalUSD.toFixed(2)}`;
  document.getElementById("subtotal-inr").innerText = `₹${subtotalINR}`;
  document.getElementById("total-usd").innerText = `$${subtotalUSD.toFixed(2)}`;
}

// --- Update Cart Quantity ---
function updateQuantity(productId, newQuantity) {
  newQuantity = parseInt(newQuantity);
  if (newQuantity < 1) newQuantity = 1;

  cart = cart.map(item => {
    if (item.id === productId) {
      item.quantity = newQuantity;
    }
    return item;
  });
  
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart(); // Re-render cart
  window.dispatchEvent(new Event("storage")); // Update header
}

// --- Remove From Cart ---
function removeFromCart(productId) {
  if (!confirm("Are you sure you want to remove this item?")) return;

  cart = cart.filter(item => item.id !== productId);
  
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart(); // Re-render cart
  window.dispatchEvent(new Event("storage")); // Update header
}

// --- === UPDATED CHECKOUT FUNCTION (SIMULATION) === ---
function handleCheckout(event) {
  event.preventDefault(); // Stop the form from submitting

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  
  // 1. Basic validation (Email only)
  const email = document.getElementById("email").value;
  if (!email || !email.includes("@")) {
    alert("Please fill out your email address to proceed.");
    return;
  }
  
  // 2. Get totals
  const totalUSD = document.getElementById("total-usd").innerText.replace('$', '');
  const totalINR = document.getElementById("subtotal-inr").innerText.replace('₹', '');

  // 3. Save totals to localStorage for the payment page to read
  localStorage.setItem("checkoutTotalUSD", totalUSD);
  localStorage.setItem("checkoutTotalINR", totalINR);

  // 4. Redirect to the fake payment page
  window.location.href = "payment.html";
}

// --- Initial Load ---
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  
  // Attach listener to the form's submit event
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckout);
  }
});
