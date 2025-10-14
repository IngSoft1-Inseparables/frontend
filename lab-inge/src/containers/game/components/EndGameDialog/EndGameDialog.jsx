import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import './EndGameDialog.css'

export default function EndGameDialog({ onClose, winners }) {
  

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h2>PARTIDA FINALIZADA</h2>
        <div className="winners-section">
          <h3>Ganadores:</h3>
          <ul className="winners-list">
            {winners.map((winner) => (
              <li key={winner.id} className="winner-item">
                {winner.name} 
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
