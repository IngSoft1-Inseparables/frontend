import './BackCard.css'

const MURDER = { id: 0, src: '/cards/02-murder_escapes.png', alt: 'MurderEscapes' }

export default function BackCard({ type, deck }) {
  return (
    <div className="back-card-container">
      {deck.map((carta, index) => {
        const isBottomRegular = type === 'regular' && index === 0
        const isTopDiscard = type === 'discard' && index === deck.length - 1

        let src = carta.back
        let alt = carta.alt

        if (isBottomRegular) {
          src = MURDER.src
          alt = MURDER.alt
        }

        if (isTopDiscard) {
          src = carta.face
          alt = carta.alt
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
