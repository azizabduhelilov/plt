// Отображение модели задач в DOM.
export function renderTasks(tasks, listElement, counterElement) {
  listElement.replaceChildren();
  tasks.forEach(task => {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("done");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.dataset.action = "toggle";
    checkbox.dataset.id = task.id;
    const title = document.createElement("span");
    title.className = "task-text";
    title.textContent = task.title;
    const remove = document.createElement("button");
    remove.className = "delete";
    remove.textContent = "Удалить";
    remove.dataset.action = "delete";
    remove.dataset.id = task.id;
    li.append(checkbox, title, remove);
    listElement.append(li);
  });
  counterElement.textContent = `Всего: ${tasks.length} · Выполнено: ${tasks.filter(t => t.completed).length}`;
}
export function showMessage(element, message) {
  element.textContent = message;
}