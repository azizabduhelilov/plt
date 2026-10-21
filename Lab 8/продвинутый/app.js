(() => {
'use strict';
const K={shopping:'lab8_shopping_list',expenses:'lab8_expenses',budget:'lab8_personal_budget',draft:'lab8_budget_edit_draft'};
const expCats=['Продукты','Транспорт','Учёба','Развлечения','Здоровье','Другое'];
const budgetCats={expense:['Продукты','Транспорт','Жильё','Здоровье','Развлечения','Покупки','Образование','Связь','Другое'],income:['Зарплата','Подработка','Подарок','Стипендия','Инвестиции','Другое']};
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function load(key,valid){try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data.filter(valid):[]}catch(e){return []}}
function save(key,data){try{localStorage.setItem(key,JSON.stringify(data))}catch(e){alert('Не удалось сохранить данные в хранилище браузера.')}}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function money(n){return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n)+' ₸'}
function dateText(s){const [y,m,d]=s.split('-');return `${d}.${m}.${y}`}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&s<=today()}
// ЗАДАНИЕ: Список покупок
// список покупок — массив строк в localStorage.
let shopping=load(K.shopping,x=>typeof x==='string');
function renderShopping(){ $('shoppingList').innerHTML=shopping.map((x,i)=>`<li><span>${esc(x)}</span><button class="remove-btn" type="button" data-shop-del="${i}">Удалить</button></li>`).join('');$('shoppingEmpty').style.display=shopping.length?'none':'block';$('shoppingCount').textContent=`${shopping.length} товаров` }
$('shoppingForm').addEventListener('submit',e=>{e.preventDefault();const input=$('shoppingInput'),name=input.value.trim();if(!name){input.setCustomValidity('Введите название товара.');input.reportValidity();input.setCustomValidity('');return}shopping.push(name);save(K.shopping,shopping);input.value='';renderShopping();input.focus()});
$('shoppingList').addEventListener('click',e=>{const b=e.target.closest('[data-shop-del]');if(!b)return;shopping.splice(Number(b.dataset.shopDel),1);save(K.shopping,shopping);renderShopping()});
$('clearShopping').addEventListener('click',()=>{if(!shopping.length||confirm('Очистить весь список покупок?')){shopping=[];save(K.shopping,shopping);renderShopping()}});

renderShopping();
})();
