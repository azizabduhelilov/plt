import { getTasks, addTask, toggleTask, deleteTask, clearCompleted } from "./modules/tasks.js";
import { renderTasks, showMessage } from "./modules/ui.js";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const counter = document.querySelector("#counter");
const message = document.querySelector("#message");
const refresh = () => renderTasks(getTasks(), list, counter);

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) {
    showMessage(message, "Введите название задачи.");
    input.focus();
    return;
  }
  addTask(title);
  input.value = "";
  showMessage(message, "Задача добавлена.");
  refresh();
});

list.addEventListener("click", event => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const id = Number(control.dataset.id);
  if (control.dataset.action === "delete") deleteTask(id);
  if (control.dataset.action === "toggle") toggleTask(id);
  showMessage(message, "");
  refresh();
});

document.querySelector("#clear-done").addEventListener("click", () => {
  clearCompleted();
  refresh();
  showMessage(message, "Выполненные задачи удалены.");
});
refresh();