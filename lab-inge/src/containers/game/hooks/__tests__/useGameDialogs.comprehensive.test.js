import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useGameDialogs } from "../useGameDialogs";

describe("useGameDialogs - Comprehensive Coverage", () => {
  let mockWsService;
  let mockHttpService;

  beforeEach(() => {
    mockWsService = {
      on: vi.fn(),
      off: vi.fn(),
    };

    mockHttpService = {
      replenishFromDiscard: vi.fn(),
      exchangeCards: vi.fn(),
    };
  });

  describe("useEffect - playedActionCard management", () => {
    it("establece playedActionCard cuando event_card_played está presente", () => {
      const mockTurnData = {
        event_card_played: { card_id: 1, card_name: "Event1" },
        turn_owner_id: 2,
        turn_state: "None",
      };

      const { result } = renderHook(() =>
        useGameDialogs(mockTurnData, 2, null, mockWsService)
      );

      expect(result.current.playedActionCard).toEqual({
        card_id: 1,
        card_name: "Event1",
      });
    });

    it("limpia playedActionCard cuando event_card_played es null", () => {
      const { result, rerender } = renderHook(
        ({ turnData }) => useGameDialogs(turnData, 2, null, mockWsService),
        {
          initialProps: {
            turnData: {
              event_card_played: { card_id: 1, card_name: "Event1" },
              turn_owner_id: 2,
              turn_state: "Playing",
            },
          },
        }
      );

      expect(result.current.playedActionCard).toEqual({
        card_id: 1,
        card_name: "Event1",
      });

      rerender({
        turnData: {
          event_card_played: null,
          turn_owner_id: 2,
          turn_state: "None",
        },
      });

      expect(result.current.playedActionCard).toBeNull();
    });

    it("limpia playedActionCard cuando no es mi turno y hay una carta jugada", () => {
      const mockPlayedCard = { card_id: 1, card_name: "Event1" };

      const { result, rerender } = renderHook(
        ({ turnData, playedActionCard }) =>
          useGameDialogs(turnData, 2, playedActionCard, mockWsService),
        {
          initialProps: {
            turnData: {
              turn_owner_id: 2,
              turn_state: "None",
            },
            playedActionCard: mockPlayedCard,
          },
        }
      );

      rerender({
        turnData: {
          turn_owner_id: 3, // No es mi turno
          turn_state: "None",
        },
        playedActionCard: mockPlayedCard,
      });

      expect(result.current.playedActionCard).toBeNull();
    });

    it("limpia playedActionCard cuando es mi turno, turn_state es None y no hay event_card_played", () => {
      const { result } = renderHook(() =>
        useGameDialogs(
          {
            turn_owner_id: 2,
            turn_state: "None",
            event_card_played: null,
          },
          2,
          { card_id: 1 },
          mockWsService
        )
      );

      expect(result.current.playedActionCard).toBeNull();
    });
  });

  describe("startDiscardTop5Action", () => {
    it("establece showDiscardDialog a true", () => {
      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      act(() => {
        result.current.startDiscardTop5Action();
      });

      expect(result.current.showDiscardDialog).toBe(true);
    });
  });

  describe("handleReplenishFromDiscard", () => {
    it("no hace nada si card es null", async () => {
      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          null,
          mockHttpService,
          1,
          2,
          vi.fn()
        );
      });

      expect(mockHttpService.replenishFromDiscard).not.toHaveBeenCalled();
    });

    it("no hace nada si gameId es null", async () => {
      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          { card_id: 1 },
          mockHttpService,
          null,
          2,
          vi.fn()
        );
      });

      expect(mockHttpService.replenishFromDiscard).not.toHaveBeenCalled();
    });

    it("no hace nada si myPlayerId es null", async () => {
      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          { card_id: 1 },
          mockHttpService,
          1,
          null,
          vi.fn()
        );
      });

      expect(mockHttpService.replenishFromDiscard).not.toHaveBeenCalled();
    });

    it("llama a replenishFromDiscard y cierra el diálogo exitosamente", async () => {
      mockHttpService.replenishFromDiscard.mockResolvedValue({ success: true });
      const mockFetchGameData = vi.fn().mockResolvedValue({});

      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      // Abrir el diálogo primero
      act(() => {
        result.current.startDiscardTop5Action();
      });

      expect(result.current.showDiscardDialog).toBe(true);

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          { card_id: 99 },
          mockHttpService,
          1,
          2,
          mockFetchGameData
        );
      });

      expect(mockHttpService.replenishFromDiscard).toHaveBeenCalledWith(1, 2, 99);
      expect(mockFetchGameData).toHaveBeenCalled();
      expect(result.current.showDiscardDialog).toBe(false);
      expect(result.current.playedActionCard).toBeNull();
    });

    it("maneja errores al reponer desde descarte", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockHttpService.replenishFromDiscard.mockRejectedValue(
        new Error("Replenish error")
      );
      const mockFetchGameData = vi.fn();

      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      await act(async () => {
        await result.current.handleReplenishFromDiscard(
          { card_id: 99 },
          mockHttpService,
          1,
          2,
          mockFetchGameData
        );
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error al reponer desde descarte:",
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("startCardTrade", () => {
    it("intercambia cartas exitosamente y cierra el diálogo", async () => {
      mockHttpService.exchangeCards.mockResolvedValue({ success: true });
      const mockFetchGameData = vi.fn().mockResolvedValue({});

      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      // Establecer opponentId
      act(() => {
        result.current.setOpponentId(3);
        result.current.setShowTradeDialog(true);
      });

      expect(result.current.opponentId).toBe(3);
      expect(result.current.showTradeDialog).toBe(true);

      await act(async () => {
        await result.current.startCardTrade(
          { card_id: 10 },
          { card_id: 20 },
          mockHttpService,
          1,
          2,
          mockFetchGameData
        );
      });

      expect(mockHttpService.exchangeCards).toHaveBeenCalledWith({
        game_id: 1,
        player1_id: 2,
        player2_id: 3,
        card1_id: 20,
        card2_id: 10,
      });
      expect(mockFetchGameData).toHaveBeenCalled();
      expect(result.current.showTradeDialog).toBe(false);
      expect(result.current.opponentId).toBeNull();
    });

    it("maneja errores al intercambiar cartas", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockHttpService.exchangeCards.mockRejectedValue(new Error("Exchange error"));
      const mockFetchGameData = vi.fn();

      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      act(() => {
        result.current.setOpponentId(3);
      });

      await act(async () => {
        await result.current.startCardTrade(
          { card_id: 10 },
          { card_id: 20 },
          mockHttpService,
          1,
          2,
          mockFetchGameData
        );
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error al intercambiar cartas:",
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("useEffect - hasToReveal WebSocket listener", () => {
    it("registra el listener hasToReveal", () => {
      renderHook(() => useGameDialogs(null, 2, null, mockWsService));

      expect(mockWsService.on).toHaveBeenCalledWith(
        "hasToReveal",
        expect.any(Function)
      );
    });

    it("limpia el listener al desmontar", () => {
      const { unmount } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      unmount();

      expect(mockWsService.off).toHaveBeenCalledWith(
        "hasToReveal",
        expect.any(Function)
      );
    });

    it("retorna 'select-my-not-revealed-secret' cuando el playerId coincide", () => {
      renderHook(() => useGameDialogs(null, 2, null, mockWsService));

      const handler = mockWsService.on.mock.calls.find(
        (call) => call[0] === "hasToReveal"
      )?.[1];

      expect(handler).toBeDefined();

      const result = handler({ playerId: 2 });
      expect(result).toBe("select-my-not-revealed-secret");
    });

    it("retorna null cuando el playerId no coincide", () => {
      renderHook(() => useGameDialogs(null, 2, null, mockWsService));

      const handler = mockWsService.on.mock.calls.find(
        (call) => call[0] === "hasToReveal"
      )?.[1];

      const result = handler({ playerId: 5 });
      expect(result).toBeNull();
    });

    it("no registra listener si wsService es null", () => {
      renderHook(() => useGameDialogs(null, 2, null, null));

      expect(mockWsService.on).not.toHaveBeenCalled();
    });
  });

  describe("useEffect - End game detection", () => {
    it("detecta fin de partida por desgracia social", async () => {
      const { result, rerender } = renderHook(
        ({ turnData }) => useGameDialogs(turnData, 2, null, mockWsService),
        {
          initialProps: {
            turnData: null,
          },
        }
      );

      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      rerender({
        turnData: {
          end_game: {
            end_reason: "all_in_disgrace",
          },
        },
      });

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "Fin de partida: desgracia social detectada"
        );
        expect(result.current.showEndDialog).toBe(true);
        expect(result.current.winnerData).toEqual({
          type: "social_disgrace",
          winners: [],
          regpileCount: 0,
        });
      });

      consoleLogSpy.mockRestore();
    });

    it("detecta fin de partida por asesino revelado", async () => {
      const { result, rerender } = renderHook(
        ({ turnData }) => useGameDialogs(turnData, 2, null, mockWsService),
        {
          initialProps: {
            turnData: null,
          },
        }
      );

      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      rerender({
        turnData: {
          end_game: {
            end_reason: "murder_revealed",
          },
        },
      });

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          "Fin de partida: asesino revelado"
        );
        expect(result.current.showEndDialog).toBe(true);
        expect(result.current.winnerData).toEqual({
          type: "murder_revealed",
          winners: [],
          regpileCount: 0,
        });
      });

      consoleLogSpy.mockRestore();
    });

    it("no hace nada si turnData es null", () => {
      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      expect(result.current.showEndDialog).toBe(false);
      expect(result.current.winnerData).toBeNull();
    });

    it("no hace nada si end_game no tiene reason", () => {
      const { result } = renderHook(() =>
        useGameDialogs(
          {
            end_game: {},
          },
          2,
          null,
          mockWsService
        )
      );

      expect(result.current.showEndDialog).toBe(false);
      expect(result.current.winnerData).toBeNull();
    });

    it("preserva datos previos de winnerData al detectar fin de partida", async () => {
      const { result, rerender } = renderHook(
        ({ turnData }) => useGameDialogs(turnData, 2, null, mockWsService),
        {
          initialProps: {
            turnData: null,
          },
        }
      );

      // Establecer winnerData previo
      act(() => {
        result.current.setWinnerData({
          winners: [{ id: 1, name: "Player1" }],
          regpileCount: 10,
        });
      });

      rerender({
        turnData: {
          end_game: {
            end_reason: "all_in_disgrace",
          },
        },
      });

      await waitFor(() => {
        expect(result.current.winnerData).toEqual({
          type: "social_disgrace",
          winners: [{ id: 1, name: "Player1" }],
          regpileCount: 10,
        });
      });
    });
  });

  describe("State setters", () => {
    it("permite modificar showEndDialog", () => {
      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      expect(result.current.showEndDialog).toBe(false);

      act(() => {
        result.current.setShowEndDialog(true);
      });

      expect(result.current.showEndDialog).toBe(true);
    });

    it("permite modificar winnerData", () => {
      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      const mockWinnerData = {
        winners: [{ id: 1, name: "Winner" }],
        type: "normal",
        regpileCount: 5,
      };

      act(() => {
        result.current.setWinnerData(mockWinnerData);
      });

      expect(result.current.winnerData).toEqual(mockWinnerData);
    });

    it("permite modificar showDiscardDialog", () => {
      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      expect(result.current.showDiscardDialog).toBe(false);

      act(() => {
        result.current.setShowDiscardDialog(true);
      });

      expect(result.current.showDiscardDialog).toBe(true);
    });

    it("permite modificar showTradeDialog", () => {
      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      expect(result.current.showTradeDialog).toBe(false);

      act(() => {
        result.current.setShowTradeDialog(true);
      });

      expect(result.current.showTradeDialog).toBe(true);
    });

    it("permite modificar opponentId", () => {
      const { result } = renderHook(() =>
        useGameDialogs(null, 2, null, mockWsService)
      );

      expect(result.current.opponentId).toBeNull();

      act(() => {
        result.current.setOpponentId(5);
      });

      expect(result.current.opponentId).toBe(5);
    });
  });
});
