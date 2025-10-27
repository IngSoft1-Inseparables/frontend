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

  describe("Event Cards - Paddington and Delay", () => {
    const mockSetSelectionAction = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    describe("Paddington Card (Early train to paddington)", () => {
      it("should show message with count when paddington is played with valid count", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "paddington",
            mockSetSelectionAction,
            5 // movedCardsCount
          )
        );

        expect(result.current.message).toBe(
          "Se han movido 5 cartas del mazo de robo al mazo de descarte. Ahora podés reponer o seguir descartando."
        );
      });

      it("should use singular form when only 1 card is moved for paddington", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "paddington",
            mockSetSelectionAction,
            1 // movedCardsCount = 1
          )
        );

        expect(result.current.message).toBe(
          "Se ha movido 1 carta del mazo de robo al mazo de descarte. Ahora podés reponer o seguir descartando."
        );
      });

      it("should show fallback message when no cards to move for paddington", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "paddington",
            mockSetSelectionAction,
            0 // movedCardsCount = 0
          )
        );

        expect(result.current.message).toBe(
          "Se han movido cartas del mazo de robo al mazo de descarte. Ahora podés reponer o seguir descartando."
        );
      });

      it("should clear selectionAction after 4500ms for paddington", async () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "paddington",
            mockSetSelectionAction,
            5
          )
        );

        expect(mockSetSelectionAction).not.toHaveBeenCalled();

        vi.advanceTimersByTime(4500);

        expect(mockSetSelectionAction).toHaveBeenCalledWith(null);
        expect(mockSetSelectionAction).toHaveBeenCalledTimes(1);
      });
    });

    describe("Delay Card (Delay the murderer's escape!)", () => {
      it("should show message with count when delay is played with valid count", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "delay",
            mockSetSelectionAction,
            5 // movedCardsCount
          )
        );

        expect(result.current.message).toBe(
          "Se han movido 5 cartas del mazo de descarte al mazo de robo. Ahora podés reponer o seguir descartando."
        );
      });

      it("should use singular form when only 1 card is moved for delay", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "delay",
            mockSetSelectionAction,
            1 // movedCardsCount = 1
          )
        );

        expect(result.current.message).toBe(
          "Se ha movido 1 carta del mazo de descarte al mazo de robo. Ahora podés reponer o seguir descartando."
        );
      });

      it("should show fallback message when no cards to move for delay", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "delay",
            mockSetSelectionAction,
            0 // movedCardsCount = 0
          )
        );

        expect(result.current.message).toBe(
          "Se han movido cartas del mazo de descarte al mazo de robo. Ahora podés reponer o seguir descartando."
        );
      });

      it("should clear selectionAction after 4500ms for delay", async () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "delay",
            mockSetSelectionAction,
            5
          )
        );

        expect(mockSetSelectionAction).not.toHaveBeenCalled();

        vi.advanceTimersByTime(4500);

        expect(mockSetSelectionAction).toHaveBeenCalledWith(null);
        expect(mockSetSelectionAction).toHaveBeenCalledTimes(1);
      });
    });

    describe("Multiple card counts", () => {
      it("should handle 3 cards moved for paddington", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "paddington",
            mockSetSelectionAction,
            3
          )
        );

        expect(result.current.message).toContain("Se han movido 3 cartas");
      });

      it("should handle 6 cards moved for paddington", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "paddington",
            mockSetSelectionAction,
            6
          )
        );

        expect(result.current.message).toContain("Se han movido 6 cartas");
      });

      it("should handle 2 cards moved for delay", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "delay",
            mockSetSelectionAction,
            2
          )
        );

        expect(result.current.message).toContain("Se han movido 2 cartas");
      });
    });

    describe("Without selectionAction in Discarding state", () => {
      it("should show default discarding message when no selectionAction", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            null, // no selectionAction
            mockSetSelectionAction,
            0
          )
        );

        expect(result.current.message).toBe(
          "Podés reponer o seguir descartando."
        );
      });

      it("should show default message when selectionAction is different", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            "other_action",
            mockSetSelectionAction,
            5
          )
        );

        expect(result.current.message).toBe(
          "Podés reponer o seguir descartando."
        );
      });
    });

    describe("Object format selectionAction (WebSocket-based)", () => {
      it("should handle selectionAction as object with paddington-discarded type", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const selectionActionObject = {
          type: "paddington-discarded",
          movedCount: 6
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            selectionActionObject,
            mockSetSelectionAction,
            null // movedCardsCount should be ignored, uses object's movedCount
          )
        );

        expect(result.current.message).toBe(
          "Se han movido 6 cartas del mazo de robo al mazo de descarte. Ahora podés reponer o seguir descartando."
        );
      });

      it("should handle selectionAction as object with paddington-discarded type and 1 card", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const selectionActionObject = {
          type: "paddington-discarded",
          movedCount: 1
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            selectionActionObject,
            mockSetSelectionAction,
            null
          )
        );

        expect(result.current.message).toBe(
          "Se ha movido 1 carta del mazo de robo al mazo de descarte. Ahora podés reponer o seguir descartando."
        );
      });

      it("should handle selectionAction as object with paddington-discarded type and 0 cards", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const selectionActionObject = {
          type: "paddington-discarded",
          movedCount: 0
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            selectionActionObject,
            mockSetSelectionAction,
            null
          )
        );

        expect(result.current.message).toBe(
          "Se han movido cartas del mazo de robo al mazo de descarte. Ahora podés reponer o seguir descartando."
        );
      });

      it("should prioritize movedCount from object over movedCardsCount parameter", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const selectionActionObject = {
          type: "paddington-discarded",
          movedCount: 4
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            selectionActionObject,
            mockSetSelectionAction,
            99 // This should be ignored
          )
        );

        // Should use 4 from object, not 99 from parameter
        expect(result.current.message).toBe(
          "Se han movido 4 cartas del mazo de robo al mazo de descarte. Ahora podés reponer o seguir descartando."
        );
      });

      it("should clear selectionAction after 4500ms for object format paddington", async () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const selectionActionObject = {
          type: "paddington-discarded",
          movedCount: 5
        };

        renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            selectionActionObject,
            mockSetSelectionAction,
            null
          )
        );

        expect(mockSetSelectionAction).not.toHaveBeenCalled();

        vi.advanceTimersByTime(4500);

        expect(mockSetSelectionAction).toHaveBeenCalledWith(null);
        expect(mockSetSelectionAction).toHaveBeenCalledTimes(1);
      });

      it("should handle mixed string and object selectionAction formats", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        // Test with string format first
        const { result, rerender } = renderHook(
          ({ selectionAction, movedCardsCount }) =>
            useTurnMessages(
              turnData,
              myPlayerId,
              orderedPlayers,
              selectionAction,
              mockSetSelectionAction,
              movedCardsCount
            ),
          {
            initialProps: {
              selectionAction: "paddington",
              movedCardsCount: 3
            }
          }
        );

        expect(result.current.message).toContain("Se han movido 3 cartas");

        // Now test with object format
        rerender({
          selectionAction: { type: "paddington-discarded", movedCount: 6 },
          movedCardsCount: null
        });

        expect(result.current.message).toContain("Se han movido 6 cartas");
      });

      it("should handle object without movedCount property", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        const selectionActionObject = {
          type: "paddington-discarded"
          // movedCount is undefined
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            selectionActionObject,
            mockSetSelectionAction,
            5 // Fallback to movedCardsCount
          )
        );

        // Cuando movedCount es undefined en el objeto, effectiveMovedCount será undefined,
        // por lo que muestra el mensaje fallback sin número
        expect(result.current.message).toBe(
          "Se han movido cartas del mazo de robo al mazo de descarte. Ahora podés reponer o seguir descartando."
        );
      });

      it("should handle delay type with object format", () => {
        const turnData = {
          turn_owner_id: myPlayerId,
          turn_state: "Discarding",
        };

        // El código actual verifica selectionAction === "delay" (no actionType)
        // Por lo que si pasamos un objeto, no coincidirá y mostrará el mensaje default
        const selectionActionObject = {
          type: "delay",
          movedCount: 5
        };

        const { result } = renderHook(() =>
          useTurnMessages(
            turnData,
            myPlayerId,
            orderedPlayers,
            selectionActionObject,
            mockSetSelectionAction,
            null
          )
        );

        // El código actual solo reconoce delay como string, no como objeto.type
        // Por lo tanto muestra el mensaje default de Discarding
        expect(result.current.message).toBe(
          "Podés reponer o seguir descartando."
        );
      });
    });
  });
});
