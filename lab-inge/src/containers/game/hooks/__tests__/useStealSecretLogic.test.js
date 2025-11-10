import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStealSecretLogic } from "../useStealSecretLogic";

describe("useStealSecretLogic hook", () => {
  let mockHttpService;
  let mockFetchGameData;
  let mockSetSelectedPlayer;
  let mockSetSelectionAction;
  let mockSetStolenPlayer;
  let mockSetPrevData;

  beforeEach(() => {
    mockHttpService = {
      stealSecret: vi.fn().mockResolvedValue({ success: true }),
      hideSecret: vi.fn().mockResolvedValue({ success: true }),
    };
    mockFetchGameData = vi.fn().mockResolvedValue();
    mockSetSelectedPlayer = vi.fn();
    mockSetSelectionAction = vi.fn();
    mockSetStolenPlayer = vi.fn();
    mockSetPrevData = vi.fn();
  });

  it("no hace nada si prevData es null", () => {
    const { result } = renderHook(() =>
      useStealSecretLogic(
        { players: [] },
        null, // prevData null
        "123",
        "specials",
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    expect(mockHttpService.stealSecret).not.toHaveBeenCalled();
  });

  it("no hace nada si turnData es null", () => {
    const { result } = renderHook(() =>
      useStealSecretLogic(
        null, // turnData null
        { players: [] },
        "123",
        "specials",
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    expect(mockHttpService.stealSecret).not.toHaveBeenCalled();
  });

  it("no hace nada si stolenPlayer es null", () => {
    const { result } = renderHook(() =>
      useStealSecretLogic(
        { players: [] },
        { players: [] },
        null, // stolenPlayer null
        "specials",
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    expect(mockHttpService.stealSecret).not.toHaveBeenCalled();
  });

  it("no hace nada si selectionAction no es 'specials'", () => {
    const { result } = renderHook(() =>
      useStealSecretLogic(
        { players: [] },
        { players: [] },
        "123",
        "other", // no es 'specials'
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    expect(mockHttpService.stealSecret).not.toHaveBeenCalled();
  });

  it("no hace nada si selectionAction es 'SPECIALS' en mayúsculas (debería funcionar por toLowerCase)", async () => {
    const stolenPlayerId = 5;
    const prevData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: 1, revealed: false, secret_type: "normal" },
          ],
        },
      ],
    };

    const turnData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: 1, revealed: true, secret_type: "normal" },
          ],
        },
      ],
    };

    renderHook(() =>
      useStealSecretLogic(
        turnData,
        prevData,
        String(stolenPlayerId),
        "SPECIALS", // en mayúsculas
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    await waitFor(() => {
      expect(mockHttpService.stealSecret).toHaveBeenCalled();
    });
  });

  it("no hace nada si previousPlayerData no se encuentra", () => {
    const turnData = {
      players: [{ id: 999, playerSecrets: [] }],
    };

    const prevData = {
      players: [{ id: 888, playerSecrets: [] }],
    };

    renderHook(() =>
      useStealSecretLogic(
        turnData,
        prevData,
        "123", // jugador que no existe
        "specials",
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    expect(mockHttpService.stealSecret).not.toHaveBeenCalled();
  });

  it("no hace nada si currentPlayerData no se encuentra", () => {
    const prevData = {
      players: [{ id: 5, playerSecrets: [] }],
    };

    const turnData = {
      players: [{ id: 999, playerSecrets: [] }],
    };

    renderHook(() =>
      useStealSecretLogic(
        turnData,
        prevData,
        "5",
        "specials",
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    expect(mockHttpService.stealSecret).not.toHaveBeenCalled();
  });

  it("roba un secreto normal cuando cambia de oculto a revelado", async () => {
    const stolenPlayerId = 5;
    const secretId = 1;
    const gameId = 1;
    const myPlayerId = 2;

    const prevData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: secretId, revealed: false, secret_type: "normal" },
          ],
        },
      ],
    };

    const turnData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: secretId, revealed: true, secret_type: "normal" },
          ],
        },
      ],
    };

    renderHook(() =>
      useStealSecretLogic(
        turnData,
        prevData,
        String(stolenPlayerId),
        "specials",
        gameId,
        myPlayerId,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    await waitFor(() => {
      expect(mockSetPrevData).toHaveBeenCalledWith(null);
    });

    await waitFor(() => {
      expect(mockHttpService.stealSecret).toHaveBeenCalledWith({
        gameId,
        secretId,
        fromPlayerId: String(stolenPlayerId),
        toPlayerId: myPlayerId,
      });
    });

    await waitFor(() => {
      expect(mockHttpService.hideSecret).toHaveBeenCalledWith({
        gameId,
        playerId: myPlayerId,
        secretId,
      });
    });

    await waitFor(() => {
      expect(mockFetchGameData).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockSetSelectedPlayer).toHaveBeenCalledWith(null);
      expect(mockSetSelectionAction).toHaveBeenCalledWith(null);
      expect(mockSetStolenPlayer).toHaveBeenCalledWith(null);
    });
  });

  it("no roba un secreto si el secret_type no es 'normal'", async () => {
    const stolenPlayerId = 5;
    const secretId = 1;

    const prevData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: secretId, revealed: false, secret_type: "special" },
          ],
        },
      ],
    };

    const turnData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: secretId, revealed: true, secret_type: "special" },
          ],
        },
      ],
    };

    renderHook(() =>
      useStealSecretLogic(
        turnData,
        prevData,
        String(stolenPlayerId),
        "specials",
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    await waitFor(() => {
      expect(mockSetPrevData).toHaveBeenCalledWith(null);
    });

    // No debería robar el secreto
    expect(mockHttpService.stealSecret).not.toHaveBeenCalled();
    expect(mockHttpService.hideSecret).not.toHaveBeenCalled();
  });

  it("no roba secreto si ya estaba revelado previamente", () => {
    const stolenPlayerId = 5;
    const secretId = 1;

    const prevData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: secretId, revealed: true, secret_type: "normal" }, // ya revelado
          ],
        },
      ],
    };

    const turnData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: secretId, revealed: true, secret_type: "normal" },
          ],
        },
      ],
    };

    renderHook(() =>
      useStealSecretLogic(
        turnData,
        prevData,
        String(stolenPlayerId),
        "specials",
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    expect(mockHttpService.stealSecret).not.toHaveBeenCalled();
  });

  it("maneja errores al robar secreto y limpia estados", async () => {
    const stolenPlayerId = 5;
    const secretId = 1;
    const error = new Error("Network error");

    mockHttpService.stealSecret.mockRejectedValue(error);

    const prevData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: secretId, revealed: false, secret_type: "normal" },
          ],
        },
      ],
    };

    const turnData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: secretId, revealed: true, secret_type: "normal" },
          ],
        },
      ],
    };

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderHook(() =>
      useStealSecretLogic(
        turnData,
        prevData,
        String(stolenPlayerId),
        "specials",
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ ERROR al robar secreto:",
        error
      );
    });

    await waitFor(() => {
      expect(mockSetStolenPlayer).toHaveBeenCalledWith(null);
      expect(mockSetSelectionAction).toHaveBeenCalledWith(null);
    });

    consoleErrorSpy.mockRestore();
  });

  it("encuentra el secreto correcto cuando hay múltiples secretos", async () => {
    const stolenPlayerId = 5;
    const secretIdToSteal = 2;

    const prevData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: 1, revealed: true, secret_type: "normal" },
            { secret_id: secretIdToSteal, revealed: false, secret_type: "normal" },
            { secret_id: 3, revealed: false, secret_type: "normal" },
          ],
        },
      ],
    };

    const turnData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: 1, revealed: true, secret_type: "normal" },
            { secret_id: secretIdToSteal, revealed: true, secret_type: "normal" }, // este cambió
            { secret_id: 3, revealed: false, secret_type: "normal" },
          ],
        },
      ],
    };

    renderHook(() =>
      useStealSecretLogic(
        turnData,
        prevData,
        String(stolenPlayerId),
        "specials",
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    await waitFor(() => {
      expect(mockHttpService.stealSecret).toHaveBeenCalledWith(
        expect.objectContaining({
          secretId: secretIdToSteal,
        })
      );
    });
  });

  it("maneja secreto con secret_type en mayúsculas 'NORMAL'", async () => {
    const stolenPlayerId = 5;
    const secretId = 1;

    const prevData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: secretId, revealed: false, secret_type: "NORMAL" }, // mayúsculas
          ],
        },
      ],
    };

    const turnData = {
      players: [
        {
          id: stolenPlayerId,
          playerSecrets: [
            { secret_id: secretId, revealed: true, secret_type: "NORMAL" },
          ],
        },
      ],
    };

    renderHook(() =>
      useStealSecretLogic(
        turnData,
        prevData,
        String(stolenPlayerId),
        "specials",
        1,
        2,
        mockHttpService,
        mockFetchGameData,
        mockSetSelectedPlayer,
        mockSetSelectionAction,
        mockSetStolenPlayer,
        mockSetPrevData
      )
    );

    await waitFor(() => {
      expect(mockHttpService.stealSecret).toHaveBeenCalled();
    });
  });
});
