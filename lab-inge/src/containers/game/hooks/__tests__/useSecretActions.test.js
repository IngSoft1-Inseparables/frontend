import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useSecretActions } from "../useSecretActions";
import { createMockHttpService } from "./testUtils";

describe("useSecretActions Hook", () => {
  let mockHttpService;
  let mockFetchGameData;
  const gameId = 1;
  const myPlayerId = 2;

  beforeEach(() => {
    mockHttpService = createMockHttpService();
    mockFetchGameData = vi.fn().mockResolvedValue({});
    console.error = vi.fn();
    console.log = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with null values", () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      expect(result.current.selectedPlayer).toBeNull();
      expect(result.current.selectedSecret).toBeNull();
      expect(result.current.selectionAction).toBeNull();
      expect(result.current.selectionMode).toBeNull();
      expect(result.current.stolenPlayer).toBeNull();
      expect(result.current.fromPlayer).toBeNull();
      expect(result.current.prevData).toBeNull();
    });
  });

  describe("Player Selection", () => {
    it("should update selectedPlayer when handlePlayerSelection is called", () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      act(() => {
        result.current.handlePlayerSelection(3);
      });

      expect(result.current.selectedPlayer).toBe(3);
    });

    it("should update both player and secret when handleSecretSelection is called", () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      act(() => {
        result.current.handleSecretSelection(3, 101);
      });

      expect(result.current.selectedPlayer).toBe(3);
      expect(result.current.selectedSecret).toBe(101);
    });
  });

  describe("Reveal Secret Actions", () => {
    it("should call revealSecret API for own secret", async () => {
      mockHttpService.revealSecret.mockResolvedValue({});

      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.revealMySecret(101);
      });

      expect(mockHttpService.revealSecret).toHaveBeenCalledWith({
        gameId,
        playerId: myPlayerId,
        secretId: 101,
      });
      expect(mockFetchGameData).toHaveBeenCalled();
    });

    it("should call revealSecret API for other player's secret", async () => {
      mockHttpService.revealSecret.mockResolvedValue({});

      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.revealOtherPlayerSecret(3, 102);
      });

      expect(mockHttpService.revealSecret).toHaveBeenCalledWith({
        gameId,
        playerId: 3,
        secretId: 102,
      });
      expect(mockFetchGameData).toHaveBeenCalled();
    });

    it("should handle reveal secret errors gracefully", async () => {
      const error = new Error("Reveal failed");
      mockHttpService.revealSecret.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.revealMySecret(101);
      });

      expect(console.log).toHaveBeenCalledWith(
        "error al revelar secreto propio:",
        error
      );
    });
  });

  describe("Hide Secret Actions", () => {
    it("should call hideSecret API for own secret", async () => {
      mockHttpService.hideSecret.mockResolvedValue({});

      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.hideMySecret(101);
      });

      expect(mockHttpService.hideSecret).toHaveBeenCalledWith({
        gameId,
        playerId: myPlayerId,
        secretId: 101,
      });
      expect(mockFetchGameData).toHaveBeenCalled();
    });

    it("should call hideSecret API for other player's secret", async () => {
      mockHttpService.hideSecret.mockResolvedValue({});

      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.hideOtherPlayerSecret(3, 102);
      });

      expect(mockHttpService.hideSecret).toHaveBeenCalledWith({
        gameId,
        playerId: 3,
        secretId: 102,
      });
      expect(mockFetchGameData).toHaveBeenCalled();
    });
  });

  describe("Force Reveal Secret", () => {
    it("should call forcePlayerReveal API", async () => {
      mockHttpService.forcePlayerReveal.mockResolvedValue({});

      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.forcePlayerRevealSecret(3);
      });

      expect(mockHttpService.forcePlayerReveal).toHaveBeenCalledWith({
        gameId,
        playerId: 3,
      });
    });

    it("should clear selectedPlayer after force reveal", async () => {
      mockHttpService.forcePlayerReveal.mockResolvedValue({});

      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      act(() => {
        result.current.setSelectedPlayer(3);
      });

      await act(async () => {
        await result.current.forcePlayerRevealSecret(3);
      });

      expect(result.current.selectedPlayer).toBeNull();
    });
  });

  describe("Steal Secret", () => {
    it("should set stolenPlayer and call forcePlayerReveal", async () => {
      mockHttpService.forcePlayerReveal.mockResolvedValue({});

      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      act(() => {
        result.current.setSelectedPlayer(3);
      });

      await act(async () => {
        await result.current.handleStealSecret();
      });

      expect(result.current.stolenPlayer).toBe(3);
      expect(mockHttpService.forcePlayerReveal).toHaveBeenCalledWith({
        gameId,
        playerId: 3,
      });
    });

    it("should not steal if no player is selected", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.handleStealSecret();
      });

      expect(mockHttpService.forcePlayerReveal).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "❌ No hay jugador seleccionado para robar secreto"
      );
    });
  });

  describe("Steal Secret Event", () => {
    it("should set fromPlayer and change selection mode", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      act(() => {
        result.current.setSelectedPlayer(3);
        result.current.setSelectedSecret(101);
      });

      await act(async () => {
        await result.current.handleStealSecretEvent(101);
      });

      expect(result.current.fromPlayer).toBe(3);
      expect(result.current.selectedPlayer).toBeNull();
      expect(result.current.selectionMode).toBe("select-player");
    });

    it("should not proceed if no secret or player selected", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.handleStealSecretEvent(null);
      });

      expect(result.current.fromPlayer).toBeNull();
      expect(console.log).toHaveBeenCalledWith("No hay secreto seleccionado");
    });
  });

  describe("State Setters", () => {
    it("should expose all setter functions", () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      expect(typeof result.current.setSelectedPlayer).toBe("function");
      expect(typeof result.current.setSelectedSecret).toBe("function");
      expect(typeof result.current.setSelectionAction).toBe("function");
      expect(typeof result.current.setSelectionMode).toBe("function");
      expect(typeof result.current.setStolenPlayer).toBe("function");
      expect(typeof result.current.setFromPlayer).toBe("function");
      expect(typeof result.current.setPrevData).toBe("function");
    });
  });
});
