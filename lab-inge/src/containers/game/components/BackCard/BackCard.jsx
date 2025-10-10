import './BackCard.css'

export default function BackCard({ type, deck }) {
  if (!deck || deck.length === 0) return null

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

        return (
          <img
            key={carta.id}
            className="back-card"
            src={src}
            alt={alt}
            style={{ zIndex: index }}
          />
        )
      })}
    </div>
  )
}
