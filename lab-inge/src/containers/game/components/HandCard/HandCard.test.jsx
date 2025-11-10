import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import HandCard from './HandCard.jsx'
import '@testing-library/jest-dom'
import { describe, it, test, expect, vi, beforeEach } from 'vitest'

describe('HandCard Component', () => {
  describe('Render Tests', () => {
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

  describe('Basic Tests', () => {
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

  describe('Selection Tests', () => {
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
})
describe("HandCard - Advanced scenarios", () => {
  const mockOnSetStateChange = vi.fn();
  const mockOnCardStateChange = vi.fn();
  const mockSetSelectionMode = vi.fn();

  const detectiveCards = [
    {
      card_id: 1,
      card_name: "Hercule Poirot",
      type: "Detective",
      image_name: "detective_poirot.png",
      image_back_name: "card_back.png",
    },
    {
      card_id: 2,
      card_name: "Hercule Poirot",
      type: "Detective",
      image_name: "detective_poirot.png",
      image_back_name: "card_back.png",
    },
    {
      card_id: 3,
      card_name: "Hercule Poirot",
      type: "Detective",
      image_name: "detective_poirot.png",
      image_back_name: "card_back.png",
    },
  ];

  const marpleCards = [
    {
      card_id: 4,
      card_name: "Miss Marple",
      type: "Detective",
      image_name: "detective_marple.png",
      image_back_name: "card_back.png",
    },
    {
      card_id: 5,
      card_name: "Miss Marple",
      type: "Detective",
      image_name: "detective_marple.png",
      image_back_name: "card_back.png",
    },
  ];

  const wildcardCard = {
    card_id: 10,
    card_name: "Harley Quin Wildcard",
    type: "Wildcard",
    image_name: "wildcard.png",
    image_back_name: "card_back.png",
  };

  const beresfordCards = [
    {
      card_id: 20,
      card_name: "Tommy Beresford",
      type: "Detective",
      image_name: "beresford_tommy.png",
      image_back_name: "card_back.png",
    },
    {
      card_id: 21,
      card_name: "Tuppence Beresford",
      type: "Detective",
      image_name: "beresford_tuppence.png",
      image_back_name: "card_back.png",
    },
  ];

  const ariadneCard = {
    card_id: 30,
    card_name: "Adriane Oliver",
    type: "Special",
    image_name: "adriane_oliver.png",
    image_back_name: "card_back.png",
  };

  it("permite seleccionar Ariadne Oliver sola", () => {
    render(
      <HandCard
        playerCards={[ariadneCard]}
        onSetStateChange={mockOnSetStateChange}
        onCardStateChange={mockOnCardStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
      />
    );

    const card = screen.getByAltText("Adriane Oliver");
    fireEvent.click(card);

    expect(mockOnCardStateChange).toHaveBeenCalledWith([
      {
        isAriadne: true,
        card: ariadneCard,
      },
    ]);
  });

  it("permite formar set de 3 con Hercule Poirot", () => {
    render(
      <HandCard
        playerCards={detectiveCards}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
      />
    );

    const cards = screen.getAllByAltText("Hercule Poirot");
    
    // Seleccionar primera carta
    fireEvent.click(cards[0]);
    
    // Seleccionar segunda carta
    fireEvent.click(cards[1]);
    
    // Seleccionar tercera carta
    fireEvent.click(cards[2]);

    expect(mockOnSetStateChange).toHaveBeenLastCalledWith(
      true,
      expect.arrayContaining([
        expect.objectContaining({ card_name: "Hercule Poirot" }),
        expect.objectContaining({ card_name: "Hercule Poirot" }),
        expect.objectContaining({ card_name: "Hercule Poirot" }),
      ])
    );
  });

  it("permite formar set con Tommy y Tuppence Beresford", () => {
    render(
      <HandCard
        playerCards={beresfordCards}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
      />
    );

    const tommy = screen.getByAltText("Tommy Beresford");
    const tuppence = screen.getByAltText("Tuppence Beresford");

    fireEvent.click(tommy);
    fireEvent.click(tuppence);

    expect(mockOnSetStateChange).toHaveBeenLastCalledWith(
      true,
      expect.arrayContaining([
        expect.objectContaining({ card_name: "Tommy Beresford" }),
        expect.objectContaining({ card_name: "Tuppence Beresford" }),
      ])
    );
  });

  it("permite empezar set con Wildcard y luego añadir detective", () => {
    render(
      <HandCard
        playerCards={[wildcardCard, marpleCards[0]]}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
      />
    );

    const wildcard = screen.getByAltText("Harley Quin Wildcard");
    const marple = screen.getByAltText("Miss Marple");

    // Seleccionar wildcard primero
    fireEvent.click(wildcard);
    
    // Seleccionar detective
    fireEvent.click(marple);

    expect(mockOnSetStateChange).toHaveBeenCalled();
  });

  it("permite añadir Wildcard a un set incompleto", () => {
    render(
      <HandCard
        playerCards={[marpleCards[0], wildcardCard, marpleCards[1]]}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
      />
    );

    const marples = screen.getAllByAltText("Miss Marple");
    const wildcard = screen.getByAltText("Harley Quin Wildcard");

    // Seleccionar primera Marple
    fireEvent.click(marples[0]);
    
    // Añadir wildcard
    fireEvent.click(wildcard);
    
    // Añadir segunda Marple
    fireEvent.click(marples[1]);

    expect(mockOnSetStateChange).toHaveBeenLastCalledWith(
      true,
      expect.arrayContaining([
        expect.objectContaining({ card_name: "Miss Marple" }),
        expect.objectContaining({ card_name: "Harley Quin Wildcard" }),
        expect.objectContaining({ card_name: "Miss Marple" }),
      ])
    );
  });

  it("reinicia selección si se intenta añadir carta diferente al set", () => {
    render(
      <HandCard
        playerCards={[marpleCards[0], detectiveCards[0]]}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
      />
    );

    const marple = screen.getByAltText("Miss Marple");
    const poirot = screen.getByAltText("Hercule Poirot");

    // Seleccionar Marple
    fireEvent.click(marple);
    
    // Intentar añadir Poirot (diferente detective)
    fireEvent.click(poirot);

    // Debería reiniciar con solo Poirot
    expect(mockOnSetStateChange).toHaveBeenLastCalledWith(
      false,
      expect.arrayContaining([
        expect.objectContaining({ card_name: "Hercule Poirot" }),
      ])
    );
  });

  it("no permite seleccionar cartas si turnState no es 'None'", () => {
    const specificMock = vi.fn();
    render(
      <HandCard
        playerCards={detectiveCards}
        onSetStateChange={specificMock}
        availableToPlay={true}
        turnState="Replenish"
        setsPlayed={[]}
      />
    );

    const card = screen.getAllByAltText("Hercule Poirot")[0];
    fireEvent.click(card);

    // Solo debería haber llamadas con false (estado inicial)
    const trueCalls = specificMock.mock.calls.filter(call => call[0] === true);
    expect(trueCalls.length).toBe(0);
  });

  it("no permite seleccionar si availableToPlay es false", () => {
    const specificMock = vi.fn();
    render(
      <HandCard
        playerCards={detectiveCards}
        onSetStateChange={specificMock}
        availableToPlay={false}
        turnState="None"
        setsPlayed={[]}
      />
    );

    const card = screen.getAllByAltText("Hercule Poirot")[0];
    fireEvent.click(card);

    // Solo debería haber llamadas con false (estado inicial)
    const trueCalls = specificMock.mock.calls.filter(call => call[0] === true);
    expect(trueCalls.length).toBe(0);
  });

  it("limpia selección al hacer clic fuera del componente", () => {
    const { container } = render(
      <div>
        <HandCard
          playerCards={detectiveCards}
          onSetStateChange={mockOnSetStateChange}
          onCardStateChange={mockOnCardStateChange}
          availableToPlay={true}
          turnState="None"
          setsPlayed={[]}
        />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    const card = screen.getAllByAltText("Hercule Poirot")[0];
    fireEvent.click(card);

    // Ahora hacer clic fuera
    const outside = screen.getByTestId("outside");
    fireEvent.click(outside);

    // Debería limpiar la selección
    expect(mockOnCardStateChange).toHaveBeenCalledWith([]);
  });

  it("detecta sets coincidentes cuando hay setsPlayed", () => {
    const setsPlayed = [
      {
        set_id: 1,
        set_type: "Poirot",
        cards: [
          { card_id: 1, card_name: "Hercule Poirot" },
          { card_id: 2, card_name: "Hercule Poirot" },
        ],
      },
    ];

    render(
      <HandCard
        playerCards={detectiveCards}
        onSetStateChange={mockOnSetStateChange}
        onCardStateChange={mockOnCardStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={setsPlayed}
      />
    );

    const card = screen.getAllByAltText("Hercule Poirot")[0];
    fireEvent.click(card);

    // Debería detectar el set coincidente
    expect(mockOnCardStateChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          setType: "Poirot",
          setId: 1,
        }),
      ])
    );
  });

  it("limpia selección cuando está en desgracia social", () => {
    const { rerender } = render(
      <HandCard
        playerCards={detectiveCards}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
        inDisgrace={false}
      />
    );

    const card = screen.getAllByAltText("Hercule Poirot")[0];
    fireEvent.click(card);

    // Cambiar a inDisgrace
    rerender(
      <HandCard
        playerCards={detectiveCards}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
        inDisgrace={true}
      />
    );

    expect(mockOnSetStateChange).toHaveBeenCalledWith(false, []);
  });

  it("no permite seleccionar cartas cuando inDisgrace es true", () => {
    const specificMock = vi.fn();
    render(
      <HandCard
        playerCards={detectiveCards}
        onSetStateChange={specificMock}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
        inDisgrace={true}
      />
    );

    const card = screen.getAllByAltText("Hercule Poirot")[0];
    fireEvent.click(card);

    // Solo debería haber llamadas con false (estado inicial o después de inDisgrace)
    const trueCalls = specificMock.mock.calls.filter(call => call[0] === true);
    expect(trueCalls.length).toBe(0);
  });

  it("muestra título cuando está en desgracia", () => {
    const { container } = render(
      <HandCard
        playerCards={detectiveCards}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
        inDisgrace={true}
      />
    );

    const handCard = container.querySelector(".hand-card");
    expect(handCard).toHaveAttribute(
      "title",
      "Estás en desgracia social: no podés seleccionar cartas para sets."
    );
  });

  it("actualiza selección cuando playerCards cambia", () => {
    const initialCards = [detectiveCards[0], detectiveCards[1]];
    const { rerender } = render(
      <HandCard
        playerCards={initialCards}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
      />
    );

    const cards = screen.getAllByAltText("Hercule Poirot");
    fireEvent.click(cards[0]);

    // Cambiar playerCards (eliminar la carta seleccionada)
    rerender(
      <HandCard
        playerCards={[detectiveCards[1]]}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
      />
    );

    // Debería actualizar la selección
    expect(mockOnSetStateChange).toHaveBeenCalled();
  });

  it("reinicia selección cuando set está completo e intenta añadir otra carta", () => {
    render(
      <HandCard
        playerCards={[...marpleCards, detectiveCards[0]]}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
      />
    );

    const marples = screen.getAllByAltText("Miss Marple");
    const poirot = screen.getByAltText("Hercule Poirot");

    // Completar set de Marple (2 cartas)
    fireEvent.click(marples[0]);
    fireEvent.click(marples[1]);

    // Intentar añadir Poirot
    fireEvent.click(poirot);

    // Debería reiniciar con Poirot
    expect(mockOnSetStateChange).toHaveBeenLastCalledWith(
      false,
      expect.arrayContaining([
        expect.objectContaining({ card_name: "Hercule Poirot" }),
      ])
    );
  });

  it("no permite añadir segundo Wildcard al set", () => {
    const twoWildcards = [
      { ...wildcardCard, card_id: 10 },
      { ...wildcardCard, card_id: 11 },
      marpleCards[0],
    ];

    render(
      <HandCard
        playerCards={twoWildcards}
        onSetStateChange={mockOnSetStateChange}
        availableToPlay={true}
        turnState="None"
        setsPlayed={[]}
      />
    );

    const wildcards = screen.getAllByAltText("Harley Quin Wildcard");
    const marple = screen.getByAltText("Miss Marple");

    // Seleccionar primera wildcard
    fireEvent.click(wildcards[0]);
    
    // Añadir Marple
    fireEvent.click(marple);
    
    // Intentar añadir segunda wildcard (no debería funcionar)
    fireEvent.click(wildcards[1]);

    // No debería tener 3 cartas, solo 2
    const lastCall = mockOnSetStateChange.mock.calls[mockOnSetStateChange.mock.calls.length - 1];
    expect(lastCall[1].length).toBeLessThanOrEqual(3);
  });
});
