import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";

const mockGames = [
  {
    id: 1,
    game_name: "Aventura",
    players_amount: 2,
    max_players: 4,
    min_players: 2,
    avatar: "avatar/avatar1.png",
    creator_name: "Micaela",
    available: true,
  },
  {
    id: 2,
    game_name: "Estrategia",
    players_amount: 4,
    max_players: 6,
    min_players: 3,
    avatar: "avatar/avatar2.png",
    creator_name: "Norma",
    available: true,
  },
];

vi.mock("../../services/HTTPService", () => ({
  createHttpService: () => ({
    getGames: vi.fn(async () => ({ games: mockGames })),
  }),
}));

vi.mock("../../services/WSService", () => ({
  createWSService: () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});
import GameList from "./GameList";

describe("GameList - pruebas básicas sin JoinGameDialog", () => {
  it("renderiza partidas correctamente", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cargando partidas/i)).toBeInTheDocument();

    // Esperar a que carguen las partidas disponibles
    await waitFor(() =>
      expect(screen.getAllByTestId("GameCard").length).toBeGreaterThan(0)
    );

    // Simular click
    fireEvent.click(screen.getAllByTestId("GameCard")[0]);
  });

  it("muestra 'No hay partidas disponibles' si no hay juegos válidos", async () => {
    // Vaciar el mock manualmente
    mockGames.length = 0;

    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/No hay partidas disponibles/i)
      ).toBeInTheDocument()
    );
  });
});
// vi.mock("../../components/JoinGameDialog/JoinGameDialog", () => ({
//   default: vi.fn(({ onClose, partidaId }) => (
//     <div data-testid="join-dialog">
//       Dialog abierto, partidaId: {partidaId}
//     </div>
//   )),
// }));





