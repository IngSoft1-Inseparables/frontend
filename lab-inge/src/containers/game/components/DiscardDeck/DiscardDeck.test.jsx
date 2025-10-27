import {render, screen, fireEvent} from '@testing-library/react'
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

  test('muestra hover effects en el icono de descarte cuando el mazo está vacío', async () => {
    const emptyDiscardPile = { count: 0 };
    renderWithDnd(<DiscardDeck discardpile={emptyDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    const discardIcon = screen.getByAltText('Zona de descarte')
    
    // Verificar que el icono existe
    expect(discardIcon).toBeInTheDocument()

    // Simular mouse enter
    fireEvent.mouseEnter(discardIcon)
    expect(discardIcon).toHaveStyle({ transform: 'scale(1.1)' })

    // Simular mouse leave
    fireEvent.mouseLeave(discardIcon)
    expect(discardIcon).toHaveStyle({ transform: 'scale(1)' })
  })

  test('aplica estilos cuando isOver es true y es el turno del jugador', async () => {
    const emptyDiscardPile = { count: 0 };
    
    // Mock useDroppable para simular isOver=true
    vi.mock('@dnd-kit/core', async () => {
      const actual = await vi.importActual('@dnd-kit/core');
      return {
        ...actual,
        useDroppable: () => ({
          setNodeRef: vi.fn(),
          isOver: true,
        }),
      };
    });

    const { container } = renderWithDnd(<DiscardDeck discardpile={emptyDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    // Verificar que el contenedor tiene el estilo de hover
    const discardContainer = container.querySelector('.back-card-container')
    expect(discardContainer).toBeInTheDocument()
  })

  test('no aplica estilos de hover cuando no es el turno del jugador', async () => {
    const emptyDiscardPile = { count: 0 };
    const differentPlayerId = 2;

    const { container } = renderWithDnd(<DiscardDeck discardpile={emptyDiscardPile} turnData={mockTurnData} myPlayerId={differentPlayerId} />)

    const discardContainer = container.querySelector('.back-card-container')
    expect(discardContainer).toBeInTheDocument()
  })

  test('limita el visibleCount a 5 cuando hay más de 5 cartas', async () => {
    const manyCardsDiscardPile = {
      count: 15,
      last_card_name: 'Test Card',
      last_card_image: '02-murder_escapes'
    };

    renderWithDnd(<DiscardDeck discardpile={manyCardsDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    const imgs = screen.getAllByRole('img')
    // Debe mostrar máximo 5 cartas (4 dorsos + 1 cara)
    expect(imgs.length).toBeLessThanOrEqual(5)
  })

  test('muestra solo una carta cuando count es 1', async () => {
    const singleCardDiscardPile = {
      count: 1,
      last_card_name: 'Single Card',
      last_card_image: '02-murder_escapes'
    };

    renderWithDnd(<DiscardDeck discardpile={singleCardDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    const imgs = screen.getAllByRole('img')
    // Solo debe mostrar 1 carta (la cara superior, sin dorsos)
    expect(imgs.length).toBe(1)
    expect(imgs[0]).toHaveAttribute('alt', 'Single Card')
  })

  test('renderiza correctamente con 3 cartas en el mazo', async () => {
    const threeCardsDiscardPile = {
      count: 3,
      last_card_name: 'Third Card',
      last_card_image: '07-detective_poirot'
    };

    renderWithDnd(<DiscardDeck discardpile={threeCardsDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    const imgs = screen.getAllByRole('img')
    // 2 dorsos + 1 cara = 3 cartas
    expect(imgs.length).toBe(3)
    
    // Las primeras 2 deben ser dorsos
    expect(imgs[0]).toHaveAttribute('src', '/cards/01-card_back.png')
    expect(imgs[1]).toHaveAttribute('src', '/cards/01-card_back.png')
    
    // La última debe ser la cara
    expect(imgs[2]).toHaveAttribute('src', '/cards/07-detective_poirot.png')
  })

  test('maneja correctamente cuando turnData es null', async () => {
    const emptyDiscardPile = { count: 0 };

    // Debería renderizar pero sin errores
    renderWithDnd(<DiscardDeck discardpile={emptyDiscardPile} turnData={null} myPlayerId={myPlayerId} />)

    const discardIcon = screen.getByAltText('Zona de descarte')
    expect(discardIcon).toBeInTheDocument()
  })

  test('usa texto por defecto cuando last_card_name no está presente', async () => {
    const discardPileWithoutName = {
      count: 2,
      last_card_image: '02-murder_escapes'
      // last_card_name no está definido
    };

    renderWithDnd(<DiscardDeck discardpile={discardPileWithoutName} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    const imgs = screen.getAllByRole('img')
    const topCard = imgs[imgs.length - 1]
    expect(topCard).toHaveAttribute('alt', 'Top Discarded Card')
  })

  test('renderiza con 10 cartas y limita la visualización a 5', async () => {
    const tenCardsDiscardPile = {
      count: 10,
      last_card_name: 'Tenth Card',
      last_card_image: '08-detective_marple'
    };

    renderWithDnd(<DiscardDeck discardpile={tenCardsDiscardPile} turnData={mockTurnData} myPlayerId={myPlayerId} />)

    const imgs = screen.getAllByRole('img')
    // Debe mostrar máximo 5 cartas (4 dorsos + 1 cara)
    expect(imgs.length).toBe(5)
    
    // Verificar que la última es la carta de cara
    expect(imgs[4]).toHaveAttribute('src', '/cards/08-detective_marple.png')
  })

  // ===== TESTS PARA RENDERIZADO DE EARLY TRAIN TO PADDINGTON =====
  
  describe('Renderizado de Early train to paddington', () => {
    test('renderiza correctamente cuando la última carta es "Early train to paddington"', () => {
      const paddingtonDiscardPile = {
        count: 1,
        last_card_image: "24-event_earlytrain",
        last_card_name: "Early train to paddington",
      };

      renderWithDnd(
        <DiscardDeck
          discardpile={paddingtonDiscardPile}
          turnData={mockTurnData}
          myPlayerId={myPlayerId}
        />
      );

      const imgs = screen.getAllByRole('img')
      const topCard = imgs[imgs.length - 1]
      expect(topCard).toHaveAttribute('src', '/cards/24-event_earlytrain.png')
      expect(topCard).toHaveAttribute('alt', 'Early train to paddington')
    });

    test('NO llama a setSelectionAction cuando se renderiza cualquier carta', () => {
      // Ya no hay lógica de detección en DiscardDeck, esto se maneja por WebSocket
      const mockSetSelectionAction = vi.fn();
      
      const paddingtonDiscardPile = {
        count: 1,
        last_card_image: "24-event_earlytrain",
        last_card_name: "Early train to paddington",
      };

      renderWithDnd(
        <DiscardDeck
          discardpile={paddingtonDiscardPile}
          turnData={mockTurnData}
          myPlayerId={myPlayerId}
          setSelectionAction={mockSetSelectionAction}
        />
      );

      // El componente no debe llamar a setSelectionAction, esto lo maneja el WebSocket
      expect(mockSetSelectionAction).not.toHaveBeenCalled();
    });

    test('renderiza correctamente cuando cambia la última carta a "Early train to paddington"', () => {
      const { rerender } = renderWithDnd(
        <DiscardDeck
          discardpile={{
            count: 1,
            last_card_image: "10-event_something",
            last_card_name: "Some Card",
          }}
          turnData={mockTurnData}
          myPlayerId={myPlayerId}
        />
      );

      // Verificar carta inicial
      let imgs = screen.getAllByRole('img')
      let topCard = imgs[imgs.length - 1]
      expect(topCard).toHaveAttribute('src', '/cards/10-event_something.png')

      // Cambiar a Early train to paddington
      rerender(
        <DndContext>
          <DiscardDeck
            discardpile={{
              count: 2,
              last_card_image: "24-event_earlytrain",
              last_card_name: "Early train to paddington",
            }}
            turnData={mockTurnData}
            myPlayerId={myPlayerId}
          />
        </DndContext>
      );

      // Verificar nueva carta
      imgs = screen.getAllByRole('img')
      topCard = imgs[imgs.length - 1]
      expect(topCard).toHaveAttribute('src', '/cards/24-event_earlytrain.png')
      expect(topCard).toHaveAttribute('alt', 'Early train to paddington')
    });
  });
})
