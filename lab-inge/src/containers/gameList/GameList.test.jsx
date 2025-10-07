import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GameList from "./GameList";
import { it, vi } from "vitest";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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

vi.mock("../../services/HTTPService", () => ({
  createHttpService: () => ({
    getGames: vi.fn(async () => ({ games: mockGames })),
  }),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("GameList - pruebas básicas sin JoinGameDialog", () => {
  it("renderiza partidas correctamente y muestra mensajes de carga y vacío", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    // Debe mostrar el loading inicialmente
    expect(screen.getByText(/Cargando partidas/i)).toBeInTheDocument();

    // Esperamos que aparezcan las partidas
    await waitFor(() =>
      expect(screen.getByText("Aventura")).toBeInTheDocument()
    );
    expect(screen.getByText("Estrategia")).toBeInTheDocument();

    // Click en la primera partida (solo para testear click)
    fireEvent.click(screen.getByText("Aventura"));
  });
  

  it("permite actualizar la lista de partidas", async () => {
    render(<GameList />);

    // Esperamos que cargue inicialmente
    await waitFor(() =>
      expect(screen.getByText("Aventura")).toBeInTheDocument()
    );

    const actualizarBtn = screen.getByRole("button", {
      name: /Actualizar partidas/i,
    });
    expect(actualizarBtn).toBeInTheDocument();

    fireEvent.click(actualizarBtn);

    // Esperamos que vuelva a cargar partidas
    await waitFor(() =>
      expect(screen.getByText("Aventura")).toBeInTheDocument()
    );
    expect(screen.getByText("Estrategia")).toBeInTheDocument();
  });
   it("se renderiza correctamente y navega al hacer clic", () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    // Verificamos que el botón "Volver" se renderiza
    const volverBtn = screen.getByRole("button", { name: /Volver/i });
    expect(volverBtn).toBeInTheDocument();

    // Simulamos el clic
    fireEvent.click(volverBtn);

    // Verificamos que navega a "/home"
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });
});
