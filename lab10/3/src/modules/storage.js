// Сохранение и загрузка JSON в localStorage.
const STORAGE_KEY = "lab10-mini-crm-clients";
export function saveClients(clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}
export function loadClients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}