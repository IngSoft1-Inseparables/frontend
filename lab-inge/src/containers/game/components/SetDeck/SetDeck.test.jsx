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
});
