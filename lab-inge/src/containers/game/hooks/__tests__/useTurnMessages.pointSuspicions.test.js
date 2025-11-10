import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTurnMessages } from "../useTurnMessages";

describe("useTurnMessages - Point Your Suspicions", () => {
  let mockSetSelectionAction;
  const mockOrderedPlayers = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];

  beforeEach(() => {
    mockSetSelectionAction = vi.fn();
  });

  describe("Voting phase messages", () => {
    it("shows voting message during Playing state when not my turn", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 2, // Not my turn
            turn_state: "Playing",
            event_card_played: {
              card_name: "Point Your Suspicions",
            },
          },
          1, // My player ID
          mockOrderedPlayers,
          null,
          mockSetSelectionAction,
          0, // movedCardsCount
          0, // timer
          "select-other-player" // selectionMode
        )
      );

      // Cuando NO es mi turno pero está en Playing con selectionMode, muestra mensaje de votación
      expect(result.current.message).toBe("Votá al jugador de quien sospechás.");
    });

    it("shows voting message during Playing state when it's my turn", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 2, // My turn
            turn_state: "Playing",
            event_card_played: {
              card_name: "Point Your Suspicions",
            },
          },
          2, // myPlayerId
          mockOrderedPlayers,
          null,
          mockSetSelectionAction,
          0, // movedCardsCount
          0, // timer
          "select-other-player" // selectionMode
        )
      );

      // Cuando es mi turno en Playing con selectionMode, muestra mensaje de votación
      expect(result.current.message).toBe("Votá al jugador de quien sospechás.");
    });

    it("does not show voting message if no Point Your Suspicions card is played", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 1,
            turn_state: "Playing",
            event_card_played: null,
          },
          2,
          mockOrderedPlayers,
          null,
          mockSetSelectionAction
        )
      );

      // Sin event card, mensaje genérico
      expect(result.current.message).toBe("Alice jugó un set bajado.");
    });
  });

  describe("Waiting state messages", () => {
    it("shows generic waiting message when not my turn in Waiting state without event card", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 2, // Not my turn (Bob's turn)
            turn_state: "Waiting",
            event_card_played: null,
          },
          1, // My player ID (Alice)
          mockOrderedPlayers,
          null,
          mockSetSelectionAction,
          0, // movedCardsCount
          0, // timer
          null, // selectionMode
          null  // playerData
        )
      );

      // Cuando NO es mi turno en Waiting, no muestra mensaje
      expect(result.current.message).toBe(" ");
    });

    it("shows generic message when not my turn even with Point Your Suspicions in Waiting", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 1, // Not my turn (Alice's turn)
            turn_state: "Waiting",
            event_card_played: {
              card_name: "Point Your Suspicions",
            },
          },
          2, // myPlayerId (Bob)
          mockOrderedPlayers,
          null,
          mockSetSelectionAction,
          0, // movedCardsCount
          0, // timer
          null, // selectionMode
          null  // playerData
        )
      );

      // Cuando NO es mi turno en Waiting, no muestra mensaje
      expect(result.current.message).toBe(" ");
    });

    it("shows waiting message when it's my turn in Waiting state", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 2, // My turn
            turn_state: "Waiting",
            event_card_played: {
              card_name: "Point Your Suspicions",
            },
          },
          2, // myPlayerId
          mockOrderedPlayers,
          null,
          mockSetSelectionAction
        )
      );

      // Cuando ES mi turno en Waiting, mensaje de espera
      expect(result.current.message).toBe("Esperá para continuar tu turno.");
    });
  });

  describe("Card name case sensitivity", () => {
    it("handles Point Your Suspicions with different casing", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 1,
            turn_state: "Playing",
            event_card_played: {
              card_name: "POINT YOUR SUSPICIONS",
            },
          },
          2,
          mockOrderedPlayers,
          null,
          mockSetSelectionAction,
          0,
          0,
          "select-other-player"
        )
      );

      expect(result.current.message).toBe(
        "Votá al jugador de quien sospechás."
      );
    });

    it("handles point your suspicions in lowercase", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 1,
            turn_state: "Playing",
            event_card_played: {
              card_name: "point your suspicions",
            },
          },
          2,
          mockOrderedPlayers,
          null,
          mockSetSelectionAction,
          0,
          0,
          "select-other-player"
        )
      );

      expect(result.current.message).toBe(
        "Votá al jugador de quien sospechás."
      );
    });

    it("handles mixed case variations", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 1,
            turn_state: "Playing",
            event_card_played: {
              card_name: "PoInT yOuR sUsPiCiOnS",
            },
          },
          2,
          mockOrderedPlayers,
          null,
          mockSetSelectionAction,
          0,
          0,
          "select-other-player"
        )
      );

      expect(result.current.message).toBe(
        "Votá al jugador de quien sospechás."
      );
    });
  });

  describe("Message priority", () => {
    it("shows Point Your Suspicions message over regular turn message", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 1,
            turn_state: "Playing",
            event_card_played: {
              card_name: "Point Your Suspicions",
            },
          },
          2,
          mockOrderedPlayers,
          null,
          mockSetSelectionAction,
          0,
          0,
          "select-other-player"
        )
      );

      // Point Your Suspicions tiene prioridad sobre mensaje genérico
      expect(result.current.message).not.toBe("Alice jugó Point Your Suspicions.");
      expect(result.current.message).toBe("Votá al jugador de quien sospechás.");
    });

    it("returns to normal message when Point Your Suspicions is cleared", () => {
      const { result } = renderHook(() =>
        useTurnMessages(
          {
            turn_owner_id: 1,
            turn_state: "Playing",
            event_card_played: null,
          },
          2,
          mockOrderedPlayers,
          null,
          mockSetSelectionAction
        )
      );

      // Sin Point Your Suspicions, vuelve a mensaje normal
      expect(result.current.message).toBe("Alice jugó un set bajado.");
    });
  });
});
