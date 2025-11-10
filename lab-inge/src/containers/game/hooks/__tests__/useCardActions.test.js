import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCardActions } from "../useCardActions";

describe("useCardActions - Another Victim card fix", () => {
  let mockHttpService;
  let mockSetSelectionMode;
  let mockSetSelectionAction;
  let mockSetPlayerData;
  let mockSetTurnData;
  let mockFetchGameData;
  let mockSetPlayedActionCard;
  let mockStartDiscardTop5Action;
  let mockSetTimer;

  const mockGameId = 1;
  const mockMyPlayerId = 2;

  beforeEach(() => {
    mockHttpService = {
      playEvent: vi.fn(),
      playSets: vi.fn(),
      discardCard: vi.fn(),
      updateHand: vi.fn(),
      playNotSoFast: vi.fn(),
      addCardToSet: vi.fn(),
    };

    mockSetSelectionMode = vi.fn();
    mockSetSelectionAction = vi.fn();
    mockSetPlayerData = vi.fn();
    mockSetTurnData = vi.fn();
    mockFetchGameData = vi.fn();
    mockSetPlayedActionCard = vi.fn();
    mockStartDiscardTop5Action = vi.fn();
    mockSetTimer = vi.fn();
  });

  it("establece AMBOS selectionMode='select-set' Y selectionAction='another' para Another Victim", async () => {
    // Este test verifica el fix del bug donde Another Victim solo establecía selectionMode
    // pero NO selectionAction, causando que no se pudiera robar el set seleccionado
    
    const mockPlayerData = {
      id: mockMyPlayerId,
      playerCards: [
        { card_id: 1, card_name: "Another victim", type: "Event", image_name: "another_victim" },
      ],
    };

    const mockTurnData = {
      gameId: mockGameId,
      turn_owner_id: mockMyPlayerId,
      turn_state: "None",
      players: [{ id: mockMyPlayerId, in_disgrace: false }],
    };

    mockHttpService.playEvent.mockResolvedValue({
      timer: 30,
      cardName: "Another victim",
    });

    // Renderizar con timer inicial = 30
    const { result, rerender } = renderHook(
      ({ timer, turnData }) =>
        useCardActions(
          mockHttpService,
          mockGameId,
          mockMyPlayerId,
          turnData,
          mockPlayerData,
          mockSetPlayerData,
          mockSetTurnData,
          mockFetchGameData,
          null,
          mockSetPlayedActionCard,
          mockSetSelectionMode,
          mockSetSelectionAction,
          mockStartDiscardTop5Action,
          timer,
          mockSetTimer
        ),
      {
        initialProps: {
          timer: 30,
          turnData: mockTurnData,
        },
      }
    );

    // Simular drag and drop de Another Victim a play-card-zone
    const dragEvent = {
      active: {
        data: {
          current: {
            cardId: 1,
            cardName: "Another victim",
            imageName: "another_victim",
          },
        },
      },
      over: {
        id: "play-card-zone",
      },
    };

    await result.current.handleDragEnd(dragEvent);

    // Verificar que se llamó al backend
    expect(mockHttpService.playEvent).toHaveBeenCalledWith(
      mockGameId,
      mockMyPlayerId,
      1,
      "Another victim"
    );

    // Cambiar timer a 0 y turn_state a "Playing" para ejecutar pendingEffect
    rerender({
      timer: 0,
      turnData: { ...mockTurnData, turn_state: "Playing" },
    });

    // Esperar a que se ejecute el pendingEffect
    // CRÍTICO: Debe establecer AMBOS para que funcione el robo de set
    await waitFor(() => {
      expect(mockSetSelectionMode).toHaveBeenCalledWith("select-set");
      expect(mockSetSelectionAction).toHaveBeenCalledWith("another");
    });
  });
});

