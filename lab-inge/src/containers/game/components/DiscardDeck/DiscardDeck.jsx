import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import BackCard from '../BackCard/BackCard'

const CARTAS = [
  { id: 1, back: '/cards/01-card_back.png', face: '/cards/07-detective_poirot.png', alt: 'Poirot' },
  { id: 2, back: '/cards/01-card_back.png', face: '/cards/08-detective_marple.png', alt: 'Marple' },
  { id: 3, back: '/cards/01-card_back.png', face: '/cards/09-detective_satterthwaite.png', alt: 'Satterthwaite' },
  { id: 4, back: '/cards/01-card_back.png', face: '/cards/10-detective_pyne.png', alt: 'Pyne' },
  { id: 5, back: '/cards/01-card_back.png', face: '/cards/11-detective_brent.png', alt: 'Brent' },
  { id: 6, back: '/cards/01-card_back.png', face: '/cards/12-detective_tommyberesford.png', alt: 'Tommy' },
  { id: 7, back: '/cards/01-card_back.png', face: '/cards/13-detective_tuppenceberesford.png', alt: 'Tuppen' },
  { id: 8, back: '/cards/01-card_back.png', face: '/cards/14-detective_quin.png', alt: 'Quin' },
  { id: 9, back: '/cards/01-card_back.png', face: '/cards/15-detective_oliver.png', alt: 'Oliver' },

  //TODO: completar el mazo
]

function DiscardDeck({turnData, myPlayerId}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'discard-deck',
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        border: isOver && turnData.turn_owner_id === myPlayerId ? '3px solid #facc15' : '3px solid transparent',
        borderRadius: '12px',
        padding: '4px',
        transition: 'all 0.2s ease',
        transform: isOver && turnData.turn_owner_id === myPlayerId ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <BackCard type="discard" deck={CARTAS} />
    </div>
  )
}

export default DiscardDeck

