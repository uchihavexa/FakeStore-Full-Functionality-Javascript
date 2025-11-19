const API_URL = "https://fakestoreapi.com/products";

const cartItemsContainer = document.getElementById("cartItems");
const cartContentEl = document.getElementById("cartContent");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartLoadingEl = document.getElementById("cartLoading");
const cartCountSummaryEl = document.getElementById("cartCountSummary");
const cartTotalEl = document.getElementById("cartTotal");
const navbarCartCountEl = document.getElementById("cartCount");

const modeToggleBtn = document.getElementById("modeToggle");
const modeToggleText = document.getElementById("modeToggleText");

let cartIds = [];
let allProducts = [];

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
  updateNavbarCartCount(cartIds.length);
}

function saveCartToStorage() {
  localStorage.setItem("products-ui-cart", JSON.stringify(cartIds));
}

function updateNavbarCartCount(count) {
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

function renderCartItems(items) {
  cartItemsContainer.innerHTML = "";

  if (!items.length) {
    cartContentEl.hidden = true;
    cartEmptyEl.hidden = false;
    return;
  }

  cartEmptyEl.hidden = true;
  cartContentEl.hidden = false;

  let totalCount = 0;
  let totalPrice = 0;

  items.forEach(({ product, quantity }) => {
    totalCount += quantity;
    totalPrice += product.price * quantity;

    const itemEl = document.createElement("article");
    itemEl.className = "cart-item";

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "cart-item-image-wrapper";

    const img = document.createElement("img");
    img.className = "cart-item-image";
    img.src = product.image;
    img.alt = product.title;
    imgWrapper.appendChild(img);

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const title = document.createElement("h3");
    title.className = "cart-item-title";
    title.textContent = product.title;

    const meta = document.createElement("p");
    meta.className = "cart-item-meta";
    meta.textContent = `Category: ${product.category} • Rating: ${
      product.rating?.rate ?? 0
    }`;

    const bottomRow = document.createElement("div");
    bottomRow.className = "cart-item-bottom";

    const qty = document.createElement("span");
    qty.className = "cart-item-qty";
    qty.textContent = `Qty: ${quantity}`;

    const price = document.createElement("span");
    price.className = "cart-item-price";
    price.textContent = `$${(product.price * quantity).toFixed(2)}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "cart-item-remove";
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      removeOneFromCart(product.id);
    });

    bottomRow.appendChild(qty);
    bottomRow.appendChild(price);
    bottomRow.appendChild(removeBtn);

    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(bottomRow);

    itemEl.appendChild(imgWrapper);
    itemEl.appendChild(info);

    cartItemsContainer.appendChild(itemEl);
  });

  cartCountSummaryEl.textContent = String(totalCount);
  cartTotalEl.textContent = `$${totalPrice.toFixed(2)}`;
}

function removeOneFromCart(productId) {
  const index = cartIds.indexOf(productId);
  if (index !== -1) {
    cartIds.splice(index, 1);
    saveCartToStorage();
    updateNavbarCartCount(cartIds.length);

    const items = groupCartItems(allProducts, cartIds);
    renderCartItems(items);
  }
}

async function fetchProductsForCart() {
  cartLoadingEl.hidden = false;
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    allProducts = data;
    const items = groupCartItems(allProducts, cartIds);
    renderCartItems(items);
  } catch (error) {
    console.error("Error loading cart products:", error);
    cartLoadingEl.textContent = "Failed to load cart items.";
  } finally {
    cartLoadingEl.hidden = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadCartFromStorage();
  if (cartIds.length === 0) {
    cartLoadingEl.hidden = true;
    cartEmptyEl.hidden = false;
    return;
  }
  fetchProductsForCart();
});

