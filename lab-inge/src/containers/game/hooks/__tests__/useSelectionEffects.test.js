import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSelectionEffects } from "../useSelectionEffects";

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
      const selectionAction = "another"; // 🎯 Agregado para robar sets

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          null, // selectedSecret
          selectedPlayer,
          selectedSet,
          selectionAction, // 🎯 Cambiado de null a "another"
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
          vi.fn(), // setSelectedSecret
          mockSetSelectionMode,
          vi.fn(), // setMovedCardsCount
          mockHandleStealSet,
          vi.fn(), // handleCardAriadneOliver
          null, // ariadneCardId
          null, // turnData
          mockSetSelectedSet,
          vi.fn(), // setAriadneCardId
          vi.fn(), // setShowTradeDialog
          vi.fn()  // setOpponentId
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
          "another",
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
          vi.fn(),
          mockSetSelectionMode,
          vi.fn(),
          mockHandleStealSet,
          vi.fn(), // handleCardAriadneOliver
          null, // ariadneCardId
          null, // turnData
          mockSetSelectedSet,
          vi.fn(), // setAriadneCardId
          vi.fn(), // setShowTradeDialog
          vi.fn()  // setOpponentId
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
          "another",
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
          vi.fn(),
          mockSetSelectionMode,
          vi.fn(),
          mockHandleStealSet,
          vi.fn(),
          null,
          null,
          mockSetSelectedSet,
          vi.fn(),
          vi.fn(),
          vi.fn()
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
          "another",
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
          vi.fn(),
          mockSetSelectionMode,
          vi.fn(),
          mockHandleStealSet,
          vi.fn(),
          null,
          null,
          mockSetSelectedSet,
          vi.fn(),
          vi.fn(),
          vi.fn()
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
          "another",
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
          vi.fn(),
          mockSetSelectionMode,
          vi.fn(),
          mockHandleStealSet,
          vi.fn(),
          null,
          null,
          mockSetSelectedSet,
          vi.fn(),
          vi.fn(),
          vi.fn()
        )
      );

      await waitFor(() => {
        expect(mockHandleStealSet).toHaveBeenCalledWith(selectedPlayer, 0);
      });
    });

    it("maneja correctamente cuando se actualiza de otro modo a 'select-set'", async () => {
      const { rerender } = renderHook(
        ({ mode, set, player, action }) =>
          useSelectionEffects(
            mode,
            null,
            player,
            set,
            action,
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
            vi.fn(),
            mockSetSelectionMode,
            vi.fn(),
            mockHandleStealSet,
            vi.fn(),
            null,
            null,
            mockSetSelectedSet,
            vi.fn(),
            vi.fn(),
            vi.fn()
          ),
        {
          initialProps: {
            mode: "select-player",
            set: 2,
            player: 5,
            action: "another"
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
        action: "another"
      });

      // Ahora sí debe llamar a handleStealSet
      await waitFor(() => {
        expect(mockHandleStealSet).toHaveBeenCalledWith(5, 2);
      });
    });

    it("llama a handleStealSet cada vez que cambian las dependencias relevantes", async () => {
      const { rerender } = renderHook(
        ({ mode, set, player, action }) =>
          useSelectionEffects(
            mode,
            null,
            player,
            set,
            action,
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
            vi.fn(),
            mockSetSelectionMode,
            vi.fn(),
            mockHandleStealSet,
            vi.fn(),
            null,
            null,
            mockSetSelectedSet,
            vi.fn(),
            vi.fn(),
            vi.fn()
          ),
        {
          initialProps: {
            mode: "select-set",
            set: 0,
            player: 3,
            action: "another"
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
        action: "another"
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
          vi.fn(),
          mockSetSelectionMode,
          vi.fn(),
          mockHandleStealSet,
          vi.fn(),
          null,
          null,
          mockSetSelectedSet,
          vi.fn(),
          vi.fn(),
          vi.fn()
        )
      );

      // Debe llamar a revealMySecret, no a handleStealSet
      await waitFor(() => {
        expect(mockRevealMySecret).toHaveBeenCalled();
      });
      
      expect(mockHandleStealSet).not.toHaveBeenCalled();
    });
  });

  describe("Ariadne Oliver functionality", () => {
    let mockHandleCardAriadneOliver;
    let mockSetAriadneCardId;

    beforeEach(() => {
      mockHandleCardAriadneOliver = vi.fn().mockResolvedValue(undefined);
      mockSetAriadneCardId = vi.fn();
    });

    it("llama a handleCardAriadneOliver cuando selectionMode es 'select-set', selectionAction es 'ariadne' y todos los parámetros están presentes", async () => {
      const selectionMode = "select-set";
      const selectedSet = 1;
      const selectedPlayer = 5;
      const selectionAction = "ariadne";
      const ariadneCardId = 42;

      const mockTurnData = {
        players: [
          {
            id: 5,
            setPlayed: [
              { set_id: 101, set_type: "Poirot" },
              { set_id: 102, set_type: "Marple" }
            ]
          }
        ]
      };

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          null,
          selectedPlayer,
          selectedSet,
          selectionAction,
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
          vi.fn(),
          mockSetSelectionMode,
          vi.fn(),
          vi.fn(), // handleStealSet
          mockHandleCardAriadneOliver,
          ariadneCardId,
          mockTurnData,
          mockSetSelectedSet,
          mockSetAriadneCardId,
          vi.fn(),
          vi.fn()
        )
      );

      await waitFor(() => {
        expect(mockHandleCardAriadneOliver).toHaveBeenCalledWith(selectedPlayer, 102, ariadneCardId);
      });
    });

    it("no llama a handleCardAriadneOliver si ariadneCardId es null", async () => {
      const selectionMode = "select-set";
      const selectedSet = 0;
      const selectedPlayer = 5;
      const selectionAction = "ariadne";

      const mockTurnData = {
        players: [
          {
            id: 5,
            setPlayed: [{ set_id: 101, set_type: "Poirot" }]
          }
        ]
      };

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          null,
          selectedPlayer,
          selectedSet,
          selectionAction,
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
          vi.fn(),
          mockSetSelectionMode,
          vi.fn(),
          vi.fn(),
          mockHandleCardAriadneOliver,
          null, // ariadneCardId is null
          mockTurnData,
          mockSetSelectedSet,
          mockSetAriadneCardId,
          vi.fn(),
          vi.fn()
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockHandleCardAriadneOliver).not.toHaveBeenCalled();
    });

    it("no llama a handleCardAriadneOliver si selectionAction no es 'ariadne'", async () => {
      const selectionMode = "select-set";
      const selectedSet = 0;
      const selectedPlayer = 5;
      const selectionAction = "another"; // different action
      const ariadneCardId = 42;

      const mockTurnData = {
        players: [
          {
            id: 5,
            setPlayed: [{ set_id: 101, set_type: "Poirot" }]
          }
        ]
      };

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          null,
          selectedPlayer,
          selectedSet,
          selectionAction,
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
          vi.fn(),
          mockSetSelectionMode,
          vi.fn(),
          vi.fn(),
          mockHandleCardAriadneOliver,
          ariadneCardId,
          mockTurnData,
          mockSetSelectedSet,
          mockSetAriadneCardId,
          vi.fn(),
          vi.fn()
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockHandleCardAriadneOliver).not.toHaveBeenCalled();
    });

    it("no ejecuta múltiples veces con el mismo ariadneCardId (previene ejecuciones duplicadas)", async () => {
      const selectionMode = "select-set";
      const selectedSet = 0;
      const selectedPlayer = 5;
      const selectionAction = "ariadne";
      const ariadneCardId = 42;

      const mockTurnData = {
        players: [
          {
            id: 5,
            setPlayed: [{ set_id: 101, set_type: "Poirot" }]
          }
        ]
      };

      const { rerender } = renderHook(
        (props) =>
          useSelectionEffects(
            props.selectionMode,
            null,
            props.selectedPlayer,
            props.selectedSet,
            props.selectionAction,
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
            vi.fn(),
            mockSetSelectionMode,
            vi.fn(),
            vi.fn(),
            mockHandleCardAriadneOliver,
            props.ariadneCardId,
            props.turnData,
            mockSetSelectedSet,
            mockSetAriadneCardId,
            vi.fn(),
            vi.fn()
          ),
        {
          initialProps: {
            selectionMode,
            selectedSet,
            selectedPlayer,
            selectionAction,
            ariadneCardId,
            turnData: mockTurnData
          }
        }
      );

      await waitFor(() => {
        expect(mockHandleCardAriadneOliver).toHaveBeenCalledTimes(1);
      });

      // Re-render con los mismos props (simula actualización de estado)
      rerender({
        selectionMode,
        selectedSet,
        selectedPlayer,
        selectionAction,
        ariadneCardId,
        turnData: mockTurnData
      });

      // Esperar y verificar que NO se llame nuevamente
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockHandleCardAriadneOliver).toHaveBeenCalledTimes(1);
    });

    it("maneja correctamente cuando el jugador seleccionado no tiene sets", async () => {
      const selectionMode = "select-set";
      const selectedSet = 0;
      const selectedPlayer = 5;
      const selectionAction = "ariadne";
      const ariadneCardId = 42;

      const mockTurnData = {
        players: [
          {
            id: 5,
            setPlayed: [] // No sets
          }
        ]
      };

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderHook(() =>
        useSelectionEffects(
          selectionMode,
          null,
          selectedPlayer,
          selectedSet,
          selectionAction,
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
          vi.fn(),
          mockSetSelectionMode,
          vi.fn(),
          vi.fn(),
          mockHandleCardAriadneOliver,
          ariadneCardId,
          mockTurnData,
          mockSetSelectedSet,
          mockSetAriadneCardId,
          vi.fn(),
          vi.fn()
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // El mensaje de error es "❌ No se encontró el set o no tiene set_id" porque el array está vacío
      // y se intenta acceder al índice 0
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockHandleCardAriadneOliver).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});
