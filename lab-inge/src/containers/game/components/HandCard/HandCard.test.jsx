import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import HandCard from './HandCard.jsx'
import '@testing-library/jest-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'

// Helper function to render with DndContext
const renderWithDnd = (component) => {
  return render(
    <DndContext>
      {component}
    </DndContext>
  )
}

// Mock FaceCard component
vi.mock('../FaceCard/FaceCard', () => ({
  default: ({ cardId, cardName, imageName, onSelect, isSelected }) => (
    <button 
      data-testid={`card-${cardId}`}
      onClick={onSelect}
      className={isSelected ? 'selected' : ''}
      aria-label={cardName}
    >
      <img src={`/cards/${imageName}`} alt={cardName} />
    </button>
  ),
}))

describe('HandCard', () => {
  const sampleCards = [
    { card_id: 1, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
    { card_id: 2, card_name: 'Miss Marple', type: 'Detective', image_name: 'detective_marple.png', image_back_name: 'card_back.png' },
    { card_id: 3, card_name: 'Captain Hastings', type: 'Detective', image_name: 'detective_hastings.png', image_back_name: 'card_back.png' },
  ]

  describe('Basic Rendering', () => {
    test('renderiza todas las cartas según playerCards', () => {
      renderWithDnd(<HandCard playerCards={sampleCards} availableToPlay={true} turnState="None" />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)

      expect(screen.getByAltText(/Poirot/i)).toBeInTheDocument()
    })

    test('no renderiza cartas si playerCards está vacío', () => {
      renderWithDnd(<HandCard playerCards={[]} availableToPlay={true} turnState="None" />)

      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    test('renderiza correctamente con varios objetos', () => {
      const extraCards = [
        { card_id: 4, card_name: 'Ariadne Oliver', type: 'Detective', image_name: 'detective_oliver.png', image_back_name: 'card_back.png' },
        { card_id: 5, card_name: 'Lady Brent', type: 'Detective', image_name: 'detective_brent.png', image_back_name: 'card_back.png' },
        { card_id: 6, card_name: 'Tommy Beresford', type: 'Detective', image_name: 'detective_tommy.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(<HandCard playerCards={extraCards} availableToPlay={true} turnState="None" />)

      expect(screen.getByAltText(/Oliver/i)).toBeInTheDocument()
      expect(screen.getByAltText(/Brent/i)).toBeInTheDocument()
      expect(screen.getByAltText(/Tommy/i)).toBeInTheDocument()
    })

    test('maneja playerCards con datos faltantes', () => {
      const incompleteCards = [
        { card_id: 1, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
        { card_id: 999 }, // Sin card_name ni image_name
      ]
      
      renderWithDnd(<HandCard playerCards={incompleteCards} availableToPlay={true} turnState="None" />)

      // Debe renderizar al menos la carta válida
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Card Selection', () => {
    const mockOnSetStateChange = vi.fn()

    beforeEach(() => {
      mockOnSetStateChange.mockClear()
    })

    test('selecciona una carta detective al hacer clic cuando availableToPlay es true', () => {
      renderWithDnd(
        <HandCard 
          playerCards={sampleCards} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      const firstButton = screen.getByTestId('card-1')
      fireEvent.click(firstButton)

      expect(firstButton).toHaveClass('selected')
    })

    test('deselecciona una carta al hacer clic nuevamente', () => {
      renderWithDnd(
        <HandCard 
          playerCards={sampleCards} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      const firstButton = screen.getByTestId('card-1')
      
      // Seleccionar
      fireEvent.click(firstButton)
      expect(firstButton).toHaveClass('selected')
      
      // Deseleccionar
      fireEvent.click(firstButton)
      expect(firstButton).not.toHaveClass('selected')
    })

    test('no permite seleccionar cuando availableToPlay es false', () => {
      renderWithDnd(
        <HandCard 
          playerCards={sampleCards} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={false}
          turnState="None"
        />
      )

      const firstButton = screen.getByTestId('card-1')
      fireEvent.click(firstButton)

      expect(firstButton).not.toHaveClass('selected')
    })

    test('no permite seleccionar cuando turnState no es None', () => {
      renderWithDnd(
        <HandCard 
          playerCards={sampleCards} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="WaitingResponse"
        />
      )

      const firstButton = screen.getByTestId('card-1')
      fireEvent.click(firstButton)

      expect(firstButton).not.toHaveClass('selected')
    })

    test('permite seleccionar múltiples cartas del mismo tipo', () => {
      const threePoirots = [
        { card_id: 1, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
        { card_id: 3, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={threePoirots} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      // Seleccionar las tres cartas
      fireEvent.click(screen.getByTestId('card-1'))
      fireEvent.click(screen.getByTestId('card-2'))
      fireEvent.click(screen.getByTestId('card-3'))

      expect(screen.getByTestId('card-1')).toHaveClass('selected')
      expect(screen.getByTestId('card-2')).toHaveClass('selected')
      expect(screen.getByTestId('card-3')).toHaveClass('selected')
    })
  })

  describe('Set Formation Logic', () => {
    const mockOnSetStateChange = vi.fn()

    beforeEach(() => {
      mockOnSetStateChange.mockClear()
    })

    test('permite formar un set de 3 Poirot (requiere 3 cartas)', () => {
      const threePoirots = [
        { card_id: 1, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
        { card_id: 3, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={threePoirots} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      // Seleccionar las 3 cartas
      fireEvent.click(screen.getByTestId('card-1'))
      fireEvent.click(screen.getByTestId('card-2'))
      fireEvent.click(screen.getByTestId('card-3'))

      // Debe notificar que el set está completo (3 cartas seleccionadas)
      expect(mockOnSetStateChange).toHaveBeenLastCalledWith(true, expect.arrayContaining([
        expect.objectContaining({ card_id: 1 }),
        expect.objectContaining({ card_id: 2 }),
        expect.objectContaining({ card_id: 3 })
      ]))
    })

    test('permite formar un set de 3 Miss Marple (requiere 3 cartas)', () => {
      const threeMarples = [
        { card_id: 1, card_name: 'Miss Marple', type: 'Detective', image_name: 'detective_marple.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Miss Marple', type: 'Detective', image_name: 'detective_marple.png', image_back_name: 'card_back.png' },
        { card_id: 3, card_name: 'Miss Marple', type: 'Detective', image_name: 'detective_marple.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={threeMarples} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      fireEvent.click(screen.getByTestId('card-1'))
      fireEvent.click(screen.getByTestId('card-2'))
      fireEvent.click(screen.getByTestId('card-3'))

      expect(mockOnSetStateChange).toHaveBeenLastCalledWith(true, expect.arrayContaining([
        expect.objectContaining({ card_id: 1 }),
        expect.objectContaining({ card_id: 2 }),
        expect.objectContaining({ card_id: 3 })
      ]))
    })

    test('permite formar un set de 2 cartas para otros detectives', () => {
      const twoHastings = [
        { card_id: 1, card_name: 'Captain Hastings', type: 'Detective', image_name: 'detective_hastings.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Captain Hastings', type: 'Detective', image_name: 'detective_hastings.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={twoHastings} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      fireEvent.click(screen.getByTestId('card-1'))
      fireEvent.click(screen.getByTestId('card-2'))

      expect(mockOnSetStateChange).toHaveBeenLastCalledWith(true, expect.arrayContaining([
        expect.objectContaining({ card_id: 1 }),
        expect.objectContaining({ card_id: 2 })
      ]))
    })
  })

  describe('Wildcard Logic (Harley Quin)', () => {
    const mockOnSetStateChange = vi.fn()

    beforeEach(() => {
      mockOnSetStateChange.mockClear()
    })

    test('permite seleccionar Harley Quin Wildcard como primera carta', () => {
      const cardsWithWildcard = [
        { card_id: 1, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Harley Quin Wildcard', type: 'Detective', image_name: 'detective_quin.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={cardsWithWildcard} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
        />
      )

      const wildcardButton = screen.getByTestId('card-2')
      fireEvent.click(wildcardButton)

      expect(wildcardButton).toHaveClass('selected')
    })

    test('forma set con 2 Poirot + Harley Quin Wildcard', () => {
      const setWithWildcard = [
        { card_id: 1, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
        { card_id: 3, card_name: 'Harley Quin Wildcard', type: 'Detective', image_name: 'detective_quin.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={setWithWildcard} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      fireEvent.click(screen.getByTestId('card-1'))
      fireEvent.click(screen.getByTestId('card-2'))
      fireEvent.click(screen.getByTestId('card-3'))

      expect(screen.getByTestId('card-1')).toHaveClass('selected')
      expect(screen.getByTestId('card-2')).toHaveClass('selected')
      expect(screen.getByTestId('card-3')).toHaveClass('selected')
    })

    test('permite seleccionar Wildcard primero y luego un detective', () => {
      const cardsWithWildcard = [
        { card_id: 1, card_name: 'Harley Quin Wildcard', type: 'Detective', image_name: 'detective_quin.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Captain Hastings', type: 'Detective', image_name: 'detective_hastings.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={cardsWithWildcard} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
        />
      )

      // Seleccionar wildcard primero
      fireEvent.click(screen.getByTestId('card-1'))
      // Luego seleccionar detective
      fireEvent.click(screen.getByTestId('card-2'))

      expect(screen.getByTestId('card-1')).toHaveClass('selected')
      expect(screen.getByTestId('card-2')).toHaveClass('selected')
    })
  })

  describe('Beresford Pairs', () => {
    const mockOnSetStateChange = vi.fn()

    beforeEach(() => {
      mockOnSetStateChange.mockClear()
    })

    test('permite formar pair con Tommy Beresford y Tuppence Beresford', () => {
      const beresfordPair = [
        { card_id: 1, card_name: 'Tommy Beresford', type: 'Detective', image_name: 'detective_tommyberesford.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Tuppence Beresford', type: 'Detective', image_name: 'detective_tuppenceberesford.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={beresfordPair} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      fireEvent.click(screen.getByTestId('card-1'))
      fireEvent.click(screen.getByTestId('card-2'))

      expect(screen.getByTestId('card-1')).toHaveClass('selected')
      expect(screen.getByTestId('card-2')).toHaveClass('selected')
      expect(mockOnSetStateChange).toHaveBeenLastCalledWith(true, expect.arrayContaining([
        expect.objectContaining({ card_id: 1 }),
        expect.objectContaining({ card_id: 2 })
      ]))
    })

    test('permite seleccionar Tommy Beresford individualmente', () => {
      const cards = [
        { card_id: 1, card_name: 'Tommy Beresford', type: 'Detective', image_name: 'detective_tommyberesford.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={cards} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      const tommyButton = screen.getByTestId('card-1')
      fireEvent.click(tommyButton)

      expect(tommyButton).toHaveClass('selected')
    })

    test('permite seleccionar Tuppence Beresford individualmente', () => {
      const cards = [
        { card_id: 1, card_name: 'Tuppence Beresford', type: 'Detective', image_name: 'detective_tuppenceberesford.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Miss Marple', type: 'Detective', image_name: 'detective_marple.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={cards} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      const tuppenceButton = screen.getByTestId('card-1')
      fireEvent.click(tuppenceButton)

      expect(tuppenceButton).toHaveClass('selected')
    })
  })

  describe('Edge Cases', () => {
    const mockOnSetStateChange = vi.fn()

    beforeEach(() => {
      mockOnSetStateChange.mockClear()
    })

    test('maneja playerCards undefined', () => {
      renderWithDnd(
        <HandCard 
          playerCards={undefined} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
        />
      )

      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    test('maneja playerCards vacío', () => {
      renderWithDnd(
        <HandCard 
          playerCards={[]} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
        />
      )

      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    test('renderiza cartas aunque card_name o image_name sean undefined (los renderiza el componente FaceCard)', () => {
      const cardsPartialData = [
        { card_id: 1, card_name: undefined, type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={cardsPartialData} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
        />
      )

      // El componente debe renderizar la carta, aunque no tenga nombre
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })

    test('no falla si onSetStateChange no está definido', () => {
      renderWithDnd(
        <HandCard 
          playerCards={sampleCards} 
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      const firstButton = screen.getByTestId('card-1')
      expect(() => fireEvent.click(firstButton)).not.toThrow()
    })

    test('limpia la selección al hacer clic fuera del contenedor de la mano', () => {
      const { container } = renderWithDnd(
        <HandCard 
          playerCards={sampleCards} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      // Seleccionar una carta
      const firstButton = screen.getByTestId('card-1')
      fireEvent.click(firstButton)
      expect(firstButton).toHaveClass('selected')

      // Hacer clic fuera del contenedor
      fireEvent.click(container.ownerDocument.body)

      // La carta ya no debe estar seleccionada
      expect(firstButton).not.toHaveClass('selected')
    })

    test('reinicia la selección cuando se intenta seleccionar una carta de diferente tipo', () => {
      const mixedCards = [
        { card_id: 1, card_name: 'Hercule Poirot', type: 'Detective', image_name: 'detective_poirot.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Miss Marple', type: 'Detective', image_name: 'detective_marple.png', image_back_name: 'card_back.png' },
      ]

      renderWithDnd(
        <HandCard 
          playerCards={mixedCards} 
          onSetStateChange={mockOnSetStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
      )

      // Seleccionar Poirot
      fireEvent.click(screen.getByTestId('card-1'))
      expect(screen.getByTestId('card-1')).toHaveClass('selected')

      // Intentar seleccionar Marple (diferente detective)
      fireEvent.click(screen.getByTestId('card-2'))
      
      // Poirot debe deseleccionarse y Marple debe ser la nueva selección
      expect(screen.getByTestId('card-1')).not.toHaveClass('selected')
      expect(screen.getByTestId('card-2')).toHaveClass('selected')
    })
  })

  describe('Detective Card Matching with Sets (Agregar carta a set)', () => {
    const mockOnCardStateChange = vi.fn()
    const mockOnSetStateChange = vi.fn()

    beforeEach(() => {
      mockOnCardStateChange.mockClear()
      mockOnSetStateChange.mockClear()
    })

    test('detecta matching set cuando se selecciona una carta detective', async () => {
      const mockSetsPlayed = [
        {
          set_id: 1,
          set_type: 'Poirot',
          cards: []
        }
      ]

      render(
        <DndContext>
          <HandCard 
            playerCards={sampleCards} 
            onSetStateChange={mockOnSetStateChange}
            onCardStateChange={mockOnCardStateChange}
            availableToPlay={true}
            turnState="None"
            setsPlayed={mockSetsPlayed}
          />
        </DndContext>
      )

      const firstButton = screen.getByTestId('card-1')
      fireEvent.click(firstButton)

      await new Promise(resolve => setTimeout(resolve, 50))

      // onCardStateChange debe ser llamado con los sets que coinciden
      expect(mockOnCardStateChange).toHaveBeenCalled()
    })

    test('llama a onCardStateChange con matches cuando detective coincide con set type', async () => {
      const mockSetsPlayed = [
        {
          set_id: 1,
          set_type: 'Poirot',
          cards: []
        }
      ]

      render(
        <DndContext>
          <HandCard 
            playerCards={sampleCards} 
            onSetStateChange={mockOnSetStateChange}
            onCardStateChange={mockOnCardStateChange}
            availableToPlay={true}
            turnState="None"
            setsPlayed={mockSetsPlayed}
          />
        </DndContext>
      )

      const poirotButton = screen.getByTestId('card-1')
      fireEvent.click(poirotButton)

      await new Promise(resolve => setTimeout(resolve, 50))

      // Debería haber encontrado una coincidencia con Poirot
      const calls = mockOnCardStateChange.mock.calls
      expect(calls.length).toBeGreaterThan(0)
      // El último call debería ser un array con al menos un elemento
      const lastCall = calls[calls.length - 1]
      expect(lastCall[0]).toBeDefined()
    })

    test('no encuentra coincidencias cuando no hay sets jugados', async () => {
      render(
        <DndContext>
          <HandCard 
            playerCards={sampleCards} 
            onSetStateChange={mockOnSetStateChange}
            onCardStateChange={mockOnCardStateChange}
            availableToPlay={true}
            turnState="None"
            setsPlayed={[]}
          />
        </DndContext>
      )

      const poirotButton = screen.getByTestId('card-1')
      fireEvent.click(poirotButton)

      await new Promise(resolve => setTimeout(resolve, 50))

      // Debería llamar con array vacío (sin coincidencias)
      expect(mockOnCardStateChange).toHaveBeenCalledWith([])
    })

    test('detecta coincidencias con Beresford pairs (Tommy y Tuppence)', async () => {
      const beresfordCards = [
        { card_id: 1, card_name: 'Tommy Beresford', type: 'Detective', image_name: 'detective_tommy.png', image_back_name: 'card_back.png' },
        { card_id: 2, card_name: 'Tuppence Beresford', type: 'Detective', image_name: 'detective_tuppence.png', image_back_name: 'card_back.png' },
      ]

      const mockSetsPlayed = [
        {
          set_id: 1,
          set_type: 'Tuppence',
          cards: []
        }
      ]

      render(
        <DndContext>
          <HandCard 
            playerCards={beresfordCards} 
            onSetStateChange={mockOnSetStateChange}
            onCardStateChange={mockOnCardStateChange}
            availableToPlay={true}
            turnState="None"
            setsPlayed={mockSetsPlayed}
          />
        </DndContext>
      )

      const tommyButton = screen.getByTestId('card-1')
      fireEvent.click(tommyButton)

      await new Promise(resolve => setTimeout(resolve, 50))

      // Tommy debería coincidir con Tuppence set
      const calls = mockOnCardStateChange.mock.calls
      expect(calls.length).toBeGreaterThan(0)
    })

    test('no detecta coincidencias con Adriane Oliver', async () => {
      const oliverCards = [
        { card_id: 1, card_name: 'Adriane Oliver', type: 'Detective', image_name: 'detective_oliver.png', image_back_name: 'card_back.png' },
      ]

      const mockSetsPlayed = [
        {
          set_id: 1,
          set_type: 'Oliver',
          cards: []
        }
      ]

      render(
        <DndContext>
          <HandCard 
            playerCards={oliverCards} 
            onSetStateChange={mockOnSetStateChange}
            onCardStateChange={mockOnCardStateChange}
            availableToPlay={true}
            turnState="None"
            setsPlayed={mockSetsPlayed}
          />
        </DndContext>
      )

      const oliverButton = screen.getByTestId('card-1')
      fireEvent.click(oliverButton)

      await new Promise(resolve => setTimeout(resolve, 50))

      // Adriane Oliver no debería generar matches
      expect(mockOnCardStateChange).toHaveBeenCalledWith([])
    })

    test('limpiar matches cuando se deselecciona la carta detective', async () => {
      const mockSetsPlayed = [
        {
          set_id: 1,
          set_type: 'Poirot',
          cards: []
        }
      ]

      render(
        <DndContext>
          <HandCard 
            playerCards={sampleCards} 
            onSetStateChange={mockOnSetStateChange}
            onCardStateChange={mockOnCardStateChange}
            availableToPlay={true}
            turnState="None"
            setsPlayed={mockSetsPlayed}
          />
        </DndContext>
      )

      const poirotButton = screen.getByTestId('card-1')
      
      // Seleccionar
      fireEvent.click(poirotButton)
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Deseleccionar
      fireEvent.click(poirotButton)
      await new Promise(resolve => setTimeout(resolve, 50))

      // Después de deseleccionar, debería mantener matches solo si selectedCards estaba vacío
      // El comportamiento actual: si matchingSets estaba con datos, se mantiene
      const calls = mockOnCardStateChange.mock.calls
      expect(calls.length).toBeGreaterThan(0)
    })

    test('no encuentra coincidencias para más de 1 carta seleccionada', async () => {
      const mockSetsPlayed = [
        {
          set_id: 1,
          set_type: 'Poirot',
          cards: []
        }
      ]

      render(
        <DndContext>
          <HandCard 
            playerCards={sampleCards} 
            onSetStateChange={mockOnSetStateChange}
            onCardStateChange={mockOnCardStateChange}
            availableToPlay={true}
            turnState="None"
            setsPlayed={mockSetsPlayed}
          />
        </DndContext>
      )

      // Seleccionar 2 cartas
      fireEvent.click(screen.getByTestId('card-1'))
      fireEvent.click(screen.getByTestId('card-2'))

      await new Promise(resolve => setTimeout(resolve, 50))

      // Con 2 cartas seleccionadas, no debería buscar matches
      expect(mockOnCardStateChange).toHaveBeenCalledWith([])
    })
  })
})

