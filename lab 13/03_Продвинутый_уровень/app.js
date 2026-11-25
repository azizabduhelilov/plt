let urgent=[],normal=[],completed=[],id=1;
const $=x=>document.getElementById(x);
function render(){
 $('urgentCount').textContent=urgent.length;$('normalCount').textContent=normal.length;$('completed').textContent=completed.length;$('total').textContent=`${urgent.length+normal.length} задач`;
 draw('urgentList',urgent,'var(--gold)');draw('normalList',normal,'var(--accent)');
}
function draw(target,arr,color){const box=$(target);box.innerHTML='';if(!arr.length){box.innerHTML='<div class="empty">Очередь пуста</div>';return;}arr.forEach((t,i)=>{const el=document.createElement('div');el.className='item';const main=document.createElement('div');main.className='item-main';const dot=document.createElement('span');dot.className='dot';dot.style.background=color;const text=document.createElement('div');text.innerHTML=`<div class="item-name"></div><div class="meta">Задача #${t.id} · позиция ${i+1}</div>`;text.querySelector('.item-name').textContent=t.name;main.append(dot,text);el.append(main);box.append(el);});}
$('add').onclick=()=>{let name=$('taskName').value.trim();if(!name)return alert('Введите название задачи.');let isUrgent=$('priority').value==='urgent';let task={id:id++,name,wasUrgent:isUrgent};(isUrgent?urgent:normal).push(task);$('taskName').value='';render();};
$('taskName').addEventListener('keydown',e=>{if(e.key==='Enter')$('add').click()});
$('next').onclick=()=>{let task=urgent.length?urgent.shift():normal.shift();if(!task){$('current').textContent='Нет задач для выполнения.';return alert('Все очереди пусты.');}completed.push(task);$('current').textContent=`Выполнена задача #${task.id}: ${task.name} (${task.wasUrgent?'срочная':'по очереди'}).`;render();};
$('history').onclick=()=>{$('historyBox').textContent=completed.length?`Выполнено: ${completed.map(t=>`#${t.id} ${t.name}`).join(' · ')}`:'История пока пуста.'};
render();
