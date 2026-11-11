import { useState } from "react";

export default function LikeButton({ label }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  function toggleLike() {
    setLikes((current) => Math.max(0, current + (liked ? -1 : 1)));
    setLiked((current) => !current);
  }

  function resetLikes() {
    setLikes(0);
    setLiked(false);
  }

  return (
    <article className="panel like-panel">
      <div>
        <h3>{label}</h3>
        <p className="muted">Нажмите кнопку, чтобы поставить или убрать лайк.</p>
      </div>
      <div className="like-counter" aria-live="polite">{likes}</div>
      <div className="actions">
        <button className={liked ? "button button-liked" : "button button-primary"} onClick={toggleLike}>
          {liked ? "♥ Вам нравится" : "♡ Нравится"}
        </button>
        <button className="button button-ghost" onClick={resetLikes}>Сбросить</button>
      </div>
    </article>
  );
}