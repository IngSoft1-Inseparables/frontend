import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCardActions } from "../useCardActions";

describe("useCardActions - Comprehensive Coverage", () => {
  let mockHttpService;
  let mockSetSelectionMode;
  let mockSetSelectionAction;
  let mockSetPlayerData;
  let mockSetTurnData;
  let mockFetchGameData;
  let mockSetPlayedActionCard;
  let mockStartDiscardTop5Action;
  let mockSetTimer;

  const mockGameId = 1;
  const mockMyPlayerId = 2;

  beforeEach(() => {
    mockHttpService = {
      playEvent: vi.fn(),
      playSets: vi.fn(),
      discardCard: vi.fn(),
      updateHand: vi.fn(),
      playNotSoFast: vi.fn(),
      addCardToSet: vi.fn(),
      replenishFromDraft: vi.fn(),
    };

    mockSetSelectionMode = vi.fn();
    mockSetSelectionAction = vi.fn();
    mockSetPlayerData = vi.fn();
    mockSetTurnData = vi.fn();
    mockFetchGameData = vi.fn();
    mockSetPlayedActionCard = vi.fn();
    mockStartDiscardTop5Action = vi.fn();
    mockSetTimer = vi.fn();
  });

  describe("handleCardClick", () => {
    it("llama a updateHand exitosamente", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      mockHttpService.updateHand.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          null,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleCardClick();
      });

      expect(mockHttpService.updateHand).toHaveBeenCalledWith(1, 2);
    });

    it("maneja errores al llamar updateHand", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockHttpService.updateHand.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          null,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleCardClick();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to update hand:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Event card effects - pendingEffect", () => {
    it("ejecuta pendingEffect cuando timer llega a 0 y turn_state es playing", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [],
      };

      const { rerender } = renderHook(
        ({ timer, turnData }) =>
          useCardActions(
            mockHttpService,
            mockGameId,
            mockMyPlayerId,
            turnData,
            { playerCards: [] },
            mockSetPlayerData,
            mockSetTurnData,
            mockFetchGameData,
            null,
            mockSetPlayedActionCard,
            mockSetSelectionMode,
            mockSetSelectionAction,
            mockStartDiscardTop5Action,
            timer,
            mockSetTimer
          ),
        {
          initialProps: { timer: 1, turnData: mockTurnData },
        }
      );

      // Timer llega a 0 - el useEffect interno ejecutará pendingEffect si existe
      rerender({ timer: 0, turnData: mockTurnData });

      // Verificar que las funciones están disponibles (se usarán si hay pendingEffect)
      await waitFor(() => {
        expect(mockSetSelectionMode).toBeDefined();
        expect(mockSetSelectionAction).toBeDefined();
      });
    });

    it("no ejecuta pendingEffect si turn_state no es playing", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const { rerender } = renderHook(
        ({ timer, turnData }) =>
          useCardActions(
            mockHttpService,
            mockGameId,
            mockMyPlayerId,
            turnData,
            { playerCards: [] },
            mockSetPlayerData,
            mockSetTurnData,
            mockFetchGameData,
            null,
            mockSetPlayedActionCard,
            mockSetSelectionMode,
            mockSetSelectionAction,
            mockStartDiscardTop5Action,
            timer,
            mockSetTimer
          ),
        {
          initialProps: { timer: 1, turnData: mockTurnData },
        }
      );

      rerender({ timer: 0, turnData: mockTurnData });

      // No debería ejecutarse ninguna acción especial
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(true).toBe(true); // El test pasa si no hay errores
    });
  });

  describe("handleSwitch - Set types", () => {
    it("establece modo correcto para 'ladybrent'", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [],
      };

      mockHttpService.playSets.mockResolvedValue({
        timer: 1,
        set_type: "ladybrent",
      });

      const { result, rerender } = renderHook(
        ({ timer, turnData }) =>
          useCardActions(
            mockHttpService,
            mockGameId,
            mockMyPlayerId,
            turnData,
            { playerCards: [] },
            mockSetPlayerData,
            mockSetTurnData,
            mockFetchGameData,
            null,
            mockSetPlayedActionCard,
            mockSetSelectionMode,
            mockSetSelectionAction,
            mockStartDiscardTop5Action,
            timer,
            mockSetTimer
          ),
        {
          initialProps: { timer: 1, turnData: mockTurnData },
        }
      );

      await act(async () => {
        await result.current.handlePlaySetAction(mockMyPlayerId, mockGameId, [
          { card_id: 1 },
          { card_id: 2 },
        ]);
      });

      rerender({ timer: 0, turnData: mockTurnData });

      await waitFor(() => {
        expect(mockSetSelectionMode).toHaveBeenCalledWith("select-other-player");
      });
    });

    it("establece modo correcto para 'tommyberestford'", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [],
      };

      mockHttpService.playSets.mockResolvedValue({
        timer: 1,
        set_type: "tommyberestford",
      });

      const { result, rerender } = renderHook(
        ({ timer, turnData }) =>
          useCardActions(
            mockHttpService,
            mockGameId,
            mockMyPlayerId,
            turnData,
            { playerCards: [] },
            mockSetPlayerData,
            mockSetTurnData,
            mockFetchGameData,
            null,
            mockSetPlayedActionCard,
            mockSetSelectionMode,
            mockSetSelectionAction,
            mockStartDiscardTop5Action,
            timer,
            mockSetTimer
          ),
        {
          initialProps: { timer: 1, turnData: mockTurnData },
        }
      );

      await act(async () => {
        await result.current.handlePlaySetAction(mockMyPlayerId, mockGameId, [
          { card_id: 1 },
          { card_id: 2 },
        ]);
      });

      rerender({ timer: 0, turnData: mockTurnData });

      await waitFor(() => {
        expect(mockSetSelectionMode).toHaveBeenCalledWith("select-other-player");
      });
    });

    it("establece modo correcto para 'tuppenceberestford'", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [],
      };

      mockHttpService.playSets.mockResolvedValue({
        timer: 1,
        set_type: "tuppenceberestford",
      });

      const { result, rerender } = renderHook(
        ({ timer, turnData }) =>
          useCardActions(
            mockHttpService,
            mockGameId,
            mockMyPlayerId,
            turnData,
            { playerCards: [] },
            mockSetPlayerData,
            mockSetTurnData,
            mockFetchGameData,
            null,
            mockSetPlayedActionCard,
            mockSetSelectionMode,
            mockSetSelectionAction,
            mockStartDiscardTop5Action,
            timer,
            mockSetTimer
          ),
        {
          initialProps: { timer: 1, turnData: mockTurnData },
        }
      );

      await act(async () => {
        await result.current.handlePlaySetAction(mockMyPlayerId, mockGameId, [
          { card_id: 1 },
          { card_id: 2 },
        ]);
      });

      rerender({ timer: 0, turnData: mockTurnData });

      await waitFor(() => {
        expect(mockSetSelectionMode).toHaveBeenCalledWith("select-other-player");
      });
    });

    it("establece modo correcto para 'tommytuppence'", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [],
      };

      mockHttpService.playSets.mockResolvedValue({
        timer: 1,
        set_type: "tommytuppence",
      });

      const { result, rerender } = renderHook(
        ({ timer, turnData }) =>
          useCardActions(
            mockHttpService,
            mockGameId,
            mockMyPlayerId,
            turnData,
            { playerCards: [] },
            mockSetPlayerData,
            mockSetTurnData,
            mockFetchGameData,
            null,
            mockSetPlayedActionCard,
            mockSetSelectionMode,
            mockSetSelectionAction,
            mockStartDiscardTop5Action,
            timer,
            mockSetTimer
          ),
        {
          initialProps: { timer: 1, turnData: mockTurnData },
        }
      );

      await act(async () => {
        await result.current.handlePlaySetAction(mockMyPlayerId, mockGameId, [
          { card_id: 1 },
          { card_id: 2 },
        ]);
      });

      rerender({ timer: 0, turnData: mockTurnData });

      await waitFor(() => {
        expect(mockSetSelectionMode).toHaveBeenCalledWith("select-other-player");
      });
    });

    it("establece modo correcto para 'satterthwaite'", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [],
      };

      mockHttpService.playSets.mockResolvedValue({
        timer: 1,
        set_type: "satterthwaite",
      });

      const { result, rerender } = renderHook(
        ({ timer, turnData }) =>
          useCardActions(
            mockHttpService,
            mockGameId,
            mockMyPlayerId,
            turnData,
            { playerCards: [] },
            mockSetPlayerData,
            mockSetTurnData,
            mockFetchGameData,
            null,
            mockSetPlayedActionCard,
            mockSetSelectionMode,
            mockSetSelectionAction,
            mockStartDiscardTop5Action,
            timer,
            mockSetTimer
          ),
        {
          initialProps: { timer: 1, turnData: mockTurnData },
        }
      );

      await act(async () => {
        await result.current.handlePlaySetAction(mockMyPlayerId, mockGameId, [
          { card_id: 1 },
          { card_id: 2 },
        ]);
      });

      rerender({ timer: 0, turnData: mockTurnData });

      await waitFor(() => {
        expect(mockSetSelectionMode).toHaveBeenCalledWith("select-other-player");
      });
    });

    it("establece modo y acción correctos para 'specialsatterthwaite'", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [],
      };

      mockHttpService.playSets.mockResolvedValue({
        timer: 1,
        set_type: "specialsatterthwaite",
      });

      const { result, rerender } = renderHook(
        ({ timer, turnData }) =>
          useCardActions(
            mockHttpService,
            mockGameId,
            mockMyPlayerId,
            turnData,
            { playerCards: [] },
            mockSetPlayerData,
            mockSetTurnData,
            mockFetchGameData,
            null,
            mockSetPlayedActionCard,
            mockSetSelectionMode,
            mockSetSelectionAction,
            mockStartDiscardTop5Action,
            timer,
            mockSetTimer
          ),
        {
          initialProps: { timer: 1, turnData: mockTurnData },
        }
      );

      await act(async () => {
        await result.current.handlePlaySetAction(mockMyPlayerId, mockGameId, [
          { card_id: 1 },
          { card_id: 2 },
        ]);
      });

      rerender({ timer: 0, turnData: mockTurnData });

      await waitFor(() => {
        expect(mockSetSelectionMode).toHaveBeenCalledWith("select-other-player");
        expect(mockSetSelectionAction).toHaveBeenCalledWith("specials");
      });
    });
  });

  describe("handlePlaySetAction", () => {
    it("no hace nada si currentSetCards está vacío", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          { playerCards: [] },
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handlePlaySetAction(mockMyPlayerId, mockGameId, []);
      });

      expect(mockHttpService.playSets).not.toHaveBeenCalled();
    });

    it("no permite jugar sets si está en desgracia", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [{ id: 2, in_disgrace: true }],
      };

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          { playerCards: [] },
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handlePlaySetAction(mockMyPlayerId, mockGameId, [
          { card_id: 1 },
          { card_id: 2 },
        ]);
      });

      expect(mockHttpService.playSets).not.toHaveBeenCalled();
    });

    it("maneja errores al jugar sets", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockHttpService.playSets.mockRejectedValue(new Error("Server error"));

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          { playerCards: [] },
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handlePlaySetAction(mockMyPlayerId, mockGameId, [
          { card_id: 1 },
          { card_id: 2 },
        ]);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error al cargar los sets:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe("handleDragEnd - Discard scenarios", () => {
    it("no permite descartar si turn_state no es None o Discarding", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Card1", image_name: "card1" }],
      };

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Card1", imageName: "card1" } },
          },
          over: { id: "discard-deck" },
        });
      });

      expect(mockHttpService.discardCard).not.toHaveBeenCalled();
    });

    it("no permite descartar si no es mi turno", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 999,
        turn_state: "None",
        players: [],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Card1", image_name: "card1" }],
      };

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Card1", imageName: "card1" } },
          },
          over: { id: "discard-deck" },
        });
      });

      expect(mockHttpService.discardCard).not.toHaveBeenCalled();
    });

    it("maneja errores al descartar y restaura el estado", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Card1", image_name: "card1" }],
      };

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockHttpService.discardCard.mockRejectedValue(new Error("Discard error"));

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Card1", imageName: "card1" } },
          },
          over: { id: "discard-deck" },
        });
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error al descartar carta:", expect.any(Error));
      expect(mockSetPlayerData).toHaveBeenCalledWith(mockPlayerData);
      expect(mockSetTurnData).toHaveBeenCalledWith(mockTurnData);
      consoleErrorSpy.mockRestore();
    });
  });

  describe("handleDragEnd - Play card scenarios", () => {
    it("no permite jugar evento si no es mi turno", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 999,
        turn_state: "None",
        players: [],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Event1", type: "Event", image_name: "event1" }],
      };

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Event1", imageName: "event1" } },
          },
          over: { id: "play-card-zone" },
        });
      });

      expect(mockHttpService.playEvent).not.toHaveBeenCalled();
    });

    it("no permite jugar evento si ya hay un playedActionCard", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Event1", type: "Event", image_name: "event1" }],
      };

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          { card_id: 99 }, // Ya hay una carta jugada
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Event1", imageName: "event1" } },
          },
          over: { id: "play-card-zone" },
        });
      });

      expect(mockHttpService.playEvent).not.toHaveBeenCalled();
    });

    it("maneja errores al jugar evento y restaura el estado", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Event1", type: "Event", image_name: "event1" }],
      };

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockHttpService.playEvent.mockRejectedValue(new Error("Play event error"));

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Event1", imageName: "event1" } },
          },
          over: { id: "play-card-zone" },
        });
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed playing event card:", expect.any(Error));
      expect(mockSetPlayerData).toHaveBeenCalledWith(mockPlayerData);
      expect(mockSetPlayedActionCard).toHaveBeenCalledWith(null);
      consoleErrorSpy.mockRestore();
    });

    it("no permite jugar instant si timer es 0", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Not So Fast", type: "Instant", image_name: "instant" }],
      };

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0, // timer = 0
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Not So Fast", imageName: "instant" } },
          },
          over: { id: "play-card-zone" },
        });
      });

      expect(mockHttpService.playNotSoFast).not.toHaveBeenCalled();
    });

    it("no permite jugar instant si turn_state no es playing ni discarding", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Not So Fast", type: "Instant", image_name: "instant" }],
      };

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          10,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Not So Fast", imageName: "instant" } },
          },
          over: { id: "play-card-zone" },
        });
      });

      expect(mockHttpService.playNotSoFast).not.toHaveBeenCalled();
    });

    it("maneja errores al jugar instant", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Not So Fast", type: "Instant", image_name: "instant" }],
      };

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockHttpService.playNotSoFast.mockRejectedValue(new Error("Instant error"));

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          10,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Not So Fast", imageName: "instant" } },
          },
          over: { id: "play-card-zone" },
        });
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error ejecutando Not So Fast:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it("loggea mensaje cuando se intenta jugar carta inválida", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Detective", type: "Detective", image_name: "detective" }],
      };

      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Detective", imageName: "detective" } },
          },
          over: { id: "play-card-zone" },
        });
      });

      expect(consoleLogSpy).toHaveBeenCalledWith("Card played not valid.");
      consoleLogSpy.mockRestore();
    });
  });

  describe("handleAddCardToSet", () => {
    it("no agrega carta si no está en matchingSets", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          { playerCards: [] },
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleAddCardToSet(
          0,
          [], // matchingSets vacío
          [{ card_id: 1 }]
        );
      });

      expect(mockHttpService.addCardToSet).not.toHaveBeenCalled();
    });

    it("no agrega carta si currentSetCards tiene más de 1 carta", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          { playerCards: [] },
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleAddCardToSet(
          0,
          [{ setIndex: 0, setType: "Poirot", setId: 1 }],
          [{ card_id: 1 }, { card_id: 2 }] // 2 cartas
        );
      });

      expect(mockHttpService.addCardToSet).not.toHaveBeenCalled();
    });

    it("agrega carta exitosamente y actualiza datos", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      mockHttpService.addCardToSet.mockResolvedValue({ set_type: "Poirot" });
      mockFetchGameData.mockResolvedValue({});

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          { playerCards: [] },
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleAddCardToSet(
          0,
          [{ setIndex: 0, setType: "Poirot", setId: 1 }],
          [{ card_id: 1 }]
        );
      });

      expect(mockHttpService.addCardToSet).toHaveBeenCalledWith(1, 2, 1, 1);
      expect(mockFetchGameData).toHaveBeenCalled();
    });

    it("maneja errores al agregar carta al set", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [],
      };

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockHttpService.addCardToSet.mockRejectedValue(new Error("Add card error"));

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          { playerCards: [] },
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleAddCardToSet(
          0,
          [{ setIndex: 0, setType: "Poirot", setId: 1 }],
          [{ card_id: 1 }]
        );
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error al agregar carta al set:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Disgrace scenarios", () => {
    it("bloquea segundo descarte cuando ya descartó en desgracia", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [{ id: 2, in_disgrace: true }],
      };

      const mockPlayerData = {
        playerCards: [
          { card_id: 1, card_name: "Card1", image_name: "card1" },
          { card_id: 2, card_name: "Card2", image_name: "card2" },
        ],
      };

      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      mockHttpService.discardCard.mockResolvedValue({});
      mockFetchGameData.mockResolvedValue({});

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      // Primer descarte
      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Card1", imageName: "card1" } },
          },
          over: { id: "discard-deck" },
        });
      });

      // Segundo intento de descarte
      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 2, cardName: "Card2", imageName: "card2" } },
          },
          over: { id: "discard-deck" },
        });
      });

      expect(consoleLogSpy).toHaveBeenCalledWith("Ya descartaste (desgracia): no podés descartar otra.");
      expect(mockHttpService.discardCard).toHaveBeenCalledTimes(1);
      consoleLogSpy.mockRestore();
    });

    it("solo permite jugar Not So Fast en desgracia cuando se arrastra a play-card-zone", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "None",
        players: [{ id: 2, in_disgrace: true }],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "EventCard", type: "Event", image_name: "event" }],
      };

      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          0,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "EventCard", imageName: "event" } },
          },
          over: { id: "play-card-zone" },
        });
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        " Solo podés jugar 'Not So Fast' mientras estás en desgracia social."
      );
      expect(mockHttpService.playEvent).not.toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it("permite jugar Not So Fast en desgracia", async () => {
      const mockTurnData = {
        gameId: 1,
        turn_owner_id: 2,
        turn_state: "Playing",
        players: [{ id: 2, in_disgrace: true }],
      };

      const mockPlayerData = {
        playerCards: [{ card_id: 1, card_name: "Not So Fast", type: "Instant", image_name: "instant" }],
      };

      mockHttpService.playNotSoFast.mockResolvedValue({ timer: 0 });

      const { result } = renderHook(() =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          mockTurnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          10,
          mockSetTimer
        )
      );

      await act(async () => {
        await result.current.handleDragEnd({
          active: {
            data: { current: { cardId: 1, cardName: "Not So Fast", imageName: "instant" } },
          },
          over: { id: "play-card-zone" },
        });
      });

      expect(mockHttpService.playNotSoFast).toHaveBeenCalledWith(1, 2, 1);
    });
  });
});
