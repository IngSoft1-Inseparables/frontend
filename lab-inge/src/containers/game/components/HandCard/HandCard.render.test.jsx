import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import HandCard from './HandCard.jsx'
import '@testing-library/jest-dom'

describe('HandCard - Render', () => {
  const sampleCards = [
    { card_id: 1, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' }
  ]

  test('renderiza una carta si playerCards tiene datos', () => {
    render(
      <DndContext>
        <HandCard playerCards={sampleCards} availableToPlay={true} turnState="None" />
      </DndContext>
    )
    expect(screen.getByAltText(/Poirot/i)).toBeInTheDocument()
  })

  test('no renderiza cartas si playerCards está vacío', () => {
    render(
      <DndContext>
        <HandCard playerCards={[]} availableToPlay={true} turnState="None" />
      </DndContext>
    )
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})
