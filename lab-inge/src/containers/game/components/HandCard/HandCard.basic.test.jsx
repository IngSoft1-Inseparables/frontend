import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import HandCard from './HandCard.jsx'
import '@testing-library/jest-dom'

describe('HandCard - Básico', () => {
  const sampleCards = [
    { card_id: 1, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' }
  ]

  test('renderiza la carta correctamente', () => {
    render(
      <DndContext>
  <HandCard playerCards={sampleCards} availableToPlay={true} turnState="None" setsPlayed={[]} />
      </DndContext>
    )
  expect(screen.getByRole('button', { name: /Poirot/i })).toBeInTheDocument()
  })

  test('no renderiza cartas si playerCards está vacío', () => {
    render(
      <DndContext>
  <HandCard playerCards={[]} availableToPlay={true} turnState="None" setsPlayed={[]} />
      </DndContext>
    )
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  test('puede seleccionar y deseleccionar la carta', () => {
    render(
      <DndContext>
  <HandCard playerCards={sampleCards} availableToPlay={true} turnState="None" setsPlayed={[]} />
      </DndContext>
    )
  const cardBtn = screen.getByRole('button', { name: /Poirot/i })
    fireEvent.click(cardBtn)
    expect(cardBtn).toHaveClass('face-card-selected')
    fireEvent.click(cardBtn)
    expect(cardBtn).not.toHaveClass('face-card-selected')
  })
})
