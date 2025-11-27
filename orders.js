const ordersListEl = document.getElementById("ordersList");
const ordersEmptyEl = document.getElementById("ordersEmpty");
const orderSearchInput = document.getElementById("orderSearch");
const orderSearchBtn = document.getElementById("orderSearchBtn");

const ordersData = [
  {
    id: "AL-1023",
    date: "Apr 12, 2024",
    total: 148.32,
    status: "Shipped",
    eta: "Apr 18",
    items: [
      { title: "Wireless Headphones", qty: 1 },
      { title: "Protective Case", qty: 1 },
    ],
  },
  {
    id: "AL-1018",
    date: "Mar 28, 2024",
    total: 82.5,
    status: "Processing",
    eta: "Apr 15",
    items: [{ title: "Desk Lamp", qty: 2 }],
  },
  {
    id: "AL-1002",
    date: "Feb 10, 2024",
    total: 219.99,
    status: "Delivered",
    eta: "Feb 14",
    items: [
      { title: "Gaming Mouse", qty: 1 },
      { title: "Mechanical Keyboard", qty: 1 },
    ],
  },
];

function statusClass(status) {
  const value = status.toLowerCase();
  if (value.includes("shipp")) return "status-pill status-info";
  if (value.includes("process")) return "status-pill status-warn";
  if (value.includes("deliver")) return "status-pill status-success";
  return "status-pill";
}

function renderOrders(list) {
  ordersListEl.innerHTML = "";

  if (!list.length) {
    ordersEmptyEl.hidden = false;
    return;
  }

  ordersEmptyEl.hidden = true;

  list.forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";

    const header = document.createElement("div");
    header.className = "order-card-header";
    const idEl = document.createElement("div");
    idEl.className = "order-id";
    idEl.textContent = `Order ${order.id}`;
    const statusEl = document.createElement("span");
    statusEl.className = statusClass(order.status);
    statusEl.textContent = order.status;
    header.appendChild(idEl);
    header.appendChild(statusEl);

    const meta = document.createElement("div");
    meta.className = "order-meta";
    meta.textContent = `${order.date} • ETA: ${order.eta}`;

    const itemsList = document.createElement("ul");
    itemsList.className = "order-items";
    order.items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.title} — Qty ${item.qty}`;
      itemsList.appendChild(li);
    });

    const totalRow = document.createElement("div");
    totalRow.className = "order-total-row";
    totalRow.innerHTML = `<span>Total</span><strong>$${order.total.toFixed(2)}</strong>`;

    const actions = document.createElement("div");
    actions.className = "order-actions";
    const trackLink = document.createElement("a");
    trackLink.href = "#";
    trackLink.className = "btn-details";
    trackLink.textContent = "Track";
    const reorderLink = document.createElement("a");
    reorderLink.href = "index.html";
    reorderLink.className = "btn-add-cart";
    reorderLink.textContent = "Reorder";
    actions.appendChild(trackLink);
    actions.appendChild(reorderLink);

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(itemsList);
    card.appendChild(totalRow);
    card.appendChild(actions);

    ordersListEl.appendChild(card);
  });
}

function handleSearch() {
  const query = (orderSearchInput.value || "").trim().toLowerCase();
  const filtered = ordersData.filter(
    (order) =>
      order.id.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
  );
  renderOrders(filtered);
}

orderSearchBtn.addEventListener("click", handleSearch);
orderSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderOrders(ordersData);
});
