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

  // Una sola carta visible que representa el mazo regular
  const topCard = {
    id: 1,
    back: `/cards/${regpile.image_back_name}.png`,
    face: null,
    alt: 'Regular Deck Top'
  }

  // Si el mazo está vacío, solo mostrar la Murder Escapes
  const fullDeck = regpile.count > 0 ? [murderCard, topCard] : [murderCard]

  return <BackCard type="regular" deck={fullDeck} />
}
