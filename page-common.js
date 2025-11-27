const modeToggleBtn = document.getElementById("modeToggle");
const modeToggleText = document.getElementById("modeToggleText");
const navbarCartCountEl = document.getElementById("cartCount");

function initTheme() {
  const savedMode = localStorage.getItem("products-ui-theme");
  if (savedMode === "dark") {
    document.body.classList.add("dark-mode");
  }
  updateModeToggleText();
}

function updateModeToggleText() {
  if (!modeToggleText || !modeToggleBtn) return;
  const isDark = document.body.classList.contains("dark-mode");
  modeToggleText.textContent = isDark ? "Light Mode" : "Dark Mode";
  modeToggleBtn.querySelector(".mode-toggle-icon").textContent = isDark
    ? "☀️"
    : "🌙";
}

if (modeToggleBtn) {
  modeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("products-ui-theme", mode);
    updateModeToggleText();
  });
}

function updateCartCount(count) {
  if (!navbarCartCountEl) return;
  if (count <= 0) {
    navbarCartCountEl.textContent = "0";
    navbarCartCountEl.hidden = true;
  } else {
    navbarCartCountEl.textContent = String(count);
    navbarCartCountEl.hidden = false;
  }
}

function loadCartBadge() {
  try {
    const raw = localStorage.getItem("products-ui-cart");
    const cartItems = raw ? JSON.parse(raw) : [];
    updateCartCount(cartItems.length);
  } catch {
    updateCartCount(0);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadCartBadge();
});
