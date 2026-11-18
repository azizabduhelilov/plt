const $=s=>document.querySelector(s),msg=$('#message');
async function api(url,opt={}){let r=await fetch(url,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...opt}),d=await r.json();if(!r.ok)throw Error(d.error);return d}
function show(u){$('#login').classList.add('hidden');$('#profile').classList.remove('hidden');$('#welcome').textContent='Здравствуйте, '+u.name;$('#name').textContent=u.name;$('#group').textContent=u.group}
$('#loginForm').onsubmit=async e=>{e.preventDefault();try{await api('/api/login',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});show(await api('/api/profile'));msg.textContent='Вход успешен.'}catch(x){msg.textContent=x.message}};
$('#logout').onclick=async()=>{try{let d=await api('/api/logout',{method:'POST'});$('#profile').classList.add('hidden');$('#login').classList.remove('hidden');$('#loginForm').reset();msg.textContent=d.message}catch(x){msg.textContent=x.message}};
api('/api/profile').then(show).catch(()=>{});
