const form = document.querySelector("#addForm");
const input = document.querySelector("#itemInput");
const list = document.querySelector("#list");
const empty = document.querySelector("#empty");
const stats = document.querySelector("#stats");
const bar = document.querySelector("#bar");
const clearBtn = document.querySelector("#clearBtn");

// Добавление пункта (событие submit — срабатывает и по кнопке, и по Enter)
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();

  if (text === "") {
    input.classList.add("error");
    setTimeout(() => input.classList.remove("error"), 400);
    return;
  }

  const item = document.createElement("li");

  const span = document.createElement("span");
  span.className = "text";
  span.textContent = text;

  const del = document.createElement("button");
  del.className = "del";
  del.type = "button";
  del.textContent = "✕";
  del.title = "Удалить";

  item.append(span, del);
  list.append(item);

  input.value = "";
  input.focus();
  updateStats();
});

// Клик по списку: отметить / удалить (делегирование событий)
list.addEventListener("click", (e) => {
  const item = e.target.closest("li");
  if (!item) return;

  if (e.target.classList.contains("del")) {
    item.remove();
  } else {
    item.classList.toggle("done");
  }
  updateStats();
});

// Очистить купленное
clearBtn.addEventListener("click", () => {
  list.querySelectorAll("li.done").forEach((li) => li.remove());
  updateStats();
});

// Обновление счётчика и прогресса
function updateStats() {
  const total = list.querySelectorAll("li").length;
  const done = list.querySelectorAll("li.done").length;

  empty.hidden = total > 0;
  stats.textContent = total ? `Куплено ${done} из ${total}` : "Пока пусто";
  bar.style.width = total ? (done / total) * 100 + "%" : "0%";
}

updateStats();