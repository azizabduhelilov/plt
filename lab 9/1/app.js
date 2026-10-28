const loadBtn = document.querySelector('#loadBtn');
const status = document.querySelector('#status');
const postsList = document.querySelector('#posts');

async function loadPosts() {
  loadBtn.disabled = true;
  status.textContent = 'Загрузка...';
  postsList.replaceChildren();

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    const posts = await response.json();

    if (!posts.length) {
      status.textContent = 'Публикации не найдены.';
      return;
    }

    for (const post of posts) {
      const item = document.createElement('li');
      const id = document.createElement('span');
      id.className = 'post-id';
      id.textContent = `#${post.id}`;
      const title = document.createElement('span');
      title.textContent = post.title;
      item.append(id, title);
      postsList.append(item);
    }
    status.textContent = `Успешно загружено публикаций: ${posts.length}`;
  } catch (error) {
    status.textContent = `Не удалось загрузить данные: ${error.message}. Проверьте подключение и повторите попытку.`;
  } finally {
    loadBtn.disabled = false;
  }
}
loadBtn.addEventListener('click', loadPosts);
