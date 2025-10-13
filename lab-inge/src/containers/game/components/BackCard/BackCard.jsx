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

    const isTopDiscard = type === "discard" && index === deck.length - 1;
    if (isTopDiscard && carta.face) {
      src = carta.face;
    }

    const isTopCard = index === deck.length - 1; // Solo la última carta

    const className = `back-card ${isTopCard && available ? "back-card-clickable" : ""}`;

    const cardStyle = {
      zIndex: index,
      transform: `translateY(-${index * 2}px)`,
      position: "absolute",
    };

    return (
      <img
        key={carta.id}
        src={src}
        alt={alt}
        className={className}
        style={cardStyle}
        onClick={isTopCard && available ? () => handleClick(carta) : undefined}
      />
    );
  })}
    </div>
  );
}
