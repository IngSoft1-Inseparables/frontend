import "./BackCard.css";
import { useState } from "react";

export default function BackCard({
  type,
  deck,
  available = false,
  onCardClick,
}) {
  // console.log("BackCard available:", available);

  if (!deck || deck.length === 0) return null;

  const [selectedCardId, setSelectedCardId] = useState(null);
  const MURDER_CARD = {
    src: "/cards/02-murder_escapes.png",
    alt: "MurderEscapes",
  };
  const handleClick = (carta) => {
    if (!available) return;
    setSelectedCardId(carta.id);
    console.log("click", carta.id);
    if (onCardClick) onCardClick(carta);
  };

  return (
    <div
      className={`back-card-container relative ${
        type === "draft" ? "draft-container" : ""
      } ${available && type === "draft" ? "draft-available" : ""}`}
    >
      {deck.map((carta, index) => {
        let src =
          type === "draft"
            ? carta.face
            : carta.back || '/cards/01-card_back.png';
        let alt = carta.alt || 'Card Back';

        const isBottomRegular = type === "regular" && index === 0;
        if (isBottomRegular) {
          src = MURDER_CARD.src;
          alt = MURDER_CARD.alt;
        }

        const isTopDiscard = type === "discard" && index === deck.length - 1;
        if (isTopDiscard && carta.face) {
          src = carta.face;
        }

        const isSet = type === "set";
         if (isSet && carta.back) {
          src = carta.back || `/cards/${carta.image_name}.png`; 
        }

        const isTopCard = index === deck.length - 1; // Solo la última carta

        const className = `back-card ${
          type === "draft"
          ? available
          ? "back-card-draft back-card-clickable"
          : "back-card-draft"
          : isTopCard && available && carta.id != 0
          ? "back-card-clickable"
          : ""
        }`;

    
        const cardStyle =
          type === "draft"
            ? {
                position: "static",
                transform: "none",
                zIndex: "auto",
              }
            : {
                    zIndex: index,
                    transform: isSet
            ? `translateY(-${index * 5}px)` // más separación para sets
            : `translateY(-${index * 2}px)`,
                    position: "absolute",
                  };

        return (
      
          <img
            key={carta.id}
            src={src}
            alt={alt}
            className={className}
            style={cardStyle}
            onClick={
              
              type === "draft"
                ? available
                  ? () => handleClick(carta)
                  : undefined
                : isTopCard && available && carta.id != 0
                && !isSet
                ? () => handleClick(carta)
               
                : undefined
            
            }
          />
        );
      })}
    </div>
  );
}
