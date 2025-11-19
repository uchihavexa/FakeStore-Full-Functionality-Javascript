const API_URL = "https://fakestoreapi.com/products";

const productsContainer = document.getElementById("productsContainer");
const loadingMessage = document.getElementById("loadingMessage");
const emptyState = document.getElementById("emptyState");
const productsCountEl = document.getElementById("productsCount");
const paginationContainer = document.getElementById("pagination");

const navbarSearchInput = document.getElementById("navbarSearch");
const navbarSearchBtn = document.getElementById("navbarSearchBtn");

const categoryFilter = document.getElementById("categoryFilter");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const nameFilterInput = document.getElementById("nameFilter");
const ratingFilterInput = document.getElementById("ratingFilter");
const sortSelect = document.getElementById("sortSelect");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

const modeToggleBtn = document.getElementById("modeToggle");
const modeToggleText = document.getElementById("modeToggleText");

const welcomeBanner = document.getElementById("welcomeBanner");
const closeWelcomeBtn = document.getElementById("closeWelcomeBtn");

const gridViewBtn = document.getElementById("gridViewBtn");
const listViewBtn = document.getElementById("listViewBtn");

const cartCountEl = document.getElementById("cartCount");

let products = [];
let filteredProducts = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 8;
let cartItems = [];

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

// ==== Cart ====
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
  if (!cartCountEl) return;
  if (count <= 0) {
    cartCountEl.textContent = "0";
    cartCountEl.hidden = true;
  } else {
    cartCountEl.textContent = String(count);
    cartCountEl.hidden = false;
  }
}

function addToCart(product) {
  // Store only product IDs for simplicity
  cartItems.push(product.id);
  saveCartToStorage();
  updateCartCount(cartItems.length);
}

// ==== View Mode (Grid / List) ====
function setGridView() {
  productsContainer.classList.remove("products-list");
  productsContainer.classList.add("products-grid");
  gridViewBtn.classList.add("is-active");
  listViewBtn.classList.remove("is-active");
  localStorage.setItem("products-ui-view", "grid");
}

function setListView() {
  productsContainer.classList.remove("products-grid");
  productsContainer.classList.add("products-list");
  listViewBtn.classList.add("is-active");
  gridViewBtn.classList.remove("is-active");
  localStorage.setItem("products-ui-view", "list");
}

function initViewMode() {
  const savedView = localStorage.getItem("products-ui-view");
  if (savedView === "list") {
    setListView();
  } else {
    setGridView();
  }
}

gridViewBtn.addEventListener("click", setGridView);
listViewBtn.addEventListener("click", setListView);

// ==== Welcome Banner ====
closeWelcomeBtn.addEventListener("click", () => {
  welcomeBanner.style.display = "none";
});

// ==== Fetch Products (Array of Objects) ====
async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    products = data; // Array of objects
    loadingMessage.style.display = "none";

    populateCategoryFilter(products);
    applyFilters(); // أول طلب
  } catch (error) {
    console.error("Error loading products:", error);
    loadingMessage.textContent = "Failed to load products.";
  }
}

// ==== UI Helpers ====
function populateCategoryFilter(productsArray) {
  const categories = Array.from(
    new Set(productsArray.map((p) => p.category))
  ).sort();

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore saved category selection from localStorage (if any)
  const savedCategory = localStorage.getItem("products-ui-category");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
  }
}

// Restore saved filter values (except category which depends on options)
function initFiltersFromStorage() {
  const savedMinPrice = localStorage.getItem("products-ui-minPrice");
  if (savedMinPrice !== null) {
    minPriceInput.value = savedMinPrice;
  }

  const savedMaxPrice = localStorage.getItem("products-ui-maxPrice");
  if (savedMaxPrice !== null) {
    maxPriceInput.value = savedMaxPrice;
  }

  const savedNameQuery = localStorage.getItem("products-ui-name");
  if (savedNameQuery !== null) {
    nameFilterInput.value = savedNameQuery;
    if (navbarSearchInput) {
      navbarSearchInput.value = savedNameQuery;
    }
  }

  const savedMinRating = localStorage.getItem("products-ui-rating");
  if (savedMinRating !== null) {
    ratingFilterInput.value = savedMinRating;
  }

  const savedSort = localStorage.getItem("products-ui-sort");
  if (savedSort !== null) {
    sortSelect.value = savedSort;
  }
}

function renderProducts(productsArray, totalCount) {
  productsContainer.innerHTML = "";

  if (!productsArray.length) {
    emptyState.hidden = false;
    productsCountEl.textContent = totalCount.toString();
    return;
  }

  emptyState.hidden = true;
  productsCountEl.textContent = totalCount.toString();

  productsArray.forEach((product) => {
    const ratingValue = product.rating?.rate ?? 0;
    const ratingCount = product.rating?.count ?? 0;

    const card = document.createElement("article");
    card.className = "product-card";

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "product-image-wrapper";

    const img = document.createElement("img");
    img.className = "product-image";
    img.src = product.image;
    img.alt = product.title;

    imgWrapper.appendChild(img);

    const contentWrapper = document.createElement("div");

    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.title;

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = `Category: ${product.category}`;

    const footer = document.createElement("div");
    footer.className = "product-footer";

    const price = document.createElement("div");
    price.className = "product-price";
    const priceLabel = document.createElement("span");
    priceLabel.textContent = "Price";
    price.appendChild(priceLabel);
    price.appendChild(document.createTextNode(` $${product.price.toFixed(2)}`));

    const ratingBadge = document.createElement("div");
    ratingBadge.className = "product-rating-badge";
    ratingBadge.textContent = `⭐ ${ratingValue.toFixed(1)} (${ratingCount})`;

    const addToCartBtn = document.createElement("button");
    addToCartBtn.className = "btn-add-cart";
    addToCartBtn.type = "button";
    addToCartBtn.textContent = "Add to cart";

    const detailsBtn = document.createElement("button");
    detailsBtn.className = "btn-details";
    detailsBtn.type = "button";
    detailsBtn.textContent = "Show details";

    footer.appendChild(price);
    footer.appendChild(ratingBadge);
    footer.appendChild(addToCartBtn);
    footer.appendChild(detailsBtn);

    const extra = document.createElement("div");
    extra.className = "product-extra";
    extra.setAttribute("hidden", "");

    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;

    extra.appendChild(description);

    addToCartBtn.addEventListener("click", () => {
      addToCart(product);
    });

    detailsBtn.addEventListener("click", () => {
      const isHidden = extra.hasAttribute("hidden");
      if (isHidden) {
        extra.removeAttribute("hidden");
        detailsBtn.textContent = "Hide details";
      } else {
        extra.setAttribute("hidden", "");
        detailsBtn.textContent = "Show details";
      }
    });

    contentWrapper.appendChild(title);
    contentWrapper.appendChild(category);
    contentWrapper.appendChild(footer);
    contentWrapper.appendChild(extra);

    // في Grid: الكارت عمودي، في List: الـ CSS هو اللي يرتبه
    card.appendChild(imgWrapper);
    card.appendChild(contentWrapper);

    productsContainer.appendChild(card);
  });
}

// ==== Pagination ====
function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "‹ Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderCurrentPage();
    }
  });
  paginationContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    if (i === currentPage) {
      pageBtn.classList.add("active-page");
    }
    pageBtn.addEventListener("click", () => {
      currentPage = i;
      renderCurrentPage();
    });
    paginationContainer.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next ›";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderCurrentPage();
    }
  });
  paginationContainer.appendChild(nextBtn);
}

function renderCurrentPage() {
  const totalItems = filteredProducts.length;

  if (totalItems === 0) {
    renderProducts([], 0);
    paginationContainer.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filteredProducts.slice(start, end);

  renderProducts(pageItems, totalItems);
  renderPagination(totalPages);
}

// ==== Sorting Helper ====
function sortProducts(arr) {
  const sortValue = sortSelect.value;
  const sorted = [...arr];

  if (sortValue === "price-asc") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-desc") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sortValue === "rating-desc") {
    sorted.sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0));
  } else if (sortValue === "name-asc") {
    sorted.sort((a, b) =>
      a.title.localeCompare(b.title, "en", { sensitivity: "base" })
    );
  }
  // Default: no sorting
  return sorted;
}

// ==== Filtration Logic ====
function applyFilters() {
  const categoryValue = categoryFilter.value;
  const minPriceValue = parseFloat(minPriceInput.value) || 0;
  const maxPriceValue =
    parseFloat(maxPriceInput.value) || Number.POSITIVE_INFINITY;
  const nameQuery = nameFilterInput.value.trim().toLowerCase();
  const minRatingValue = parseFloat(ratingFilterInput.value) || 0;

  const filtered = products.filter((product) => {
    const productRating = product.rating?.rate ?? 0;

    const matchesCategory = categoryValue
      ? product.category === categoryValue
      : true;

    const matchesPrice =
      product.price >= minPriceValue && product.price <= maxPriceValue;

    const matchesName = nameQuery
      ? product.title.toLowerCase().includes(nameQuery)
      : true;

    const matchesRating = productRating >= minRatingValue;

    return matchesCategory && matchesPrice && matchesName && matchesRating;
  });

  filteredProducts = sortProducts(filtered);
  currentPage = 1; // كل ما نغير الفلتر أو السورت نرجع لأول صفحة
  renderCurrentPage();
}

// ==== Event Listeners for Filters & Sorting ====
function handleCategoryChange() {
  localStorage.setItem("products-ui-category", categoryFilter.value || "");
  applyFilters();
}

categoryFilter.addEventListener("change", handleCategoryChange);

function handleMinPriceInput() {
  localStorage.setItem("products-ui-minPrice", minPriceInput.value || "");
  applyFilters();
}

function handleMaxPriceInput() {
  localStorage.setItem("products-ui-maxPrice", maxPriceInput.value || "");
  applyFilters();
}

function handleNameFilterInput() {
  localStorage.setItem("products-ui-name", nameFilterInput.value || "");
  if (navbarSearchInput) {
    navbarSearchInput.value = nameFilterInput.value;
  }
  applyFilters();
}

function handleRatingFilterInput() {
  localStorage.setItem("products-ui-rating", ratingFilterInput.value || "");
  applyFilters();
}

function handleSortChange() {
  localStorage.setItem("products-ui-sort", sortSelect.value || "");
  applyFilters();
}

minPriceInput.addEventListener("input", handleMinPriceInput);
maxPriceInput.addEventListener("input", handleMaxPriceInput);
nameFilterInput.addEventListener("input", handleNameFilterInput);
ratingFilterInput.addEventListener("input", handleRatingFilterInput);
sortSelect.addEventListener("change", handleSortChange);

function handleNavbarSearch() {
  if (!navbarSearchInput) return;
  nameFilterInput.value = navbarSearchInput.value;
  handleNameFilterInput();
}

if (navbarSearchInput && navbarSearchBtn) {
  navbarSearchBtn.addEventListener("click", handleNavbarSearch);
  navbarSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleNavbarSearch();
    }
  });
}

resetFiltersBtn.addEventListener("click", () => {
  categoryFilter.value = "";
  localStorage.removeItem("products-ui-category");
  minPriceInput.value = "";
  maxPriceInput.value = "";
  nameFilterInput.value = "";
  ratingFilterInput.value = "";
  sortSelect.value = "";
  localStorage.removeItem("products-ui-minPrice");
  localStorage.removeItem("products-ui-maxPrice");
  localStorage.removeItem("products-ui-name");
  localStorage.removeItem("products-ui-rating");
  localStorage.removeItem("products-ui-sort");
  applyFilters();
});

// ==== Init ====
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initViewMode();
  initFiltersFromStorage();
  loadCartFromStorage();
  fetchProducts();
});
