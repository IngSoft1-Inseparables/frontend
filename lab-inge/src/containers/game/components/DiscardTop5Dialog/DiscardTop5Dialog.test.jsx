import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";

// ✅ MOCK COMPLETO DEL HTTPService ANTES DE IMPORTAR EL COMPONENTE
const mockGetDiscardTop5 = vi.fn();

vi.mock("../../../../services/HTTPService", () => {
  return {
    createHttpService: () => ({
      getDiscardTop5: mockGetDiscardTop5,
    }),
  };
});

// ✅ MOCK SIMPLE DE FaceCard (para evitar imágenes o dependencias innecesarias)
vi.mock("../FaceCard/FaceCard", () => ({
  default: ({ cardName }) => <div data-testid="face-card">{cardName}</div>,
}));

// ✅ IMPORTAMOS EL COMPONENTE DESPUÉS DE MOCKEAR
import DiscardTop5Dialog from "./DiscardTop5Dialog";

describe("DiscardTop5Dialog", () => {
  const mockCards = {
    cards: [
      {
        card_id: 1,
        card_name: "Poirot",
        type: "Detective",
        image_name: "07-detective_poirot.png",
        image_back_name: "01-card_back.png",
      },
      {
        card_id: 2,
        card_name: "Marple",
        type: "Detective",
        image_name: "08-detective_marple.png",
        image_back_name: "01-card_back.png",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada si open es false", () => {
    const { container } = render(<DiscardTop5Dialog gameId={1} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra el mensaje de carga y luego renderiza las cartas correctamente", async () => {
    mockGetDiscardTop5.mockResolvedValueOnce(mockCards);

    render(<DiscardTop5Dialog gameId={1} open={true} onClose={() => {}} />);

    // Estado de carga
    expect(screen.getByText("Cargando...")).toBeInTheDocument();

    // Espera a que termine el fetch y renderice el título
    await waitFor(() =>
      expect(
        screen.getByText("Primeras 5 cartas del mazo de descarte")
      ).toBeInTheDocument()
    );

    // Verifica que se rendericen las cartas mockeadas
    expect(screen.getByText("Poirot")).toBeInTheDocument();
    expect(screen.getByText("Marple")).toBeInTheDocument();
  });

  it("muestra el mensaje de error si la petición falla", async () => {
    mockGetDiscardTop5.mockRejectedValueOnce(new Error("Server fail"));

    render(<DiscardTop5Dialog gameId={1} open={true} />);

    await waitFor(() =>
      expect(
        screen.getByText("No se pudieron cargar las cartas del descarte.")
      ).toBeInTheDocument()
    );
  });

  it("cierra automáticamente si no hay cartas en el descarte", async () => {
    mockGetDiscardTop5.mockResolvedValueOnce({ cards: [] });
    const mockClose = vi.fn();

    render(<DiscardTop5Dialog gameId={1} open={true} onClose={mockClose} />);

    // Espera a que se llame onClose automáticamente
    await waitFor(() => expect(mockClose).toHaveBeenCalled());
  });

  it("ejecuta onSelect al hacer click en una carta", async () => {
    mockGetDiscardTop5.mockResolvedValueOnce(mockCards);
    const mockSelect = vi.fn();

    render(
      <DiscardTop5Dialog
        gameId={1}
        open={true}
        onSelect={mockSelect}
        onClose={() => {}}
      />
    );

    await waitFor(() => screen.getByText("Poirot"));

    const card = screen.getByText("Poirot");
    fireEvent.click(card);

    expect(mockSelect).toHaveBeenCalledWith(mockCards.cards[0]);
  });
});
