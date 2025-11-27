const API_URL = "https://fakestoreapi.com/products";

const modeToggleBtn = document.getElementById("modeToggle");
const modeToggleText = document.getElementById("modeToggleText");
const navbarCartCountEl = document.getElementById("cartCount");

const summaryLoadingEl = document.getElementById("summaryLoading");
const summaryEmptyEl = document.getElementById("summaryEmpty");
const summaryContentEl = document.getElementById("summaryContent");
const summaryItemsEl = document.getElementById("summaryItems");
const summaryCountEl = document.getElementById("summaryCount");
const summarySubtotalEl = document.getElementById("summarySubtotal");
const summaryShippingEl = document.getElementById("summaryShipping");
const summaryTotalEl = document.getElementById("summaryTotal");

const checkoutForm = document.getElementById("checkoutForm");
const checkoutSuccessEl = document.getElementById("checkoutSuccess");
const placeOrderBtn = document.getElementById("placeOrderBtn");

const shippingInputs = document.querySelectorAll('input[name="shippingMethod"]');

let cartIds = [];
let allProducts = [];
let groupedItems = [];

// ==== Theme (Light / Dark) ====
function initTheme() {
  const savedMode = localStorage.getItem("products-ui-theme");
  if (savedMode === "dark") {
    document.body.classList.add("dark-mode");
  }
  updateModeToggleText();
}

function updateModeToggleText() {
  const isDark = document.body.classList.contains("dark-mode");
  modeToggleText.textContent = isDark ? "Light Mode" : "Dark Mode";
  modeToggleBtn.querySelector(".mode-toggle-icon").textContent = isDark
    ? "☀️"
    : "🌙";
}

modeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("products-ui-theme", mode);
  updateModeToggleText();
});

// ==== Cart helpers ====
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem("products-ui-cart");
    cartIds = raw ? JSON.parse(raw) : [];
  } catch {
    cartIds = [];
  }
  updateCartCount(cartIds.length);
}

function saveCartToStorage() {
  localStorage.setItem("products-ui-cart", JSON.stringify(cartIds));
}

function clearCart() {
  cartIds = [];
  saveCartToStorage();
  updateCartCount(0);
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

function groupCartItems(products, ids) {
  const counts = {};
  ids.forEach((id) => {
    counts[id] = (counts[id] || 0) + 1;
  });

  return products
    .filter((p) => counts[p.id])
    .map((p) => ({
      product: p,
      quantity: counts[p.id],
    }));
}

// ==== Summary Rendering ====
function getSelectedShippingMethod() {
  const checked = document.querySelector('input[name="shippingMethod"]:checked');
  return checked ? checked.value : "standard";
}

function computeShipping(subtotal) {
  const shippingMap = {
    standard: 5,
    express: 12,
    pickup: 0,
  };

  const method = getSelectedShippingMethod();
  const base = shippingMap[method] ?? 5;

  // Free standard shipping for orders over $100
  if (method === "standard" && subtotal >= 100) return 0;
  return base;
}

function renderOrderSummary(items) {
  groupedItems = items;
  summaryItemsEl.innerHTML = "";

  if (!items.length) {
    summaryContentEl.hidden = true;
    summaryEmptyEl.hidden = false;
    summaryLoadingEl.hidden = true;
    placeOrderBtn.disabled = true;
    return;
  }

  summaryEmptyEl.hidden = true;
  summaryContentEl.hidden = false;
  placeOrderBtn.disabled = false;

  let subtotal = 0;
  let totalCount = 0;

  items.forEach(({ product, quantity }) => {
    totalCount += quantity;
    subtotal += product.price * quantity;

    const itemEl = document.createElement("article");
    itemEl.className = "summary-item";

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "summary-item-image-wrapper";
    const img = document.createElement("img");
    img.className = "summary-item-image";
    img.src = product.image;
    img.alt = product.title;
    imgWrapper.appendChild(img);

    const info = document.createElement("div");
    info.className = "summary-item-info";

    const title = document.createElement("h4");
    title.className = "summary-item-title";
    title.textContent = product.title;

    const meta = document.createElement("p");
    meta.className = "summary-item-meta";
    meta.textContent = `Category: ${product.category}`;

    const qtyPrice = document.createElement("div");
    qtyPrice.className = "summary-item-bottom";
    const qty = document.createElement("span");
    qty.textContent = `Qty: ${quantity}`;
    const price = document.createElement("span");
    price.className = "summary-item-price";
    price.textContent = `$${(product.price * quantity).toFixed(2)}`;
    qtyPrice.appendChild(qty);
    qtyPrice.appendChild(price);

    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(qtyPrice);

    itemEl.appendChild(imgWrapper);
    itemEl.appendChild(info);
    summaryItemsEl.appendChild(itemEl);
  });

  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping;

  summaryCountEl.textContent = String(totalCount);
  summarySubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  summaryShippingEl.textContent = `$${shipping.toFixed(2)}`;
  summaryTotalEl.textContent = `$${total.toFixed(2)}`;

  summaryLoadingEl.hidden = true;
}

// ==== Data Fetch ====
async function fetchProductsForSummary() {
  summaryLoadingEl.hidden = false;
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    allProducts = data;
    const items = groupCartItems(allProducts, cartIds);
    renderOrderSummary(items);
  } catch (error) {
    console.error("Error loading cart products:", error);
    summaryLoadingEl.textContent = "Failed to load items. Please refresh.";
  }
}

shippingInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (groupedItems.length) {
      renderOrderSummary(groupedItems);
    }
  });
});

// ==== Form handling ====
checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!groupedItems.length) {
    alert("Your cart is empty.");
    return;
  }

  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = "Processing...";

  setTimeout(() => {
    checkoutSuccessEl.hidden = false;
    clearCart();
    groupedItems = [];
    renderOrderSummary([]);
    checkoutForm.reset();
    placeOrderBtn.textContent = "Place order securely";
  }, 900);
});

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadCartFromStorage();
  if (cartIds.length === 0) {
    summaryLoadingEl.hidden = true;
    summaryEmptyEl.hidden = false;
    placeOrderBtn.disabled = true;
    return;
  }
  fetchProductsForSummary();
});
