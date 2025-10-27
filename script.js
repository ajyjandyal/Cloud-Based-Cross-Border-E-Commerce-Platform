// ================================
// 🌍 CLOUD E-COMMERCE MAIN SCRIPT
// ================================

// --- Currency Conversion Logic ---
async function convert(btn) {
  const product = btn.parentElement;
  const inrEl = product.querySelector(".inr");
  inrEl.innerText = "Converting..."; // Added loading text

  const usd = product.querySelector(".usd").getAttribute("data-usd");
  const currency = document.getElementById("currency").value;

  try {
    // ✅ Reliable API for currency conversion (works on GitHub Pages)
    const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=INR`);
    const data = await res.json();

    // ✅ Extract rate safely, fallback if API fails
    const rate = data.rates?.INR || 83.25;
    const price = (usd * rate).toFixed(2);
    const date = data.date || new Date().toISOString().split("T")[0];

    // Using a more concise update
    inrEl.innerText = `Price (INR): ₹${price}`; 
    // If you want the date, uncomment this:
    // inrEl.innerText = `Price (INR): ₹${price} (Updated ${date})`;

  } catch (err) {
    console.error("Currency API Error:", err);
    inrEl.innerText = "⚠️ Unable to fetch rate. Please try again.";
  }
}

// --- BUY NOW Simulation ---
function buyNow(productName) {
  alert(`✅ Order placed successfully for ${productName}! \n📧 A confirmation email will be sent shortly.`);
}

// --- Dark Mode Toggle ---
const toggle = document.getElementById("darkToggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    toggle.innerText = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
}

// --- DOMContentLoaded: Runs once the HTML page is fully loaded ---
document.addEventListener("DOMContentLoaded", () => {
  
  // --- MOCK LOGIN / LOGOUT Simulation ---
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const adminBtn = document.getElementById("adminBtn");

  if (loginBtn && logoutBtn && adminBtn) { 
    
    // --- LOGIN ---
    loginBtn.onclick = () => {
      alert("✅ Logged in successfully (Firebase simulation)");
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      adminBtn.style.display = "inline-block";
      sessionStorage.setItem("loggedIn", "true");
    };

    // --- LOGOUT ---
    logoutBtn.onclick = () => {
      alert("👋 Logged out successfully");
      logoutBtn.style.display = "none";
      adminBtn.style.display = "none"; 
      loginBtn.style.display = "inline-block";
      sessionStorage.removeItem("loggedIn");
    };

    // --- Restore login state after page refresh ---
    if (sessionStorage.getItem("loggedIn") === "true") {
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      adminBtn.style.display = "inline-block";
    }
  }

  // --- Ensure all product images load properly (MOVED HERE) ---
  document.querySelectorAll("img").forEach(img => {
    img.onerror = () => {
      img.src = "https://via.placeholder.com/200x200?text=Image+Not+Found";
    };
  });

});
