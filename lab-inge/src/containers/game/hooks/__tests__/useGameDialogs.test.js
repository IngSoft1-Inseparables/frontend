import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGameDialogs } from "../useGameDialogs";
import { createMockHttpService, createMockWSService, mockTurnData } from "./testUtils";

describe("useGameDialogs", () => {
  let mockWsService;
  let turnData;
  let myPlayerId;

  beforeEach(() => {
    mockWsService = createMockWSService();
    turnData = { ...mockTurnData };
    myPlayerId = 2;
    
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe("Dialog States", () => {
    it("initializes with showEndDialog as false", () => {
      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      expect(result.current.showEndDialog).toBe(false);
    });

    it("initializes with showDiscardDialog as false", () => {
      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      expect(result.current.showDiscardDialog).toBe(false);
    });

    it("initializes with winnerData as null", () => {
      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      expect(result.current.winnerData).toBe(null);
    });

    it("initializes with playedActionCard as null", () => {
      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      expect(result.current.playedActionCard).toBe(null);
    });
  });

  describe("playedActionCard State Management", () => {
    it("sets playedActionCard when turnData has event_card_played", async () => {
      const turnDataWithCard = {
        ...turnData,
        event_card_played: "TestEventCard",
      };

      const { result } = renderHook(() =>
        useGameDialogs(turnDataWithCard, myPlayerId, null, mockWsService)
      );

      await waitFor(() => {
        expect(result.current.playedActionCard).toBe("TestEventCard");
      });
    });

    it("clears playedActionCard when event_card_played is null", async () => {
      const { result, rerender } = renderHook(
        ({ td }) => useGameDialogs(td, myPlayerId, null, mockWsService),
        {
          initialProps: { td: { ...turnData, event_card_played: "TestCard" } },
        }
      );

      await waitFor(() => {
        expect(result.current.playedActionCard).toBe("TestCard");
      });

      // Ahora quitamos el event_card_played
      rerender({ td: { ...turnData, event_card_played: null } });

      await waitFor(() => {
        expect(result.current.playedActionCard).toBe(null);
      });
    });

    it("clears playedActionCard when turn_owner changes and was not my turn", async () => {
      const notMyTurn = {
        ...turnData,
        turn_owner_id: 3,
      };

      const { result } = renderHook(() =>
        useGameDialogs(notMyTurn, myPlayerId, "SomeCard", mockWsService)
      );

      await waitFor(() => {
        expect(result.current.playedActionCard).toBe(null);
      });
    });

    it("clears playedActionCard when my turn starts with turn_state None and no event_card_played", async () => {
      const myTurnNone = {
        ...turnData,
        turn_owner_id: myPlayerId,
        turn_state: "None",
        event_card_played: null,
      };

      const { result } = renderHook(() =>
        useGameDialogs(myTurnNone, myPlayerId, "PreviousCard", mockWsService)
      );

      await waitFor(() => {
        expect(result.current.playedActionCard).toBe(null);
      });
    });
  });

  describe("startDiscardTop5Action", () => {
    it("activates discard dialog when called", () => {
      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      expect(result.current.showDiscardDialog).toBe(false);

      act(() => {
        result.current.startDiscardTop5Action();
      });

      expect(result.current.showDiscardDialog).toBe(true);
    });
  });

  describe("handleReplenishFromDiscard", () => {
    it("calls replenishFromDiscard with correct parameters", async () => {
      const mockHttpService = createMockHttpService();
      mockHttpService.replenishFromDiscard.mockResolvedValue({ success: true });
      const mockFetchGameData = vi.fn();

      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      const card = { card_id: 99, card_name: "TestCard" };
      const gameId = 1;

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          card,
          mockHttpService,
          gameId,
          myPlayerId,
          mockFetchGameData
        );
      });

      expect(mockHttpService.replenishFromDiscard).toHaveBeenCalledWith(gameId, myPlayerId, 99);
      expect(console.log).toHaveBeenCalledWith(card);
      expect(console.log).toHaveBeenCalledWith("Replenish desde descarte:", { success: true });
    });

    it("fetches game data after successful replenish", async () => {
      const mockHttpService = createMockHttpService();
      mockHttpService.replenishFromDiscard.mockResolvedValue({ success: true });
      const mockFetchGameData = vi.fn();

      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      const card = { card_id: 99 };

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          card,
          mockHttpService,
          1,
          myPlayerId,
          mockFetchGameData
        );
      });

      expect(mockFetchGameData).toHaveBeenCalled();
    });

    it("closes discard dialog after successful replenish", async () => {
      const mockHttpService = createMockHttpService();
      mockHttpService.replenishFromDiscard.mockResolvedValue({ success: true });
      const mockFetchGameData = vi.fn();

      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      // Primero abrir el diálogo
      act(() => {
        result.current.startDiscardTop5Action();
      });

      expect(result.current.showDiscardDialog).toBe(true);

      // Ahora reponer carta
      const card = { card_id: 99 };

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          card,
          mockHttpService,
          1,
          myPlayerId,
          mockFetchGameData
        );
      });

      expect(result.current.showDiscardDialog).toBe(false);
    });

    it("clears playedActionCard after successful replenish", async () => {
      const mockHttpService = createMockHttpService();
      mockHttpService.replenishFromDiscard.mockResolvedValue({ success: true });
      const mockFetchGameData = vi.fn();

      const turnDataWithCard = {
        ...turnData,
        event_card_played: "LookIntoTheAshes",
      };

      const { result } = renderHook(() =>
        useGameDialogs(turnDataWithCard, myPlayerId, null, mockWsService)
      );

      await waitFor(() => {
        expect(result.current.playedActionCard).toBe("LookIntoTheAshes");
      });

      const card = { card_id: 99 };

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          card,
          mockHttpService,
          1,
          myPlayerId,
          mockFetchGameData
        );
      });

      expect(result.current.playedActionCard).toBe(null);
    });

    it("handles replenishFromDiscard error gracefully", async () => {
      const mockHttpService = createMockHttpService();
      const error = new Error("Replenish failed");
      mockHttpService.replenishFromDiscard.mockRejectedValue(error);
      const mockFetchGameData = vi.fn();

      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      const card = { card_id: 99 };

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          card,
          mockHttpService,
          1,
          myPlayerId,
          mockFetchGameData
        );
      });

      expect(console.error).toHaveBeenCalledWith("Error al reponer desde descarte:", error);
      expect(mockFetchGameData).not.toHaveBeenCalled();
    });

    it("does nothing if card is not provided", async () => {
      const mockHttpService = createMockHttpService();
      const mockFetchGameData = vi.fn();

      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          null,
          mockHttpService,
          1,
          myPlayerId,
          mockFetchGameData
        );
      });

      expect(mockHttpService.replenishFromDiscard).not.toHaveBeenCalled();
    });

    it("does nothing if gameId is not provided", async () => {
      const mockHttpService = createMockHttpService();
      const mockFetchGameData = vi.fn();

      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      const card = { card_id: 99 };

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          card,
          mockHttpService,
          null,
          myPlayerId,
          mockFetchGameData
        );
      });

      expect(mockHttpService.replenishFromDiscard).not.toHaveBeenCalled();
    });

    it("does nothing if myPlayerId is not provided", async () => {
      const mockHttpService = createMockHttpService();
      const mockFetchGameData = vi.fn();

      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      const card = { card_id: 99 };

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          card,
          mockHttpService,
          1,
          null,
          mockFetchGameData
        );
      });

      expect(mockHttpService.replenishFromDiscard).not.toHaveBeenCalled();
    });
  });

  describe("WebSocket hasToReveal Event", () => {
    it("registers hasToReveal event handler on mount", () => {
      renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      expect(mockWsService.on).toHaveBeenCalledWith("hasToReveal", expect.any(Function));
    });

    it("unregisters hasToReveal event handler on unmount", () => {
      const { unmount } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      unmount();

      expect(mockWsService.off).toHaveBeenCalledWith("hasToReveal", expect.any(Function));
    });

    it("returns select-my-not-revealed-secret when playerId matches", () => {
      renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      const handler = mockWsService.on.mock.calls.find(
        (call) => call[0] === "hasToReveal"
      )[1];

      const result = handler({ playerId: myPlayerId });

      expect(result).toBe("select-my-not-revealed-secret");
    });

    it("returns null when playerId does not match", () => {
      renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      const handler = mockWsService.on.mock.calls.find(
        (call) => call[0] === "hasToReveal"
      )[1];

      const result = handler({ playerId: 999 });

      expect(result).toBe(null);
    });
  });

  describe("setWinnerData and setShowEndDialog", () => {
    it("allows setting winner data", () => {
      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      const winnerData = { winners: ["Player1"], regpileCount: 5 };

      act(() => {
        result.current.setWinnerData(winnerData);
      });

      expect(result.current.winnerData).toEqual(winnerData);
    });

    it("allows showing end dialog", () => {
      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      act(() => {
        result.current.setShowEndDialog(true);
      });

      expect(result.current.showEndDialog).toBe(true);
    });

    it("allows hiding end dialog", () => {
      const { result } = renderHook(() =>
        useGameDialogs(turnData, myPlayerId, null, mockWsService)
      );

      act(() => {
        result.current.setShowEndDialog(true);
      });

      expect(result.current.showEndDialog).toBe(true);

      act(() => {
        result.current.setShowEndDialog(false);
      });

      expect(result.current.showEndDialog).toBe(false);
    });
  });
});
