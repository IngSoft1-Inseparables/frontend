import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import HandCard from './HandCard.jsx'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

describe('HandCard - Selection', () => {
  const sampleCards = [
    { card_id: 1, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' }
  ]
  const mockOnSetStateChange = vi.fn()

  beforeEach(() => {
    mockOnSetStateChange.mockClear()
  })

  test('selecciona y deselecciona una carta', () => {
    render(
      <DndContext>
        <HandCard 
          playerCards={sampleCards} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      </DndContext>
    )
  const cardImg = screen.getByRole('button', { name: /Poirot/i })
  fireEvent.click(cardImg)
  expect(cardImg).toHaveClass('face-card-selected')
  fireEvent.click(cardImg)
  expect(cardImg).not.toHaveClass('face-card-selected')
  })
})
