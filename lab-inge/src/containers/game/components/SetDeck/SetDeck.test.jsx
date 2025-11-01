import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import SetDeck from "./SetDeck.jsx";

// Mock de BackCard (evita dependencias externas)
vi.mock("../BackCard/BackCard", () => ({
  default: ({ type, deck, containerStyle }) => (
    <div
      data-testid="mock-backcard"
      data-type={type}
      data-count={deck.length}
      style={containerStyle}
    >
      BackCardMock
    </div>
  ),
}));

describe("SetDeck component", () => {
  const resizeEvent = () => {
    window.dispatchEvent(new Event("resize"));
  };

  beforeEach(() => {
    // Mock para offsetWidth (control del ancho del contenedor)
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 1000,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("no renderiza nada si setPlayed está vacío", () => {
    const { container } = render(<SetDeck setPlayed={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza correctamente un solo set", () => {
    const mockSet = [
      {
        cards: [
          { card_id: 1, card_name: "Poirot", image_name: "07-detective_poirot" },
          { card_id: 2, card_name: "Poirot", image_name: "07-detective_poirot" },
          { card_id: 3, card_name: "Poirot", image_name: "07-detective_poirot" },
        ],
      },
    ];

    render(<SetDeck setPlayed={mockSet} />);

    expect(screen.getByTestId("mock-backcard")).toBeInTheDocument();
    expect(screen.getByTitle(/Cantidad de cartas: 3/)).toBeInTheDocument();
  });

  it("muestra color verde si contiene comodín (Harley Quin Wildcard)", () => {
    const mockSet = [
      {
        cards: [
          { card_id: 1, card_name: "Harley Quin Wildcard", image_name: "14-detective_quin" },
        ],
      },
    ];

    render(<SetDeck setPlayed={mockSet} />);
    const infoIcon = screen.getByText("i");
    expect(infoIcon).toHaveClass("bg-green-300/80");
  });

  it("muestra color azul si tiene Tommy y Tuppence Beresford", () => {
    const mockSet = [
      {
        cards: [
          { card_id: 1, card_name: "Tommy Beresford", image_name: "12-detective_tommyberesford" },
          { card_id: 2, card_name: "Tuppence Beresford", image_name: "13-detective_tuppenceberesford" },
        ],
      },
    ];

    render(<SetDeck setPlayed={mockSet} />);
    const infoIcon = screen.getByText("i");
    expect(infoIcon).toHaveClass("bg-blue-300");
  });

  it("muestra color blanco por defecto si no cumple ninguna condición", () => {
    const mockSet = [
      {
        cards: [
          { card_id: 1, card_name: "Miss Marple", image_name: "08-detective_marple" },
        ],
      },
    ];

    render(<SetDeck setPlayed={mockSet} />);
    const infoIcon = screen.getByText("i");
    expect(infoIcon).toHaveClass("bg-white/80");
  });

  it("ajusta correctamente el ancho cuando el contenedor cambia de tamaño", async () => {
    const mockSet = Array.from({ length: 15 }, (_, i) => ({
      cards: [{ card_id: i + 1, card_name: "Card " + i, image_name: "img" + i }],
    }));

    const { container } = render(<SetDeck setPlayed={mockSet} />);
    resizeEvent(); // dispara el listener de resize

    // Debe haber tantos BackCard como sets
    const cards = screen.getAllByTestId("mock-backcard");
    expect(cards.length).toBe(15);

    // Contenedor principal existe
    const containerDiv = container.querySelector("div.w-full");
    expect(containerDiv).toBeInTheDocument();
  });

  describe("Set selection functionality", () => {
    it("no muestra borde de selección cuando selectionMode no es 'select-set'", () => {
      const mockSet = [
        {
          cards: [
            { card_id: 1, card_name: "Poirot", image_name: "07-detective_poirot" },
          ],
        },
      ];

      const { container } = render(
        <SetDeck 
          setPlayed={mockSet}
          onSetClick={vi.fn()}
          selectionMode="select-player"
          playerId={10}
        />
      );

      // No debe tener borde dashed cuando selectionMode es diferente
      const setContainer = container.querySelector("div.relative");
      expect(setContainer).not.toHaveClass("border-dashed");
    });

    it("muestra borde de selección cuando selectionMode es 'select-set'", () => {
      const mockSet = [
        {
          cards: [
            { card_id: 1, card_name: "Poirot", image_name: "07-detective_poirot" },
          ],
        },
      ];

      const { container } = render(
        <SetDeck 
          setPlayed={mockSet}
          onSetClick={vi.fn()}
          selectionMode="select-set"
          playerId={10}
        />
      );

      // Debe tener borde dashed cuando selectionMode es 'select-set'
      const setContainer = container.querySelector("div.relative");
      expect(setContainer).toHaveClass("border-dashed");
      expect(setContainer).toHaveClass("cursor-pointer");
    });

    it("llama a onSetClick con los parámetros correctos cuando se hace click", () => {
      const mockOnSetClick = vi.fn();
      const mockSet = [
        {
          cards: [
            { card_id: 1, card_name: "Poirot", image_name: "07-detective_poirot" },
          ],
        },
        {
          cards: [
            { card_id: 2, card_name: "Miss Marple", image_name: "08-detective_marple" },
          ],
        },
      ];

      const { container } = render(
        <SetDeck 
          setPlayed={mockSet}
          onSetClick={mockOnSetClick}
          selectionMode="select-set"
          playerId={10}
        />
      );

      // Hacer click en el segundo set
      const setContainers = container.querySelectorAll("div.relative");
      setContainers[1].click();

      // Verificar que se llamó con playerId y setIndex correctos
      expect(mockOnSetClick).toHaveBeenCalledWith(10, 1);
      expect(mockOnSetClick).toHaveBeenCalledTimes(1);
    });

    it("no llama a onSetClick cuando selectionMode no es 'select-set'", () => {
      const mockOnSetClick = vi.fn();
      const mockSet = [
        {
          cards: [
            { card_id: 1, card_name: "Poirot", image_name: "07-detective_poirot" },
          ],
        },
      ];

      const { container } = render(
        <SetDeck 
          setPlayed={mockSet}
          onSetClick={mockOnSetClick}
          selectionMode="select-player"
          playerId={10}
        />
      );

      // Intentar hacer click
      const setContainer = container.querySelector("div.relative");
      setContainer.click();

      // No debe llamar a onSetClick
      expect(mockOnSetClick).not.toHaveBeenCalled();
    });

    it("muestra borde amarillo cuando el set está seleccionado", () => {
      const mockSet = [
        {
          cards: [
            { card_id: 1, card_name: "Poirot", image_name: "07-detective_poirot" },
          ],
        },
        {
          cards: [
            { card_id: 2, card_name: "Miss Marple", image_name: "08-detective_marple" },
          ],
        },
      ];

      const { container } = render(
        <SetDeck 
          setPlayed={mockSet}
          onSetClick={vi.fn()}
          selectionMode="select-set"
          playerId={10}
          selectedSetIndex={1}
        />
      );

      // El segundo set debe tener el borde amarillo
      const setContainers = container.querySelectorAll("div.relative");
      expect(setContainers[1]).toHaveClass("border-yellow-400");
    });

    it("no muestra borde amarillo en sets no seleccionados", () => {
      const mockSet = [
        {
          cards: [
            { card_id: 1, card_name: "Poirot", image_name: "07-detective_poirot" },
          ],
        },
        {
          cards: [
            { card_id: 2, card_name: "Miss Marple", image_name: "08-detective_marple" },
          ],
        },
      ];

      const { container } = render(
        <SetDeck 
          setPlayed={mockSet}
          onSetClick={vi.fn()}
          selectionMode="select-set"
          playerId={10}
          selectedSetIndex={1}
        />
      );

      // El primer set NO debe tener el borde amarillo
      const setContainers = container.querySelectorAll("div.relative");
      expect(setContainers[0]).not.toHaveClass("border-yellow-400");
    });

    it("maneja múltiples clicks en diferentes sets", () => {
      const mockOnSetClick = vi.fn();
      const mockSet = [
        {
          cards: [
            { card_id: 1, card_name: "Poirot", image_name: "07-detective_poirot" },
          ],
        },
        {
          cards: [
            { card_id: 2, card_name: "Miss Marple", image_name: "08-detective_marple" },
          ],
        },
        {
          cards: [
            { card_id: 3, card_name: "Poirot", image_name: "07-detective_poirot" },
          ],
        },
      ];

      const { container } = render(
        <SetDeck 
          setPlayed={mockSet}
          onSetClick={mockOnSetClick}
          selectionMode="select-set"
          playerId={10}
        />
      );

      const setContainers = container.querySelectorAll("div.relative");
      
      // Click en el primer set
      setContainers[0].click();
      expect(mockOnSetClick).toHaveBeenCalledWith(10, 0);
      
      // Click en el tercer set
      setContainers[2].click();
      expect(mockOnSetClick).toHaveBeenCalledWith(10, 2);
      
      expect(mockOnSetClick).toHaveBeenCalledTimes(2);
    });
  });
});
