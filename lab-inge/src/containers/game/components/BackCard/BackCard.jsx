import './BackCard.css'

export default function BackCard({ type, deck }) {
  if (!deck || deck.length === 0) return null;

  // Carta fija para el mazo regular (la del fondo)
  const MURDER_CARD = {
    src: '/cards/02-murder_escapes.png',
    alt: 'MurderEscapes',
  };

  return (
    <div className="back-card-container relative">
      {deck.map((carta, index) => {
        let src = carta.back || '/cards/01-card_back.png';
        let alt = carta.alt || 'Card Back';

        const isBottomRegular = type === 'regular' && index === 0;
        if (isBottomRegular) {
          src = MURDER_CARD.src;
          alt = MURDER_CARD.alt;
        }

        const isTopDiscard = type === 'discard' && index === deck.length - 1;
        if (isTopDiscard && carta.face) {
          src = carta.face;
        }

        return (
          <img
            key={carta.id}
            className="back-card absolute transition-transform duration-300"
            src={src}
            alt={alt}
            style={{
              zIndex: index,
              transform: `translateY(-${index * 2}px)`, // apila levemente
            }}
          />
        );
      })}
    </div>
  );
}
