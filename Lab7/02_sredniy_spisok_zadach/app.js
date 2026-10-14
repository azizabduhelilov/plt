let tasks = [
  { id: 1, title: "Прочитать задание лабораторной", done: true },
  { id: 2, title: "Написать HTML и CSS", done: false },
  { id: 3, title: "Проверить работу JavaScript", done: false }
];
let currentFilter = "all";
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const error = document.querySelector("#form-error");
const tabs = document.querySelectorAll("[data-filter]");
function render() {
  const filtered = tasks.filter(task => currentFilter === "all" || (currentFilter === "active" && !task.done) || (currentFilter === "done" && task.done));
  document.querySelector("#count-all").textContent = tasks.length;
  document.querySelector("#count-active").textContent = tasks.filter(t => !t.done).length;
  document.querySelector("#count-done").textContent = tasks.filter(t => t.done).length;
  list.replaceChildren();
  if (!filtered.length) { const p = document.createElement("p"); p.className = "empty"; p.textContent = "В этом разделе пока нет задач."; list.append(p); }
  filtered.forEach(task => {
    const row = document.createElement("div"); row.className = `task${task.done ? " done" : ""}`;
    const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = task.done; checkbox.setAttribute("aria-label", "Изменить статус задачи");
    checkbox.addEventListener("change", () => { task.done = checkbox.checked; render(); });
    const title = document.createElement("span"); title.textContent = task.title;
    const del = document.createElement("button"); del.className = "delete"; del.textContent = "Удалить";
    del.addEventListener("click", () => { tasks = tasks.filter(t => t.id !== task.id); render(); });
    row.append(checkbox, title, del); list.append(row);
  });
}
form.addEventListener("submit", event => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) { error.textContent = "Введите название задачи."; return; }
  tasks.push({ id: Date.now(), title, done: false }); input.value = ""; error.textContent = ""; render();
});
tabs.forEach(tab => tab.addEventListener("click", () => {
  currentFilter = tab.dataset.filter;
  tabs.forEach(item => item.classList.toggle("active", item === tab));
  render();
}));
render();