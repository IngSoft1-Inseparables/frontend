import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import HandCard from './HandCard.jsx'
import '@testing-library/jest-dom'
import { describe, test, expect } from 'vitest'

// Helper function to render with DndContext
const renderWithDnd = (component) => {
  return render(
    <DndContext>
      {component}
    </DndContext>
  )
}

describe('HandCard', () => {
  const sampleCards = [
    { card_id: 1, card_name: 'Poirot', image_name: 'detective_poirot', image_back_name: 'card_back' },
    { card_id: 2, card_name: 'Marple', image_name: 'detective_marple', image_back_name: 'card_back' },
    { card_id: 3, card_name: 'Hastings', image_name: 'detective_hastings', image_back_name: 'card_back' },
  ]

  test('renderiza todas las cartas según playerCards', () => {
    renderWithDnd(<HandCard playerCards={sampleCards} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)

    // Verifica que al menos una carta específica esté
    expect(screen.getByAltText(/Poirot/i)).toBeInTheDocument()
  })

  test('no renderiza cartas si playerCards está vacío', () => {
    renderWithDnd(<HandCard playerCards={[]} />)

    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })

  test('renderiza correctamente con varios objetos', () => {
    const extraCards = [
      { card_id: 4, card_name: 'Pyne', image_name: 'detective_pyne', image_back_name: 'card_back' },
      { card_id: 5, card_name: 'Brent', image_name: 'detective_brent', image_back_name: 'card_back' },
      { card_id: 6, card_name: 'Tommy', image_name: 'detective_tommy', image_back_name: 'card_back' },
    ]

    renderWithDnd(<HandCard playerCards={extraCards} />)

    expect(screen.getByAltText(/Pyne/i)).toBeInTheDocument()
    expect(screen.getByAltText(/Brent/i)).toBeInTheDocument()
    expect(screen.getByAltText(/Tommy/i)).toBeInTheDocument()
  })

  test('no explota si recibe playerCards con datos inválidos', () => {
    renderWithDnd(<HandCard playerCards={[{ card_id: 999 }]} />)

    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0) // no debería renderizar nada
  })
})
