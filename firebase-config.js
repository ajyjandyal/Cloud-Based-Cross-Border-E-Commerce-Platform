// Mock Firebase Configuration (Offline Demo)
console.log("Firebase Mock Config Loaded");

// Simulated Login/Logout Buttons
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn && logoutBtn) {
    loginBtn.onclick = () => {
      alert("✅ Logged in successfully (Firebase Simulation)");
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
