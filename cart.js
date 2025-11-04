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

// --- UPDATED Checkout Simulation ---
function handleCheckout(event) {
  event.preventDefault(); // Stop the form from submitting normally

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  
  // Get all form values
  const details = {
    email: document.getElementById("email").value,
    name: document.getElementById("name").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    zip: document.getElementById("zip").value,
    card: document.getElementById("card-number").value,
    expiry: document.getElementById("card-expiry").value,
    cvc: document.getElementById("card-cvc").value
  };

  // Simple validation
  for (const [key, value] of Object.entries(details)) {
    if (!value) {
      alert(`Please fill out the "${key}" field.`);
      return; // Stop execution
    }
  }

  // Validation passed, show success alert
  alert(
    `✅ Order Placed Successfully! (Simulation)\n\n` +
    `Total: ${document.getElementById("total-usd").innerText}\n` +
    `Shipping to: ${details.name} at ${details.address}, ${details.city}\n` +
    `Confirmation Email: Sent to ${details.email} (simulated via AWS SES)\n\n` +
    `Thank you for shopping!`
  );

  // Clear cart and redirect
  localStorage.removeItem("cart");
  window.location.href = "index.html";
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
