import React, { useEffect, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import BackCard from '../BackCard/BackCard'

export default function DiscardDeck({ discardpile, turnData, myPlayerId, setSelectionAction }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'discard-deck',
  });

  const prevLastCardRef = useRef(null);

  // Detectar cuando se descarta "Early train to paddington" (NO cuando se juega como evento)
  useEffect(() => {
    // Detectar cuando la carta actual es Early train y el estado es Discarding
    if (discardpile?.last_card_image === "24-event_earlytrain" &&
        turnData?.turn_state === "Discarding" &&
        prevLastCardRef.current !== "24-event_earlytrain") {
      setSelectionAction("paddington");
    }
    
    prevLastCardRef.current = discardpile?.last_card_image;
  }, [discardpile?.last_card_image, setSelectionAction, turnData?.turn_state]);

  if (!discardpile) return null;

  // Si no hay cartas descartadas
  if (discardpile.count === 0) {
    const canDiscard = turnData && turnData.turn_owner_id === myPlayerId && (turnData.turn_state === "None" || turnData.turn_state === "Discarding");
    console.log("can discard dds:", canDiscard);
    return (
      <div className="back-card-container relative" ref={setNodeRef}>
        <div
          style={{
            width: '100px',
            height: '150px',
            borderRadius: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            padding: '4px',
            transition: 'all 0.2s ease',
            border: isOver && canDiscard ? '2px dashed #facc15' : '2px dashed rgba(255, 255, 255, 0.4)',
            transform: isOver && canDiscard ? 'scale(1.05)' : 'scale(1)',
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
    face: `/cards/${discardpile.last_card_image}.png`,
    alt: discardpile.last_card_name || 'Top Discarded Card',
  };

  // Combinar cartas
  const deck = [...backCards, topCard];

  const canDiscard = turnData && turnData.turn_owner_id === myPlayerId && (turnData.turn_state === "None" || turnData.turn_state === "Discarding");

  return (
    <div
      ref={setNodeRef}
      style={{
        border: isOver && canDiscard ? '2px dashed #facc15' : '2px dashed transparent',
        borderRadius: '2px',
        padding: '2px',
        transition: 'all 0.2s ease',
        transform: isOver && canDiscard ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <BackCard type="discard" deck={deck} />
    </div>
  );
}
