let queue=[], served=[], nextId=1001;
const $=id=>document.getElementById(id);
function render(){
 $('queueCount').textContent=`${queue.length} в очереди`;$('pending').textContent=queue.length;$('served').textContent=served.length;
 $('orders').innerHTML='';
 if(!queue.length){$('orders').innerHTML='<div class="empty"><b>Очередь пуста</b>Новые заказы появятся здесь</div>';return;}
 queue.forEach((o,i)=>{const el=document.createElement('div');el.className='item';el.innerHTML=`<div class="item-main"><span class="dot"></span><div><div class="item-name">${escapeHtml(o.id)} · ${escapeHtml(o.customer)}</div><div class="meta">${escapeHtml(o.details)}</div></div></div><span class="pill">#${i+1}</span>`;$('orders').append(el)});
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
$('add').onclick=()=>{let customer=$('customer').value.trim(),details=$('details').value.trim();if(!customer||!details)return alert('Заполните имя клиента и описание заказа.');queue.push({id:`ORD-${nextId++}`,customer,details});$('customer').value='';$('details').value='';render();};
$('serve').onclick=()=>{if(!queue.length)return alert('Нет заказов для обработки.');let order=queue.shift();served.push(order);render();alert(`Заказ ${order.id} клиента ${order.customer} обработан.`)};
$('search').addEventListener('input',()=>{let id=$('search').value.trim().toUpperCase();if(!id){$('searchResult').textContent='Введите номер, например ORD-1001';return;}let o=queue.find(x=>x.id===id)||served.find(x=>x.id===id);$('searchResult').textContent=o?`${o.id} · ${o.customer} — ${o.details} (${queue.includes(o)?'ожидает':'обработан'})`:'Заказ с таким номером не найден.';});
$('report').onclick=()=>{$('reportBox').textContent=`Отчёт: в очереди ${queue.length}; обработано ${served.length}. ${queue.length?`Следующий заказ: ${queue[0].id}.`:'Ожидающих заказов нет.'}`};
render();
