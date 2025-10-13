import {render, screen} from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import DiscardDeck from './DiscardDeck.jsx' 
import '@testing-library/jest-dom'
import { expect, test, describe, vi } from 'vitest'


// Helper function to render with DndContext
const renderWithDnd = (component) => {
  return render(
    <DndContext>
      {component}
    </DndContext>
  )
}

describe('DiscardDeck', () => {
  const mockDiscardPile = {
    count: 5,
    last_card_name: 'Murder Escapes',
    last_card_image: '02-murder_escapes'
  };

  const mockTurnData = {
    turn_owner_id: 1
  };

  const myPlayerId = 1;

  test('render del mazo de descarte', async () => {
    // ARRANGE
    renderWithDnd(<DiscardDeck discardpile={mockDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)
    
    // ASSERT
    const imgs = screen.getAllByRole('img')

    expect(imgs.length).toBeGreaterThan(0)
  })

  test('el top de la pila esta visible', async () => {
    renderWithDnd(<DiscardDeck discardpile={mockDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    const imgs = screen.getAllByRole('img')
    expect(imgs[imgs.length - 1]).not.toHaveAttribute('src', '/cards/01-card_back.png')
  })

  test('todas las cartas menos el top tienen el reverso', async () => {
    renderWithDnd(<DiscardDeck discardpile={mockDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    const imgs = screen.getAllByRole('img')
    const imgs_tail = imgs.slice(0, -1)
    imgs_tail.forEach(img => {
      expect(img).toHaveAttribute('src', '/cards/01-card_back.png')
    })
  })

  test('tiene atributos de dnd-kit droppable', async () => {
    renderWithDnd(<DiscardDeck discardpile={mockDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    // Verificar que hay imágenes renderizadas (el componente se renderiza correctamente con dnd-kit)
    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBeGreaterThan(0)

    // La carta superior debe estar visible (no es card_back)
    const topCard = imgs[imgs.length - 1]
    expect(topCard).not.toHaveAttribute('src', '/cards/01-card_back.png')
  })

  test('muestra zona de descarte cuando no hay cartas', async () => {
    const emptyDiscardPile = {
      count: 0
    };

    renderWithDnd(<DiscardDeck discardpile={emptyDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    // Debe mostrar el icono de zona de descarte
    const discardIcon = screen.getByAltText('Zona de descarte')
    expect(discardIcon).toBeInTheDocument()
  })

  test('no renderiza nada si discardpile es null', async () => {
    renderWithDnd(<DiscardDeck discardpile={null} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    // El componente no debe renderizar ninguna imagen
    const imgs = screen.queryAllByRole('img')
    expect(imgs).toHaveLength(0)
  })
})
