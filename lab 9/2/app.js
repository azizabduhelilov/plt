const loadBtn = document.querySelector('#loadBtn');
const searchInput = document.querySelector('#searchInput');
const status = document.querySelector('#status');
const postsContainer = document.querySelector('#posts');
let allPosts = [];

async function loadPosts() {
  loadBtn.disabled = true;
  searchInput.disabled = true;
  status.textContent = 'Загрузка публикаций...';
  postsContainer.replaceChildren();

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    allPosts = await response.json();
    searchInput.disabled = false;
    renderPosts(allPosts);
    status.textContent = `Загружено записей: ${allPosts.length}. Можно искать по заголовку.`;
  } catch (error) {
    allPosts = [];
    status.textContent = `Ошибка загрузки: ${error.message}. Проверьте сеть и попробуйте снова.`;
  } finally {
    loadBtn.disabled = false;
  }
}

function renderPosts(posts) {
  postsContainer.replaceChildren();
  for (const post of posts) {
    const card = document.createElement('article');
    card.className = 'card';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = `Публикация №${post.id}`;
    const title = document.createElement('h2');
    title.textContent = post.title;
    const body = document.createElement('p');
    body.textContent = post.body;
    card.append(badge, title, body);
    postsContainer.append(card);
  }
  if (posts.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'По вашему запросу ничего не найдено.';
    postsContainer.append(empty);
  }
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLocaleLowerCase('ru');
  const filtered = allPosts.filter(post => post.title.toLocaleLowerCase('ru').includes(query));
  renderPosts(filtered);
  status.textContent = `Найдено публикаций: ${filtered.length} из ${allPosts.length}`;
});
loadBtn.addEventListener('click', loadPosts);
