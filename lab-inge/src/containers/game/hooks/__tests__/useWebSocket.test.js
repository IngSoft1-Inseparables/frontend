import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWebSocket } from "../useWebSocket";
import { createMockWSService } from "./testUtils";

describe("useWebSocket", () => {
  let mockWsService;
  let mockSetTurnData;
  let mockSetPlayerData;
  let mockSetOrderedPlayers;
  let mockSetWinnerData;
  let mockSetShowEndDialog;
  let mockFetchGameData;
  let mockReorderPlayers;

  beforeEach(() => {
    mockWsService = createMockWSService();
    mockSetTurnData = vi.fn();
    mockSetPlayerData = vi.fn();
    mockSetOrderedPlayers = vi.fn();
    mockSetWinnerData = vi.fn();
    mockSetShowEndDialog = vi.fn();
    mockFetchGameData = vi.fn();
    mockReorderPlayers = vi.fn((players) => players);
    
    console.log = vi.fn();
    console.error = vi.fn();
  });

  it("connects to WebSocket on mount", () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    expect(mockWsService.connect).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("Inicializando conexión WebSocket...");
  });

  it("disconnects WebSocket on unmount", () => {
    const { unmount } = renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    unmount();

    expect(mockWsService.off).toHaveBeenCalledTimes(5); // 5 eventos registrados
    expect(mockWsService.disconnect).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("Limpiando conexión WebSocket...");
  });

  it("registers all WebSocket event handlers on mount", () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    expect(mockWsService.on).toHaveBeenCalledWith("game_public_update", expect.any(Function));
    expect(mockWsService.on).toHaveBeenCalledWith("player_private_update", expect.any(Function));
    expect(mockWsService.on).toHaveBeenCalledWith("connection_status", expect.any(Function));
    expect(mockWsService.on).toHaveBeenCalledWith("reconnecting", expect.any(Function));
    expect(mockWsService.on).toHaveBeenCalledWith("connection_failed", expect.any(Function));
  });

  it("does not connect if gameId or myPlayerId is missing", () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        null,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    expect(mockWsService.connect).not.toHaveBeenCalled();
  });

  it("handles game_public_update event with string payload", async () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "game_public_update"
    )[1];

    const updatedTurnData = {
      turn_owner_id: 3,
      players: [
        { id: 1, name: "Player1" },
        { id: 2, name: "Player2" },
      ],
    };

    handler(JSON.stringify(updatedTurnData));

    await waitFor(() => {
      expect(mockSetTurnData).toHaveBeenCalledWith(updatedTurnData);
      expect(mockReorderPlayers).toHaveBeenCalledWith(updatedTurnData.players, 2);
      expect(mockSetOrderedPlayers).toHaveBeenCalled();
    });
  });

  it("handles game_public_update event with object payload", async () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "game_public_update"
    )[1];

    const updatedTurnData = {
      turn_owner_id: 4,
      players: [{ id: 1 }, { id: 2 }],
    };

    handler(updatedTurnData);

    await waitFor(() => {
      expect(mockSetTurnData).toHaveBeenCalledWith(updatedTurnData);
    });
  });

  it("handles player_private_update event with string payload", async () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "player_private_update"
    )[1];

    const updatedPlayerData = {
      id: 2,
      playerCards: [{ card_id: 5, card_name: "NewCard" }],
    };

    handler(JSON.stringify(updatedPlayerData));

    await waitFor(() => {
      expect(mockSetPlayerData).toHaveBeenCalledWith(updatedPlayerData);
    });
  });

  it("handles player_private_update event with object payload", async () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "player_private_update"
    )[1];

    const updatedPlayerData = {
      id: 2,
      playerCards: [{ card_id: 6, card_name: "AnotherNewCard" }],
    };

    handler(updatedPlayerData);

    await waitFor(() => {
      expect(mockSetPlayerData).toHaveBeenCalledWith(updatedPlayerData);
    });
  });

  it("handles connection_status event and fetches game data when connected", async () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "connection_status"
    )[1];

    handler({ status: "connected" });

    await waitFor(() => {
      expect(mockFetchGameData).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("Estado de conexión: connected");
    });
  });

  it("handles connection_status event with disconnected status", async () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "connection_status"
    )[1];

    handler({ status: "disconnected" });

    await waitFor(() => {
      expect(mockFetchGameData).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith("Estado de conexión: disconnected");
    });
  });

  it("handles reconnecting event", async () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "reconnecting"
    )[1];

    handler({ attempt: 3 });

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("Reconectando... (intento 3)");
    });
  });

  it("handles connection_failed event and shows error", async () => {
    const { result } = renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "connection_failed"
    )[1];

    handler({ attempts: 5 });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Falló la conexión después de 5 intentos");
      expect(result.current.showConnectionError).toBe(true);
    });
  });

  it("handles end_game event with Finished status", async () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "game_public_update"
    )[1];

    const endGameData = {
      end_game: {
        game_status: "Finished",
        winners: ["Player1", "Player2"],
      },
      regpile: { count: 10 },
    };

    handler(endGameData);

    await waitFor(() => {
      expect(mockSetWinnerData).toHaveBeenCalledWith({
        winners: ["Player1", "Player2"],
        regpileCount: 10,
      });
      expect(mockSetShowEndDialog).toHaveBeenCalledWith(true);
      expect(console.log).toHaveBeenCalledWith("Fin de la partida detectado:", endGameData.end_game);
    });
  });

  it("handles end_game event without regpile", async () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "game_public_update"
    )[1];

    const endGameData = {
      end_game: {
        game_status: "Finished",
        winners: ["Player3"],
      },
    };

    handler(endGameData);

    await waitFor(() => {
      expect(mockSetWinnerData).toHaveBeenCalledWith({
        winners: ["Player3"],
        regpileCount: 0,
      });
      expect(mockSetShowEndDialog).toHaveBeenCalledWith(true);
    });
  });

  it("does not show end dialog if game_status is not Finished", async () => {
    renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    const handler = mockWsService.on.mock.calls.find(
      (call) => call[0] === "game_public_update"
    )[1];

    const endGameData = {
      end_game: {
        game_status: "InProgress",
        winners: [],
      },
    };

    handler(endGameData);

    await waitFor(() => {
      expect(mockSetShowEndDialog).not.toHaveBeenCalled();
    });
  });

  it("unregisters all event handlers on unmount", () => {
    const { unmount } = renderHook(() =>
      useWebSocket(
        mockWsService,
        1,
        2,
        mockSetTurnData,
        mockSetPlayerData,
        mockSetOrderedPlayers,
        mockSetWinnerData,
        mockSetShowEndDialog,
        mockFetchGameData,
        mockReorderPlayers
      )
    );

    unmount();

    expect(mockWsService.off).toHaveBeenCalledWith("game_public_update", expect.any(Function));
    expect(mockWsService.off).toHaveBeenCalledWith("player_private_update", expect.any(Function));
    expect(mockWsService.off).toHaveBeenCalledWith("connection_status", expect.any(Function));
    expect(mockWsService.off).toHaveBeenCalledWith("reconnecting", expect.any(Function));
    expect(mockWsService.off).toHaveBeenCalledWith("connection_failed", expect.any(Function));
  });
});
