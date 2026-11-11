import LikeButton from "./LikeButton.jsx";
export default function App() {
  return <main className="wrap">
    <header><p>Лабораторная работа № 11 · React</p><h1>Счётчик лайков</h1><span>Начальный уровень · вариант 1</span></header>
    <LikeButton label="Нравится эта работа?" />
  </main>;
}