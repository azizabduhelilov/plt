const $=s=>document.querySelector(s),msg=$('#message');
async function api(url,opt={}){let r=await fetch(url,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...opt}),d=await r.json();if(!r.ok)throw Error(d.error);return d}
async function dashboard(u){$('#login').classList.add('hidden');$('#dash').classList.remove('hidden');$('#hello').textContent=u.name;$('#role').textContent=u.role.toUpperCase();let d=await api('/api/'+u.role);$('#title').textContent=d.title;$('#items').innerHTML=d.items.map(x=>'<li>'+x+'</li>').join('')}
$('#form').onsubmit=async e=>{e.preventDefault();try{await api('/api/login',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});dashboard(await api('/api/me'))}catch(x){msg.textContent=x.message}};
$('#out').onclick=async()=>{try{let d=await api('/api/logout',{method:'POST'});$('#dash').classList.add('hidden');$('#login').classList.remove('hidden');$('#form').reset();msg.textContent=d.message}catch(x){msg.textContent=x.message}};
api('/api/me').then(dashboard).catch(()=>{});
