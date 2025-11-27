const API_URL = "https://fakestoreapi.com/products";

const cartItemsContainer = document.getElementById("cartItems");
const cartContentEl = document.getElementById("cartContent");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartLoadingEl = document.getElementById("cartLoading");
const cartCountSummaryEl = document.getElementById("cartCountSummary");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartShippingEl = document.getElementById("cartShipping");
const cartTaxEl = document.getElementById("cartTax");
const cartDiscountEl = document.getElementById("cartDiscount");
const cartTotalEl = document.getElementById("cartTotal");
const promoInput = document.getElementById("promoCode");
const promoFeedbackEl = document.getElementById("promoFeedback");
const applyPromoBtn = document.getElementById("applyPromoBtn");
const cartSkeleton = document.getElementById("cartSkeleton");
const navbarCartCountEl = document.getElementById("cartCount");

const modeToggleBtn = document.getElementById("modeToggle");
const modeToggleText = document.getElementById("modeToggleText");

let cartIds = [];
let allProducts = [];
let appliedPromoCode = null;
let lastGroupedItems = [];

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

function showSkeleton() {
  if (cartSkeleton) cartSkeleton.hidden = false;
  cartLoadingEl.hidden = false;
}

function hideSkeleton() {
  if (cartSkeleton) cartSkeleton.hidden = true;
  cartLoadingEl.hidden = true;
}

function setQuantity(productId, quantity) {
  const nextQty = Math.max(0, Number(quantity) || 0);
  const withoutProduct = cartIds.filter((id) => id !== productId);
  if (nextQty > 0) {
    const additions = Array.from({ length: nextQty }, () => productId);
    cartIds = withoutProduct.concat(additions);
  } else {
    cartIds = withoutProduct;
  }
  saveCartToStorage();
  updateNavbarCartCount(cartIds.length);
  rebuildCartView();
}

function updateSummary(items, precomputedTotals) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  if (itemCount === 0) {
    appliedPromoCode = null;
    cartCountSummaryEl.textContent = "0";
    cartSubtotalEl.textContent = "$0.00";
    cartShippingEl.textContent = "$0.00";
    cartTaxEl.textContent = "$0.00";
    cartDiscountEl.textContent = "$0.00";
    cartTotalEl.textContent = "$0.00";
    if (promoFeedbackEl) promoFeedbackEl.textContent = "";
    return;
  }

  const totals =
    precomputedTotals || CartTotals.computeTotals(items, appliedPromoCode);
  cartCountSummaryEl.textContent = String(itemCount);
  cartSubtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
  cartShippingEl.textContent = `$${totals.shipping.toFixed(2)}`;
  cartTaxEl.textContent = `$${totals.tax.toFixed(2)}`;
  cartDiscountEl.textContent = totals.discount
    ? `- $${totals.discount.toFixed(2)}`
    : "$0.00";
  cartTotalEl.textContent = `$${totals.total.toFixed(2)}`;

  if (!totals.appliedPromo) {
    appliedPromoCode = null;
  }
}

function renderCartItems(items) {
  lastGroupedItems = items;
  cartItemsContainer.innerHTML = "";

  if (!items.length) {
    cartContentEl.hidden = true;
    cartEmptyEl.hidden = false;
    updateSummary([]);
    return;
  }

  cartEmptyEl.hidden = true;
  cartContentEl.hidden = false;

  items.forEach(({ product, quantity }) => {
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

    const qtyControls = document.createElement("div");
    qtyControls.className = "qty-controls";

    const decreaseBtn = document.createElement("button");
    decreaseBtn.type = "button";
    decreaseBtn.className = "qty-btn";
    decreaseBtn.textContent = "−";
    decreaseBtn.addEventListener("click", () =>
      setQuantity(product.id, quantity - 1)
    );

    const qtyValue = document.createElement("input");
    qtyValue.type = "number";
    qtyValue.className = "qty-input";
    qtyValue.min = "0";
    qtyValue.value = String(quantity);
    qtyValue.addEventListener("change", (event) => {
      setQuantity(product.id, event.target.value);
    });

    const increaseBtn = document.createElement("button");
    increaseBtn.type = "button";
    increaseBtn.className = "qty-btn";
    increaseBtn.textContent = "+";
    increaseBtn.addEventListener("click", () =>
      setQuantity(product.id, quantity + 1)
    );

    qtyControls.appendChild(decreaseBtn);
    qtyControls.appendChild(qtyValue);
    qtyControls.appendChild(increaseBtn);

    const price = document.createElement("span");
    price.className = "cart-item-price";
    price.textContent = `$${(product.price * quantity).toFixed(2)}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "cart-item-remove";
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      setQuantity(product.id, 0);
    });

    bottomRow.appendChild(qtyControls);
    bottomRow.appendChild(price);
    bottomRow.appendChild(removeBtn);

    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(bottomRow);

    itemEl.appendChild(imgWrapper);
    itemEl.appendChild(info);

    cartItemsContainer.appendChild(itemEl);
  });

  updateSummary(items);
}

function rebuildCartView() {
  const items = groupCartItems(allProducts, cartIds);
  renderCartItems(items);
}

function handleApplyPromo() {
  if (!promoInput) return;
  const code = promoInput.value.trim();
  if (!code) {
    appliedPromoCode = null;
    if (promoFeedbackEl) {
      promoFeedbackEl.textContent = "Removed promo code.";
      promoFeedbackEl.className = "promo-feedback muted";
    }
    updateSummary(lastGroupedItems);
    return;
  }

  const totals = CartTotals.computeTotals(lastGroupedItems, code);
  if (totals.appliedPromo) {
    appliedPromoCode = totals.appliedPromo.code;
    if (promoFeedbackEl) {
      promoFeedbackEl.textContent = `Applied ${appliedPromoCode}.`;
      promoFeedbackEl.className = "promo-feedback success";
    }
    updateSummary(lastGroupedItems, totals);
  } else {
    appliedPromoCode = null;
    if (promoFeedbackEl) {
      promoFeedbackEl.textContent = "Invalid or unsupported code.";
      promoFeedbackEl.className = "promo-feedback error";
    }
    updateSummary(lastGroupedItems);
  }
}

async function fetchProductsForCart() {
  showSkeleton();
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    allProducts = data;
    rebuildCartView();
    hideSkeleton();
    cartLoadingEl.hidden = true;
  } catch (error) {
    console.error("Error loading cart products:", error);
    if (cartSkeleton) cartSkeleton.hidden = true;
    cartLoadingEl.hidden = false;
    cartLoadingEl.textContent = "Failed to load cart items.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadCartFromStorage();

  if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", handleApplyPromo);
  }
  if (promoInput) {
    promoInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleApplyPromo();
      }
    });
  }

  if (cartIds.length === 0) {
    hideSkeleton();
    cartEmptyEl.hidden = false;
    updateSummary([]);
    return;
  }

  // Recompute totals on load to ensure any stored promo is reflected
  updateSummary([]);
  fetchProductsForCart();
});
