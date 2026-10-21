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
// ЗАДАНИЕ: Учёт расходов
// расходы с категорией, суммой, датой и итогом.
let expenses=load(K.expenses,x=>x&&typeof x.id==='string'&&expCats.includes(x.category)&&Number.isInteger(x.amount)&&x.amount>0&&typeof x.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date));
function renderExpenses(){const total=expenses.reduce((s,x)=>s+x.amount,0);$('totalExpenses').textContent=money(total);$('expenseCount').textContent=expenses.length;$('expenseTable').innerHTML=[...expenses].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<tr><td>${esc(x.category)}</td><td>${dateText(x.date)}</td><td class="negative">−${money(x.amount)}</td><td><button class="remove-btn" data-exp-del="${esc(x.id)}">Удалить</button></td></tr>`).join('');$('expenseEmpty').style.display=expenses.length?'none':'block'}
$('expenseDate').value=today();$('expenseDate').max=today();
$('expenseForm').addEventListener('submit',e=>{e.preventDefault();const amount=Number($('expenseAmount').value),category=$('expenseCategory').value,date=$('expenseDate').value;if(!Number.isInteger(amount)||amount<1||amount>1e9){$('expenseError').textContent='Сумма должна быть целым числом от 1 до 1 000 000 000 ₸.';return}if(!expCats.includes(category)||!validDate(date)){$('expenseError').textContent='Выберите корректную категорию и дату не позднее сегодняшнего дня.';return}expenses.push({id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,category,amount,date});save(K.expenses,expenses);$('expenseAmount').value='';$('expenseError').textContent='';renderExpenses()});
$('expenseTable').addEventListener('click',e=>{const b=e.target.closest('[data-exp-del]');if(!b)return;expenses=expenses.filter(x=>x.id!==b.dataset.expDel);save(K.expenses,expenses);renderExpenses()});

renderExpenses();
})();
