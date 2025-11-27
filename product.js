const API_URL = "https://fakestoreapi.com/products";

const productCardEl = document.getElementById("productCard");
const productLoadingEl = document.getElementById("productLoading");
const productErrorEl = document.getElementById("productError");

const productImageEl = document.getElementById("productImage");
const productTitleEl = document.getElementById("productTitle");
const productCategoryEl = document.getElementById("productCategory");
const productDescriptionEl = document.getElementById("productDescription");
const productPriceEl = document.getElementById("productPrice");
const productRatingEl = document.getElementById("productRating");
const productAddToCartBtn = document.getElementById("productAddToCart");

const navbarCartCountEl = document.getElementById("cartCount");
const modeToggleBtn = document.getElementById("modeToggle");
const modeToggleText = document.getElementById("modeToggleText");

let cartItems = [];
let currentProduct = null;

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
    cartItems = raw ? JSON.parse(raw) : [];
  } catch {
    cartItems = [];
  }
  updateCartCount(cartItems.length);
}

function saveCartToStorage() {
  localStorage.setItem("products-ui-cart", JSON.stringify(cartItems));
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

function addToCart(product) {
  cartItems.push(product.id);
  saveCartToStorage();
  updateCartCount(cartItems.length);
}

// ==== Product loading ====
function showError(message) {
  productLoadingEl.hidden = true;
  productCardEl.hidden = true;
  productErrorEl.hidden = false;
  const errorText = document.getElementById("productErrorText");
  if (errorText) {
    errorText.textContent = message;
  }
}

function renderProduct(product) {
  currentProduct = product;
  const ratingValue = product.rating?.rate ?? 0;
  const ratingCount = product.rating?.count ?? 0;

  productImageEl.src = product.image;
  productImageEl.alt = product.title;
  productTitleEl.textContent = product.title;
  productCategoryEl.textContent = `Category: ${product.category}`;
  productPriceEl.textContent = `$${product.price.toFixed(2)}`;
  productDescriptionEl.textContent = product.description;
  productRatingEl.textContent = `⭐ ${ratingValue.toFixed(1)} (${ratingCount} reviews)`;

  productLoadingEl.hidden = true;
  productErrorEl.hidden = true;
  productCardEl.hidden = false;
  productAddToCartBtn.disabled = false;
}

async function fetchProduct(productId) {
  productLoadingEl.hidden = false;
  productAddToCartBtn.disabled = true;
  try {
    const res = await fetch(`${API_URL}/${productId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch product");
    }
    const data = await res.json();
    renderProduct(data);
  } catch (error) {
    console.error("Error loading product:", error);
    showError("Failed to load this product. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadCartFromStorage();

  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get("id");
  if (!productId) {
    showError("No product selected.");
    return;
  }

  fetchProduct(productId);
});

productAddToCartBtn.addEventListener("click", () => {
  if (!currentProduct) return;
  addToCart(currentProduct);
});
