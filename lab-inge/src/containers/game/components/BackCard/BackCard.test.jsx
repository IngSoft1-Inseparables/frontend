import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, test, expect } from 'vitest'
import BackCard from './BackCard.jsx'

describe('BackCard', () => {

  test('renderiza Murder Escapes en la primera carta y las demás con el dorso cuando type="regular"', () => {
    const deck = [
      { id: 1, back: '/cards/back1.png', face: '/cards/front1.png', alt: 'card1' },
      { id: 2, back: '/cards/back2.png', face: '/cards/front2.png', alt: 'card2' },
      { id: 3, back: '/cards/back3.png', face: '/cards/front3.png', alt: 'card3' },
    ]

    render(<BackCard type="regular" deck={deck} />)

    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(3)

    // Primera carta: Murder Escapes
    expect(imgs[0]).toHaveAttribute('src', '/cards/02-murder_escapes.png')
    expect(imgs[0]).toHaveAttribute('alt', 'MurderEscapes')

    // Las demás cartas: dorso
    imgs.slice(1).forEach(img => {
      expect(img).toHaveAttribute('src', expect.stringMatching(/back/))
    })
  })

  test('reemplaza la primera carta por Murder Escapes cuando type="regular"', () => {
    const deck = [
      { id: 1, back: '/cards/back1.png', face: '/cards/front1.png', alt: 'card1' },
      { id: 2, back: '/cards/back2.png', face: '/cards/front2.png', alt: 'card2' }
    ]

    render(<BackCard type="regular" deck={deck} />)

    const firstCard = screen.getAllByRole('img')[0]
    expect(firstCard).toHaveAttribute('src', '/cards/02-murder_escapes.png')
    expect(firstCard).toHaveAttribute('alt', 'MurderEscapes')
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
