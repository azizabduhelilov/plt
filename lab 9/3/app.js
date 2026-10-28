const loadBtn = document.querySelector('#loadBtn');
const sortSelect = document.querySelector('#sortSelect');
const status = document.querySelector('#status');
const summary = document.querySelector('#summary');
const usersContainer = document.querySelector('#users');
let combinedUsers = [];

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} при запросе ${url}`);
  return response.json();
}

async function loadDashboard() {
  loadBtn.disabled = true;
  status.textContent = 'Параллельно загружаются пользователи и публикации...';
  summary.replaceChildren();
  usersContainer.replaceChildren();

  try {
    // Оба ресурса запрашиваются одновременно.
    const [users, posts] = await Promise.all([
      fetchJson('https://jsonplaceholder.typicode.com/users'),
      fetchJson('https://jsonplaceholder.typicode.com/posts')
    ]);

    combinedUsers = users.map(user => ({
      ...user,
      postCount: posts.filter(post => post.userId === user.id).length
    }));
    renderDashboard();
    const totalPosts = combinedUsers.reduce((sum, user) => sum + user.postCount, 0);
    addStat('Пользователей', users.length);
    addStat('Публикаций', totalPosts);
    status.textContent = 'Данные успешно загружены. Можно изменить сортировку или повторить запрос.';
  } catch (error) {
    combinedUsers = [];
    status.textContent = `Не удалось загрузить данные: ${error.message}. Проверьте подключение и повторите попытку.`;
  } finally {
    loadBtn.disabled = false;
  }
}

function addStat(label, value) {
  const box = document.createElement('div');
  box.className = 'stat';
  const caption = document.createElement('span');
  caption.textContent = label;
  const number = document.createElement('strong');
  number.textContent = value;
  box.append(caption, number);
  summary.append(box);
}

function renderDashboard() {
  usersContainer.replaceChildren();
  const sorted = [...combinedUsers].sort((a, b) => {
    if (sortSelect.value === 'count') return b.postCount - a.postCount || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });

  for (const user of sorted) {
    const card = document.createElement('article');
    card.className = 'card';
    const name = document.createElement('h2');
    name.textContent = user.name;
    const username = document.createElement('p');
    username.textContent = `Логин: ${user.username}`;
    const email = document.createElement('p');
    email.textContent = `Email: ${user.email}`;
    const company = document.createElement('p');
    company.textContent = `Компания: ${user.company.name}`;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = `Публикаций: ${user.postCount}`;
    card.append(name, username, email, company, count);
    usersContainer.append(card);
  }
}

loadBtn.addEventListener('click', loadDashboard);
sortSelect.addEventListener('change', renderDashboard);
