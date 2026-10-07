const COLS = ["new", "progress", "done"];

const form = document.querySelector("#addForm");
const taskInput = document.querySelector("#taskInput");
const searchInput = document.querySelector("#searchInput");
const board = document.querySelector("#board");

// Загружаем сохранённую доску или стартовые карточки
let cards = JSON.parse(localStorage.getItem("kanban") || "null") || [
  { id: 1, text: "Изучить querySelector()", col: "new" },
  { id: 2, text: "Сделать лабораторную №6", col: "progress" },
  { id: 3, text: "Создать папку Lab6_DOM", col: "done" },
];

function save() {
  localStorage.setItem("kanban", JSON.stringify(cards));
}

// Создание DOM-элемента карточки
function createCard(card) {
  const index = COLS.indexOf(card.col);

  const el = document.createElement("article");
  el.className = "task";
  el.dataset.id = card.id;

  const text = document.createElement("p");
  text.textContent = card.text;

  const actions = document.createElement("div");
  actions.className = "actions";

  const left = makeButton("left", "←", "Переместить влево");
  left.disabled = index === 0;

  const right = makeButton("right", "→", "Переместить вправо");
  right.disabled = index === COLS.length - 1;

  const del = makeButton("delete", "🗑", "Удалить");
  del.classList.add("del");

  actions.append(left, right, del);
  el.append(text, actions);
  return el;
}

function makeButton(action, label, title) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.dataset.action = action;
  btn.textContent = label;
  btn.title = title;
  return btn;
}

// Перерисовка всей доски
function render() {
  const query = searchInput.value.trim().toLowerCase();

  COLS.forEach((col) => {
    const box = document.querySelector(`[data-list="${col}"]`);
    box.textContent = "";

    const colCards = cards.filter((c) => c.col === col);
    colCards
      .filter((c) => c.text.toLowerCase().includes(query))
      .forEach((c) => box.append(createCard(c)));

    document.querySelector(`[data-count="${col}"]`).textContent = colCards.length;
  });
}

// Добавление карточки в колонку «Новые»
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }
  cards.push({ id: Date.now(), text, col: "new" });
  taskInput.value = "";
  save();
  render();
});

// Кнопки на карточках (делегирование событий)
board.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = Number(btn.closest(".task").dataset.id);
  const card = cards.find((c) => c.id === id);
  const action = btn.dataset.action;

  if (action === "left") card.col = COLS[COLS.indexOf(card.col) - 1];
  if (action === "right") card.col = COLS[COLS.indexOf(card.col) + 1];
  if (action === "delete") cards = cards.filter((c) => c.id !== id);

  save();
  render();
});

// Поиск по карточкам
searchInput.addEventListener("input", render);

// Escape очищает поиск
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    searchInput.value = "";
    render();
  }
});

render();