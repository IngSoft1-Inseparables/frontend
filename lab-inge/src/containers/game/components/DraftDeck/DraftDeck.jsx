import React from "react";
import BackCard from "../BackCard/BackCard";

export default function DraftDeck({ draft, isAvailable, onCardClick }) {
  // Si el backend todavía no envió datos, no renderizamos nada
  if (!draft || draft.count === 0) return null;

  // Creamos las cartas del draft en base a los datos reales del backend
  const cards = [];

  if (draft.card_1_image)
    cards.push({
      id: 1,
      face: `/cards/${draft.card_1_image}`,
      alt: "Carta del draft 1",
    });

  if (draft.card_2_image)
    cards.push({
      id: 2,
      face: `/cards/${draft.card_2_image}`,
      alt: "Carta del draft 2",
    });

  if (draft.card_3_image)
    cards.push({
      id: 3,
      face: `/cards/${draft.card_3_image}`,
      alt: "Carta del draft 3",
    });

  // Si el backend no envió ninguna imagen válida, no renderizamos nada
  if (cards.length === 0) return null;

  // Pasamos las cartas reales al BackCard, con type="draft"
  return (
    <BackCard
      type="draft"
      deck={cards}
      available={isAvailable}
      onCardClick={onCardClick}
    />
  );
}
