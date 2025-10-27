// Currency conversion and buy logic
async function convert(btn) {
  const product = btn.parentElement;
  const usd = product.querySelector(".usd").getAttribute("data-usd");
  const currency = document.getElementById("currency").value;
  try {
    // ✅ Updated API endpoint
    const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=INR`);
    const data = await res.json();

    const rate = data.rates?.INR || 83.25; // fallback rate
    const price = (usd * rate).toFixed(2);
    const date = data.date || new Date().toISOString().split("T")[0];

    product.querySelector(".inr").innerText = `Price (INR): ₹${price} (Updated ${date})`;
  } catch (err) {
    product.querySelector(".inr").innerText = "Error fetching rate!";
  }
}
