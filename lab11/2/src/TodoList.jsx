import { useMemo, useState } from "react";
import TodoItem from "./TodoItem.jsx";

export default function TodoList({ initialTasks = [] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const completed = tasks.filter((task) => task.done).length;

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === "active") return !task.done;
    if (filter === "done") return task.done;
    return true;
  }), [tasks, filter]);

  function addTask(event) {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;
    setTasks((current) => [...current, { id: Date.now(), text: cleanText, done: false }]);
    setText("");
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    <article className="panel">
      <form className="add-form" onSubmit={addTask}>
        <input value={text} onChange={(event) => setText(event.target.value)}
          placeholder="Например: подготовить отчёт" aria-label="Новая задача" />
        <button className="button button-primary" type="submit">Добавить</button>
      </form>
      <div className="list-toolbar">
        <span className="muted">Выполнено: <strong>{completed}</strong> из <strong>{tasks.length}</strong></span>
        <div className="filter-buttons">
          {[
            ["all", "Все"], ["active", "Активные"], ["done", "Готовые"]
          ].map(([value, title]) => (
            <button key={value} className={`filter-button ${filter === value ? "selected" : ""}`}
              onClick={() => setFilter(value)} type="button">{title}</button>
          ))}
        </div>
      </div>
      <ul className="todo-list">
        {visibleTasks.map((task) => <TodoItem key={task.id} task={task}
          onToggle={toggleTask} onDelete={deleteTask} />)}
      </ul>
      {visibleTasks.length === 0 && <p className="empty-state">Задач в этой категории пока нет.</p>}
    </article>
  );
}