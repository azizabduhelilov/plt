// DOM-слой: создание строк таблицы и управление сообщениями.
export function renderClients(clients, tbody, summary) {
  tbody.replaceChildren();
  clients.forEach(client => {
    const tr = document.createElement("tr");
    [client.name, client.phone, client.email].forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    });
    const actions = document.createElement("td");
    const wrapper = document.createElement("div");
    wrapper.className = "actions";
    const edit = document.createElement("button");
    edit.className = "edit";
    edit.textContent = "Изменить";
    edit.dataset.action = "edit";
    edit.dataset.id = client.id;
    const remove = document.createElement("button");
    remove.className = "delete";
    remove.textContent = "Удалить";
    remove.dataset.action = "delete";
    remove.dataset.id = client.id;
    wrapper.append(edit, remove);
    actions.append(wrapper);
    tr.append(actions);
    tbody.append(tr);
  });
  summary.textContent = `Клиентов: ${clients.length}`;
}
export function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? "#b42318" : "#16803c";
}