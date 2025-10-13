import "./BackCard.css";
import { useState } from "react";

export default function BackCard({ type, deck, available, onCardClick }) {
  console.log("BackCard available:", available);
  if (!deck || deck.length === 0) return null;

  const [selectedCardId, setSelectedCardId] = useState(null);

  const handleClick = (carta) => {
    if (!available) return;
    setSelectedCardId(carta.id);
    console.log("click", carta.id);
    if (onCardClick) onCardClick();
  };

  return (
    <div className="back-card-container">
      {deck.map((carta, index) => {
        let src = carta.back;
        let alt = carta.alt;

        // En el mazo de descarte, la última carta se muestra boca arriba
        const isTopDiscard = type === "discard" && index === deck.length - 1;
        if (isTopDiscard && carta.face) {
          src = carta.face;
        }
        const isTopRegpile = type !== "discard" && index === deck.length - 1;

        // Todas apiladas
        const cardStyle = {
          zIndex: index,
          cursor: isTopRegpile && available ? "pointer" : "default",
          transform: `translateY(-${index * 2}px)`,
        };

        // La última carta brilla solo si available
        if (isTopRegpile) {
          return (
            <button
              key={carta.id}
              onClick={() => handleClick(carta)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: isTopRegpile && available ? "pointer" : "default",
              }}
            >
              <img
                src={src}
                alt={alt}
                className={`back-card${
                  available ? " back-card-clickable" : ""
                }`}
                style={cardStyle}
              />
            </button>
          );
        } else {
          return (
            <img
              key={carta.id}
              className="back-card"
              src={src}
              alt={alt}
              style={cardStyle}
            />
          );
        }
      })}
    </div>
  );
}
