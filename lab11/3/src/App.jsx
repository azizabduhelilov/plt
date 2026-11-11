import ExpensePlanner from "./ExpensePlanner.jsx";
export default function App() {
  return <main className="wrap">
    <header><p>Лабораторная работа № 11 · React</p><h1>Планировщик расходов</h1><span>Продвинутый уровень · вариант 16</span></header>
    <ExpensePlanner currency="₸"/>
  </main>;
}