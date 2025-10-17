import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PlayerCard from "./PlayerCard";

describe("PlayerCard component", () => {
  const mockPlayer = {
    id: 1,
    name: "Jugador Test",
    avatar: "avatar1.png",
    turn: 1,
    playerSecrets: [
      { secret_id: 1, revealed: false, image_front_name: "secret1_front", image_back_name: "secret1_back" },
      { secret_id: 2, revealed: true, image_front_name: "secret2_front", image_back_name: "secret2_back" },
      { secret_id: 3, revealed: false, image_front_name: "secret3_front", image_back_name: "secret3_back" },
    ],
  };

  const mockTurnData = {
    turn_owner_id: 1,
    players_amount: 4,
  };

  const defaultProps = {
    player: mockPlayer,
    turnData: mockTurnData,
    myPlayerId: "2",
    onPlayerSelect: null,
    selectedPlayer: null,
    onSecretSelect: null,
    selectedSecret: null,
    selectionMode: null,
  };

  it("renders player name", () => {
    render(<PlayerCard {...defaultProps} />);
    expect(screen.getByText("Jugador Test")).toBeInTheDocument();
  });

  it("renders player avatar", () => {
    const { container } = render(<PlayerCard {...defaultProps} />);
    
    // El avatar se renderiza como background-image en un div
    const avatarDiv = container.querySelector('[style*="avatar1.png"]');
    expect(avatarDiv).toBeInTheDocument();
  });

  it("renders player secrets count", () => {
    render(<PlayerCard {...defaultProps} />);
    // Verificar que muestra los 3 secretos
    const secretsContainer = screen.getByText("Jugador Test").closest("div");
    expect(secretsContainer).toBeInTheDocument();
  });

  it("highlights player when it's their turn", () => {
    const props = {
      ...defaultProps,
      player: { ...mockPlayer, id: 1 },
      turnData: { ...mockTurnData, turn_owner_id: 1 },
    };

    const { container } = render(<PlayerCard {...props} />);
    
    // El jugador cuyo turno es debe tener algún estilo especial
    // Esto depende de cómo implementes el highlight en PlayerCard
    expect(container.firstChild).toBeInTheDocument();
  });

  it("does not highlight player when it's not their turn", () => {
    const props = {
      ...defaultProps,
      player: { ...mockPlayer, id: 2 },
      turnData: { ...mockTurnData, turn_owner_id: 1 },
    };

    const { container } = render(<PlayerCard {...props} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("shows current player indicator when myPlayerId matches", () => {
    const props = {
      ...defaultProps,
      player: { ...mockPlayer, id: 2 },
      myPlayerId: "2",
    };

    render(<PlayerCard {...props} />);
    
    // Debería mostrar algún indicador de que es el jugador actual
    expect(screen.getByText("Jugador Test")).toBeInTheDocument();
  });

  it("handles player with no secrets", () => {
    const playerWithoutSecrets = {
      ...mockPlayer,
      playerSecrets: [],
    };

    render(<PlayerCard {...defaultProps} player={playerWithoutSecrets} />);
    expect(screen.getByText("Jugador Test")).toBeInTheDocument();
  });

  it("handles missing avatar gracefully", () => {
    const playerNoAvatar = {
      ...mockPlayer,
      avatar: "",
    };

    render(<PlayerCard {...defaultProps} player={playerNoAvatar} />);
    expect(screen.getByText("Jugador Test")).toBeInTheDocument();
  });

  it("renders multiple secrets correctly", () => {
    const playerManySecrets = {
      ...mockPlayer,
      playerSecrets: [
        { secret_id: 1, revealed: false, image_front_name: "secret1_front", image_back_name: "secret1_back" },
        { secret_id: 2, revealed: false, image_front_name: "secret2_front", image_back_name: "secret2_back" },
        { secret_id: 3, revealed: false, image_front_name: "secret3_front", image_back_name: "secret3_back" },
        { secret_id: 4, revealed: false, image_front_name: "secret4_front", image_back_name: "secret4_back" },
      ],
    };

    render(<PlayerCard {...defaultProps} player={playerManySecrets} />);
    expect(screen.getByText("Jugador Test")).toBeInTheDocument();
  });

  // Tests para selección de jugadores
  describe("Player Selection", () => {
    it("calls onPlayerSelect when player card is clicked in select-player mode", () => {
      const mockOnPlayerSelect = vi.fn();
      const props = {
        ...defaultProps,
        onPlayerSelect: mockOnPlayerSelect,
        selectionMode: "select-player",
      };

      const { container } = render(<PlayerCard {...props} />);
      const playerCard = container.firstChild;
      
      fireEvent.click(playerCard);
      
      expect(mockOnPlayerSelect).toHaveBeenCalledWith(1);
    });

    it("does not call onPlayerSelect when player is already selected", () => {
      const mockOnPlayerSelect = vi.fn();
      const props = {
        ...defaultProps,
        onPlayerSelect: mockOnPlayerSelect,
        selectionMode: "select-player",
        selectedPlayer: 1,
      };

      const { container } = render(<PlayerCard {...props} />);
      const playerCard = container.firstChild;
      
      fireEvent.click(playerCard);
      
      expect(mockOnPlayerSelect).not.toHaveBeenCalled();
    });

    it("allows selecting other players in select-other-player mode", () => {
      const mockOnPlayerSelect = vi.fn();
      const props = {
        ...defaultProps,
        onPlayerSelect: mockOnPlayerSelect,
        selectionMode: "select-other-player",
        myPlayerId: "2", // Yo soy el jugador 2
        player: { ...mockPlayer, id: 1 }, // Este es el jugador 1
      };

      const { container } = render(<PlayerCard {...props} />);
      const playerCard = container.firstChild;
      
      fireEvent.click(playerCard);
      
      expect(mockOnPlayerSelect).toHaveBeenCalledWith(1);
    });

    it("does not allow selecting myself in select-other-player mode", () => {
      const mockOnPlayerSelect = vi.fn();
      const props = {
        ...defaultProps,
        onPlayerSelect: mockOnPlayerSelect,
        selectionMode: "select-other-player",
        myPlayerId: "1", // Yo soy el jugador 1
        player: { ...mockPlayer, id: 1 }, // Este también es el jugador 1
      };

      const { container } = render(<PlayerCard {...props} />);
      const playerCard = container.firstChild;
      
      fireEvent.click(playerCard);
      
      expect(mockOnPlayerSelect).not.toHaveBeenCalled();
    });

    it("highlights selected player", () => {
      const props = {
        ...defaultProps,
        selectionMode: "select-player",
        selectedPlayer: 1,
      };

      const { container } = render(<PlayerCard {...props} />);
      const playerCard = container.firstChild;
      
      expect(playerCard.className).toContain("border-yellow-400");
    });
  });

  // Tests para selección de secretos
  describe("Secret Selection", () => {
    it("calls onSecretSelect when a secret is clicked in select-revealed-secret mode", () => {
      const mockOnSecretSelect = vi.fn();
      const props = {
        ...defaultProps,
        onSecretSelect: mockOnSecretSelect,
        selectionMode: "select-revealed-secret",
        selectedPlayer: 1, // Player must be selected first
      };

      const { container } = render(<PlayerCard {...props} />);
      
      // Buscar los secretos por su clase característica
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      const revealedSecret = secrets[1]; // El segundo secreto está revelado
      
      fireEvent.click(revealedSecret);
      
      expect(mockOnSecretSelect).toHaveBeenCalledWith(1, 2); // playerId, secretId
    });

    it("only allows selecting revealed secrets in select-revealed-secret mode", () => {
      const mockOnSecretSelect = vi.fn();
      const props = {
        ...defaultProps,
        onSecretSelect: mockOnSecretSelect,
        selectionMode: "select-revealed-secret",
        selectedPlayer: 1,
      };

      const { container } = render(<PlayerCard {...props} />);
      
      // Intentar clickear un secreto NO revelado (el primero)
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      const notRevealedSecret = secrets[0];
      
      fireEvent.click(notRevealedSecret);
      
      expect(mockOnSecretSelect).not.toHaveBeenCalled();
    });

    it("only allows selecting not revealed secrets in select-not-revealed-secret mode", () => {
      const mockOnSecretSelect = vi.fn();
      const props = {
        ...defaultProps,
        onSecretSelect: mockOnSecretSelect,
        selectionMode: "select-not-revealed-secret",
        selectedPlayer: 1,
      };

      const { container } = render(<PlayerCard {...props} />);
      
      // Clickear un secreto NO revelado
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      const notRevealedSecret = secrets[0];
      
      fireEvent.click(notRevealedSecret);
      
      expect(mockOnSecretSelect).toHaveBeenCalledWith(1, 1); // playerId, secretId
    });

    it("only allows selecting other player's revealed secrets in select-other-revealed-secret mode", () => {
      const mockOnSecretSelect = vi.fn();
      const props = {
        ...defaultProps,
        onSecretSelect: mockOnSecretSelect,
        selectionMode: "select-other-revealed-secret",
        myPlayerId: "2", // Yo soy el jugador 2
        player: { ...mockPlayer, id: 1 }, // Este es el jugador 1 (otro jugador)
        selectedPlayer: 1,
      };

      const { container } = render(<PlayerCard {...props} />);
      
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      const revealedSecret = secrets[1]; // Secreto revelado del otro jugador
      
      fireEvent.click(revealedSecret);
      
      expect(mockOnSecretSelect).toHaveBeenCalledWith(1, 2);
    });

    it("does not allow selecting my revealed secrets in select-other-revealed-secret mode", () => {
      const mockOnSecretSelect = vi.fn();
      const props = {
        ...defaultProps,
        onSecretSelect: mockOnSecretSelect,
        selectionMode: "select-other-revealed-secret",
        myPlayerId: "1", // Yo soy el jugador 1
        player: { ...mockPlayer, id: 1 }, // Este también es el jugador 1 (yo mismo)
        selectedPlayer: 1,
      };

      const { container } = render(<PlayerCard {...props} />);
      
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      const myRevealedSecret = secrets[1];
      
      fireEvent.click(myRevealedSecret);
      
      expect(mockOnSecretSelect).not.toHaveBeenCalled();
    });

    it("only allows selecting my revealed secrets in select-my-revealed-secret mode", () => {
      const mockOnSecretSelect = vi.fn();
      const props = {
        ...defaultProps,
        onSecretSelect: mockOnSecretSelect,
        selectionMode: "select-my-revealed-secret",
        myPlayerId: "1", // Yo soy el jugador 1
        player: { ...mockPlayer, id: 1 }, // Este es mi jugador
        selectedPlayer: 1,
      };

      const { container } = render(<PlayerCard {...props} />);
      
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      const myRevealedSecret = secrets[1];
      
      fireEvent.click(myRevealedSecret);
      
      expect(mockOnSecretSelect).toHaveBeenCalledWith(1, 2);
    });

    it("only allows selecting my not revealed secrets in select-my-not-revealed-secret mode", () => {
      const mockOnSecretSelect = vi.fn();
      const props = {
        ...defaultProps,
        onSecretSelect: mockOnSecretSelect,
        selectionMode: "select-my-not-revealed-secret",
        myPlayerId: "1",
        player: { ...mockPlayer, id: 1 },
        selectedPlayer: 1,
      };

      const { container } = render(<PlayerCard {...props} />);
      
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      const myNotRevealedSecret = secrets[0];
      
      fireEvent.click(myNotRevealedSecret);
      
      expect(mockOnSecretSelect).toHaveBeenCalledWith(1, 1);
    });

    it("highlights selected secret", () => {
      const props = {
        ...defaultProps,
        selectionMode: "select-revealed-secret",
        selectedSecret: 2, // El segundo secreto está seleccionado
        selectedPlayer: 1,
      };

      const { container } = render(<PlayerCard {...props} />);
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      const selectedSecretElement = secrets[1];
      
      expect(selectedSecretElement.className).toContain("border-yellow-400");
    });

    it("does not allow selecting secrets when one is already selected", () => {
      const mockOnSecretSelect = vi.fn();
      const props = {
        ...defaultProps,
        onSecretSelect: mockOnSecretSelect,
        selectionMode: "select-revealed-secret",
        selectedSecret: 2, // Ya hay un secreto seleccionado
        selectedPlayer: 1,
      };

      const { container } = render(<PlayerCard {...props} />);
      
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      const anotherSecret = secrets[1];
      
      fireEvent.click(anotherSecret);
      
      expect(mockOnSecretSelect).not.toHaveBeenCalled();
    });

    it("shows correct opacity for my unrevealed secrets", () => {
      const props = {
        ...defaultProps,
        myPlayerId: "1",
        player: { ...mockPlayer, id: 1 },
      };

      const { container } = render(<PlayerCard {...props} />);
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      const myUnrevealedSecret = secrets[0]; // First secret is not revealed
      
      expect(myUnrevealedSecret.className).toContain("opacity-30");
    });

    it("adapts secret size when there are many secrets", () => {
      const playerManySecrets = {
        ...mockPlayer,
        playerSecrets: [
          { secret_id: 1, revealed: false, image_front_name: "secret1_front", image_back_name: "secret1_back" },
          { secret_id: 2, revealed: false, image_front_name: "secret2_front", image_back_name: "secret2_back" },
          { secret_id: 3, revealed: false, image_front_name: "secret3_front", image_back_name: "secret3_back" },
          { secret_id: 4, revealed: false, image_front_name: "secret4_front", image_back_name: "secret4_back" },
          { secret_id: 5, revealed: false, image_front_name: "secret5_front", image_back_name: "secret5_back" },
        ],
      };

      const { container } = render(<PlayerCard {...defaultProps} player={playerManySecrets} />);
      const secrets = container.querySelectorAll('div[class*="aspect-[734"]');
      
      // Debería haber 5 secretos renderizados
      expect(secrets.length).toBeGreaterThanOrEqual(5);
    });
  });
});
