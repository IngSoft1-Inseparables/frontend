import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DraftDeck from "./DraftDeck";

describe("DraftDeck", () => {
  const mockOnCardClick = vi.fn();

  it("no renderiza nada si draft es null", () => {
    const { container } = render(<DraftDeck draft={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("no renderiza nada si draft.count es 0", () => {
    const { container } = render(<DraftDeck draft={{ count: 0 }} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza correctamente cuando hay 3 cartas", () => {
    const draft = {
      count: 3,
      card_1: { card_id: 101, image_name: "10-detective_pyne" },
      card_2: { card_id: 102, image_name: "11-detective_brent" },
      card_3: { card_id: 103, image_name: "12-detective_tommyberesford" },
    };

    render(<DraftDeck draft={draft} isAvailable={true} onCardClick={mockOnCardClick} />);

    // Asegura que las 3 cartas se rendericen
    const cards = screen.getAllByAltText(/Carta del draft/i);
    expect(cards).toHaveLength(3);

    // Verifica que cada imagen tenga la ruta correcta
    expect(cards[0]).toHaveAttribute("src", "/cards/10-detective_pyne.png");
    expect(cards[1]).toHaveAttribute("src", "/cards/11-detective_brent.png");
    expect(cards[2]).toHaveAttribute("src", "/cards/12-detective_tommyberesford.png");
  });

  it("renderiza solo las cartas válidas si faltan algunas", () => {
    const draft = {
      count: 2,
      card_1: { card_id: 201, image_name: "14-detective_hastings" },
      card_2: null,
      card_3: { card_id: 203, image_name: "16-detective_tommy" },
    };

    render(<DraftDeck draft={draft} isAvailable={false} />);

    const cards = screen.getAllByAltText(/Carta del draft/i);
    expect(cards).toHaveLength(2);
  });

  it("llama a onCardClick cuando se hace click en una carta (si está disponible)", async () => {
    const draft = {
      count: 1,
      card_1: { card_id: 300, image_name: "10-detective_pyne" },
    };

    render(<DraftDeck draft={draft} isAvailable={true} onCardClick={mockOnCardClick} />);

    const card = screen.getByAltText("Carta del draft 1");
    card.click();

    expect(mockOnCardClick).toHaveBeenCalledTimes(1);
  });
});
