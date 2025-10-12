import React from 'react';
import BackCard from '../BackCard/BackCard';

export default function DiscardDeck({ discardpile }) {
  if (!discardpile) return null;

  // Si no hay cartas descartadas, no mostrar nada
  if (discardpile.count === 0) {
    return null;
  }

  // Mostrar solo una pila visual (máximo 5 cartas)
  const visibleCount = Math.min(discardpile.count, 5);

  // Generar los dorsos
  const backCards = Array.from({ length: visibleCount - 1 }, (_, i) => ({
    id: i,
    back: '/cards/01-card_back.png',
    alt: 'Back',
  }));

  // Carta superior boca arriba
  const topCard = {
    id: visibleCount,
    face: `/cards/${discardpile.last_card_image}`,
    alt: discardpile.last_card_name || 'Top Discarded Card',
  };

  // Combinar cartas
  const deck = [...backCards, topCard];

  return <BackCard type="discard" deck={deck} />;
}
