import React from "react";
import BackCard from "../BackCard/BackCard";

export default function DraftDeck({ draft, isAvailable, onCardClick }) {
  if (!draft || draft.count === 0) return null;

  const cards = [];

  if (draft.card_1_image)
    cards.push({
      id: 1,
      face: `/cards/${draft.card_1_image}.png`,
      alt: "Carta del draft 1",
    });

  if (draft.card_2_image)
    cards.push({
      id: 2,
      face: `/cards/${draft.card_2_image}.png`,
      alt: "Carta del draft 2",
    });

  if (draft.card_3_image)
    cards.push({
      id: 3,
      face: `/cards/${draft.card_3_image}.png`,
      alt: "Carta del draft 3",
    });

  if (cards.length === 0) return null;

  return (
    <div className="draft-container">
      
      {cards.map((card) => (
        <BackCard
          key={card.id}
          type="draft"
          deck={[card]} // una carta por BackCard!!
          available={isAvailable}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
