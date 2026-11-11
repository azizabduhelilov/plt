import TodoList from "./TodoList.jsx";
export default function App() {
  return <main className="wrap">
    <header><p>Лабораторная работа № 11 · React</p><h1>Список задач</h1><span>Средний уровень · вариант 8</span></header>
    <TodoList initialTasks={[
      {id:1,text:"Изучить props и state",done:true},
      {id:2,text:"Собрать React-приложение",done:false},
      {id:3,text:"Проверить интерфейс",done:false}
    ]}/>
  </main>;
}