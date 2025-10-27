// Currency conversion and buy logic
async function convert(btn) {
  const product = btn.parentElement;
  const usd = product.querySelector(".usd").getAttribute("data-usd");
  const currency = document.getElementById("currency").value;
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
    const data = await res.json();
    const rate = data.rates?.INR || 83.25;
    const price = (usd * rate).toFixed(2);
    product.querySelector(".inr").innerText = `Price (INR): ₹${price}`;
  } catch (err) {
    product.querySelector(".inr").innerText = "Error fetching rate!";
  }
}

function buyNow(item) {
  alert(`✅ Order placed successfully for ${item}!\nConfirmation email sent.`);
}

// Dark mode toggle
const toggle = document.getElementById("darkToggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
// BUY NOW button simulation
function buyNow(productName) {
  alert(`✅ Order placed successfully for ${productName}! \nA confirmation email will be sent shortly.`);
}

// MOCK LOGIN / LOGOUT Simulation
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn && logoutBtn) {
    loginBtn.onclick = () => {
      alert("✅ Logged in successfully (Firebase simulation)");
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
    };

    logoutBtn.onclick = () => {
      alert("👋 Logged out successfully");
      logoutBtn.style.display = "none";
      loginBtn.style.display = "inline-block";
    };
  }
});
