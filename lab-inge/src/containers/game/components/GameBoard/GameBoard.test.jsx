import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import GameBoard from "./GameBoard";

describe("GameBoard component", () => {
  const mockTurnData = {
    players_amount: 4,
    turn_owner_id: 2,
  };

  const mockPlayers = [
    { id: 2, name: "Yo", avatar: "avatar2.png", turn: 2, playerSecrets: [{}, {}, {}] },
    { id: 3, name: "Jugador3", avatar: "avatar3.png", turn: 3, playerSecrets: [{}, {}, {}] },
    { id: 4, name: "Jugador4", avatar: "avatar4.png", turn: 4, playerSecrets: [{}, {}, {}] },
    { id: 1, name: "Jugador1", avatar: "avatar1.png", turn: 1, playerSecrets: [{}, {}, {}] },
  ];

  const mockPlayerData = {
    id: 2,
    name: "Yo",
    avatar: "avatar2.png",
    playerSecrets: [{}, {}, {}],
    playerCards: [
      { card_id: 1, card_name: "Carta1" },
      { card_id: 2, card_name: "Carta2" },
    ],
  };

  const defaultProps = {
    orderedPlayers: mockPlayers,
    playerData: mockPlayerData,
    turnData: mockTurnData,
    myPlayerId: "2",
  };

  it("renders game background", () => {
    render(<GameBoard {...defaultProps} />);
    const bg = document.querySelector('[style*="game_bg.png"]');
    expect(bg).not.toBeNull();
  });

  it("renders the correct number of players for 4 players game", () => {
    render(<GameBoard {...defaultProps} />);
    // 4 jugadores: 1 arriba (index 2), 1 izquierda (index 1), 1 derecha (index 3), 1 abajo (yo)
    expect(screen.getByText("Jugador3")).toBeInTheDocument(); // top
    expect(screen.getByText("Jugador4")).toBeInTheDocument(); // right
    expect(screen.getByText("Jugador1")).toBeInTheDocument(); // left
    expect(screen.getAllByText("Yo")).toHaveLength(1); // bottom (mi jugador)
  });

  it("renders player in correct positions for 2 players", () => {
    const twoPlayerData = {
      ...mockTurnData,
      players_amount: 2,
    };
    const twoPlayers = [
      mockPlayers[0], // Yo
      mockPlayers[1], // Oponente
    ];

    render(
      <GameBoard
        {...defaultProps}
        turnData={twoPlayerData}
        orderedPlayers={twoPlayers}
      />
    );

    // En juego de 2: 1 arriba, 1 abajo (yo)
    expect(screen.getByText("Jugador3")).toBeInTheDocument();
    expect(screen.getByText("Yo")).toBeInTheDocument();
  });

  it("renders player in correct positions for 6 players", () => {
    const sixPlayerData = {
      ...mockTurnData,
      players_amount: 6,
    };
    const sixPlayers = [
      { id: 1, name: "P1", avatar: "a1.png", turn: 1, playerSecrets: [{}, {}, {}] },
      { id: 2, name: "P2", avatar: "a2.png", turn: 2, playerSecrets: [{}, {}, {}] },
      { id: 3, name: "P3", avatar: "a3.png", turn: 3, playerSecrets: [{}, {}, {}] },
      { id: 4, name: "P4", avatar: "a4.png", turn: 4, playerSecrets: [{}, {}, {}] },
      { id: 5, name: "P5", avatar: "a5.png", turn: 5, playerSecrets: [{}, {}, {}] },
      { id: 6, name: "P6", avatar: "a6.png", turn: 6, playerSecrets: [{}, {}, {}] },
    ];

    render(
      <GameBoard
        {...defaultProps}
        turnData={sixPlayerData}
        orderedPlayers={sixPlayers}
        playerData={{ ...mockPlayerData, name: "P1" }}
      />
    );

    // En juego de 6: 3 arriba, 1 izquierda, 1 derecha, 1 abajo
    expect(screen.getByText("P2")).toBeInTheDocument(); // left
    expect(screen.getByText("P3")).toBeInTheDocument(); // top
    expect(screen.getByText("P4")).toBeInTheDocument(); // top
    expect(screen.getByText("P5")).toBeInTheDocument(); // top
    expect(screen.getByText("P6")).toBeInTheDocument(); // right
  });

  it("renders RegularDeck and DiscardDeck", () => {
    const { container } = render(<GameBoard {...defaultProps} />);
    
    // Verificar que existe la mesa central con los mazos
    const centralTable = container.querySelector('.bg-orange-950\\/90');
    expect(centralTable).toBeInTheDocument();
  });

  it("applies correct z-index for HandCard based on player count", () => {
    const { container } = render(<GameBoard {...defaultProps} />);
    
    // Con 4 jugadores, HandCard debe tener z-20
    const handContainer = container.querySelector('[class*="z-20"]');
    expect(handContainer).toBeInTheDocument();
  });

  it("does not apply z-20 for 6 players", () => {
    const sixPlayerData = {
      ...mockTurnData,
      players_amount: 6,
    };

    const { container } = render(
      <GameBoard {...defaultProps} turnData={sixPlayerData} />
    );

    // Con 6 jugadores, no debe tener z-20 en el contenedor de la mano
    const handContainer = container.querySelector('.absolute.bottom-6');
    expect(handContainer?.className).not.toContain('z-20');
  });

  it("handles empty orderedPlayers array", () => {
    render(<GameBoard {...defaultProps} orderedPlayers={[]} />);
    
    // No debe crashear, solo renderizar la estructura base
    const bg = document.querySelector('[style*="game_bg.png"]');
    expect(bg).toBeInTheDocument();
  });
});
