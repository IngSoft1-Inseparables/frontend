import { useNavigate } from "react-router-dom"
import "./EndGameDialog.css"

export default function EndGameDialog({ winners }) {
  const navigate = useNavigate()

  const handleReturnHome = () => {
    navigate("/home") 
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h2>Game Over</h2>

        <div className="winners-section">
          <h3>Winners:</h3>
          <ul className="winners-list">
            {winners.map((winner) => (
              <li key={winner.id} className="winner-item">
                {winner.name}
              </li>
            ))}
          </ul>
        </div>
        <button className="dialog-button" onClick={handleReturnHome}>
          Back to Home
        </button>
      </div>
    </div>
  )
}
