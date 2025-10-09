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

describe("Game component", () => {
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

  it("renders loading screen first", () => {
    renderGame();
    expect(screen.getByText("Cargando jugadores...")).toBeInTheDocument();
  });

  it("calls HTTP services with correct parameters", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame({ gameId: 10, myPlayerId: 99 });

    await waitFor(() => {
      expect(mockHttp.getPublicTurnData).toHaveBeenCalledWith(10);
      expect(mockHttp.getPrivatePlayerData).toHaveBeenCalledWith(10, 99);
    });
  });

  it("renders players after data load", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();

    await waitFor(() => {
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
      expect(screen.getByText("Jugador2")).toBeInTheDocument();
      expect(screen.getByText("Jugador3")).toBeInTheDocument();
      expect(screen.getByText("Jugador4")).toBeInTheDocument();
    });
  });

  it("shows game background after loading", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();

    await waitFor(() => {
      const bg = document.querySelector('[style*="game_bg.png"]');
      expect(bg).not.toBeNull();
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
  });

  it("connects and disconnects WSService correctly", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    const { unmount } = renderGame();

    await waitFor(() => expect(mockWS.connect).toHaveBeenCalled());

    unmount();

    expect(mockWS.off).toHaveBeenCalledTimes(4); // Se desuscribe de ambos eventos
    expect(mockWS.disconnect).toHaveBeenCalled(2);
  });

  it("handles missing navigation state", async () => {
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
