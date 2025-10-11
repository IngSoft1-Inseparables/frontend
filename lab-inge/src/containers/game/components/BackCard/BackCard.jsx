import './BackCard.css'

export default function BackCard({ type, deck, available, onCardClick }) {
  if (!deck || deck.length === 0) return null

   const handleClick = () => {
    if (onCardClick) {
      onCardClick(); // solo avisamos al padre
    }
  }


  return (
    <div className="back-card-container">
      {deck.map((carta, index) => {
        let src = carta.back
        let alt = carta.alt

        // En el mazo de descarte, la última carta se muestra boca arriba
        const isTopDiscard = type === 'discard' && index === deck.length - 1
        if (isTopDiscard && carta.face) {
          src = carta.face
        }
        const isTopRegpile = type !== 'discard' && index === deck.length -1;
           
        return (
          <img
            key={carta.id}
            className="back-card"
            src={src}
            alt={alt}
            style={{ zIndex: index }}
            onClick={() => isTopRegpile && available && handleClick(carta)}

          />
        )
      })}
    </div>
  )
}
