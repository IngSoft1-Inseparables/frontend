import { render, screen } from '@testing-library/react'
import HandCard from './HandCard.jsx' 
import '@testing-library/jest-dom'
import { expect, test } from 'vitest'

describe('HandCard', () => {
  test('renderiza todas las cartas según cardIds', () => {
    render(<HandCard cardIds={[1, 2, 3]} />)

    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(3)

    // Verifica que al menos una carta específica esté
    expect(screen.getByAltText(/Poirot/i)).toBeInTheDocument()
  })

  test('no renderiza cartas si cardIds está vacío', () => {
    render(<HandCard cardIds={[]} />)

    const imgs = screen.queryAllByRole('img')
    expect(imgs).toHaveLength(0)
  })

  test('renderiza correctamente con varios IDs', () => {
    render(<HandCard cardIds={[4, 5, 6]} />)

    expect(screen.getByAltText(/Pyne/i)).toBeInTheDocument()
    expect(screen.getByAltText(/Brent/i)).toBeInTheDocument()
    expect(screen.getByAltText(/Tommy/i)).toBeInTheDocument()
  })

  test('no explota si recibe un ID inválido', () => {
    render(<HandCard cardIds={[999]} />)

    const imgs = screen.queryAllByRole('img')
    expect(imgs).toHaveLength(0) // no debería renderizar nada
  })
})

