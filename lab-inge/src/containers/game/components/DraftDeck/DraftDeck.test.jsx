import { render, screen } from "@testing-library/react";
import DraftDeck from "./DraftDeck";
import BackCard from "../BackCard/BackCard";
import "@testing-library/jest-dom";

vi.mock("../BackCard/BackCard", () => ({
  default: vi.fn(() => <div data-testid="back-card-mock"></div>),
}));

describe("DraftDeck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("no renderiza nada si draft es null o undefined", () => {
    const { container } = render(<DraftDeck draft={null} />);
    expect(container.firstChild).toBeNull();

    const { container: container2 } = render(<DraftDeck />);
    expect(container2.firstChild).toBeNull();
  });

  test("no renderiza nada si draft.count es 0", () => {
    const draft = { count: 0 };
    const { container } = render(<DraftDeck draft={draft} />);
    expect(container.firstChild).toBeNull();
  });

  test("renderiza correctamente las 3 cartas del draft cuando están disponibles", () => {
    const draft = {
      count: 3,
      card_1_image: "01-detective_poirot",
      card_2_image: "02-hastings",
      card_3_image: "03-miss_marple",
    };

    render(<DraftDeck draft={draft} isAvailable={true} onCardClick={() => {}} />);

    // Debe renderizar 3 BackCard
    const cards = screen.getAllByTestId("back-card-mock");
    expect(cards).toHaveLength(3);

    // Verifica que BackCard fue llamado 3 veces
    expect(BackCard).toHaveBeenCalledTimes(3);

    // Verifica que los props tengan type y available correctos
    const firstCallProps = BackCard.mock.calls[0][0];
    expect(firstCallProps.type).toBe("draft");
    expect(firstCallProps.available).toBe(true);
  });

  test("no renderiza cartas si las imágenes son null", () => {
    const draft = {
      count: 3,
      card_1_image: null,
      card_2_image: null,
      card_3_image: null,
    };

    const { container } = render(<DraftDeck draft={draft} />);
    expect(container.firstChild).toBeNull();
  });

  test("llama correctamente al callback onCardClick", () => {
    const draft = {
      count: 3,
      card_1_image: "01-test",
      card_2_image: "02-test",
      card_3_image: "03-test",
    };

    const handleClick = vi.fn();
    render(<DraftDeck draft={draft} isAvailable={true} onCardClick={handleClick} />);

    // Verifica que el callback fue pasado como prop
    const firstCallProps = BackCard.mock.calls[0][0];
    expect(firstCallProps.onCardClick).toBe(handleClick);
  });
});
