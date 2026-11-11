import { useMemo, useState } from "react";
import ExpenseForm from "./ExpenseForm.jsx";
import ExpenseItem from "./ExpenseItem.jsx";

const filters = ["Все", "Еда", "Транспорт", "Учёба", "Развлечения", "Другое"];

export default function ExpensePlanner({ currency = "₸" }) {
  const [expenses, setExpenses] = useState([
    { id: 1, title: "Обед", amount: 1800, category: "Еда" },
    { id: 2, title: "Проезд", amount: 500, category: "Транспорт" },
    { id: 3, title: "Тетрадь", amount: 700, category: "Учёба" }
  ]);
  const [filter, setFilter] = useState("Все");

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const visibleExpenses = useMemo(() => filter === "Все"
    ? expenses
    : expenses.filter((item) => item.category === filter), [expenses, filter]);

  function addExpense(expense) {
    setExpenses((current) => [...current, expense]);
  }

  function deleteExpense(id) {
    setExpenses((current) => current.filter((item) => item.id !== id));
  }

  return (
    <article className="panel">
      <div className="total-card">
        <span>Общая сумма расходов</span>
        <strong>{total.toLocaleString("ru-RU")} {currency}</strong>
        <small>Количество записей: {expenses.length}</small>
      </div>
      <ExpenseForm onAdd={addExpense} />
      <div className="list-toolbar expense-toolbar">
        <h3>История расходов</h3>
        <select aria-label="Фильтр по категории" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {filters.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <ul className="expense-list">
        {visibleExpenses.map((expense) => <ExpenseItem key={expense.id}
          expense={expense} currency={currency} onDelete={deleteExpense} />)}
      </ul>
      {visibleExpenses.length === 0 && <p className="empty-state">В выбранной категории расходов нет.</p>}
    </article>
  );
}