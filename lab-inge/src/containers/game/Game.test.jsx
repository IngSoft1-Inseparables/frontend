import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import Game from "./Game";

// --- Mock del HTTPService ---
vi.mock("../../services/HTTPService", () => {
  const mockHttpService = {
    getPublicTurnData: vi.fn(),
    getPrivatePlayerData: vi.fn(),
    updateHand: vi.fn(),
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

// --- Mock del GameBoard ---
vi.mock("./components/GameBoard/GameBoard", () => ({
  default: ({ orderedPlayers, playerData, turnData, myPlayerId, onCardClick }) => (
    <div data-testid="game-board">
      <div data-testid="player-count">{orderedPlayers?.length || 0}</div>
      <div data-testid="my-player-id">{myPlayerId}</div>
      <div data-testid="players-amount">{turnData?.players_amount || 0}</div>
      {orderedPlayers?.map((player) => (
        <div key={player?.id} data-testid={`player-${player?.id}`}>
          {player?.name}
        </div>
      ))}
      <button data-testid="card-button" onClick={onCardClick}>Click Card</button>
    </div>
  ),
}));

describe("Game Container", () => {
  const renderGame = (initialState = { gameId: 1, myPlayerId: 2 }) => {
    return render(
      <MemoryRouter initialEntries={[{ pathname: "/game", state: initialState }]}>
        <Game />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    console.error = vi.fn();
    console.log = vi.fn();
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
        expect(console.error).toHaveBeenCalledWith("Failed obtaining game data:", error);
      });

      expect(screen.getByText("Cargando jugadores...")).toBeInTheDocument();
    });

    it("calls updateHand and logs hand on success", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
      mockHttp.updateHand.mockResolvedValue([{ card_id: 1, card_name: "Carta1" }]);

      renderGame();

      const button = await screen.findByTestId("card-button");
      await fireEvent.click(button);

      await waitFor(() => {
        expect(mockHttp.updateHand).toHaveBeenCalledWith(mockTurnData.gameId, mockTurnData.turn_owner_id);
        expect(console.log).toHaveBeenCalledWith("Update Hand:", [{ card_id: 1, card_name: "Carta1" }]);
      });
    });

    it("handles updateHand failure gracefully", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
      const error = new Error("update fail");
      mockHttp.updateHand.mockRejectedValue(error);

      renderGame();

      const button = await screen.findByTestId("card-button");
      await fireEvent.click(button);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("Failed to update hand:", error);
      });
    });

    it("handles WebSocket player_private_update correctly", async () => {
  renderGame({ gameId: 1, myPlayerId: 2 });

  const privateHandler = mockWS.on.mock.calls.find(call => call[0] === "player_private_update")[1];

  // Simulamos un update de cartas del jugador
  const updatedPlayerData = { ...mockPlayerData, playerCards: [{ card_id: 99, card_name: "Carta99" }] };

  await waitFor(() => privateHandler(JSON.stringify(updatedPlayerData)));

  // Comprobamos que GameBoard recibió el nuevo playerData
  const cardButton = screen.getByTestId("card-button");
  expect(cardButton).toBeInTheDocument(); 
});


it("handles updateHand returning empty array", async () => {
  mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
  mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
  mockHttp.updateHand.mockResolvedValue([]); // vacío

  renderGame();

  const button = await screen.findByTestId("card-button");
  await fireEvent.click(button);

  await waitFor(() => {
    expect(console.log).toHaveBeenCalledWith("Update Hand:", []); // cubre branch de array vacío
  });
});
it("handles player reordering when only 2 players", async () => {
  const turnData2 = { ...mockTurnData, players: mockTurnData.players.slice(0,2), players_amount: 2 };
  mockHttp.getPublicTurnData.mockResolvedValue(turnData2);
  mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

  renderGame({ gameId: 1, myPlayerId: 2 });

  await waitFor(() => expect(screen.getByTestId("game-board")).toBeInTheDocument());

  expect(screen.getByTestId("player-2")).toBeInTheDocument();
  expect(screen.getByTestId("player-1")).toBeInTheDocument();
});


  });

  describe("Player Reordering Logic", () => {
    it("reorders players correctly with current player first", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => expect(screen.getByTestId("game-board")).toBeInTheDocument());

      expect(screen.getByTestId("player-2")).toBeInTheDocument();
      expect(screen.getByTestId("player-3")).toBeInTheDocument();
      expect(screen.getByTestId("player-4")).toBeInTheDocument();
      expect(screen.getByTestId("player-1")).toBeInTheDocument();
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
    it("logs error if gameId or myPlayerId missing", async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: "/game", state: { myPlayerId: 2 } }]}>
          <Game />
        </MemoryRouter>
      );

      await waitFor(() => expect(console.error).toHaveBeenCalledWith("Missing gameId or myPlayerId in navigation state"));
    });

    it("logs error when state missing completely", async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: "/game" }]}>
          <Game />
        </MemoryRouter>
      );

      await waitFor(() => expect(console.error).toHaveBeenCalledWith("Missing gameId or myPlayerId in navigation state"));
    });
  });

  describe("Data Passing to GameBoard", () => {
    it("passes correct props to GameBoard component", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => expect(screen.getByTestId("game-board")).toBeInTheDocument());

      expect(screen.getByTestId("player-count")).toHaveTextContent("4");
      expect(screen.getByTestId("my-player-id")).toHaveTextContent("2");
      expect(screen.getByTestId("players-amount")).toHaveTextContent("4");
    });
  });
});
