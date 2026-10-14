const pages = {
  about: { title: "О себе", body: "Меня зовут Азиз. Я студент направления «Информационные системы». Изучаю программирование и веб-разработку." },
  skills: { title: "Навыки", items: ["Основы HTML и CSS", "Основы JavaScript", "Работа в Visual Studio Code", "Основы Git и GitHub"] },
  contacts: { title: "Контакты", body: "Email: student@example.com", extra: "Город: Алматы" }
};
const content = document.querySelector("#content");
const tabs = document.querySelectorAll("[data-page]");
function showPage(pageName) {
  const page = pages[pageName];
  content.replaceChildren();
  const title = document.createElement("h2");
  title.textContent = page.title;
  content.append(title);
  const panel = document.createElement("div");
  panel.className = "info";
  if (page.items) {
    const list = document.createElement("ul");
    page.items.forEach(item => { const li = document.createElement("li"); li.textContent = item; list.append(li); });
    panel.append(list);
  } else {
    panel.textContent = page.body;
    if (page.extra) { const p = document.createElement("p"); p.textContent = page.extra; panel.append(p); }
  }
  content.append(panel);
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.page === pageName));
}
tabs.forEach(tab => tab.addEventListener("click", () => showPage(tab.dataset.page)));
showPage("about");