import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useTurnMessages } from "../useTurnMessages";

describe("useTurnMessages Hook", () => {
  const myPlayerId = 2;
  const orderedPlayers = [
    { id: 1, name: "Player1" },
    { id: 2, name: "Player2" },
    { id: 3, name: "Player3" },
  ];

  beforeEach(() => {
    console.error = vi.fn();
    console.log = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Turn State Messages", () => {
    it("should show message when it's player's turn (None state)", () => {
      const turnData = {
        turn_owner_id: myPlayerId,
        turn_state: "None",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe(
        "¡Es tu turno! Jugá un set o una carta de evento. Si no querés realizar ninguna acción tenés que descartar al menos una carta."
      );
    });

    it("should show message for Playing state", () => {
      const turnData = {
        turn_owner_id: myPlayerId,
        turn_state: "Playing",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe(
        "Seguí las indicaciones para continuar el turno."
      );
    });

    it("should show message for Waiting state", () => {
      const turnData = {
        turn_owner_id: myPlayerId,
        turn_state: "Waiting",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe("Esperá para continuar tu turno.");
    });

    it("should show message for Discarding state", () => {
      const turnData = {
        turn_owner_id: myPlayerId,
        turn_state: "Discarding",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe("Podés reponer o seguir descartando.");
    });

    it("should show message for Replenish state", () => {
      const turnData = {
        turn_owner_id: myPlayerId,
        turn_state: "Replenish",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe(
        "Debés tener seis cartas en mano para terminar el turno."
      );
    });

    it("should show message for Complete state", () => {
      const turnData = {
        turn_owner_id: myPlayerId,
        turn_state: "Complete",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe("Siguiente turno...");
    });

    it("should show empty message for unknown state", () => {
      const turnData = {
        turn_owner_id: myPlayerId,
        turn_state: "UnknownState",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe(" ");
    });
  });

  describe("Other Player's Turn", () => {
    it("should show other player's name when it's their turn", () => {
      const turnData = {
        turn_owner_id: 1,
        turn_state: "None",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe("Player1 está jugando su turno.");
    });

    it("should show 'Jugador' when player not found", () => {
      const turnData = {
        turn_owner_id: 999, // Non-existent player
        turn_state: "None",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe("Jugador está jugando su turno.");
    });

    it("should show 'Jugador' when orderedPlayers is empty", () => {
      const turnData = {
        turn_owner_id: 1,
        turn_state: "None",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, [])
      );

      expect(result.current.message).toBe("Jugador está jugando su turno.");
    });
  });

  describe("getPlayerNameById", () => {
    it("should return correct player name by ID", () => {
      const turnData = {
        turn_owner_id: myPlayerId,
        turn_state: "None",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.getPlayerNameById(1)).toBe("Player1");
      expect(result.current.getPlayerNameById(2)).toBe("Player2");
      expect(result.current.getPlayerNameById(3)).toBe("Player3");
    });

    it("should return 'Jugador' for non-existent player", () => {
      const turnData = {
        turn_owner_id: myPlayerId,
        turn_state: "None",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, orderedPlayers)
      );

      expect(result.current.getPlayerNameById(999)).toBe("Jugador");
    });

    it("should handle null orderedPlayers", () => {
      const turnData = {
        turn_owner_id: myPlayerId,
        turn_state: "None",
      };

      const { result } = renderHook(() =>
        useTurnMessages(turnData, myPlayerId, null)
      );

      expect(result.current.getPlayerNameById(1)).toBe("Jugador");
    });
  });

  describe("Message Updates", () => {
    it("should update message when turnData changes", async () => {
      const { result, rerender } = renderHook(
        ({ turnData }) => useTurnMessages(turnData, myPlayerId, orderedPlayers),
        {
          initialProps: {
            turnData: {
              turn_owner_id: myPlayerId,
              turn_state: "None",
            },
          },
        }
      );

      expect(result.current.message).toContain("¡Es tu turno!");

      rerender({
        turnData: {
          turn_owner_id: myPlayerId,
          turn_state: "Playing",
        },
      });

      await waitFor(() => {
        expect(result.current.message).toBe(
          "Seguí las indicaciones para continuar el turno."
        );
      });
    });

    it("should update message when turn owner changes", async () => {
      const { result, rerender } = renderHook(
        ({ turnData }) => useTurnMessages(turnData, myPlayerId, orderedPlayers),
        {
          initialProps: {
            turnData: {
              turn_owner_id: myPlayerId,
              turn_state: "None",
            },
          },
        }
      );

      expect(result.current.message).toContain("¡Es tu turno!");

      rerender({
        turnData: {
          turn_owner_id: 3,
          turn_state: "None",
        },
      });

      await waitFor(() => {
        expect(result.current.message).toBe("Player3 está jugando su turno.");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle null turnData", () => {
      const { result } = renderHook(() =>
        useTurnMessages(null, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe(" ");
    });

    it("should handle undefined turnData", () => {
      const { result } = renderHook(() =>
        useTurnMessages(undefined, myPlayerId, orderedPlayers)
      );

      expect(result.current.message).toBe(" ");
    });
  });
});
