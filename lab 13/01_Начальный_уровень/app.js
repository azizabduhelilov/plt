let products = [];
let bought = new Set();
const input=document.getElementById('product'), items=document.getElementById('items');
function render(){
 items.innerHTML='';
 document.getElementById('count').textContent=`${products.length} товаров`;
 document.getElementById('total').textContent=products.length;
 document.getElementById('done').textContent=bought.size;
 document.getElementById('left').textContent=products.length-bought.size;
 if(!products.length){items.innerHTML='<div class="empty"><b>Пока здесь пусто</b>Добавь первый товар в список</div>';return;}
 products.forEach((name,i)=>{
  const row=document.createElement('div');row.className='item';
  const main=document.createElement('div');main.className='item-main';
  const dot=document.createElement('span');dot.className='dot';dot.style.background=bought.has(name)?'var(--accent2)':'var(--accent)';
  const label=document.createElement('span');label.className='item-name';label.textContent=name;if(bought.has(name))label.style.textDecoration='line-through',label.style.opacity='.55';
  main.append(dot,label);
  const actions=document.createElement('div');actions.className='row';
  const check=document.createElement('button');check.className='iconbtn';check.textContent=bought.has(name)?'↶':'✓';check.title='Отметить покупку';check.onclick=()=>{bought.has(name)?bought.delete(name):bought.add(name);render()};
  const del=document.createElement('button');del.className='iconbtn';del.textContent='×';del.title='Удалить товар';del.onclick=()=>{products.splice(i,1);bought.delete(name);render()};
  actions.append(check,del);row.append(main,actions);items.append(row);
 });
}
function add(){const value=input.value.trim();if(!value)return alert('Введите название товара.');if(products.some(x=>x.toLowerCase()===value.toLowerCase()))return alert('Этот товар уже есть в списке.');products.push(value);input.value='';render();input.focus();}
document.getElementById('add').onclick=add;input.addEventListener('keydown',e=>{if(e.key==='Enter')add()});
document.getElementById('clear').onclick=()=>{if(!products.length)return alert('Список уже пуст.');products=[];bought.clear();render()};
render();
