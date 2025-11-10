import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSecretActions } from "../useSecretActions";

describe("useSecretActions hook", () => {
  let mockHttpService;
  let mockFetchGameData;
  const gameId = 1;
  const myPlayerId = 10;

  beforeEach(() => {
    mockFetchGameData = vi.fn().mockResolvedValue(undefined);
    mockHttpService = {
      revealSecret: vi.fn().mockResolvedValue({}),
      hideSecret: vi.fn().mockResolvedValue({}),
      forcePlayerReveal: vi.fn().mockResolvedValue({}),
      stealSecret: vi.fn().mockResolvedValue({}),
      stealSet: vi.fn().mockResolvedValue({}),
      addCardToSet: vi.fn().mockResolvedValue({}),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Set selection functionality", () => {
    it("inicializa selectedSet en null", () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      expect(result.current.selectedSet).toBeNull();
    });

    it("handleSetSelection actualiza selectedPlayer y selectedSet correctamente", () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      const playerId = 5;
      const setIndex = 2;

      act(() => {
        result.current.handleSetSelection(playerId, setIndex);
      });

      expect(result.current.selectedPlayer).toBe(playerId);
      expect(result.current.selectedSet).toBe(setIndex);
    });

    it("handleSetSelection actualiza el estado con diferentes valores", () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      // Primera selección
      act(() => {
        result.current.handleSetSelection(3, 0);
      });

      expect(result.current.selectedPlayer).toBe(3);
      expect(result.current.selectedSet).toBe(0);

      // Segunda selección con valores diferentes
      act(() => {
        result.current.handleSetSelection(7, 1);
      });

      expect(result.current.selectedPlayer).toBe(7);
      expect(result.current.selectedSet).toBe(1);
    });

    it("handleStealSet llama al servicio HTTP con los parámetros correctos", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      const fromPlayerId = 5;
      const setIndex = 2;

      await act(async () => {
        await result.current.handleStealSet(fromPlayerId, setIndex);
      });

      expect(mockHttpService.stealSet).toHaveBeenCalledWith(
        gameId,
        setIndex,
        myPlayerId,
        fromPlayerId
      );
      expect(mockHttpService.stealSet).toHaveBeenCalledTimes(1);
    });

    it("handleStealSet actualiza los datos del juego después de robar", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.handleStealSet(5, 1);
      });

      expect(mockFetchGameData).toHaveBeenCalledTimes(1);
    });

    it("handleStealSet limpia los estados después de robar exitosamente", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      // Establecer estados antes de robar
      act(() => {
        result.current.setSelectedPlayer(5);
        result.current.setSelectedSet(1);
        result.current.setSelectionMode("select-set");
      });

      // Robar el set
      await act(async () => {
        await result.current.handleStealSet(5, 1);
      });

      // Verificar que los estados se limpiaron
      expect(result.current.selectedPlayer).toBeNull();
      expect(result.current.selectedSet).toBeNull();
      expect(result.current.selectionMode).toBeNull();
    });

    it("handleStealSet no llama al servicio si fromPlayerId es null", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.handleStealSet(null, 1);
      });

      expect(mockHttpService.stealSet).not.toHaveBeenCalled();
      expect(mockFetchGameData).not.toHaveBeenCalled();
    });

    it("handleStealSet no llama al servicio si setIndex es null", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.handleStealSet(5, null);
      });

      expect(mockHttpService.stealSet).not.toHaveBeenCalled();
      expect(mockFetchGameData).not.toHaveBeenCalled();
    });

    it("handleStealSet no llama al servicio si setIndex es undefined", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.handleStealSet(5, undefined);
      });

      expect(mockHttpService.stealSet).not.toHaveBeenCalled();
      expect(mockFetchGameData).not.toHaveBeenCalled();
    });

    it("handleStealSet limpia estados incluso si hay un error", async () => {
      mockHttpService.stealSet.mockRejectedValueOnce(new Error("Network error"));
      
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      // Establecer estados antes de robar
      act(() => {
        result.current.setSelectedPlayer(5);
        result.current.setSelectedSet(1);
        result.current.setSelectionMode("select-set");
      });

      // Intentar robar el set (debe fallar)
      await act(async () => {
        await result.current.handleStealSet(5, 1);
      });

      // Verificar que los estados se limpiaron a pesar del error
      expect(result.current.selectedPlayer).toBeNull();
      expect(result.current.selectedSet).toBeNull();
      expect(result.current.selectionMode).toBeNull();
    });

    it("handleStealSet puede robar el set en índice 0", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      await act(async () => {
        await result.current.handleStealSet(5, 0);
      });

      expect(mockHttpService.stealSet).toHaveBeenCalledWith(
        gameId,
        0,
        myPlayerId,
        5
      );
      expect(mockFetchGameData).toHaveBeenCalledTimes(1);
    });
  });

  describe("setSelectedSet setter", () => {
    it("setSelectedSet actualiza el estado correctamente", () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      act(() => {
        result.current.setSelectedSet(3);
      });

      expect(result.current.selectedSet).toBe(3);
    });

    it("setSelectedSet puede establecer el valor a null", () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      // Primero establecer un valor
      act(() => {
        result.current.setSelectedSet(2);
      });

      expect(result.current.selectedSet).toBe(2);

      // Luego establecer a null
      act(() => {
        result.current.setSelectedSet(null);
      });

      expect(result.current.selectedSet).toBeNull();
    });
  });

  describe("handleCardAriadneOliver functionality", () => {
    beforeEach(() => {
      mockHttpService.addCardToSet = vi.fn().mockResolvedValue({ success: true });
    });

    it("llama a addCardToSet con los parámetros correctos", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      const playerId = 5;
      const setId = 101;
      const cardId = 42;

      await act(async () => {
        await result.current.handleCardAriadneOliver(playerId, setId, cardId);
      });

      expect(mockHttpService.addCardToSet).toHaveBeenCalledWith(
        gameId,
        myPlayerId,
        cardId,
        setId
      );
    });

    it("establece pendingAriadneReveal con el playerId correcto", async () => {
      const mockTimer = 5; // Timer inicial > 0 para que no se ejecute el reveal inmediatamente
      const mockSetTimer = vi.fn();
      const mockTurnData = { turn_state: "Playing" };
      
      const { result } = renderHook(() =>
        useSecretActions(
          mockHttpService, 
          gameId, 
          myPlayerId, 
          mockFetchGameData,
          mockTimer,
          mockSetTimer,
          mockTurnData
        )
      );

      const playerId = 5;
      const setId = 101;
      const cardId = 42;

      mockHttpService.addCardToSet.mockResolvedValue({ timer: 5 });

      await act(async () => {
        await result.current.handleCardAriadneOliver(playerId, setId, cardId);
      });

      // Verificar que se llamó addCardToSet
      expect(mockHttpService.addCardToSet).toHaveBeenCalledWith(
        gameId,
        myPlayerId,
        cardId,
        setId
      );

      // Verificar que se actualizó el timer
      expect(mockSetTimer).toHaveBeenCalledWith(5);

      // No debe llamar a forcePlayerReveal inmediatamente
      expect(mockHttpService.forcePlayerReveal).not.toHaveBeenCalled();
    });

    it("llama a fetchGameData después de agregar la carta", async () => {
      const mockTimer = 5; // Timer inicial > 0 para evitar que se ejecute el useEffect
      const mockSetTimer = vi.fn();
      const mockTurnData = { turn_state: "Playing" };
      
      const { result } = renderHook(() =>
        useSecretActions(
          mockHttpService,
          gameId,
          myPlayerId,
          mockFetchGameData,
          mockTimer,
          mockSetTimer,
          mockTurnData
        )
      );

      const playerId = 5;
      const setId = 101;
      const cardId = 42;

      mockHttpService.addCardToSet.mockResolvedValue({ timer: 5 });

      await act(async () => {
        await result.current.handleCardAriadneOliver(playerId, setId, cardId);
      });

      // Solo debe llamar a fetchGameData una vez (después de agregar)
      expect(mockFetchGameData).toHaveBeenCalledTimes(1);
    });

    it("no ejecuta si playerId es null", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => {
        await result.current.handleCardAriadneOliver(null, 101, 42);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("❌ Parámetros inválidos:", {
        playerId: null,
        setId: 101,
        cardId: 42
      });
      expect(mockHttpService.addCardToSet).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it("no ejecuta si setId es null", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => {
        await result.current.handleCardAriadneOliver(5, null, 42);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("❌ Parámetros inválidos:", {
        playerId: 5,
        setId: null,
        cardId: 42
      });
      expect(mockHttpService.addCardToSet).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it("no ejecuta si cardId es null", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => {
        await result.current.handleCardAriadneOliver(5, 101, null);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("❌ Parámetros inválidos:", {
        playerId: 5,
        setId: 101,
        cardId: null
      });
      expect(mockHttpService.addCardToSet).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it("lanza error si addCardToSet falla", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      const testError = new Error("Backend error");
      mockHttpService.addCardToSet.mockRejectedValue(testError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(async () => {
        await act(async () => {
          await result.current.handleCardAriadneOliver(5, 101, 42);
        });
      }).rejects.toThrow("Backend error");

      expect(consoleErrorSpy).toHaveBeenCalledWith("❌ ERROR al agregar Ariadne Oliver:", testError);
      
      consoleErrorSpy.mockRestore();
    });

    it("actualiza el timer cuando el backend devuelve un timer", async () => {
      const mockTimer = 0;
      const mockSetTimer = vi.fn();
      const mockTurnData = { turn_state: "Playing" };
      
      const { result } = renderHook(() =>
        useSecretActions(
          mockHttpService,
          gameId,
          myPlayerId,
          mockFetchGameData,
          mockTimer,
          mockSetTimer,
          mockTurnData
        )
      );

      mockHttpService.addCardToSet.mockResolvedValue({ timer: 10 });

      await act(async () => {
        await result.current.handleCardAriadneOliver(5, 101, 42);
      });

      // Verificar que se actualizó el timer con el valor del backend
      expect(mockSetTimer).toHaveBeenCalledWith(10);
    });

    it("establece pendingAriadneReveal que se exporta correctamente", async () => {
      const mockTimer = 5;
      const mockSetTimer = vi.fn();
      const mockTurnData = { turn_state: "Playing" };
      
      const { result } = renderHook(() =>
        useSecretActions(
          mockHttpService,
          gameId,
          myPlayerId,
          mockFetchGameData,
          mockTimer,
          mockSetTimer,
          mockTurnData
        )
      );

      const playerId = 5;
      mockHttpService.addCardToSet.mockResolvedValue({ timer: 5 });

      // Verificar que pendingAriadneReveal está en null inicialmente
      expect(result.current.pendingAriadneReveal).toBeNull();

      await act(async () => {
        await result.current.handleCardAriadneOliver(playerId, 101, 42);
      });

      // Verificar que pendingAriadneReveal se establece con el playerId
      expect(result.current.pendingAriadneReveal).toEqual({ playerId: 5 });
    });
  });

  describe("useEffect - Timer-based Ariadne Oliver reveal", () => {
    it("ejecuta forcePlayerReveal cuando el timer llega a 0 y hay pendingAriadneReveal", async () => {
      const mockTurnData = { turn_state: "Playing" };
      
      // Iniciar con timer en 1
      const { result, rerender } = renderHook(
        ({ timer }) =>
          useSecretActions(
            mockHttpService,
            gameId,
            myPlayerId,
            mockFetchGameData,
            timer,
            vi.fn(),
            mockTurnData
          ),
        { initialProps: { timer: 1 } }
      );

      const playerId = 5;
      mockHttpService.addCardToSet.mockResolvedValue({ timer: 1 });
      mockHttpService.forcePlayerReveal.mockResolvedValue({ success: true });

      // Ejecutar handleCardAriadneOliver para establecer pendingAriadneReveal
      await act(async () => {
        await result.current.handleCardAriadneOliver(playerId, 101, 42);
      });

      // Limpiar el mock de fetchGameData para contar solo las llamadas del useEffect
      mockFetchGameData.mockClear();

      // Cambiar el timer a 0 para disparar el useEffect
      await act(async () => {
        rerender({ timer: 0 });
      });

      // Verificar que se llamó a forcePlayerReveal
      expect(mockHttpService.forcePlayerReveal).toHaveBeenCalledWith({
        gameId,
        playerId: 5,
      });

      // Verificar que se llamó a fetchGameData después del reveal
      expect(mockFetchGameData).toHaveBeenCalled();
    });

    it("no ejecuta forcePlayerReveal si el timer no es 0", async () => {
      const mockTurnData = { turn_state: "Playing" };
      
      const { result } = renderHook(() =>
        useSecretActions(
          mockHttpService,
          gameId,
          myPlayerId,
          mockFetchGameData,
          3, // Timer en 3, no en 0
          vi.fn(),
          mockTurnData
        )
      );

      const playerId = 5;
      mockHttpService.addCardToSet.mockResolvedValue({ timer: 3 });

      await act(async () => {
        await result.current.handleCardAriadneOliver(playerId, 101, 42);
      });

      // No debe llamar a forcePlayerReveal porque el timer no es 0
      expect(mockHttpService.forcePlayerReveal).not.toHaveBeenCalled();
    });

    it("no ejecuta forcePlayerReveal si no hay pendingAriadneReveal", async () => {
      const mockTurnData = { turn_state: "Playing" };
      
      const { rerender } = renderHook(
        ({ timer }) =>
          useSecretActions(
            mockHttpService,
            gameId,
            myPlayerId,
            mockFetchGameData,
            timer,
            vi.fn(),
            mockTurnData
          ),
        { initialProps: { timer: 1 } }
      );

      // Cambiar el timer a 0 sin haber llamado a handleCardAriadneOliver
      await act(async () => {
        rerender({ timer: 0 });
      });

      // No debe llamar a forcePlayerReveal porque no hay pendingAriadneReveal
      expect(mockHttpService.forcePlayerReveal).not.toHaveBeenCalled();
    });

    it("limpia pendingAriadneReveal después de ejecutar el reveal", async () => {
      const mockTurnData = { turn_state: "Playing" };
      
      const { result, rerender } = renderHook(
        ({ timer }) =>
          useSecretActions(
            mockHttpService,
            gameId,
            myPlayerId,
            mockFetchGameData,
            timer,
            vi.fn(),
            mockTurnData
          ),
        { initialProps: { timer: 1 } }
      );

      const playerId = 5;
      mockHttpService.addCardToSet.mockResolvedValue({ timer: 1 });
      mockHttpService.forcePlayerReveal.mockResolvedValue({ success: true });

      // Establecer pendingAriadneReveal
      await act(async () => {
        await result.current.handleCardAriadneOliver(playerId, 101, 42);
      });

      // Verificar que pendingAriadneReveal está establecido
      expect(result.current.pendingAriadneReveal).toEqual({ playerId: 5 });

      // Cambiar el timer a 0 para ejecutar el reveal
      await act(async () => {
        rerender({ timer: 0 });
      });

      // Verificar que pendingAriadneReveal se limpió
      expect(result.current.pendingAriadneReveal).toBeNull();
    });

    it("maneja errores al ejecutar forcePlayerReveal", async () => {
      const mockTurnData = { turn_state: "Playing" };
      
      const { result, rerender } = renderHook(
        ({ timer }) =>
          useSecretActions(
            mockHttpService,
            gameId,
            myPlayerId,
            mockFetchGameData,
            timer,
            vi.fn(),
            mockTurnData
          ),
        { initialProps: { timer: 1 } }
      );

      const playerId = 5;
      const testError = new Error("Reveal failed");
      
      mockHttpService.addCardToSet.mockResolvedValue({ timer: 1 });
      mockHttpService.forcePlayerReveal.mockRejectedValue(testError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Establecer pendingAriadneReveal
      await act(async () => {
        await result.current.handleCardAriadneOliver(playerId, 101, 42);
      });

      // Cambiar el timer a 0 para disparar el error
      await act(async () => {
        rerender({ timer: 0 });
      });

      // Verificar que se manejó el error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Error al revelar secreto después de Ariadne Oliver:",
        testError
      );

      // Verificar que pendingAriadneReveal se limpió a pesar del error
      expect(result.current.pendingAriadneReveal).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it("ejecuta forcePlayerReveal con el playerId correcto del pendingAriadneReveal", async () => {
      const mockTurnData = { turn_state: "Playing" };
      
      const { result, rerender } = renderHook(
        ({ timer }) =>
          useSecretActions(
            mockHttpService,
            gameId,
            myPlayerId,
            mockFetchGameData,
            timer,
            vi.fn(),
            mockTurnData
          ),
        { initialProps: { timer: 1 } }
      );

      const targetPlayerId = 99; // ID específico para verificar
      mockHttpService.addCardToSet.mockResolvedValue({ timer: 1 });
      mockHttpService.forcePlayerReveal.mockResolvedValue({ success: true });

      // Establecer pendingAriadneReveal con playerId específico
      await act(async () => {
        await result.current.handleCardAriadneOliver(targetPlayerId, 101, 42);
      });

      // Cambiar el timer a 0
      await act(async () => {
        rerender({ timer: 0 });
      });

      // Verificar que forcePlayerReveal se llamó con el playerId correcto
      expect(mockHttpService.forcePlayerReveal).toHaveBeenCalledWith({
        gameId,
        playerId: targetPlayerId,
      });
    });
  });
});
