export default function TodoItem({ task, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${task.done ? "is-done" : ""}`}>
      <label className="todo-label">
        <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} />
        <span>{task.text}</span>
      </label>
      <button className="icon-button" onClick={() => onDelete(task.id)} aria-label={`Удалить: ${task.text}`}>×</button>
    </li>
  );
}