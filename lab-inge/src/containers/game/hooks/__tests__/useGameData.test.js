import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useGameData } from "../useGameData";
import { createMockHttpService, mockTurnData, mockPlayerData } from "./testUtils";

describe("useGameData Hook", () => {
  let mockHttpService;

  beforeEach(() => {
    mockHttpService = createMockHttpService();
    console.error = vi.fn();
    console.log = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with loading state", () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.hasLoadedOnce).toBe(false);
      expect(result.current.turnData).toBeNull();
      expect(result.current.playerData).toBeNull();
      expect(result.current.orderedPlayers).toEqual([]);
    });

    it("should fetch game data on mount", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderHook(() => useGameData(mockHttpService, 1, 2));

      await waitFor(() => {
        expect(mockHttpService.getPublicTurnData).toHaveBeenCalledWith(1);
        expect(mockHttpService.getPrivatePlayerData).toHaveBeenCalledWith(1, 2);
      });
    });
  });

  describe("Data Loading", () => {
    it("should set turnData and playerData after successful fetch", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.turnData).toEqual(mockTurnData);
      expect(result.current.playerData).toEqual(mockPlayerData);
    });
  });

  describe("Player Reordering", () => {
    it("should reorder players with current player first", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const orderedPlayers = result.current.orderedPlayers;
      expect(orderedPlayers[0].id).toBe(2); // Current player first
      expect(orderedPlayers[1].id).toBe(3);
      expect(orderedPlayers[2].id).toBe(4);
      expect(orderedPlayers[3].id).toBe(1);
    });

    it("should handle reordering with only 2 players", async () => {
      const twoPlayerData = {
        ...mockTurnData,
        players: [
          { id: 1, name: "Player1", turn: 1, playerSecrets: [] },
          { id: 2, name: "Player2", turn: 2, playerSecrets: [] },
        ],
      };

      mockHttpService.getPublicTurnData.mockResolvedValue(twoPlayerData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const orderedPlayers = result.current.orderedPlayers;
      expect(orderedPlayers).toHaveLength(2);
      expect(orderedPlayers[0].id).toBe(2);
      expect(orderedPlayers[1].id).toBe(1);
    });

    it("should return sorted array if player not found", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 999) // Player ID doesn't exist
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const orderedPlayers = result.current.orderedPlayers;
      expect(orderedPlayers[0].id).toBe(1); // Just sorted by turn
      expect(orderedPlayers[1].id).toBe(2);
    });
  });

  describe("fetchGameData", () => {
    it("should refetch data when called manually", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear previous calls
      mockHttpService.getPublicTurnData.mockClear();
      mockHttpService.getPrivatePlayerData.mockClear();

      // Call fetchGameData manually
      await result.current.fetchGameData();

      expect(mockHttpService.getPublicTurnData).toHaveBeenCalledTimes(1);
      expect(mockHttpService.getPrivatePlayerData).toHaveBeenCalledTimes(1);
    });

    it("should return both turnData and playerData", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const data = await result.current.fetchGameData();

      expect(data).toEqual({
        turnData: mockTurnData,
        playerData: mockPlayerData,
      });
    });
  });

  describe("State Setters", () => {
    it("should expose setTurnData", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.setTurnData).toBeDefined();
      expect(typeof result.current.setTurnData).toBe("function");
    });

    it("should expose setPlayerData", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.setPlayerData).toBeDefined();
      expect(typeof result.current.setPlayerData).toBe("function");
    });
  });

  describe("hasLoadedOnce flag", () => {
    it("should set hasLoadedOnce to true after first successful fetch", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      // Initially false
      expect(result.current.hasLoadedOnce).toBe(false);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // After successful fetch, should be true
      expect(result.current.hasLoadedOnce).toBe(true);
    });

    it("should keep hasLoadedOnce true after manual refetch", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasLoadedOnce).toBe(true);

      // Call fetchGameData manually (simulating WebSocket reconnection)
      await result.current.fetchGameData();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // hasLoadedOnce should still be true
      expect(result.current.hasLoadedOnce).toBe(true);
    });

    it("should temporarily set isLoading to true during refetch but keep hasLoadedOnce true", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.hasLoadedOnce).toBe(true);
      });

      // Mock a delayed response to capture isLoading state during fetch
      mockHttpService.getPublicTurnData.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockTurnData), 100))
      );
      mockHttpService.getPrivatePlayerData.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPlayerData), 100))
      );

      // Trigger refetch
      const fetchPromise = result.current.fetchGameData();

      // During fetch, isLoading should be true but hasLoadedOnce remains true
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
      expect(result.current.hasLoadedOnce).toBe(true);

      // Wait for fetch to complete
      await fetchPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // After refetch, both should be correct
      expect(result.current.hasLoadedOnce).toBe(true);
    });

    it("should set hasLoadedOnce to true even after multiple refetches", async () => {
      mockHttpService.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttpService.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { result } = renderHook(() =>
        useGameData(mockHttpService, 1, 2)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.hasLoadedOnce).toBe(true);
      });

      // Call fetchGameData multiple times
      await result.current.fetchGameData();
      expect(result.current.hasLoadedOnce).toBe(true);

      await result.current.fetchGameData();
      expect(result.current.hasLoadedOnce).toBe(true);

      // hasLoadedOnce should remain true throughout
      expect(result.current.hasLoadedOnce).toBe(true);
    });
  });
});
