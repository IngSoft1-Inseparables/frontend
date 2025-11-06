import React from "react";
import BackCard from "../BackCard/BackCard";

export default function DraftDeck({ draft, isAvailable, onCardClick }) {
  if (!draft || !draft.count) return null;

  const cards = [];

  if (draft.card_1?.card_id && draft.card_1?.image_name) {
    cards.push({
      id: draft.card_1.card_id,
      face: `/cards/${draft.card_1.image_name}.png`,
      alt: "Carta del draft 1",
    });
  }

  if (draft.card_2?.card_id && draft.card_2?.image_name) {
    cards.push({
      id: draft.card_2.card_id,
      face: `/cards/${draft.card_2.image_name}.png`,
      alt: "Carta del draft 2",
    });
  }

  if (draft.card_3?.card_id && draft.card_3?.image_name) {
    cards.push({
      id: draft.card_3.card_id,
      face: `/cards/${draft.card_3.image_name}.png`,
      alt: "Carta del draft 3",
    });
  }

  if (cards.length === 0) return null;

  //console.log("DraftDeck renderizando cartas:", cards);

  return (
    <div className="draft-container">
      {cards.map((card) => (
        <BackCard
          key={card.id}
          type="draft"
          deck={[card]}
          available={isAvailable}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
