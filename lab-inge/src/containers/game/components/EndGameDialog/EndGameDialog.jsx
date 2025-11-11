import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import './EndGameDialog.css'

export default function EndGameDialog({ onClose, winners, turnData }) {

  const navigate = useNavigate()

  const handleReturnHome = () => {
    onClose?.();       
    navigate("/home"); 
  };


  if(!winners) return null;

  const winnersList = winners.winners || [];
  const regpileCount = winners.regpileCount ?? 0;

  let victoryMessage = "";
  console.log("winners data in dialog:", winners);
  if (winners.type === "social_disgrace") {
    victoryMessage = "El asesino ha ganado.";
  } 
  else if (winners.type === "murder_revealed") {
    victoryMessage = "Los Detectives descubrieron al Asesino.";
  } 
  else if (winners.winners?.some(w => w.role?.toLowerCase() === "asesino")) {
    
    victoryMessage = "El asesino ha ganado.";
  } 
  else if (regpileCount === 0) {
    victoryMessage = turnData?.players?.length < 5 ? "El Asesino ha ganado la partida." : "El Asesino y Cómplice han ganado la partida.";
  } 
  else {
    victoryMessage = "Los Detectives descubrieron al Asesino.";
  }



  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h2>PARTIDA FINALIZADA</h2>

        {victoryMessage && (
          <p className="victoru-message">{victoryMessage}</p>
        )}
        <div className="winners-section">
          <h3>Ganadores:</h3>
          <ul className="winners-list">
            {winnersList.map((winner) => (
              <li key={winner.id} className="winner-item">
                {winner.name} 
              </li>
            ))}
          </ul>
        </div>
        <button type="button" className="dialog-button" onClick={handleReturnHome}>
          Volver a Home
        </button>
      </div>
    </div>
  )
}
