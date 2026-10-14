const statuses = { new: "Новый", work: "В работе", ready: "Готовый" };
let orders = [
  { id: 101, name: "Заказ №101 — настройка сайта", status: "new" },
  { id: 102, name: "Заказ №102 — проверка формы", status: "work" },
  { id: 103, name: "Заказ №103 — обновление дизайна", status: "ready" },
  { id: 104, name: "Заказ №104 — исправление ошибок", status: "new" }
];
let currentStatus = "new";
const orderList = document.querySelector("#orders");
const tabs = document.querySelectorAll("[data-status]");
function render() {
  ["new", "work", "ready"].forEach(status => {
    document.querySelector(`#count-${status}`).textContent = orders.filter(order => order.status === status).length;
  });
  document.querySelector("#total").textContent = orders.length;
  const readyCount = orders.filter(order => order.status === "ready").length;
  document.querySelector("#completion").textContent = orders.length ? `${Math.round(readyCount / orders.length * 100)}%` : "0%";
  orderList.replaceChildren();
  const filtered = orders.filter(order => order.status === currentStatus);
  if (!filtered.length) { const p = document.createElement("p"); p.className = "empty"; p.textContent = "В этой категории заказов нет."; orderList.append(p); }
  filtered.forEach(order => {
    const row = document.createElement("article"); row.className = "order";
    const info = document.createElement("div"); info.className = "order-info";
    const name = document.createElement("strong"); name.textContent = order.name;
    const status = document.createElement("small"); status.textContent = `Текущий статус: ${statuses[order.status]}`;
    info.append(name, status);
    const select = document.createElement("select"); select.setAttribute("aria-label", `Статус заказа ${order.id}`);
    Object.entries(statuses).forEach(([value, label]) => { const option = document.createElement("option"); option.value = value; option.textContent = label; option.selected = value === order.status; select.append(option); });
    select.addEventListener("change", () => { order.status = select.value; render(); });
    row.append(info, select); orderList.append(row);
  });
}
tabs.forEach(tab => tab.addEventListener("click", () => {
  currentStatus = tab.dataset.status;
  tabs.forEach(item => item.classList.toggle("active", item === tab));
  render();
}));
document.querySelector("#order-form").addEventListener("submit", event => {
  event.preventDefault();
  const nameInput = document.querySelector("#order-name");
  const name = nameInput.value.trim();
  const error = document.querySelector("#error");
  if (!name) { error.textContent = "Введите название заказа."; return; }
  orders.push({ id: Date.now(), name, status: document.querySelector("#order-status").value });
  nameInput.value = ""; error.textContent = ""; render();
});
render();