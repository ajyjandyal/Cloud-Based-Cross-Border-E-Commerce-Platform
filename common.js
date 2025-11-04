// common.js - Handles header logic for ALL pages
document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  updateCartCount();
  restoreAccountLink();
  setupSearch();
});

function setupDarkMode() {
  const toggle = document.getElementById("darkToggle");
  if (!toggle) return;
  
  // Set initial state from localStorage
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    toggle.innerText = "☀️ Light";
  } else {
    toggle.innerText = "🌙 Dark";
  }
  
  // Add click listener
  toggle.onclick = () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    toggle.innerText = isDark ? "☀️ Light" : "🌙 Dark";
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };
}

function updateCartCount() {
  // Your login/signup files use 'cart' and 'qty'
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((a, i) => a + i.qty, 0); 
  const el = document.getElementById("cart-count");
  if (el) el.innerText = count;
}

function restoreAccountLink() {
  const acctLink = document.getElementById("acctLink");
  // Your login.html file uses sessionStorage.setItem('user', email)
  const userEmail = sessionStorage.getItem('user'); 
  if (!acctLink) return;
  
  if (userEmail) {
    // Get user's first name
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const name = users[userEmail]?.name.split(' ')[0] || 'Account';
    
    acctLink.innerText = `Logout (${name})`;
    acctLink.href = "#";
    acctLink.onclick = (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to log out?")) {
        sessionStorage.removeItem('user');
        window.location.reload();
      }
    };
  } else {
    acctLink.innerText = "Account";
    acctLink.href = "login.html";
  }
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  const triggerSearch = () => {
    const query = searchInput.value.toLowerCase().trim();
    // Dispatch a custom event that app.js will listen for
    window.dispatchEvent(new CustomEvent('productSearch', { detail: query }));
  };
  
  // 'search' event fires when user presses Enter or clicks 'x'
  searchInput.addEventListener('search', triggerSearch); 
  
  // Optional: trigger search on keypress
  searchInput.addEventListener('keyup', (e) => {
     if (e.key === 'Enter') triggerSearch();
  });
}
