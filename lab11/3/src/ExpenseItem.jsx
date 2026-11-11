export default function ExpenseItem({ expense, currency, onDelete }) {
  return (
    <li className="expense-item">
      <div className="expense-info">
        <strong>{expense.title}</strong>
        <span>{expense.category}</span>
      </div>
      <strong className="expense-amount">{expense.amount.toLocaleString("ru-RU")} {currency}</strong>
      <button className="icon-button" onClick={() => onDelete(expense.id)} aria-label={`Удалить ${expense.title}`}>×</button>
    </li>
  );
}