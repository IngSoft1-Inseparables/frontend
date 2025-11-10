import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks mínimos de los hijos para aislar la prueba
vi.mock("../../../../services/HTTPService", () => ({
  createHttpService: () => ({ replenishFromDraft: vi.fn() }),
}));

vi.mock("../PlayerCard/PlayerCard.jsx", () => {
  const React = require("react");
  return { default: ({ player }) => React.createElement("div", null, player?.name || "") };
});

vi.mock("../RegularDeck/RegularDeck.jsx", () => {
  const React = require("react");
  return { default: () => React.createElement("div", { "data-testid": "regular-deck" }, "regpile") };
});

vi.mock("../DraftDeck/DraftDeck.jsx", () => {
  const React = require("react");
  return { default: () => React.createElement("div", { "data-testid": "draft-deck" }, "draft") };
});

vi.mock("../DiscardDeck/DiscardDeck.jsx", () => {
  const React = require("react");
  return { default: () => React.createElement("div", { "data-testid": "discard" }, "discard") };
});

vi.mock("../SetDeck/SetDeck.jsx", () => {
  const React = require("react");
  return { default: () => React.createElement("div", { "data-testid": "setdeck" }, "sets") };
});

vi.mock("../PlayCardZone/PlayCardZone.jsx", () => {
  const React = require("react");
  return { default: () => React.createElement("div", null, "playzone") };
});

vi.mock("../PlayerSetModal/PlayerSetModal.jsx", () => {
  const React = require("react");
  return { default: () => React.createElement("div", null, "playersetsmodal") };
});

// Aquí mockeamos HandCard de forma específica para estos tests: el botón "trigger-set"
vi.mock("../HandCard/HandCard.jsx", () => {
  const React = require("react");
  return {
    default: ({ onSetStateChange }) =>
      React.createElement(
        "div",
        { "data-testid": "handcard" },
        React.createElement("button", {
          "data-testid": "trigger-set",
          onClick: () => onSetStateChange(true, [{ card_name: "Adriane Oliver" }]),
        },
        "trigger-set")
      ),
  };
});

import GameBoard from "./GameBoard";

describe("Ariadne Oliver behaviour (unit)", () => {
  const basePlayers = [
    { id: 2, name: "Yo", setPlayed: [] },
    { id: 3, name: "Jugador3", setPlayed: [{ card_id: 10, card_name: "Set1" }] },
    { id: 4, name: "Jugador4", setPlayed: [] },
  ];

  const defaultProps = {
    orderedPlayers: basePlayers,
    playerData: { id: 2, name: "Yo", playerCards: [{ card_id: 1, card_name: "Adriane Oliver" }] },
    turnData: {
      players_amount: 3,
      turn_owner_id: 2,
      turn_state: "None",
      players: basePlayers,
      regpile: { count: 2 },
      draft: { count: 0 },
      discardpile: [],
      gameId: "game-1",
    },
    myPlayerId: 2,
    setSelectionMode: vi.fn(),
    setSelectionAction: vi.fn(),
    message: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("activa el modo de selección para Ariadne Oliver cuando otros jugadores tienen sets", async () => {
    const mockSetSelectionMode = vi.fn();
    const mockSetSelectionAction = vi.fn();

    render(
      <GameBoard
        {...defaultProps}
        setSelectionMode={mockSetSelectionMode}
        setSelectionAction={mockSetSelectionAction}
      />
    );

    // Simulamos que HandCard avisa que hay un set listo con Adriane Oliver
    const trigger = screen.getByTestId("trigger-set");
    fireEvent.click(trigger);

    // Esperamos que el botón de jugar set aparezca (label depende del nombre detectado)
    await waitFor(() => expect(screen.getByText(/JUGAR ARIADNE OLIVER|BAJAR SET DE/i)).toBeInTheDocument());

    const playBtn = screen.getByText(/JUGAR ARIADNE OLIVER|BAJAR SET DE/i);
    fireEvent.click(playBtn);

    // Verificar que llamó a los mocks correctos
    expect(mockSetSelectionMode).toHaveBeenCalledWith("select-set");
    expect(mockSetSelectionAction).toHaveBeenCalledWith("ariadne");
  });

  it("no activa el modo de selección si ningún otro jugador tiene sets", async () => {
    const mockSetSelectionMode = vi.fn();
    const mockSetSelectionAction = vi.fn();

    // clonamos turnData pero con players sin sets
    const noSetsPlayers = [
      { id: 2, name: "Yo", setPlayed: [] },
      { id: 3, name: "Jugador3", setPlayed: [] },
      { id: 4, name: "Jugador4", setPlayed: [] },
    ];

    render(
      <GameBoard
        {...defaultProps}
        turnData={{ ...defaultProps.turnData, players: noSetsPlayers }}
        orderedPlayers={noSetsPlayers}
        setSelectionMode={mockSetSelectionMode}
        setSelectionAction={mockSetSelectionAction}
      />
    );

    const trigger = screen.getByTestId("trigger-set");
    fireEvent.click(trigger);

    await waitFor(() => expect(screen.getByText(/JUGAR ARIADNE OLIVER|BAJAR SET DE/i)).toBeInTheDocument());

    const playBtn = screen.getByText(/JUGAR ARIADNE OLIVER|BAJAR SET DE/i);
    fireEvent.click(playBtn);

    expect(mockSetSelectionMode).not.toHaveBeenCalled();
    expect(mockSetSelectionAction).not.toHaveBeenCalled();
  });
});
