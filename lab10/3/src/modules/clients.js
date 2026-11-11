// CRUD-операции над данными клиентов.
let clients = [];
let nextId = 1;
export function getAllClients() { return clients.map(client => ({ ...client })); }
export function createClient(data) {
  const client = { id: nextId++, ...data };
  clients.push(client);
  return { ...client };
}
export function updateClient(id, data) {
  const index = clients.findIndex(client => client.id === id);
  if (index < 0) return false;
  clients[index] = { ...clients[index], ...data };
  return true;
}
export function removeClient(id) {
  const before = clients.length;
  clients = clients.filter(client => client.id !== id);
  return clients.length !== before;
}
export function searchClients(query) {
  const q = query.trim().toLowerCase();
  return getAllClients().filter(client =>
    [client.name, client.phone, client.email].some(value => value.toLowerCase().includes(q))
  );
}