import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import GameBoard from "./GameBoard";

describe("GameBoard component", () => {
  const mockTurnData = {
    players_amount: 4,
    turn_owner_id: 2,
  };

  const mockPlayers = [
    {
      id: 2,
      name: "Yo",
      avatar: "avatar2.png",
      turn: 2,
      playerSecrets: [{}, {}, {}],
    },
    {
      id: 3,
      name: "Jugador3",
      avatar: "avatar3.png",
      turn: 3,
      playerSecrets: [{}, {}, {}],
    },
    {
      id: 4,
      name: "Jugador4",
      avatar: "avatar4.png",
      turn: 4,
      playerSecrets: [{}, {}, {}],
    },
    {
      id: 1,
      name: "Jugador1",
      avatar: "avatar1.png",
      turn: 1,
      playerSecrets: [{}, {}, {}],
    },
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
    myPlayerId: 2,
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
      {
        id: 1,
        name: "P1",
        avatar: "a1.png",
        turn: 1,
        playerSecrets: [{}, {}, {}],
      },
      {
        id: 2,
        name: "P2",
        avatar: "a2.png",
        turn: 2,
        playerSecrets: [{}, {}, {}],
      },
      {
        id: 3,
        name: "P3",
        avatar: "a3.png",
        turn: 3,
        playerSecrets: [{}, {}, {}],
      },
      {
        id: 4,
        name: "P4",
        avatar: "a4.png",
        turn: 4,
        playerSecrets: [{}, {}, {}],
      },
      {
        id: 5,
        name: "P5",
        avatar: "a5.png",
        turn: 5,
        playerSecrets: [{}, {}, {}],
      },
      {
        id: 6,
        name: "P6",
        avatar: "a6.png",
        turn: 6,
        playerSecrets: [{}, {}, {}],
      },
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
    const centralTable = container.querySelector(".bg-orange-950\\/90");
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
    const handContainer = container.querySelector(".absolute.bottom-6");
    expect(handContainer?.className).not.toContain("z-20");
  });

  it("handles empty orderedPlayers array", () => {
    render(<GameBoard {...defaultProps} orderedPlayers={[]} />);

    // No debe crashear, solo renderizar la estructura base
    const bg = document.querySelector('[style*="game_bg.png"]');
    expect(bg).toBeInTheDocument();
  });
  it("renders RegularDeck with clickable BackCard when available", () => {
    const regpileMock = {
      count: 10,
      image_back_name: '01-card_back'
    };

    const turnDataWithDeck = {
      players_amount: 4,
      turn_owner_id: 2, // debe ser número para coincidir con myPlayerId
      regpile: regpileMock,
    };

    const playerDataFewCards = {
      ...mockPlayerData,
      playerCards: [{ card_id: 1 }, { card_id: 2 }], // <6
    };

    const mockOnCardClick = vi.fn();

    const { container } = render(
      <GameBoard
        {...defaultProps}
        turnData={turnDataWithDeck}
        playerData={playerDataFewCards}
        onCardClick={mockOnCardClick}
      />
    );

    // Seleccionamos la última carta clickeable
    const topCardImg = container.querySelector(".back-card-clickable");

    expect(topCardImg).toBeInTheDocument();
    expect(topCardImg).toHaveClass("back-card-clickable");

    // Simulamos click
    fireEvent.click(topCardImg);
    expect(mockOnCardClick).toHaveBeenCalled();
  });
  it("renders RegularDeck with non-clickable BackCard when not available", () => {
    const regpileMock = [
      { id: 1, back: "/carta1.png", alt: "Carta1" },
      { id: 2, back: "/carta2.png", alt: "Carta2" },
    ];

    const turnDataWithDeck = {
      players_amount: 4,
      turn_owner_id: "2",
      regpile: regpileMock,
    };

    const playerDataFewCards = {
      ...mockPlayerData,
      playerCards: [
        { card_id: 1 },
        { card_id: 2 },
        { card_id: 3 },
        { card_id: 4 },
        { card_id: 5 },
        { card_id: 6 },
      ], // >=6 cartas, BackCard no disponible
    };

    const mockOnCardClick = vi.fn();

    const { container } = render(
      <GameBoard
        {...defaultProps}
        turnData={turnDataWithDeck}
        playerData={playerDataFewCards}
        onCardClick={mockOnCardClick}
      />
    );

    // Buscar todas las imágenes en el contenedor de BackCard
    const backCardImages = container.querySelectorAll(".back-card-container img");
    
    // La última carta (top card) no debe tener la clase clickable porque available=false
    const topCardImg = backCardImages[backCardImages.length - 1];
    expect(topCardImg).not.toHaveClass("back-card-clickable");

    // Simulamos click
    fireEvent.click(topCardImg);
    expect(mockOnCardClick).not.toHaveBeenCalled();
  });
  it("renders RegularDeck BackCard with empty deck without crashing", () => {
    const turnDataEmptyDeck = {
      players_amount: 4,
      turn_owner_id: "2",
      regpile: [], // deck vacío
    };

    const { container } = render(
      <GameBoard
        {...defaultProps}
        turnData={turnDataEmptyDeck}
        playerData={mockPlayerData}
      />
    );

    // La imagen existe pero debe ser la clase base, no clickeable
    const topCardImg = container.querySelector(".back-card-container img");
    expect(topCardImg).toBeInTheDocument();
  });
  it("does not allow BackCard click when it's not the player's turn", () => {
    const regpileMock = [
      { id: 1, back: "/carta1.png", alt: "Carta1" },
      { id: 2, back: "/carta2.png", alt: "Carta2" },
    ];

    const turnDataNotMyTurn = {
      players_amount: 4,
      turn_owner_id: "3", // distinto a myPlayerId
      regpile: regpileMock,
    };

    const mockOnCardClick = vi.fn();

    const { container } = render(
      <GameBoard
        {...defaultProps}
        turnData={turnDataNotMyTurn}
        onCardClick={mockOnCardClick}
      />
    );

    const topCardImg = container.querySelector(".back-card-container img");

    // La carta no debe ser clickeable
    expect(topCardImg).not.toHaveClass("back-card-clickable");

    // Click no dispara nada
    topCardImg.click();
    expect(mockOnCardClick).not.toHaveBeenCalled();
  });
  it("renders correctly with 3 players", () => {
    const threePlayers = [
      { id: 1, name: "P1", avatar: "a1.png", turn: 1, playerSecrets: [{}] },
      { id: 2, name: "P2", avatar: "a2.png", turn: 2, playerSecrets: [{}] },
      { id: 3, name: "P3", avatar: "a3.png", turn: 3, playerSecrets: [{}] },
    ];
    const turnData3 = { ...mockTurnData, players_amount: 3 };

    render(
      <GameBoard
        {...defaultProps}
        turnData={turnData3}
        orderedPlayers={threePlayers}
        playerData={threePlayers[0]}
      />
    );

    expect(screen.getByText("P2")).toBeInTheDocument();
    expect(screen.getByText("P3")).toBeInTheDocument();
    expect(screen.getByText("P1")).toBeInTheDocument(); // mi jugador
  });

  it("renders correctly with 5 players", () => {
    const fivePlayers = [
      { id: 1, name: "P1", avatar: "a1.png", turn: 1, playerSecrets: [{}] },
      { id: 2, name: "P2", avatar: "a2.png", turn: 2, playerSecrets: [{}] },
      { id: 3, name: "P3", avatar: "a3.png", turn: 3, playerSecrets: [{}] },
      { id: 4, name: "P4", avatar: "a4.png", turn: 4, playerSecrets: [{}] },
      { id: 5, name: "P5", avatar: "a5.png", turn: 5, playerSecrets: [{}] },
    ];
    const turnData5 = { ...mockTurnData, players_amount: 5 };

    render(
      <GameBoard
        {...defaultProps}
        turnData={turnData5}
        orderedPlayers={fivePlayers}
        playerData={fivePlayers[0]}
      />
    );

    expect(screen.getByText("P2")).toBeInTheDocument();
    expect(screen.getByText("P3")).toBeInTheDocument();
    expect(screen.getByText("P4")).toBeInTheDocument();
    expect(screen.getByText("P5")).toBeInTheDocument();
  });
});
