// Currency conversion and buy logic
async function convert(btn) {
  const product = btn.parentElement;
  const usd = product.querySelector(".usd").getAttribute("data-usd");
  const currency = document.getElementById("currency").value;
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
    const data = await res.json();
    const rate = data.rates.INR;
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
