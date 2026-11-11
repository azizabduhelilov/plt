import { useState } from "react";

const categories = ["Еда", "Транспорт", "Учёба", "Развлечения", "Другое"];

export default function ExpenseForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const numericAmount = Number(amount);
    if (!cleanTitle) {
      setError("Введите название расхода.");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Сумма должна быть положительным числом.");
      return;
    }
    onAdd({ id: Date.now(), title: cleanTitle, amount: numericAmount, category });
    setTitle("");
    setAmount("");
    setCategory(categories[0]);
    setError("");
  }

  return (
    <form className="expense-form" onSubmit={submit}>
      <label>Название
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: обед" />
      </label>
      <label>Сумма
        <input type="number" min="0.01" step="0.01" value={amount}
          onChange={(e) => setAmount(e.target.value)} placeholder="0" />
      </label>
      <label>Категория
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <button className="button button-primary" type="submit">Добавить расход</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}