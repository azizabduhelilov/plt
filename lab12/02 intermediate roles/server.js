const express=require('express'),session=require('express-session'),path=require('path'),app=express(),PORT=3002;
app.use(express.json());app.use(session({name:'roles.sid',secret:process.env.SESSION_SECRET||'roles-demo-secret',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:false,maxAge:1800000}}));app.use(express.static(path.join(__dirname,'public')));
const users=[{username:'student',password:'12345',name:'Алексей Студент',role:'student'},{username:'teacher',password:'12345',name:'Мария Преподаватель',role:'teacher'}];
function guard(role){return(req,res,next)=>{if(!req.session.user)return res.status(401).json({error:'Сначала войдите.'});if(req.session.user.role!==role)return res.status(403).json({error:'Доступ запрещён: требуется роль '+role});next()}}
app.post('/api/login',(req,res)=>{let{username,password}=req.body;if(!username||!password)return res.status(400).json({error:'Заполните все поля.'});let u=users.find(x=>x.username===username&&x.password===password);if(!u)return res.status(401).json({error:'Неверный логин или пароль.'});req.session.user={username:u.username,name:u.name,role:u.role};res.json({message:'Вход успешен'})});
app.get('/api/me',(req,res)=>req.session.user?res.json(req.session.user):res.status(401).json({error:'Нет активной сессии'}));
app.get('/api/student',guard('student'),(req,res)=>res.json({title:'Кабинет студента',items:['Мои дисциплины','Расписание','Успеваемость']}));
app.get('/api/teacher',guard('teacher'),(req,res)=>res.json({title:'Кабинет преподавателя',items:['Список групп','Журнал оценок','Материалы курса']}));
app.post('/api/logout',(req,res)=>{if(!req.session.user)return res.status(401).json({error:'Вы не вошли'});req.session.destroy(()=>{res.clearCookie('roles.sid');res.json({message:'Сессия завершена'})})});
app.listen(PORT,()=>console.log('http://localhost:'+PORT));
