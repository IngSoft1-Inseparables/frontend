import React from 'react'
import FaceCard from '../FaceCard/FaceCard'


function HandCard({ cardIds =[] }) {
    return (
        <div className="hand-card">
            {cardIds.map((id) => (
                <FaceCard cardId={id} />
            ))}
        </div>
    )
}

export default HandCard
