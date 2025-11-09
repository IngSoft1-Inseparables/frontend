import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSelectionEffects } from "../useSelectionEffects";

describe("useSelectionEffects - Point Your Suspicions", () => {
  let mockHttpService;
  let mockSetSelectedPlayer;
  let mockSetSelectionAction;
  let mockSetSelectionMode;
  let mockSetSelectedSecret;
  let mockSetFromPlayer;
  let mockSetMovedCardsCount;
  let mockSetShowTradeDialog;
  let mockSetOpponentId;
  let mockFetchGameData;
  let mockRevealMySecret;
  let mockRevealOtherPlayerSecret;
  let mockForcePlayerRevealSecret;
  let mockHideMySecret;
  let mockHideOtherPlayerSecret;
  let mockHandleStealSecret;
  let mockHandleStealSecretEvent;
  let mockHandleStealSet;

  beforeEach(() => {
    mockHttpService = {
      voteSuspicion: vi.fn(),
    };
    mockSetSelectedPlayer = vi.fn();
    mockSetSelectionAction = vi.fn();
    mockSetSelectionMode = vi.fn();
    mockSetSelectedSecret = vi.fn();
    mockSetFromPlayer = vi.fn();
    mockSetMovedCardsCount = vi.fn();
    mockSetShowTradeDialog = vi.fn();
    mockSetOpponentId = vi.fn();
    mockFetchGameData = vi.fn();
    mockRevealMySecret = vi.fn();
    mockRevealOtherPlayerSecret = vi.fn();
    mockForcePlayerRevealSecret = vi.fn();
    mockHideMySecret = vi.fn();
    mockHideOtherPlayerSecret = vi.fn();
    mockHandleStealSecret = vi.fn();
    mockHandleStealSecretEvent = vi.fn();
    mockHandleStealSet = vi.fn();
  });

  describe("Voting functionality", () => {
    it("sends vote when player is selected with point action", async () => {
      mockHttpService.voteSuspicion.mockResolvedValue({
        message: "Vote registered",
      });

      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null, // selectedSecret
            selectedPlayer,
            null, // selectedSet
            selectionAction,
            null, // fromPlayer
            mockRevealMySecret,
            mockRevealOtherPlayerSecret,
            mockForcePlayerRevealSecret,
            mockHideMySecret,
            mockHideOtherPlayerSecret,
            mockHandleStealSecret,
            mockHandleStealSecretEvent,
            mockHttpService,
            1, // gameId
            mockFetchGameData,
            mockSetSelectedPlayer,
            mockSetSelectionAction,
            mockSetFromPlayer,
            mockSetSelectedSecret,
            mockSetSelectionMode,
            mockSetMovedCardsCount,
            mockHandleStealSet,
            mockSetShowTradeDialog,
            mockSetOpponentId,
            2 // myPlayerId
          ),
        {
          initialProps: {
            selectionMode: null,
            selectedPlayer: null,
            selectionAction: null,
          },
        }
      );

      // Simular selección de jugador para votar
      rerender({
        selectionMode: "select-other-player",
        selectedPlayer: 3,
        selectionAction: "point",
      });

      await waitFor(() => {
        expect(mockHttpService.voteSuspicion).toHaveBeenCalledWith(1, 2, 3);
      });

      await waitFor(() => {
        expect(mockSetSelectedPlayer).toHaveBeenCalledWith(null);
        expect(mockSetSelectionMode).toHaveBeenCalledWith(null);
        expect(mockSetSelectionAction).toHaveBeenCalledWith(null);
      });
    });

    it("clears selection immediately when voting", async () => {
      mockHttpService.voteSuspicion.mockResolvedValue({
        message: "Vote registered",
      });

      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockRevealMySecret,
            mockRevealOtherPlayerSecret,
            mockForcePlayerRevealSecret,
            mockHideMySecret,
            mockHideOtherPlayerSecret,
            mockHandleStealSecret,
            mockHandleStealSecretEvent,
            mockHttpService,
            1,
            mockFetchGameData,
            mockSetSelectedPlayer,
            mockSetSelectionAction,
            mockSetFromPlayer,
            mockSetSelectedSecret,
            mockSetSelectionMode,
            mockSetMovedCardsCount,
            mockHandleStealSet,
            mockSetShowTradeDialog,
            mockSetOpponentId,
            2
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

      // La selección debe limpiarse inmediatamente, antes de esperar respuesta del servidor
      await waitFor(() => {
        expect(mockSetSelectedPlayer).toHaveBeenCalledWith(null);
        expect(mockSetSelectionMode).toHaveBeenCalledWith(null);
        expect(mockSetSelectionAction).toHaveBeenCalledWith(null);
      });
    });

    it("handles voting error gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      mockHttpService.voteSuspicion.mockRejectedValue(
        new Error("Network error")
      );

      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockRevealMySecret,
            mockRevealOtherPlayerSecret,
            mockForcePlayerRevealSecret,
            mockHideMySecret,
            mockHideOtherPlayerSecret,
            mockHandleStealSecret,
            mockHandleStealSecretEvent,
            mockHttpService,
            1,
            mockFetchGameData,
            mockSetSelectedPlayer,
            mockSetSelectionAction,
            mockSetFromPlayer,
            mockSetSelectedSecret,
            mockSetSelectionMode,
            mockSetMovedCardsCount,
            mockHandleStealSet,
            mockSetShowTradeDialog,
            mockSetOpponentId,
            2
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
        selectedPlayer: 4,
        selectionAction: "point",
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error al votar:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("does not vote if selectionMode is not select-other-player", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockRevealMySecret,
            mockRevealOtherPlayerSecret,
            mockForcePlayerRevealSecret,
            mockHideMySecret,
            mockHideOtherPlayerSecret,
            mockHandleStealSecret,
            mockHandleStealSecretEvent,
            mockHttpService,
            1,
            mockFetchGameData,
            mockSetSelectedPlayer,
            mockSetSelectionAction,
            mockSetFromPlayer,
            mockSetSelectedSecret,
            mockSetSelectionMode,
            mockSetMovedCardsCount,
            mockHandleStealSet,
            mockSetShowTradeDialog,
            mockSetOpponentId,
            2
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
        selectionMode: "select-my-secret",
        selectedPlayer: 3,
        selectionAction: "point",
      });

      await waitFor(() => {
        expect(mockHttpService.voteSuspicion).not.toHaveBeenCalled();
      });
    });

    it("does not vote if selectionAction is not point", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockRevealMySecret,
            mockRevealOtherPlayerSecret,
            mockForcePlayerRevealSecret,
            mockHideMySecret,
            mockHideOtherPlayerSecret,
            mockHandleStealSecret,
            mockHandleStealSecretEvent,
            mockHttpService,
            1,
            mockFetchGameData,
            mockSetSelectedPlayer,
            mockSetSelectionAction,
            mockSetFromPlayer,
            mockSetSelectedSecret,
            mockSetSelectionMode,
            mockSetMovedCardsCount,
            mockHandleStealSet,
            mockSetShowTradeDialog,
            mockSetOpponentId,
            2
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
        selectedPlayer: 3,
        selectionAction: "card trade",
      });

      await waitFor(() => {
        expect(mockHttpService.voteSuspicion).not.toHaveBeenCalled();
      });
    });

    it("does not vote if no player is selected", async () => {
      const { rerender } = renderHook(
        ({ selectionMode, selectedPlayer, selectionAction }) =>
          useSelectionEffects(
            selectionMode,
            null,
            selectedPlayer,
            null,
            selectionAction,
            null,
            mockRevealMySecret,
            mockRevealOtherPlayerSecret,
            mockForcePlayerRevealSecret,
            mockHideMySecret,
            mockHideOtherPlayerSecret,
            mockHandleStealSecret,
            mockHandleStealSecretEvent,
            mockHttpService,
            1,
            mockFetchGameData,
            mockSetSelectedPlayer,
            mockSetSelectionAction,
            mockSetFromPlayer,
            mockSetSelectedSecret,
            mockSetSelectionMode,
            mockSetMovedCardsCount,
            mockHandleStealSet,
            mockSetShowTradeDialog,
            mockSetOpponentId,
            2
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
        selectedPlayer: null,
        selectionAction: "point",
      });

      await waitFor(() => {
        expect(mockHttpService.voteSuspicion).not.toHaveBeenCalled();
      });
    });
  });
});
