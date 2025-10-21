import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import FaceCard from './FaceCard.jsx'
import '@testing-library/jest-dom'
import { describe, test, expect } from 'vitest'

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
})

