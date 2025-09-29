import './FaceCard.css'

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
]

export default function FaceCard({ cardId }) {
  const carta = CARTAS.find((c) => c.id === cardId)

  if (!carta) {
    return null
  }

  return (<img className="face-card" src={carta.face} alt={carta.alt} />)
}
