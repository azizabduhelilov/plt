// Модель задач: операции над данными не зависят от HTML.
let tasks = [];
let nextId = 1;
export function getTasks() { return tasks.map(task => ({ ...task })); }
export function addTask(title) {
  const task = { id: nextId++, title, completed: false };
  tasks.push(task);
  return { ...task };
}
export function toggleTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return false;
  task.completed = !task.completed;
  return true;
}
export function deleteTask(id) {
  const before = tasks.length;
  tasks = tasks.filter(task => task.id !== id);
  return tasks.length !== before;
}
export function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
}
