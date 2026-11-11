import { getAllClients, createClient, updateClient, removeClient, searchClients } from "./modules/clients.js";
import { validateClient } from "./modules/validation.js";
import { saveClients, loadClients } from "./modules/storage.js";
import { renderClients, showMessage } from "./modules/ui.js";

const form = document.querySelector("#client-form");
const nameInput = document.querySelector("#name");
const phoneInput = document.querySelector("#phone");
const emailInput = document.querySelector("#email");
const searchInput = document.querySelector("#search");
const tbody = document.querySelector("#clients");
const summary = document.querySelector("#summary");
const message = document.querySelector("#message");
let editingId = null;

// Восстанавливаем данные при запуске.
const saved = loadClients();
saved.forEach(client => createClient({ name: client.name, phone: client.phone, email: client.email }));

function refresh() {
  const visible = searchInput.value ? searchClients(searchInput.value) : getAllClients();
  renderClients(visible, tbody, summary);
}
function persist() { saveClients(getAllClients()); }

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = { name: nameInput.value.trim(), phone: phoneInput.value.trim(), email: emailInput.value.trim() };
  const error = validateClient(data);
  if (error) { showMessage(message, error, true); return; }

  if (editingId === null) {
    createClient(data);
    showMessage(message, "Клиент добавлен.");
  } else {
    updateClient(editingId, data);
    editingId = null;
    form.querySelector('button[type="submit"]').textContent = "Добавить клиента";
    showMessage(message, "Данные клиента обновлены.");
  }
  persist();
  form.reset();
  refresh();
});

tbody.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const client = getAllClients().find(item => item.id === id);
  if (!client) return;

  if (button.dataset.action === "delete") {
    removeClient(id);
    persist();
    showMessage(message, "Клиент удалён.");
    refresh();
  } else if (button.dataset.action === "edit") {
    editingId = id;
    nameInput.value = client.name;
    phoneInput.value = client.phone;
    emailInput.value = client.email;
    form.querySelector('button[type="submit"]').textContent = "Сохранить изменения";
    showMessage(message, "Измените данные и нажмите «Сохранить изменения».");
    nameInput.focus();
  }
});

searchInput.addEventListener("input", refresh);
refresh();