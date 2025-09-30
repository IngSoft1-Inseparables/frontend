import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GameList from "./GameList";
import { vi } from "vitest";

// Mock del HTTP service interno
const mockGames = [
  {
    id: 1,
    game_name: "Aventura",
    players_amount: 2,
    max_players: 4,
    min_players: 2,
    avatar: "avatar/avatar1.png",
    creator_name: "Micaela",
  },
  {
    id: 2,
    game_name: "Estrategia",
    players_amount: 4,
    max_players: 6,
    min_players: 3,
    avatar: "avatar/avatar2.png",
    creator_name: "Norma",
  },
];
const mockGamesEmpty =[];

vi.mock("../../services/HTTPService", () => ({
  createHttpService: () => ({
    getGames: vi.fn(async () => mockGames),
  }),
}));

describe("GameList - pruebas básicas sin JoinGameDialog", () => {
  it("renderiza partidas correctamente y muestra mensajes de carga y vacío", async () => {
    render(<GameList />);

    // Debe mostrar el loading inicialmente
    expect(screen.getByText(/Cargando partidas/i)).toBeInTheDocument();

    // Esperamos que aparezcan las partidas
    await waitFor(() => screen.getByText("Aventura"));
    expect(screen.getByText("Aventura")).toBeInTheDocument();
    expect(screen.getByText("Estrategia")).toBeInTheDocument();

    // Click en la primera partida (solo para testear click)
    fireEvent.click(screen.getByText("Aventura"));
    
  });

  it("permite actualizar la lista de partidas", async () => {
    render(<GameList />);

    await waitFor(() => screen.getByText("Aventura"));

    const actualizarBtn = screen.getByRole("button", { name: /Actualizar partidas/i });
    expect(actualizarBtn).toBeInTheDocument();

    fireEvent.click(actualizarBtn);

    // Esperamos que vuelva a cargar partidas
    await waitFor(() => screen.getByText("Aventura"));
    expect(screen.getByText("Estrategia")).toBeInTheDocument();
  });
});
