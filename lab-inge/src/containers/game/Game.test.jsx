import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import Game from "./Game";

// --- Mock del HTTPService ---
vi.mock("../../services/HTTPService", () => {
  const mockHttpService = {
    getPublicTurnData: vi.fn(),
    getPrivatePlayerData: vi.fn(),
  };

  return {
    createHttpService: vi.fn(() => mockHttpService),
    __mockHttp: mockHttpService,
  };
});
import { __mockHttp as mockHttp } from "../../services/HTTPService";

// --- Mock del WSService ---
vi.mock("../../services/WSService", () => {
  const mockWSService = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
  };

  return {
    createWSService: vi.fn(() => mockWSService),
    __mockWS: mockWSService,
  };
});
import { __mockWS as mockWS } from "../../services/WSService";

// --- Mock del GameBoard (componente presentacional) ---
vi.mock("./components/GameBoard/GameBoard", () => ({
  default: ({ orderedPlayers, playerData, turnData, myPlayerId }) => (
    <div data-testid="game-board">
      <div data-testid="player-count">{orderedPlayers?.length || 0}</div>
      <div data-testid="my-player-id">{myPlayerId}</div>
      <div data-testid="players-amount">{turnData?.players_amount || 0}</div>
      {orderedPlayers?.map((player) => (
        <div key={player?.id} data-testid={`player-${player?.id}`}>
          {player?.name}
        </div>
      ))}
    </div>
  ),
}));

describe("Game Container", () => {
  const renderGame = (initialState = { gameId: 1, myPlayerId: 2 }) => {
    return render(
      <MemoryRouter
        initialEntries={[{ pathname: "/game", state: initialState }]}
      >
        <Game />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockTurnData = {
    players_amount: 4,
    turn_owner_id: 2,
    players: [
      { id: 1, name: "Jugador1", avatar: "avatars/avatar1.png", turn: 1, playerSecrets: [{}, {}, {}] },
      { id: 2, name: "Jugador2", avatar: "avatars/avatar2.png", turn: 2, playerSecrets: [{}, {}, {}] },
      { id: 3, name: "Jugador3", avatar: "avatars/avatar3.png", turn: 3, playerSecrets: [{}, {}, {}] },
      { id: 4, name: "Jugador4", avatar: "avatars/avatar4.png", turn: 4, playerSecrets: [{}, {}, {}] },
    ],
  };

  const mockPlayerData = {
    id: 2,
    name: "Jugador2",
    avatar: "avatars/avatar2.png",
    playerSecrets: [{}, {}, {}],
    playerCards: [
      { card_id: 1, card_name: "Carta1" },
      { card_id: 2, card_name: "Carta2" },
      { card_id: 3, card_name: "Carta3" },
    ],
  };

  describe("Loading State", () => {
    it("renders loading screen initially", () => {
      renderGame();
      expect(screen.getByText("Cargando jugadores...")).toBeInTheDocument();
    });
  });

  describe("HTTP Service Integration", () => {
    it("calls HTTP services with correct parameters", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 10, myPlayerId: 99 });

      await waitFor(() => {
        expect(mockHttp.getPublicTurnData).toHaveBeenCalledWith(10);
        expect(mockHttp.getPrivatePlayerData).toHaveBeenCalledWith(10, 99);
      });
    });

    it("handles API errors gracefully", async () => {
      const error = new Error("network fail");
      mockHttp.getPublicTurnData.mockRejectedValue(error);

      renderGame();

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Failed obtaining game data:",
          error
        );
      });

      // Debe seguir mostrando loading en caso de error
      expect(screen.getByText("Cargando jugadores...")).toBeInTheDocument();
    });
  });

  describe("Player Reordering Logic", () => {
    it("reorders players correctly with current player first", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });

      // Verificar que los jugadores están en el orden correcto
      // Jugador 2 (yo) primero, luego 3, 4, 1
      expect(screen.getByTestId("player-2")).toBeInTheDocument();
      expect(screen.getByTestId("player-3")).toBeInTheDocument();
      expect(screen.getByTestId("player-4")).toBeInTheDocument();
      expect(screen.getByTestId("player-1")).toBeInTheDocument();
    });

    it("handles different starting player positions", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue({
        ...mockPlayerData,
        id: 4,
        name: "Jugador4",
      });

      renderGame({ gameId: 1, myPlayerId: 4 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });

      // Con jugador 4 como actual, orden debe ser: 4, 1, 2, 3
      expect(screen.getByTestId("player-4")).toBeInTheDocument();
    });
  });

  describe("WebSocket Integration", () => {
    it("connects to WebSocket on mount", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame();

      await waitFor(() => expect(mockWS.connect).toHaveBeenCalled());
    });

    it("disconnects WebSocket on unmount", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { unmount } = renderGame();

      await waitFor(() => expect(mockWS.connect).toHaveBeenCalled());

      unmount();

      expect(mockWS.off).toHaveBeenCalled();
      expect(mockWS.disconnect).toHaveBeenCalled();
    });
  });

  describe("Navigation Validation", () => {
    it("redirects when gameId is missing", async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: "/game", state: { myPlayerId: 2 } }]}>
          <Game />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Missing gameId or myPlayerId in navigation state"
        );
      });
    });

    it("redirects when myPlayerId is missing", async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: "/game", state: { gameId: 1 } }]}>
          <Game />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Missing gameId or myPlayerId in navigation state"
        );
      });
    });

    it("redirects when navigation state is completely missing", async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: "/game" }]}>
          <Game />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Missing gameId or myPlayerId in navigation state"
        );
      });
    });
  });

  describe("Data Passing to GameBoard", () => {
    it("passes correct props to GameBoard component", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });

      // Verificar que pasa el número correcto de jugadores
      expect(screen.getByTestId("player-count")).toHaveTextContent("4");
      
      // Verificar que pasa el myPlayerId
      expect(screen.getByTestId("my-player-id")).toHaveTextContent("2");
      
      // Verificar que pasa players_amount
      expect(screen.getByTestId("players-amount")).toHaveTextContent("4");
    });
  });
});
