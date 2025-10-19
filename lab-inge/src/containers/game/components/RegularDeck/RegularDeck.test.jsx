import { render, screen } from '@testing-library/react'
import RegularDeck from './RegularDeck.jsx'
import '@testing-library/jest-dom'
import { describe, test, expect } from 'vitest'

describe('RegularDeck', () => {
  test('no renderiza nada si no se pasa regpile', () => {
    render(<RegularDeck />)
    const imgs = screen.queryAllByRole('img')
    expect(imgs).toHaveLength(0)
  })

  test('renderiza solo Murder Escapes cuando el mazo está vacío', () => {
    const regpile = { count: 0, image_back_name: '01-card_back' }

    render(<RegularDeck regpile={regpile} />)
    const imgs = screen.getAllByRole('img')

    // Solo 1 imagen -> Murder Escapes
    expect(imgs).toHaveLength(1)
    expect(imgs[0]).toHaveAttribute('src', '/cards/02-murder_escapes.png')
    expect(imgs[0]).toHaveAttribute('alt', 'MurderEscapes')
  })

  test('renderiza Murder Escapes + 3 dorsos cuando count entre 1 y 5', () => {
    const regpile = { count: 5, image_back_name: '01-card_back' }

    render(<RegularDeck regpile={regpile} />)
    const imgs = screen.getAllByRole('img')

    // Murder + 3 dorsos => total 4 imágenes
    expect(imgs).toHaveLength(4)

    const murderCard = imgs[0]
    expect(murderCard).toHaveAttribute('src', '/cards/02-murder_escapes.png')
    expect(murderCard).toHaveAttribute('alt', 'MurderEscapes')

    const backCards = imgs.slice(1)
    backCards.forEach(card => {
      expect(card).toHaveAttribute('src', '/cards/01-card_back.png')
      expect(card).toHaveAttribute('alt', 'Regular Deck Card')
    })
  })

  test('renderiza Murder + 4 dorsos cuando count entre 6 y 10', () => {
    const regpile = { count: 8, image_back_name: '01-card_back' }

    render(<RegularDeck regpile={regpile} />)
    const imgs = screen.getAllByRole('img')

    // Murder + 4 dorsos => total 5 imágenes
    expect(imgs).toHaveLength(5)
  })

  test('renderiza Murder + 5 dorsos cuando count entre 11 y 20', () => {
    const regpile = { count: 15, image_back_name: '01-card_back' }

    render(<RegularDeck regpile={regpile} />)
    const imgs = screen.getAllByRole('img')

    // Murder + 5 dorsos => total 6 imágenes
    expect(imgs).toHaveLength(6)
  })

  test('renderiza Murder + 6 dorsos cuando count > 20', () => {
    const regpile = { count: 25, image_back_name: '01-card_back' }

    render(<RegularDeck regpile={regpile} />)
    const imgs = screen.getAllByRole('img')

    // Murder + 6 dorsos => total 7 imágenes
    expect(imgs).toHaveLength(7)
  })
  test('maneja regpile sin count definido', () => {
  const regpile = { image_back_name: '01-card_back' } // count undefined
  render(<RegularDeck regpile={regpile} />)
  const imgs = screen.getAllByRole('img')
  expect(imgs).toHaveLength(1) 
})
})
