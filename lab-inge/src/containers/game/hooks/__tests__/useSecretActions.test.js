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

    it("llama a forcePlayerReveal después de agregar la carta", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      const playerId = 5;
      const setId = 101;
      const cardId = 42;

      await act(async () => {
        await result.current.handleCardAriadneOliver(playerId, setId, cardId);
      });

      expect(mockHttpService.forcePlayerReveal).toHaveBeenCalledWith({
        gameId,
        playerId
      });
    });

    it("llama a fetchGameData dos veces (antes y después de forceReveal)", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      const playerId = 5;
      const setId = 101;
      const cardId = 42;

      await act(async () => {
        await result.current.handleCardAriadneOliver(playerId, setId, cardId);
      });

      expect(mockFetchGameData).toHaveBeenCalledTimes(2);
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

    it("espera 100ms entre addCardToSet y forcePlayerReveal", async () => {
      const { result } = renderHook(() =>
        useSecretActions(mockHttpService, gameId, myPlayerId, mockFetchGameData)
      );

      const startTime = Date.now();

      await act(async () => {
        await result.current.handleCardAriadneOliver(5, 101, 42);
      });

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      // Debe haber esperado al menos 100ms
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });
});
