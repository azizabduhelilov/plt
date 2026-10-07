const openBtn = document.querySelector("#openBtn");
const closeBtn = document.querySelector("#closeBtn");
const overlay = document.querySelector("#overlay");
const form = document.querySelector("#joinForm");
const nameInput = document.querySelector("#nameInput");
const emailInput = document.querySelector("#emailInput");
const nameMsg = document.querySelector("#nameMsg");
const emailMsg = document.querySelector("#emailMsg");
const toasts = document.querySelector("#toasts");

function openModal() {
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("lock");
  setTimeout(() => nameInput.focus(), 100);
}

function closeModal() {
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lock");
  openBtn.focus();
}

// Динамически создаём и удаляем уведомление
function showToast(text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  toasts.append(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setError(input, msgEl, text) {
  input.classList.toggle("invalid", Boolean(text));
  msgEl.textContent = text;
}

// 1. Открытие кнопкой
openBtn.addEventListener("click", openModal);

// 2. Закрытие крестиком
closeBtn.addEventListener("click", closeModal);

// 3. Закрытие кликом вне окна
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

// 4. Клавиатура: Escape закрывает, N открывает
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("open")) {
    closeModal();
  }
  const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
  if (e.key.toLowerCase() === "n" && !typing && !overlay.classList.contains("open")) {
    openModal();
  }
});

// Отправка формы с проверкой
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  let ok = true;

  if (name.length < 2) {
    setError(nameInput, nameMsg, "Введите имя (минимум 2 символа)");
    ok = false;
  } else setError(nameInput, nameMsg, "");

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    setError(emailInput, emailMsg, "Введите корректный email");
    ok = false;
  } else setError(emailInput, emailMsg, "");

  if (!ok) return;

  closeModal();
  form.reset();
  showToast(`🎉 Спасибо, ${name}! Заявка отправлена`);
});