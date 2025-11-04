// ================================
// 🌍 CLOUD E-COMMERCE MAIN SCRIPT
// (Unified Version)
// ================================

// ====== Global Variables ======
let PRODUCTS = [];
let exchangeRate = 83.25;

// ====== Utility: Load Products JSON ======
async function loadProducts() {
  try {
    const res = await fetch("data/products.json");
    PRODUCTS = await res.json();
  } catch (err) {
    console.error("Failed to load products.json", err);
    PRODUCTS = [];
  }
}

// ====== Render Products on Home ======
async function renderProducts() {
  await loadProducts();
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";
  PRODUCTS.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x400?text=${encodeURIComponent(p.brand)}'">
      <h3>${p.name}</h3>
      <p class="brand">${p.brand}</p>
      <p>USD: $${p.priceUSD}</p>
      <p class="inr">INR: ₹--</p>
      <div class="product-actions">
        <a class="btn" href="product.html?id=${p.id}">View</a>
        <button class="btn" onclick="convertCurrency(this, ${p.priceUSD})">Convert</button>
        <button class="btn primary" onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>`;
    container.appendChild(card);
  });
}

// ====== Render Single Product Page ======
async function renderProductPage() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;
  if (PRODUCTS.length === 0) await loadProducts();
  const p = PRODUCTS.find(x => x.id === id);
  const container = document.getElementById("product-detail");
  if (!p || !container) return;
  container.innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <div class="product-info">
      <h2>${p.name}</h2>
      <p class="brand">${p.brand}</p>
      <p>Price (USD): <span class="usd" data-usd="${p.priceUSD}">$${p.priceUSD}</span></p>
      <p class="inr">Price (INR): ₹--</p>
      <div class="product-actions">
        <button class="btn" onclick="convertCurrency(this, ${p.priceUSD})">Convert</button>
        <button class="btn primary" onclick="addToCart('${p.id}')">Add To Cart</button>
        <button class="btn" onclick="buyNow('${p.name}')">Buy Now</button>
      </div>
      <h3>Description</h3>
      <p>${p.desc}</p>
    </div>`;
}

// ====== Currency Conversion ======
async function convertCurrency(btn, usd) {
  const product = btn.closest(".card, .product-detail");
  const inrEl = product.querySelector(".inr");
  inrEl.innerText = "Converting...";
  const currency = document.getElementById("currency")?.value || "USD";

  try {
    const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=INR`);
    const data = await res.json();
    const rate = data.rates?.INR || 83.25;
    const price = (usd * rate).toFixed(2);
    inrEl.innerText = `Price (INR): ₹${price}`;
  } catch (err) {
    inrEl.innerText = "⚠️ Conversion Failed";
  }
}

// ====== Cart Functions ======
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1, price: product.priceUSD });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} added to cart`);
}

function updateCartCount() {
  const count = (JSON.parse(localStorage.getItem("cart")) || []).reduce((a, i) => a + i.qty, 0);
  const el = document.getElementById("cart-count");
  if (el) el.innerText = count;
}

// ====== Buy Now Simulation ======
function buyNow(productName) {
  alert(`✅ Order placed successfully for ${productName}! \n📧 Confirmation email sent (simulation).`);
}

// ====== Login / Logout Simulation ======
function setupAuth() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const adminBtn = document.getElementById("adminBtn");

  if (!loginBtn || !logoutBtn) return;

  loginBtn.onclick = () => {
    alert("✅ Logged in (simulation)");
    sessionStorage.setItem("loggedIn", "true");
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    if (adminBtn) adminBtn.style.display = "inline-block";
  };

  logoutBtn.onclick = () => {
    alert("👋 Logged out");
    sessionStorage.removeItem("loggedIn");
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    if (adminBtn) adminBtn.style.display = "none";
  };

  if (sessionStorage.getItem("loggedIn") === "true") {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    if (adminBtn) adminBtn.style.display = "inline-block";
  }
}

// ====== Dark Mode ======
function setupDarkMode() {
  const toggle = document.getElementById("darkToggle");
  if (!toggle) return;
  toggle.onclick = () => {
    document.body.classList.toggle("dark");
    toggle.innerText = document.body.classList.contains("dark") ? "☀️ Light" : "🌙 Dark";
  };
}

// ====== Image Fallbacks ======
function setupImageFallbacks() {
  document.querySelectorAll("img").forEach(img => {
    img.onerror = () => {
      img.src = "https://via.placeholder.com/400x400?text=Image+Not+Found";
    };
  });
}

// ====== Initialization ======
document.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  renderProducts();
  renderProductPage();
  setupAuth();
  setupDarkMode();
  setupImageFallbacks();
  updateCartCount();
});
