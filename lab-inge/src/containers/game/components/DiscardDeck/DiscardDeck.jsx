import React from 'react';
import BackCard from '../BackCard/BackCard';

export default function DiscardDeck({ discardpile }) {
  if (!discardpile) return null;

// Si no hay cartas descartadas
if (discardpile.count === 0) {
  return (
    <div className="back-card-container relative">
      <div
        style={{
          width: '100px',
          height: '150px',
          border: '2px dashed rgba(255, 255, 255, 0.4)',
          borderRadius: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <img
          src="/icons/discard-slot.png"
          alt="Zona de descarte"
          style={{
            width: '65px',
            height: '65px',
            opacity: 0.85,
            transition: 'transform 0.25s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
    </div>
  );
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
