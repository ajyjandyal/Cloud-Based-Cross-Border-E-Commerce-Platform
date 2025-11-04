// ===================================
// 🌍 GLOABALSTORE - PAYMENT.JS
// (Logic for payment.html)
// ===================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Get total from localStorage
  const totalUSD = localStorage.getItem("checkoutTotalUSD");
  const totalINR = localStorage.getItem("checkoutTotalINR");

  if (!totalUSD || !totalINR) {
    alert("No order total found. Returning to cart.");
    window.location.href = "cart.html";
    return;
  }

  // 2. Display the total
  const paymentTotalEl = document.getElementById("payment-total");
  paymentTotalEl.innerText = `₹${totalINR}`;

  // 3. Handle the fake payment
  const paymentForm = document.getElementById("fake-payment-form");
  paymentForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Stop form submission
    
    // Get card details (just for the alert)
    const cardNum = document.getElementById("card-number").value;
    const name = document.getElementById("name-on-card").value;
    
    alert(
      `✅ Payment Successful! \n\n` +
      `Amount: ₹${totalINR} (USD $${totalUSD})\n` +
      `Paid by: ${name}\n` +
      `Card: **** **** **** ${cardNum.slice(-4)}\n\n` +
      `Thank you for shopping!`
    );

    // 4. Clear cart and redirect home
    localStorage.removeItem("cart");
    localStorage.removeItem("checkoutTotalUSD");
    localStorage.removeItem("checkoutTotalINR");
    window.location.href = "index.html";
  });
});
