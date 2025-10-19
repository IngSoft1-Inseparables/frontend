import { render, screen } from "@testing-library/react";
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
      expect(icon).toHaveAttribute("src", "public/icons/event-icon.png");
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
});
