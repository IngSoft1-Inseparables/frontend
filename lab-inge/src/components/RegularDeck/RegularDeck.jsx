import React from 'react'
import BackCard from '../BackCard/BackCard'

export default function RegularDeck({ regpile }) {
  if (!regpile) return null

  // Carta fija de "Murder Escapes" 
  const murderCard = {
    id: 0,
    back: '/cards/02-murder_escapes.png',
    face: '/cards/02-murder_escapes.png',
    alt: 'MurderEscapes'
  }

  // para que mientras menos cartas haya se vea mas chiquito el mazo
  let visibleCount = 1
  if (regpile.count > 20) visibleCount = 6
  else if (regpile.count > 10) visibleCount = 5
  else if (regpile.count > 5) visibleCount = 4
  else if (regpile.count > 0) visibleCount = 3
  else visibleCount = 0

  const backCards = Array.from({ length: visibleCount }, (_, i) => ({
    id: i + 1,
    back: `/cards/${regpile.image_back_name}.png`,
    face: null,
    alt: 'Regular Deck Card'
  }))

  const fullDeck = [murderCard, ...backCards]

  return <BackCard type="regular" deck={fullDeck} />
}
