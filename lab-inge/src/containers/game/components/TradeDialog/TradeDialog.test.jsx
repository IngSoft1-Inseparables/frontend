import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import TradeDialog from "./TradeDialog";

// Mock del HTTPService
const mockGetOpponentHand = vi.fn();
const mockGetPrivatePlayerData = vi.fn();

vi.mock("../../../../services/HTTPService", () => {
  return {
    createHttpService: () => ({
      getOpponentHand: mockGetOpponentHand,
      getPrivatePlayerData: mockGetPrivatePlayerData,
    }),
  };
});

// Mock de FaceCard
vi.mock("../FaceCard/FaceCard", () => ({
  default: ({ cardId, onSelect, isSelected }) => (
    <div
      data-testid={`face-card-${cardId}`}
      onClick={() => onSelect && onSelect()}
      className={isSelected ? "selected" : ""}
    >
      Carta {cardId}
    </div>
  ),
}));

describe("TradeDialog", () => {
  const baseProps = {
    open: true,
    gameId: 1,
    myPlayerId: 2,
    opponentId: 3,
    turnOwnerId: 2,
    onConfirm: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada si open es false", () => {
    render(<TradeDialog {...baseProps} open={false} />);
    expect(screen.queryByText("Intercambio de cartas")).not.toBeInTheDocument();
  });

  it("renderiza correctamente las cartas del oponente y las del jugador", async () => {
    mockGetOpponentHand.mockResolvedValueOnce({
      hand: [11, 12, 13],
      image_back_name: "01-card_back",
    });
    mockGetPrivatePlayerData.mockResolvedValueOnce({
      playerCards: [
        { card_id: 21, image_name: "07-detective_poirot.png" },
        { card_id: 22, image_name: "08-detective_marple.png" },
      ],
    });

    render(<TradeDialog {...baseProps} />);

    await waitFor(() => {
      expect(screen.getByText("Intercambio de cartas")).toBeInTheDocument();
    });

    // Cartas del oponente renderizadas
    expect(screen.getByTestId("face-card-11")).toBeInTheDocument();
    expect(screen.getByTestId("face-card-12")).toBeInTheDocument();

    // Cartas del jugador renderizadas
    expect(screen.getByTestId("face-card-21")).toBeInTheDocument();
    expect(screen.getByTestId("face-card-22")).toBeInTheDocument();
  });

  it("permite seleccionar cartas y habilita Confirmar intercambio", async () => {
    mockGetOpponentHand.mockResolvedValueOnce({
      hand: [10, 11],
      image_back_name: "01-card_back",
    });
    mockGetPrivatePlayerData.mockResolvedValueOnce({
      playerCards: [{ card_id: 20, image_name: "07-detective_poirot.png" }],
    });

    render(<TradeDialog {...baseProps} />);

    const button = await screen.findByRole("button", {
      name: /Confirmar intercambio/i,
    });
    expect(button).toBeDisabled();

    // Selecciona una carta del oponente y una del jugador
    fireEvent.click(await screen.findByTestId("face-card-10"));
    fireEvent.click(await screen.findByTestId("face-card-20"));

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("llama a onConfirm con las cartas seleccionadas", async () => {
    mockGetOpponentHand.mockResolvedValueOnce({
      hand: [30],
      image_back_name: "01-card_back",
    });
    mockGetPrivatePlayerData.mockResolvedValueOnce({
      playerCards: [{ card_id: 40, image_name: "07-detective_poirot.png" }],
    });

    render(<TradeDialog {...baseProps} />);

    const button = await screen.findByRole("button", {
      name: /Confirmar intercambio/i,
    });

    // Selecciona una carta de cada lado
    fireEvent.click(await screen.findByTestId("face-card-30"));
    fireEvent.click(await screen.findByTestId("face-card-40"));

    fireEvent.click(button);

    await waitFor(() => {
      expect(baseProps.onConfirm).toHaveBeenCalledWith(
        { card_id: 30, image_back_name: "01-card_back" },
        { card_id: 40, image_name: "07-detective_poirot.png" }
      );
    });
  });
});
