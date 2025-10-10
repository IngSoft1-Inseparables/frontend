import { render, screen } from '@testing-library/react'
import BackCard from './BackCard.jsx'
import '@testing-library/jest-dom'
import { describe, test, expect } from 'vitest'

describe('BackCard', () => {
  test('renderiza todas las cartas con el dorso cuando type="regular"', () => {
    const deck = [
      { id: 1, back: '/cards/back1.png', face: '/cards/front1.png', alt: 'card1' },
      { id: 2, back: '/cards/back1.png', face: '/cards/front2.png', alt: 'card2' }
    ]

    render(<BackCard type="regular" deck={deck} />)

    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(2)
    imgs.forEach(img => {
      expect(img).toHaveAttribute('src', '/cards/back1.png')
    })
  })

  test('renderiza la última carta boca arriba cuando type="discard"', () => {
    const deck = [
      { id: 1, back: '/cards/back1.png', face: '/cards/front1.png', alt: 'card1' },
      { id: 2, back: '/cards/back1.png', face: '/cards/front2.png', alt: 'card2' }
    ]

    render(<BackCard type="discard" deck={deck} />)

    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(2)

    const lastCard = imgs[imgs.length - 1]
    expect(lastCard).toHaveAttribute('src', '/cards/front2.png')
  })

  test('no renderiza nada si el deck está vacío', () => {
    render(<BackCard type="regular" deck={[]} />)
    const imgs = screen.queryAllByRole('img')
    expect(imgs).toHaveLength(0)
  })

  test('no renderiza nada si no se pasa deck', () => {
    render(<BackCard type="regular" />)
    const imgs = screen.queryAllByRole('img')
    expect(imgs).toHaveLength(0)
  })
})
