async function convert(usd, id) {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    const rate = data.rates.INR;
    const price = (usd * rate).toFixed(2);
    document.getElementById(id).innerText = `Price (INR): ₹${price}`;
  } catch (error) {
    document.getElementById(id).innerText = "Error fetching rate!";
  }
}
