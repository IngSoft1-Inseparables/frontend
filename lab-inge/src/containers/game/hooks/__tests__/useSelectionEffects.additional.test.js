import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSelectionEffects } from "../useSelectionEffects";

describe("useSelectionEffects - Additional Coverage", () => {
  let mockFunctions;

  beforeEach(() => {
    mockFunctions = {
      revealMySecret: vi.fn(),
      revealOtherPlayerSecret: vi.fn(),
      forcePlayerRevealSecret: vi.fn(),
      hideMySecret: vi.fn(),
      hideOtherPlayerSecret: vi.fn(),
      handleStealSecret: vi.fn(),
      handleStealSecretEvent: vi.fn(),
      httpService: {
        stealSecret: vi.fn().mockResolvedValue({}),
        hideSecret: vi.fn().mockResolvedValue({}),
        tradeCards: vi.fn().mockResolvedValue({}),
        discardCards: vi.fn().mockResolvedValue({}),
        voteSuspicion: vi.fn().mockResolvedValue({}),
      },
      fetchGameData: vi.fn(),
      setSelectedPlayer: vi.fn(),
      setSelectionAction: vi.fn(),
      setFromPlayer: vi.fn(),
      setSelectedSecret: vi.fn(),
      setSelectionMode: vi.fn(),
      setMovedCardsCount: vi.fn(),
      handleStealSet: vi.fn(),
      handleCardAriadneOliver: vi.fn(),
      setSelectedSet: vi.fn(),
      setAriadneCardId: vi.fn(),
      setShowTradeDialog: vi.fn(),
      setOpponentId: vi.fn(),
    };
  });

  describe("select-my-not-revealed-secret mode", () => {
    it("revela secreto propio cuando hay selección", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedSecret }) =>
          useSelectionEffects(
            selectionMode,
            selectedSecret,
            null,
            null,
            null,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedSecret: null,
          },
        }
      );

      rerender({
        selectionMode: "select-my-not-revealed-secret",
        selectedSecret: 123,
      });

      await waitFor(() => {
        expect(mockFunctions.revealMySecret).toHaveBeenCalledWith(123);
        expect(mockFunctions.setSelectedSecret).toHaveBeenCalledWith(null);
        expect(mockFunctions.setSelectedPlayer).toHaveBeenCalledWith(null);
        expect(mockFunctions.setSelectionMode).toHaveBeenCalledWith(null);
      });
    });
  });

  describe("select-other-not-revealed-secret mode", () => {
    it("revela secreto ajeno cuando hay jugador y secreto seleccionados", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedSecret, selectedPlayer }) =>
          useSelectionEffects(
            selectionMode,
            selectedSecret,
            selectedPlayer,
            null,
            null,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedSecret: null,
            selectedPlayer: null,
          },
        }
      );

      rerender({
        selectionMode: "select-other-not-revealed-secret",
        selectedSecret: 123,
        selectedPlayer: 5,
      });

      await waitFor(() => {
        expect(mockFunctions.revealOtherPlayerSecret).toHaveBeenCalledWith(5, 123);
        expect(mockFunctions.setSelectedSecret).toHaveBeenCalledWith(null);
        expect(mockFunctions.setSelectedPlayer).toHaveBeenCalledWith(null);
        expect(mockFunctions.setSelectionMode).toHaveBeenCalledWith(null);
      });
    });
  });

  describe("select-other-player mode with different actions", () => {
    it("fuerza revelación cuando no hay selectionAction", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedPlayer: null,
            selectionAction: null,
          },
        }
      );

      rerender({
        selectionMode: "select-other-player",
        selectedPlayer: 5,
        selectionAction: null,
      });

      await waitFor(() => {
        expect(mockFunctions.forcePlayerRevealSecret).toHaveBeenCalledWith(5);
      });
    });

    it("NO fuerza revelación cuando selectionAction es 'card trade'", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedPlayer: null,
            selectionAction: null,
          },
        }
      );

      rerender({
        selectionMode: "select-other-player",
        selectedPlayer: 5,
        selectionAction: "card trade",
      });

      // Esperar un poco para asegurar que no se llame
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFunctions.forcePlayerRevealSecret).not.toHaveBeenCalled();
    });

    it("NO fuerza revelación cuando selectionAction es 'specials'", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedPlayer: null,
            selectionAction: null,
          },
        }
      );

      rerender({
        selectionMode: "select-other-player",
        selectedPlayer: 5,
        selectionAction: "specials",
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFunctions.forcePlayerRevealSecret).not.toHaveBeenCalled();
    });

    it("NO fuerza revelación cuando selectionAction es 'cards off the table'", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedPlayer: null,
            selectionAction: null,
          },
        }
      );

      rerender({
        selectionMode: "select-other-player",
        selectedPlayer: 5,
        selectionAction: "cards off the table",
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFunctions.forcePlayerRevealSecret).not.toHaveBeenCalled();
    });

    it("NO fuerza revelación cuando selectionAction es 'point'", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedPlayer: null,
            selectionAction: null,
          },
        }
      );

      rerender({
        selectionMode: "select-other-player",
        selectedPlayer: 5,
        selectionAction: "point",
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFunctions.forcePlayerRevealSecret).not.toHaveBeenCalled();
    });
  });

  describe("select-other-player with specials action", () => {
    it("llama handleStealSecret cuando hay jugador y action es 'specials'", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedPlayer: null,
            selectionAction: null,
          },
        }
      );

      rerender({
        selectionMode: "select-other-player",
        selectedPlayer: 5,
        selectionAction: "specials",
      });

      await waitFor(() => {
        expect(mockFunctions.handleStealSecret).toHaveBeenCalledWith(5);
      });
    });
  });

  describe("select-my-revealed-secret mode", () => {
    it("oculta secreto propio cuando hay selección", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedSecret }) =>
          useSelectionEffects(
            selectionMode,
            selectedSecret,
            null,
            null,
            null,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedSecret: null,
          },
        }
      );

      rerender({
        selectionMode: "select-my-revealed-secret",
        selectedSecret: 123,
      });

      await waitFor(() => {
        expect(mockFunctions.hideMySecret).toHaveBeenCalledWith(123);
        expect(mockFunctions.setSelectedSecret).toHaveBeenCalledWith(null);
        expect(mockFunctions.setSelectedPlayer).toHaveBeenCalledWith(null);
        expect(mockFunctions.setSelectionMode).toHaveBeenCalledWith(null);
      });
    });
  });

  describe("select-revealed-secret mode", () => {
    it("oculta secreto ajeno cuando hay selección", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedSecret, selectedPlayer }) =>
          useSelectionEffects(
            selectionMode,
            selectedSecret,
            selectedPlayer,
            null,
            null,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedSecret: null,
            selectedPlayer: null,
          },
        }
      );

      rerender({
        selectionMode: "select-revealed-secret",
        selectedSecret: 123,
        selectedPlayer: 5,
      });

      await waitFor(() => {
        expect(mockFunctions.hideOtherPlayerSecret).toHaveBeenCalledWith(5, 123);
        expect(mockFunctions.setSelectedSecret).toHaveBeenCalledWith(null);
        expect(mockFunctions.setSelectedPlayer).toHaveBeenCalledWith(null);
        expect(mockFunctions.setSelectionMode).toHaveBeenCalledWith(null);
      });
    });
  });

  describe("select-secret-to-steal mode", () => {
    it("llama handleStealSecretEvent cuando hay selección y action es 'one more'", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedSecret, selectionAction, selectedPlayer }) =>
          useSelectionEffects(
            selectionMode,
            selectedSecret,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedSecret: null,
            selectionAction: null,
            selectedPlayer: null,
          },
        }
      );

      rerender({
        selectionMode: "select-other-revealed-secret",
        selectedSecret: 123,
        selectionAction: "one more",
        selectedPlayer: 5,
      });

      await waitFor(() => {
        expect(mockFunctions.handleStealSecretEvent).toHaveBeenCalledWith(123, 5);
      });
    });
  });

  describe("select-set mode", () => {
    it("llama handleStealSet cuando hay jugador, set y action es 'another'", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectedSet, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            selectedSet,
            selectionAction,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedPlayer: null,
            selectedSet: null,
            selectionAction: null,
          },
        }
      );

      rerender({
        selectionMode: "select-set",
        selectedPlayer: 5,
        selectedSet: 2,
        selectionAction: "another",
      });

      await waitFor(() => {
        expect(mockFunctions.handleStealSet).toHaveBeenCalledWith(5, 2);
      });
    });

    it("maneja selectedSet en 0 (primer set) con action 'another'", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectedSet, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            selectedSet,
            selectionAction,
            null,
            mockFunctions.revealMySecret,
            mockFunctions.revealOtherPlayerSecret,
            mockFunctions.forcePlayerRevealSecret,
            mockFunctions.hideMySecret,
            mockFunctions.hideOtherPlayerSecret,
            mockFunctions.handleStealSecret,
            mockFunctions.handleStealSecretEvent,
            mockFunctions.httpService,
            1,
            mockFunctions.fetchGameData,
            mockFunctions.setSelectedPlayer,
            mockFunctions.setSelectionAction,
            mockFunctions.setFromPlayer,
            mockFunctions.setSelectedSecret,
            mockFunctions.setSelectionMode,
            mockFunctions.setMovedCardsCount,
            mockFunctions.handleStealSet,
            mockFunctions.handleCardAriadneOliver,
            null,
            null,
            mockFunctions.setSelectedSet,
            mockFunctions.setAriadneCardId,
            mockFunctions.setShowTradeDialog,
            mockFunctions.setOpponentId,
            10
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedPlayer: null,
            selectedSet: null,
            selectionAction: null,
          },
        }
      );

      rerender({
        selectionMode: "select-set",
        selectedPlayer: 5,
        selectedSet: 0,
        selectionAction: "another",
      });

      await waitFor(() => {
        expect(mockFunctions.handleStealSet).toHaveBeenCalledWith(5, 0);
      });
    });
  });
});
