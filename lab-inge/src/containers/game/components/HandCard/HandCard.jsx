import React from 'react'
import FaceCard from '../FaceCard/FaceCard'
import './HandCard.css'


function HandCard({ playerCards = [] }) {
    return (
        <div className="hand-card">
            {playerCards.map((card) => (
                <FaceCard 
                    key={card.card_id}
                    cardId={card.card_id} 
                    imageName={card.image_name}
                    cardName={card.card_name}
                    imageBackName={card.image_back_name}
                />
            ))}
        </div>
    )
}

export default HandCard
