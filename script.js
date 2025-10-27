// ========== GlobalStore: Main Script ==========

// 💱 Currency conversion (USD/EUR → INR)
async function convert(btn) {
  const product = btn.parentElement;
  const usd = parseFloat(product.querySelector(".usd").getAttribute("data-usd"));
  const currency = document.getElementById("currency").value || "USD";

  try {
    const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=INR`);
    if (!res.ok) throw new Error("Network response failed");
    const data = await res.json();

    // Rate + fallback
    const rate = data?.rates?.INR || 83.25;
    const date = data?.date || new Date().toISOString().split("T")[0];

    const price = (usd * rate).toFixed(2);
    product.querySelector(".inr").innerText = `Price (INR): ₹${price} (Updated ${date})`;
  } catch (err) {
    console.error("Currency conversion error:", err);
    product.querySelector(".inr").innerText = "⚠️ Error fetching rate (using fallback ₹)";
    const fallback = (usd * 83.25).toFixed(2);
    product.querySelector(".inr").innerText += ` ₹${fallback}`;
  }
}

// 🛍️ BUY NOW simulation
function buyNow(productName) {
  if (!window.userLoggedIn) {
    alert("⚠️ Please login first to place your order.");
    return;
  }
  alert(`✅ Order placed successfully for ${productName}!\nA confirmation email will be sent shortly.`);
}

// 🌙 Dark mode toggle
const toggle = document.getElementById("darkToggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    toggle.textContent = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
}

// 🔐 Mock Login / Logout (Firebase simulation)
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn && logoutBtn) {
    loginBtn.addEventListener("click", () => {
      alert("✅ Logged in successfully (Firebase simulation)");
      window.userLoggedIn = true;
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
    });

    logoutBtn.addEventListener("click", () => {
      alert("👋 Logged out successfully");
      window.userLoggedIn = false;
      logoutBtn.style.display = "none";
      loginBtn.style.display = "inline-block";
    });
  }
});

// ⚙️ Auto-convert prices on page load
document.addEventListener("DOMContentLoaded", async () => {
  const buttons = document.querySelectorAll(".product button:first-of-type");
  for (const btn of buttons) {
    try {
      await convert(btn);
    } catch (err) {
      console.warn("Auto conversion failed for a product:", err);
    }
  }
});
