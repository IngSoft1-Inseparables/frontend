import { render, screen } from '@testing-library/react'
import RegularDeck from './RegularDeck.jsx'
import '@testing-library/jest-dom'
import { expect, test, describe } from 'vitest'

describe('RegularDeck', () => {

  test('renderiza solo Murder Escapes cuando el mazo está vacío', () => {
    const regpile = {
      count: 0,
      image_back_name: '01-card_back'
    }

    render(<RegularDeck regpile={regpile} />)

    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(1)

    const card = imgs[0]
    expect(card).toHaveAttribute('src', '/cards/02-murder_escapes.png')
    expect(card).toHaveAttribute('alt', 'MurderEscapes')
  })


  test('renderiza Murder Escapes y una carta del dorso cuando hay cartas en el mazo', () => {
    const regpile = {
      count: 5,
      image_back_name: '01-card_back'
    }

    render(<RegularDeck regpile={regpile} />)

    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(2)

    const murderCard = imgs[0]
    const topCard = imgs[1]

    expect(murderCard).toHaveAttribute('src', '/cards/02-murder_escapes.png')
    expect(murderCard).toHaveAttribute('alt', 'MurderEscapes')

    expect(topCard).toHaveAttribute('src', '/cards/01-card_back.png')
    expect(topCard).toHaveAttribute('alt', 'Regular Deck Top')
  })


  test('no renderiza nada si no se pasa regpile', () => {
    render(<RegularDeck />)
    const imgs = screen.queryAllByRole('img')
    expect(imgs).toHaveLength(0)
  })

})
