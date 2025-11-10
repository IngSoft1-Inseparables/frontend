import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import PlayCardZone from "./PlayCardZone";

const renderWithDndContext = (ui, { active = null } = {}) => {
  const mockDndContext = {
    active,
    over: null,
  };

  return render(
    <DndContext
      onDragStart={vi.fn()}
      onDragEnd={vi.fn()}
      modifiers={[]}
    >
      {ui}
    </DndContext>
  );
};

describe("PlayCardZone - Additional Coverage", () => {
  const mockPlayerData = {
    playerCards: [
      {
        card_id: 1,
        card_name: "EventCard1",
        type: "Event",
        image_name: "event1",
      },
      {
        card_id: 2,
        card_name: "InstantCard",
        type: "Instant",
        image_name: "instant1",
      },
    ],
  };

  const mockTurnData = {
    turn_owner_id: 1,
    turn_state: "None",
  };

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

    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={turnDataWithInstant}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={0}
      />
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
      turn_owner_id: 2, // No es mi turno
      turn_state: "None",
      event_card_played: eventCard,
    };

    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={turnDataWithEvent}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={0}
      />
    );

    expect(screen.getByAltText("Event Card")).toBeInTheDocument();
  });

  it("muestra timer cuando es mayor a 0 y no hay actionCard", () => {
    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={mockTurnData}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={5}
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/Podés jugar Not So Fast para cancelar/)).toBeInTheDocument();
  });

  it("muestra timer con actionCard presente", () => {
    const actionCard = {
      card_id: 1,
      card_name: "Some Action",
      type: "Event",
      image_name: "some_action",
    };

    renderWithDndContext(
      <PlayCardZone
        actionCard={actionCard}
        turnData={mockTurnData}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={3}
      />
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("muestra guión cuando timer es 0", () => {
    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={mockTurnData}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={0}
      />
    );

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("detecta carta Instant al arrastrar", () => {
    const active = {
      data: {
        current: {
          cardId: 2, // InstantCard
        },
      },
    };

    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={mockTurnData}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={0}
      />,
      { active }
    );

    // No debería romper al detectar carta Instant
    expect(screen.getByAltText("Card Zone")).toBeInTheDocument();
  });

  it("maneja correctamente cuando playerData es null", () => {
    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={mockTurnData}
        myPlayerId={1}
        playerData={null}
        timer={0}
      />
    );

    expect(screen.getByAltText("Card Zone")).toBeInTheDocument();
  });

  it("maneja correctamente cuando turnData es null", () => {
    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={null}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={0}
      />
    );

    expect(screen.getByAltText("Card Zone")).toBeInTheDocument();
  });

  it("muestra mensaje de cancelar cuando hay instant_played", () => {
    const turnDataWithInstant = {
      ...mockTurnData,
      instant_played: {
        card_id: 99,
        card_name: "Some Instant",
        type: "Instant",
        image_name: "instant",
      },
    };

    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={turnDataWithInstant}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={5}
      />
    );

    expect(screen.getByText(/Some Instant/)).toBeInTheDocument();
  });

  it("muestra mensaje de cancelar cuando hay event_card_played", () => {
    const turnDataWithEvent = {
      turn_owner_id: 1,
      event_card_played: {
        card_id: 88,
        card_name: "Some Event",
        type: "Event",
        image_name: "event",
      },
    };

    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={turnDataWithEvent}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={4}
      />
    );

    expect(screen.getByText(/Some Event/)).toBeInTheDocument();
  });

  it("muestra mensaje de cancelar cuando hay set_played", () => {
    const turnDataWithSet = {
      turn_owner_id: 1,
      set_played: {
        set_type: "Poirot",
      },
    };

    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={turnDataWithSet}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={3}
      />
    );

    expect(screen.getByText(/Poirot/)).toBeInTheDocument();
  });

  it("muestra mensaje de cancelar cuando hay set_add", () => {
    const turnDataWithSetAdd = {
      turn_owner_id: 1,
      set_add: {
        card_name: "Ariadne Oliver",
      },
    };

    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={turnDataWithSetAdd}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={2}
      />
    );

    expect(screen.getByText(/Ariadne Oliver/)).toBeInTheDocument();
  });

  it("prioriza instant_played sobre event_card_played", () => {
    const turnDataWithBoth = {
      turn_owner_id: 1,
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

    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={turnDataWithBoth}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={0}
      />
    );

    // Debería mostrar el instant_played
    expect(screen.getByAltText("Instant Priority")).toBeInTheDocument();
  });

  it("aplica pointer-events none a la imagen de la carta", () => {
    const actionCard = {
      card_id: 1,
      card_name: "Test Card",
      type: "Event",
      image_name: "test_card",
    };

    renderWithDndContext(
      <PlayCardZone
        actionCard={actionCard}
        turnData={mockTurnData}
        myPlayerId={1}
        playerData={mockPlayerData}
        timer={0}
      />
    );

    const img = screen.getByAltText("Test Card");
    expect(img).toHaveStyle({ pointerEvents: "none" });
  });

  it("no detecta carta jugable cuando el tipo no es Event ni Instant", () => {
    const playerDataWithAction = {
      playerCards: [
        {
          card_id: 3,
          card_name: "Action Card",
          type: "Action",
          image_name: "action",
        },
      ],
    };

    const active = {
      data: {
        current: {
          cardId: 3,
        },
      },
    };

    renderWithDndContext(
      <PlayCardZone
        actionCard={null}
        turnData={mockTurnData}
        myPlayerId={1}
        playerData={playerDataWithAction}
        timer={0}
      />,
      { active }
    );

    // Debería renderizar sin error
    expect(screen.getByAltText("Card Zone")).toBeInTheDocument();
  });

  describe("Mouse event handlers", () => {
    it("escala la imagen al hacer mouseEnter y vuelve al tamaño original con mouseLeave", () => {
      renderWithDndContext(
        <PlayCardZone
          actionCard={null}
          turnData={mockTurnData}
          myPlayerId={1}
          playerData={mockPlayerData}
          timer={0}
        />
      );

      const image = screen.getByAltText("Card Zone");
      
      // Simular mouseEnter
      fireEvent.mouseEnter(image);
      expect(image.style.transform).toBe("scale(1.1)");

      // Simular mouseLeave
      fireEvent.mouseLeave(image);
      expect(image.style.transform).toBe("scale(1)");
    });

    it("escala la imagen varias veces correctamente", () => {
      renderWithDndContext(
        <PlayCardZone
          actionCard={null}
          turnData={mockTurnData}
          myPlayerId={1}
          playerData={mockPlayerData}
          timer={0}
        />
      );

      const image = screen.getByAltText("Card Zone");

      // Primer hover
      fireEvent.mouseEnter(image);
      expect(image.style.transform).toBe("scale(1.1)");
      
      fireEvent.mouseLeave(image);
      expect(image.style.transform).toBe("scale(1)");

      // Segundo hover
      fireEvent.mouseEnter(image);
      expect(image.style.transform).toBe("scale(1.1)");
      
      fireEvent.mouseLeave(image);
      expect(image.style.transform).toBe("scale(1)");
    });
  });
});