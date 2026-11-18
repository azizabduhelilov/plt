const express=require('express'),session=require('express-session'),path=require('path');
const app=express(),PORT=3001;
app.use(express.json());app.use(express.urlencoded({extended:true}));
app.use(session({name:'student.sid',secret:process.env.SESSION_SECRET||'demo-secret-change-me',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:false,maxAge:1800000}}));
app.use(express.static(path.join(__dirname,'public')));
const demo={username:'student',password:'12345',name:'Тестовый студент',group:'ИС 25 22'};
function auth(req,res,next){if(!req.session.user)return res.status(401).json({error:'Сначала войдите в систему.'});next();}
app.post('/api/login',(req,res)=>{const{username,password}=req.body;if(!username||!password)return res.status(400).json({error:'Заполните логин и пароль.'});if(username!==demo.username||password!==demo.password)return res.status(401).json({error:'Неверный логин или пароль.'});req.session.user={username,name:demo.name,group:demo.group};res.json({message:'Вход выполнен.'});});
app.get('/api/profile',auth,(req,res)=>res.json(req.session.user));
app.post('/api/logout',auth,(req,res)=>req.session.destroy(e=>{if(e)return res.status(500).json({error:'Ошибка выхода.'});res.clearCookie('student.sid');res.json({message:'Вы вышли из кабинета.'});}));
app.listen(PORT,()=>console.log('http://localhost:'+PORT));
