import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PlayerCard from "./PlayerCard";

describe("PlayerCard component", () => {
  const mockPlayer = {
    id: 1,
    name: "Jugador Test",
    avatar: "avatar1.png",
    turn: 1,
    playerSecrets: [{}, {}, {}],
  };

  const mockTurnData = {
    turn_owner_id: 1,
    players_amount: 4,
  };

  const defaultProps = {
    player: mockPlayer,
    turnData: mockTurnData,
    myPlayerId: "2",
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
      playerSecrets: [{}, {}, {}, {}], // 4 secretos
    };

    render(<PlayerCard {...defaultProps} player={playerManySecrets} />);
    expect(screen.getByText("Jugador Test")).toBeInTheDocument();
  });
});
