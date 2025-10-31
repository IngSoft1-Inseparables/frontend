import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSelectionEffects } from "./useSelectionEffects";

describe("useSelectionEffects hook", () => {
  let mockHandleStealSet;
  let mockSetSelectedPlayer;
  let mockSetSelectionMode;
  let mockSetSelectedSet;

  beforeEach(() => {
    mockHandleStealSet = vi.fn().mockResolvedValue(undefined);
    mockSetSelectedPlayer = vi.fn();
    mockSetSelectionMode = vi.fn();
    mockSetSelectedSet = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Select-set mode functionality", () => {
    it("llama a handleStealSet cuando selectionMode es 'select-set' y todos los parámetros están presentes", async () => {
      const selectionMode = "select-set";
      const selectedSet = 2;
      const selectedPlayer = 5;

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          null, // selectedSecret
          selectedPlayer,
          selectedSet,
          null, // selectionAction
          null, // fromPlayer
          vi.fn(), // revealMySecret
          vi.fn(), // revealOtherPlayerSecret
          vi.fn(), // forcePlayerRevealSecret
          vi.fn(), // hideMySecret
          vi.fn(), // hideOtherPlayerSecret
          vi.fn(), // handleStealSecret
          vi.fn(), // handleStealSecretEvent
          {}, // httpService
          1, // gameId
          vi.fn(), // fetchGameData
          mockSetSelectedPlayer,
          vi.fn(), // setSelectionAction
          vi.fn(), // setFromPlayer
          mockSetSelectedSet,
          mockSetSelectionMode,
          mockHandleStealSet
        )
      );

      await waitFor(() => {
        expect(mockHandleStealSet).toHaveBeenCalledWith(selectedPlayer, selectedSet);
      });
    });

    it("no llama a handleStealSet si selectionMode no es 'select-set'", async () => {
      const selectionMode = "select-player";
      const selectedSet = 2;
      const selectedPlayer = 5;

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          null,
          selectedPlayer,
          selectedSet,
          null,
          null,
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          {},
          1,
          vi.fn(),
          mockSetSelectedPlayer,
          vi.fn(),
          vi.fn(),
          mockSetSelectedSet,
          mockSetSelectionMode,
          mockHandleStealSet
        )
      );

      // Esperar un tiempo para asegurar que no se llama
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockHandleStealSet).not.toHaveBeenCalled();
    });

    it("no llama a handleStealSet si selectedSet es null", async () => {
      const selectionMode = "select-set";
      const selectedSet = null;
      const selectedPlayer = 5;

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          null,
          selectedPlayer,
          selectedSet,
          null,
          null,
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          {},
          1,
          vi.fn(),
          mockSetSelectedPlayer,
          vi.fn(),
          vi.fn(),
          mockSetSelectedSet,
          mockSetSelectionMode,
          mockHandleStealSet
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockHandleStealSet).not.toHaveBeenCalled();
    });

    it("no llama a handleStealSet si selectedPlayer es null", async () => {
      const selectionMode = "select-set";
      const selectedSet = 2;
      const selectedPlayer = null;

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          null,
          selectedPlayer,
          selectedSet,
          null,
          null,
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          {},
          1,
          vi.fn(),
          mockSetSelectedPlayer,
          vi.fn(),
          vi.fn(),
          mockSetSelectedSet,
          mockSetSelectionMode,
          mockHandleStealSet
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockHandleStealSet).not.toHaveBeenCalled();
    });

    it("llama a handleStealSet con setIndex 0", async () => {
      const selectionMode = "select-set";
      const selectedSet = 0;
      const selectedPlayer = 5;

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          null,
          selectedPlayer,
          selectedSet,
          null,
          null,
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          {},
          1,
          vi.fn(),
          mockSetSelectedPlayer,
          vi.fn(),
          vi.fn(),
          mockSetSelectedSet,
          mockSetSelectionMode,
          mockHandleStealSet
        )
      );

      await waitFor(() => {
        expect(mockHandleStealSet).toHaveBeenCalledWith(selectedPlayer, 0);
      });
    });

    it("maneja correctamente cuando se actualiza de otro modo a 'select-set'", async () => {
      const { rerender } = renderHook(
        ({ mode, set, player }) =>
          useSelectionEffects(
            mode,
            null,
            player,
            set,
            null,
            null,
            vi.fn(),
            vi.fn(),
            vi.fn(),
            vi.fn(),
            vi.fn(),
            vi.fn(),
            vi.fn(),
            {},
            1,
            vi.fn(),
            mockSetSelectedPlayer,
            vi.fn(),
            vi.fn(),
            mockSetSelectedSet,
            mockSetSelectionMode,
            mockHandleStealSet
          ),
        {
          initialProps: {
            mode: "select-player",
            set: 2,
            player: 5,
          },
        }
      );

      // Inicialmente no debe llamar a handleStealSet
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockHandleStealSet).not.toHaveBeenCalled();

      // Cambiar el modo a 'select-set'
      rerender({
        mode: "select-set",
        set: 2,
        player: 5,
      });

      // Ahora sí debe llamar a handleStealSet
      await waitFor(() => {
        expect(mockHandleStealSet).toHaveBeenCalledWith(5, 2);
      });
    });

    it("llama a handleStealSet cada vez que cambian las dependencias relevantes", async () => {
      const { rerender } = renderHook(
        ({ mode, set, player }) =>
          useSelectionEffects(
            mode,
            null,
            player,
            set,
            null,
            null,
            vi.fn(),
            vi.fn(),
            vi.fn(),
            vi.fn(),
            vi.fn(),
            vi.fn(),
            vi.fn(),
            {},
            1,
            vi.fn(),
            mockSetSelectedPlayer,
            vi.fn(),
            vi.fn(),
            mockSetSelectedSet,
            mockSetSelectionMode,
            mockHandleStealSet
          ),
        {
          initialProps: {
            mode: "select-set",
            set: 0,
            player: 3,
          },
        }
      );

      await waitFor(() => {
        expect(mockHandleStealSet).toHaveBeenCalledWith(3, 0);
      });

      // Cambiar los valores
      rerender({
        mode: "select-set",
        set: 1,
        player: 7,
      });

      await waitFor(() => {
        expect(mockHandleStealSet).toHaveBeenCalledWith(7, 1);
      });

      expect(mockHandleStealSet).toHaveBeenCalledTimes(2);
    });

    it("no interfiere con otros modos de selección", async () => {
      const mockRevealMySecret = vi.fn();
      const selectionMode = "select-my-not-revealed-secret";
      const selectedSecret = 1;

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          selectedSecret,
          null, // selectedPlayer
          null, // selectedSet
          null,
          null,
          mockRevealMySecret,
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          vi.fn(),
          {},
          1,
          vi.fn(),
          mockSetSelectedPlayer,
          vi.fn(),
          vi.fn(),
          mockSetSelectedSet,
          mockSetSelectionMode,
          mockHandleStealSet
        )
      );

      // Debe llamar a revealMySecret, no a handleStealSet
      await waitFor(() => {
        expect(mockRevealMySecret).toHaveBeenCalled();
      });
      
      expect(mockHandleStealSet).not.toHaveBeenCalled();
    });
  });
});
