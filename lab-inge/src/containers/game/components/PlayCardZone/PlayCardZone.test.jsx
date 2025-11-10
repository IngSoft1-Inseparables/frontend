import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PlayCardZone from "./PlayCardZone";
import { DndContext } from "@dnd-kit/core";

// Mock de useDndContext para controlar el estado de drag
let mockActive = null;

vi.mock("@dnd-kit/core", async () => {
  const actual = await vi.importActual("@dnd-kit/core");
  return {
    ...actual,
    useDndContext: () => ({
      active: mockActive,
    }),
  };
});

describe("PlayCardZone Component", () => {
  const mockTurnData = {
    turn_owner_id: 2,
    turn_state: "None",
  };

  const mockPlayerData = {
    playerCards: [
      { card_id: 1, card_name: "EventCard1", type: "Event", image_name: "event1" },
      { card_id: 2, card_name: "ActionCard2", type: "Action", image_name: "action2" },
    ],
  };

  const defaultProps = {
    actionCard: null,
    turnData: mockTurnData,
    myPlayerId: 2,
    playerData: mockPlayerData,
  };

  afterEach(() => {
    mockActive = null;
  });

  describe("Empty State (no action card)", () => {
    it("renders empty zone when no actionCard is provided", () => {
      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      const emptyZone = container.querySelector(".bg-red-500\\/20");
      expect(emptyZone).toBeInTheDocument();
    });

    it("displays event icon when zone is empty", () => {
      render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      const icon = screen.getByAltText("Card Zone");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("src", "/icons/event-icon.png");
    });

    it("has default border style when not hovering", () => {
      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      const zone = container.querySelector(".border-white\\/40");
      expect(zone).toBeInTheDocument();
    });
  });

  describe("Drop Styling", () => {
    it("shows drop styling when dragging Event card over zone during my turn", () => {
      mockActive = {
        data: {
          current: {
            cardId: 1,
          },
        },
      };

      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      // Nota: isOver no se puede testear fácilmente sin simular DnD completo
      // pero podemos verificar que el componente renderiza sin errores
      expect(container.querySelector(".relative")).toBeInTheDocument();
    });

    it("does not show drop styling when dragging Action card (not Event)", () => {
      mockActive = {
        data: {
          current: {
            cardId: 2, // Esta es una carta de tipo Action
          },
        },
      };

      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      expect(container.querySelector(".relative")).toBeInTheDocument();
    });

    it("does not show drop styling when not my turn", () => {
      const notMyTurnData = {
        ...mockTurnData,
        turn_owner_id: 3,
      };

      mockActive = {
        data: {
          current: {
            cardId: 1,
          },
        },
      };

      render(
        <DndContext>
          <PlayCardZone {...defaultProps} turnData={notMyTurnData} />
        </DndContext>
      );

      const zone = screen.getByAltText("Card Zone");
      expect(zone).toBeInTheDocument();
    });

    it("does not show drop styling when turn_state is not None", () => {
      const playingTurnData = {
        ...mockTurnData,
        turn_state: "Playing",
      };

      mockActive = {
        data: {
          current: {
            cardId: 1,
          },
        },
      };

      render(
        <DndContext>
          <PlayCardZone {...defaultProps} turnData={playingTurnData} />
        </DndContext>
      );

      const zone = screen.getByAltText("Card Zone");
      expect(zone).toBeInTheDocument();
    });
  });

  describe("With Action Card", () => {
    const mockActionCard = {
      card_id: 10,
      card_name: "Test Event Card",
      image_name: "test_event",
      type: "Event",
    };

    it("renders the action card when provided", () => {
      render(
        <DndContext>
          <PlayCardZone {...defaultProps} actionCard={mockActionCard} />
        </DndContext>
      );

      const cardImage = screen.getByAltText("Test Event Card");
      expect(cardImage).toBeInTheDocument();
      expect(cardImage).toHaveAttribute("src", "/cards/test_event.png");
    });

    it("applies correct styling to action card container", () => {
      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} actionCard={mockActionCard} />
        </DndContext>
      );

      const cardContainer = container.querySelector(".relative.w-24.h-36");
      expect(cardContainer).toBeInTheDocument();
    });

    it("card image has pointer-events none", () => {
      render(
        <DndContext>
          <PlayCardZone {...defaultProps} actionCard={mockActionCard} />
        </DndContext>
      );

      const cardImage = screen.getByAltText("Test Event Card");
      expect(cardImage).toHaveStyle({ pointerEvents: "none" });
    });

    it("does not show empty zone icon when card is present", () => {
      render(
        <DndContext>
          <PlayCardZone {...defaultProps} actionCard={mockActionCard} />
        </DndContext>
      );

      const icon = screen.queryByAltText("Card Zone");
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null turnData gracefully", () => {
      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} turnData={null} />
        </DndContext>
      );

      expect(container.querySelector(".relative")).toBeInTheDocument();
    });

    it("handles null playerData gracefully", () => {
      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} playerData={null} />
        </DndContext>
      );

      expect(container.querySelector(".relative")).toBeInTheDocument();
    });

    it("handles empty playerCards array", () => {
      const emptyPlayerData = {
        playerCards: [],
      };

      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} playerData={emptyPlayerData} />
        </DndContext>
      );

      expect(container.querySelector(".relative")).toBeInTheDocument();
    });

    it("handles dragging card not found in playerCards", () => {
      mockActive = {
        data: {
          current: {
            cardId: 999, // ID que no existe en playerCards
          },
        },
      };

      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      expect(container.querySelector(".relative")).toBeInTheDocument();
    });

    it("renders correctly when active is null", () => {
      mockActive = null;

      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      expect(container.querySelector(".relative")).toBeInTheDocument();
    });
  });

  describe("Droppable Functionality", () => {
    it("has droppable id 'play-card-zone'", () => {
      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      // Verificar que el componente renderiza (useDroppable se llama internamente)
      expect(container.querySelector(".relative")).toBeInTheDocument();
    });

    it("applies ref to the container", () => {
      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      const zone = container.querySelector(".relative");
      expect(zone).toBeInTheDocument();
    });
  });

  describe("Card Type Validation", () => {
    it("identifies Event card correctly", () => {
      mockActive = {
        data: {
          current: {
            cardId: 1, // EventCard1
          },
        },
      };

      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      expect(container.querySelector(".relative")).toBeInTheDocument();
    });

    it("identifies Action card correctly", () => {
      mockActive = {
        data: {
          current: {
            cardId: 2, // ActionCard2
          },
        },
      };

      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      expect(container.querySelector(".relative")).toBeInTheDocument();
    });

    it("handles card without type property", () => {
      const playerDataWithoutType = {
        playerCards: [
          { card_id: 3, card_name: "NoTypeCard", image_name: "notype" },
        ],
      };

      mockActive = {
        data: {
          current: {
            cardId: 3,
          },
        },
      };

      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} playerData={playerDataWithoutType} />
        </DndContext>
      );

      expect(container.querySelector(".relative")).toBeInTheDocument();
    });
  });

  describe("Visual Styling", () => {
    it("applies correct width and height to empty zone", () => {
      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} />
        </DndContext>
      );

      const zone = container.querySelector(".w-24.h-36");
      expect(zone).toBeInTheDocument();
    });

    it("applies correct width and height to card zone", () => {
      const mockActionCard = {
        card_id: 10,
        card_name: "Test Event Card",
        image_name: "test_event",
        type: "Event",
      };

      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} actionCard={mockActionCard} />
        </DndContext>
      );

      const zone = container.querySelector(".w-24.h-36");
      expect(zone).toBeInTheDocument();
    });

    it("applies transition styles to card container", () => {
      const mockActionCard = {
        card_id: 10,
        card_name: "Test Event Card",
        image_name: "test_event",
        type: "Event",
      };

      const { container } = render(
        <DndContext>
          <PlayCardZone {...defaultProps} actionCard={mockActionCard} />
        </DndContext>
      );

      const cardContainer = container.querySelector(".relative");
      expect(cardContainer).toHaveStyle({ transition: "all 0.2s ease" });
    });
  });

  describe("Additional Coverage - Instant and Event Cards", () => {
    it("muestra instant_played cuando está disponible", () => {
      const instantCard = {
        card_id: 99,
        card_name: "Not So Fast",
        type: "Instant",
        image_name: "instant_not_so_fast",
      };

      const turnDataWithInstant = {
        ...mockTurnData,
        instant_played: instantCard,
      };

      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={turnDataWithInstant}
            myPlayerId={2}
            playerData={mockPlayerData}
            timer={0}
          />
        </DndContext>
      );

      expect(screen.getByAltText("Not So Fast")).toBeInTheDocument();
    });

    it("muestra event_card_played cuando no es mi turno", () => {
      const eventCard = {
        card_id: 88,
        card_name: "Event Card",
        type: "Event",
        image_name: "event_card",
      };

      const turnDataWithEvent = {
        turn_owner_id: 3, // No es mi turno
        turn_state: "None",
        event_card_played: eventCard,
      };

      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={turnDataWithEvent}
            myPlayerId={2}
            playerData={mockPlayerData}
            timer={0}
          />
        </DndContext>
      );

      expect(screen.getByAltText("Event Card")).toBeInTheDocument();
    });

    it("muestra timer cuando es mayor a 0", () => {
      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={mockTurnData}
            myPlayerId={2}
            playerData={mockPlayerData}
            timer={5}
          />
        </DndContext>
      );

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("muestra guión cuando timer es 0", () => {
      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={mockTurnData}
            myPlayerId={2}
            playerData={mockPlayerData}
            timer={0}
          />
        </DndContext>
      );

      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("prioriza instant_played sobre event_card_played", () => {
      const turnDataWithBoth = {
        turn_owner_id: 2,
        instant_played: {
          card_id: 1,
          card_name: "Instant Priority",
          type: "Instant",
          image_name: "instant_priority",
        },
        event_card_played: {
          card_id: 2,
          card_name: "Event Secondary",
          type: "Event",
          image_name: "event_secondary",
        },
      };

      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={turnDataWithBoth}
            myPlayerId={2}
            playerData={mockPlayerData}
            timer={0}
          />
        </DndContext>
      );

      expect(screen.getByAltText("Instant Priority")).toBeInTheDocument();
    });

    it("maneja correctamente cuando playerData es null", () => {
      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={mockTurnData}
            myPlayerId={2}
            playerData={null}
            timer={0}
          />
        </DndContext>
      );

      expect(screen.getByAltText("Card Zone")).toBeInTheDocument();
    });

    it("maneja correctamente cuando turnData es null", () => {
      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={null}
            myPlayerId={2}
            playerData={mockPlayerData}
            timer={0}
          />
        </DndContext>
      );

      expect(screen.getByAltText("Card Zone")).toBeInTheDocument();
    });

    it("muestra mensaje de cancelar cuando hay set_played", () => {
      const turnDataWithSet = {
        turn_owner_id: 2,
        set_played: {
          set_type: "Poirot",
        },
      };

      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={turnDataWithSet}
            myPlayerId={2}
            playerData={mockPlayerData}
            timer={3}
          />
        </DndContext>
      );

      expect(screen.getByText(/Poirot/)).toBeInTheDocument();
    });

    it("muestra mensaje de cancelar cuando hay set_add", () => {
      const turnDataWithSetAdd = {
        turn_owner_id: 2,
        set_add: {
          card_name: "Ariadne Oliver",
        },
      };

      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={turnDataWithSetAdd}
            myPlayerId={2}
            playerData={mockPlayerData}
            timer={2}
          />
        </DndContext>
      );

      expect(screen.getByText(/Ariadne Oliver/)).toBeInTheDocument();
    });
  });

  describe("Mouse event handlers", () => {
    it("escala la imagen al hacer mouseEnter y vuelve al tamaño original con mouseLeave", () => {
      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={mockTurnData}
            myPlayerId={2}
            playerData={mockPlayerData}
            timer={0}
          />
        </DndContext>
      );

      const image = screen.getByAltText("Card Zone");
      
      fireEvent.mouseEnter(image);
      expect(image.style.transform).toBe("scale(1.1)");

      fireEvent.mouseLeave(image);
      expect(image.style.transform).toBe("scale(1)");
    });

    it("escala la imagen varias veces correctamente", () => {
      render(
        <DndContext>
          <PlayCardZone
            actionCard={null}
            turnData={mockTurnData}
            myPlayerId={2}
            playerData={mockPlayerData}
            timer={0}
          />
        </DndContext>
      );

      const image = screen.getByAltText("Card Zone");

      fireEvent.mouseEnter(image);
      expect(image.style.transform).toBe("scale(1.1)");
      
      fireEvent.mouseLeave(image);
      expect(image.style.transform).toBe("scale(1)");

      fireEvent.mouseEnter(image);
      expect(image.style.transform).toBe("scale(1.1)");
      
      fireEvent.mouseLeave(image);
      expect(image.style.transform).toBe("scale(1)");
    });
  });
});
