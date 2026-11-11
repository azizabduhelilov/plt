// Проверка входных данных CRM.
export function validateClient({ name, phone, email }) {
  if (!name.trim()) return "Укажите имя клиента.";
  if (!phone.trim()) return "Укажите номер телефона.";
  if (!/^[+\d()\-\s]{5,25}$/.test(phone.trim())) return "Проверьте формат телефона.";
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Укажите корректный email.";
  return "";
}