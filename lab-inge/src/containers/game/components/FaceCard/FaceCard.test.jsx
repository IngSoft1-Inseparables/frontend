import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import FaceCard from './FaceCard.jsx'
import '@testing-library/jest-dom'
import { describe, test, expect, vi } from 'vitest'

// Helper para renderizar con DndContext
const renderWithDnd = (ui) => {
  return render(<DndContext>{ui}</DndContext>)
}

describe('FaceCard', () => {
  test('renderiza la carta con el frente correcto', () => {
    renderWithDnd(<FaceCard cardId={1} imageName="detective_poirot" cardName="Poirot" />)

    const card = screen.getByRole('button', { name: /Poirot/i })
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('src', expect.stringContaining('detective_poirot.png'))
  })

  test('renderiza otra carta si cambian props', () => {
    renderWithDnd(<FaceCard cardId={2} imageName="detective_marple" cardName="Marple" />)

    const card = screen.getByRole('button', { name: /Marple/i })
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('src', expect.stringContaining('detective_marple.png'))
  })

  test('renderiza el dorso si showBack es true y hay imageBackName', () => {
    renderWithDnd(
      <FaceCard
        cardId={3}
        imageName="detective_poirot"
        cardName="Poirot"
        showBack={true}
        imageBackName="card_back"
      />
    )

    const card = screen.getByRole('button', { name: /Poirot/i })
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('src', expect.stringContaining('card_back.png'))
  })

  test('no renderiza nada si no hay imageName', () => {
    renderWithDnd(<FaceCard cardId={4} />)
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })
  
  test('la carta es draggable (tiene atributos de dnd-kit)', () => {
    renderWithDnd(<FaceCard cardId={5} imageName="detective_poirot" cardName="Poirot" />)
    
    const card = screen.getByRole('button', { name: /Poirot/i })
    expect(card).toHaveAttribute('aria-roledescription', 'draggable')
    expect(card).toHaveAttribute('tabindex', '0')
  })
  
  test('aplica cursor grab por defecto', () => {
    renderWithDnd(<FaceCard cardId={6} imageName="detective_poirot" cardName="Poirot" />)
    
    const card = screen.getByRole('button', { name: /Poirot/i })
    expect(card).toHaveStyle({ cursor: 'grab' })
  })

  test('aplica clase face-card-selected cuando isSelected es true', () => {
    renderWithDnd(
      <FaceCard cardId={7} imageName="detective_poirot" cardName="Poirot" isSelected={true} />
    )
    
    const card = screen.getByRole('button', { name: /Poirot/i })
    expect(card).toHaveClass('face-card-selected')
  })

  test('no aplica clase face-card-selected cuando isSelected es false', () => {
    renderWithDnd(
      <FaceCard cardId={8} imageName="detective_poirot" cardName="Poirot" isSelected={false} />
    )
    
    const card = screen.getByRole('button', { name: /Poirot/i })
    expect(card).toHaveClass('face-card')
    expect(card).not.toHaveClass('face-card-selected')
  })

  test('cuando isStatic es true, no tiene listeners de drag y cursor es default', () => {
    renderWithDnd(
      <FaceCard cardId={9} imageName="detective_poirot" cardName="Poirot" isStatic={true} />
    )
    
    const card = screen.getByAltText(/Poirot/i)
    expect(card).toHaveStyle({ cursor: 'default' })
    // No debe tener atributos de draggable
    expect(card).not.toHaveAttribute('aria-roledescription', 'draggable')
  })

  test('cuando isStatic es true, onClick no se ejecuta', () => {
    const mockOnSelect = vi.fn()
    renderWithDnd(
      <FaceCard 
        cardId={10} 
        imageName="detective_poirot" 
        cardName="Poirot" 
        isStatic={true}
        onSelect={mockOnSelect}
      />
    )
    
    const card = screen.getByAltText(/Poirot/i)
    fireEvent.click(card)
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  test('muestra imageBackName cuando showBack es true', () => {
    renderWithDnd(
      <FaceCard
        cardId={11}
        imageName="detective_poirot"
        cardName="Poirot"
        showBack={true}
        imageBackName="card_back_special"
      />
    )

    const card = screen.getByRole('button', { name: /Poirot/i })
    expect(card).toHaveAttribute('src', expect.stringContaining('card_back_special.png'))
  })

  test('usa imageName si showBack es true pero no hay imageBackName', () => {
    renderWithDnd(
      <FaceCard
        cardId={12}
        imageName="detective_poirot"
        cardName="Poirot"
        showBack={true}
      />
    )

    const card = screen.getByRole('button', { name: /Poirot/i })
    expect(card).toHaveAttribute('src', expect.stringContaining('detective_poirot.png'))
  })
})

