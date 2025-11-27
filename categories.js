const API_URL = "https://fakestoreapi.com/products";

const categoriesGrid = document.getElementById("categoriesGrid");
const categoriesLoading = document.getElementById("categoriesLoading");
const categoriesError = document.getElementById("categoriesError");

function buildCategoryLink(category) {
  return `index.html?category=${encodeURIComponent(category)}`;
}

function renderCategories(categories) {
  categoriesGrid.innerHTML = "";
  categories.forEach((cat) => {
    const card = document.createElement("article");
    card.className = "category-card";

    const title = document.createElement("h3");
    title.textContent = cat;

    const desc = document.createElement("p");
    desc.textContent = "Shop curated picks from this category.";

    const link = document.createElement("a");
    link.className = "btn-details";
    link.href = buildCategoryLink(cat);
    link.textContent = "View products";

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(link);
    categoriesGrid.appendChild(card);
  });

  categoriesLoading.hidden = true;
  categoriesGrid.hidden = false;
}

async function fetchCategories() {
  categoriesLoading.hidden = false;
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const categories = Array.from(new Set(data.map((p) => p.category))).sort();
    renderCategories(categories);
  } catch (error) {
    console.error("Error loading categories:", error);
    categoriesLoading.hidden = true;
    categoriesError.hidden = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
});
