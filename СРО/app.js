(() => {
  "use strict";

  const STORAGE_KEY = "personal-expenses-v1";
  const categories = {
    expense: ["Продукты", "Транспорт", "Жильё", "Здоровье", "Развлечения", "Покупки", "Образование", "Связь", "Другое"],
    income: ["Зарплата", "Подработка", "Подарок", "Стипендия", "Инвестиции", "Другое"]
  };
  const categoryColors = ["#8276f5", "#39b990", "#f0a35e", "#e87886", "#56a9d8", "#b78be5", "#e2c64f", "#66b9c2", "#a0a8b8"];
  const $ = (selector) => document.querySelector(selector);
  const form = $("#transactionForm");
  const dialog = $("#transactionDialog");
  let transactions = loadTransactions();
  let showAll = false;
  let toastTimer;

  function loadTransactions() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(stored)) return [];
      return stored.filter(item =>
        item && typeof item.id === "string" &&
        ["income", "expense"].includes(item.type) &&
        typeof item.description === "string" &&
        Number.isFinite(item.amount) && item.amount > 0 &&
        typeof item.category === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date)
      );
    } catch (error) {
      return [];
    }
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      showToast("Не удалось сохранить данные. Проверьте настройки браузера.");
    }
  }

  function money(value) {
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value) + " ₸";
  }

  function formatDate(dateString) {
    const parts = dateString.split("-");
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  function safeText(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  function renderSummary() {
    const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    $("#balanceValue").textContent = money(income - expenses);
    $("#incomeValue").textContent = money(income);
    $("#expenseValue").textContent = money(expenses);
    $("#reportExpenseTotal").textContent = money(expenses);
  }

  function getFilteredTransactions() {
    const query = $("#searchInput").value.trim().toLocaleLowerCase("ru");
    const type = $("#typeFilter").value;
    return [...transactions]
      .filter(t => type === "all" || t.type === type)
      .filter(t => `${t.description} ${t.category}`.toLocaleLowerCase("ru").includes(query))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }

  function renderTransactions() {
    const filtered = getFilteredTransactions();
    const visible = showAll ? filtered : filtered.slice(0, 6);
    $("#transactionsBody").innerHTML = visible.map(t => `
      <tr>
        <td><div class="transaction-name"><span class="transaction-icon ${t.type}">${t.type === "income" ? "↗" : "↘"}</span><span>${safeText(t.description)}</span></div></td>
        <td><span class="category-pill">${safeText(t.category)}</span></td>
        <td>${formatDate(t.date)}</td>
        <td class="right money ${t.type}">${t.type === "income" ? "+" : "−"}${money(t.amount)}</td>
        <td><button class="delete-btn" data-delete="${safeText(t.id)}" aria-label="Удалить ${safeText(t.description)}" title="Удалить операцию">×</button></td>
      </tr>`).join("");
    const empty = filtered.length === 0;
    $("#emptyState").classList.toggle("visible", empty);
    $("#transactionsBody").parentElement.style.display = empty ? "none" : "table";
    $("#showAllButton").textContent = showAll ? "Свернуть" : "Показать все";
    $("#showAllButton").style.visibility = filtered.length > 6 ? "visible" : "hidden";
  }

  function renderReport() {
    const expenses = transactions.filter(t => t.type === "expense");
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totals = expenses.reduce((map, t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
      return map;
    }, {});
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) {
      $("#categoryReport").innerHTML = '<div class="report-empty">Здесь появится распределение расходов по категориям после добавления операций.</div>';
      return;
    }
    $("#categoryReport").innerHTML = sorted.map(([name, amount], index) => {
      const color = categoryColors[index % categoryColors.length];
      const percent = total ? Math.round(amount / total * 100) : 0;
      return `<div class="category-row"><div class="category-info"><span class="category-name"><span class="category-dot" style="background:${color}"></span>${safeText(name)}</span><span class="category-value">${money(amount)} · ${percent}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%;background:${color}"></div></div></div>`;
    }).join("");
  }

  function render() {
    renderSummary();
    renderTransactions();
    renderReport();
  }

  function updateCategories() {
    const type = form.querySelector('input[name="type"]:checked').value;
    const select = $("#category");
    const previous = select.value;
    select.innerHTML = categories[type].map(c => `<option value="${safeText(c)}">${safeText(c)}</option>`).join("");
    if (categories[type].includes(previous)) select.value = previous;
  }

  function openDialog(type = "expense") {
    form.reset();
    form.querySelector(`input[name="type"][value="${type}"]`).checked = true;
    $("#date").value = new Date().toLocaleDateString("en-CA");
    $("#formError").textContent = "";
    updateCategories();
    dialog.showModal();
    $("#description").focus();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function validateForm(data) {
    if (!data.description || data.description.length > 70) return "Введите описание длиной до 70 символов.";
    if (!Number.isFinite(data.amount) || !Number.isInteger(data.amount) || data.amount <= 0 || data.amount > 1000000000) return "Сумма должна быть целым числом от 1 до 1 000 000 000 ₸.";
    if (!categories[data.type].includes(data.category)) return "Выберите корректную категорию.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date))) return "Укажите корректную дату.";
    if (data.date > new Date().toLocaleDateString("en-CA")) return "Дата не может быть в будущем.";
    return "";
  }

  $("#addTopButton").addEventListener("click", () => openDialog());
  $("#emptyAddButton").addEventListener("click", () => openDialog());
  $("#closeDialog").addEventListener("click", () => dialog.close());
  $("#cancelButton").addEventListener("click", () => dialog.close());
  form.querySelectorAll('input[name="type"]').forEach(input => input.addEventListener("change", updateCategories));
  $("#searchInput").addEventListener("input", renderTransactions);
  $("#typeFilter").addEventListener("change", renderTransactions);
  $("#showAllButton").addEventListener("click", () => { showAll = !showAll; renderTransactions(); });

  $("#transactionsBody").addEventListener("click", event => {
    const button = event.target.closest("[data-delete]");
    if (!button) return;
    const transaction = transactions.find(t => t.id === button.dataset.delete);
    if (!transaction) return;
    if (confirm(`Удалить операцию «${transaction.description}»?`)) {
      transactions = transactions.filter(t => t.id !== transaction.id);
      saveTransactions();
      render();
      showToast("Операция удалена.");
    }
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: form.querySelector('input[name="type"]:checked').value,
      description: $("#description").value.trim(),
      amount: Number($("#amount").value),
      category: $("#category").value,
      date: $("#date").value
    };
    const error = validateForm(data);
    if (error) { $("#formError").textContent = error; return; }
    transactions.push(data);
    saveTransactions();
    render();
    dialog.close();
    showToast(data.type === "income" ? "Доход успешно добавлен." : "Расход успешно добавлен.");
  });

  // Установка сегодняшней даты и первичная отрисовка интерфейса.
  $("#date").max = new Date().toLocaleDateString("en-CA");
  updateCategories();
  render();
})();