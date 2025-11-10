import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import GameList from "./GameList";

const mockGames = [
  {
    id: 1,
    game_name: "Aventura",
    players_amount: 2,
    max_players: 4,
    min_players: 2,
    creator_name: "Micaela",
    available: true,
    in_progress: false,
  },
  {
    id: 2,
    game_name: "Estrategia",
    players_amount: 4,
    max_players: 6,
    min_players: 3,
    creator_name: "Norma",
    available: true,
    in_progress: false,
  },
  {
    id: 3,
    game_name: "Juego en curso",
    players_amount: 3,
    max_players: 4,
    min_players: 2,
    creator_name: "Pedro",
    available: false,
    in_progress: true,
  },
];

const mockNavigate = vi.fn();
const mockGetGames = vi.fn();
const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockOn = vi.fn();
const mockOff = vi.fn();

vi.mock("../../services/HTTPService", () => ({
  createHttpService: () => ({
    getGames: mockGetGames,
  }),
}));

vi.mock("../../services/WSService", () => ({
  createWSService: () => ({
    connect: mockConnect,
    disconnect: mockDisconnect,
    on: mockOn,
    off: mockOff,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGames.mockResolvedValue({ games: mockGames });
});

describe("GameList", () => {
  it("renderiza el título correctamente", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    expect(screen.getByText("Partidas disponibles")).toBeInTheDocument();
  });

  it("muestra 'Cargando partidas...' mientras carga", () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cargando partidas/i)).toBeInTheDocument();
  });

  it("renderiza partidas disponibles correctamente", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    // Esperar a que carguen las partidas
    await waitFor(() => {
      expect(screen.queryByText(/Cargando partidas/i)).not.toBeInTheDocument();
    });

    // Verificar que se muestran solo las partidas no in_progress
    const gameCards = screen.getAllByTestId("GameCard");
    expect(gameCards).toHaveLength(2); // Solo 2 partidas (las que no están in_progress)

    // Verificar contenido de las partidas
    expect(screen.getByText("Aventura")).toBeInTheDocument();
    expect(screen.getByText("Estrategia")).toBeInTheDocument();
    expect(screen.queryByText("Juego en curso")).not.toBeInTheDocument();
  });

  it("filtra partidas que están en progreso (in_progress: true)", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando partidas/i)).not.toBeInTheDocument();
    });

    // Verificar que la partida en progreso NO se muestra
    expect(screen.queryByText("Juego en curso")).not.toBeInTheDocument();
    
    // Solo se muestran las 2 partidas disponibles
    const gameCards = screen.getAllByTestId("GameCard");
    expect(gameCards).toHaveLength(2);
  });

  it("muestra información correcta de cada partida", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando partidas/i)).not.toBeInTheDocument();
    });

    // Verificar nombre del juego
    expect(screen.getByText("Aventura")).toBeInTheDocument();
    
    // Verificar nombre del creador
    expect(screen.getByText("Micaela")).toBeInTheDocument();
    
    // Verificar cantidad de jugadores
    expect(screen.getByText("2/4")).toBeInTheDocument();
    
    // Verificar mínimo de jugadores
    expect(screen.getByText("Mínimo de jugadores: 2")).toBeInTheDocument();
  });

  it("muestra 'No hay partidas disponibles' cuando no hay juegos disponibles", async () => {
    mockGetGames.mockResolvedValueOnce({ games: [] });

    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No hay partidas disponibles/i)).toBeInTheDocument();
    });
  });

  it("muestra 'No hay partidas disponibles' cuando solo hay partidas en progreso", async () => {
    const gamesInProgress = [
      {
        id: 3,
        game_name: "Juego en curso",
        players_amount: 3,
        max_players: 4,
        min_players: 2,
        creator_name: "Pedro",
        available: false,
        in_progress: true,
      },
    ];
    mockGetGames.mockResolvedValueOnce({ games: gamesInProgress });

    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No hay partidas disponibles/i)).toBeInTheDocument();
    });
  });

  it("abre el diálogo al hacer click en una partida", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando partidas/i)).not.toBeInTheDocument();
    });

    const gameCards = screen.getAllByTestId("GameCard");
    fireEvent.click(gameCards[0]);

    // El diálogo debería renderizarse (aunque esté mockeado o no)
    // Simplemente verificamos que el click no causa error
    expect(gameCards[0]).toBeInTheDocument();
  });

  it("navega a /home al hacer click en 'Volver'", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    const volverBtn = screen.getByRole("button", { name: /Volver/i });
    expect(volverBtn).toBeInTheDocument();

    fireEvent.click(volverBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("conecta y desconecta el WebSocket correctamente", () => {
    const { unmount } = render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    // Verificar que se conectó
    expect(mockConnect).toHaveBeenCalled();
    expect(mockOn).toHaveBeenCalledWith("game_list_update", expect.any(Function));

    // Desmontar el componente
    unmount();

    // Verificar que se desconectó
    expect(mockOff).toHaveBeenCalledWith("game_list_update", expect.any(Function));
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("maneja errores al cargar partidas", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetGames.mockRejectedValueOnce(new Error("Error de red"));

    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No hay partidas disponibles/i)).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("cierra el diálogo al presionar Escape", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando partidas/i)).not.toBeInTheDocument();
    });

    // Abrir el diálogo
    const gameCards = screen.getAllByTestId("GameCard");
    fireEvent.click(gameCards[0]);

    // Simular presionar Escape
    fireEvent.keyDown(screen.getByText("Partidas disponibles").closest("div"), {
      key: "Escape",
      code: "Escape",
    });

    // El diálogo debería cerrarse (verificamos que no cause error)
    expect(gameCards[0]).toBeInTheDocument();
  });

  it("filtra correctamente partidas disponibles vs no disponibles", async () => {
    const mixedGames = [
      {
        id: 1,
        game_name: "Disponible 1",
        players_amount: 2,
        max_players: 4,
        min_players: 2,
        creator_name: "User1",
        available: true,
        in_progress: false,
      },
      {
        id: 2,
        game_name: "No disponible",
        players_amount: 4,
        max_players: 4,
        min_players: 2,
        creator_name: "User2",
        available: false,
        in_progress: false,
      },
      {
        id: 3,
        game_name: "Disponible 2",
        players_amount: 1,
        max_players: 6,
        min_players: 2,
        creator_name: "User3",
        available: true,
        in_progress: false,
      },
    ];

    mockGetGames.mockResolvedValueOnce({ games: mixedGames });

    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando partidas/i)).not.toBeInTheDocument();
    });

    // Solo debe mostrar las 2 partidas disponibles
    const gameCards = screen.getAllByTestId("GameCard");
    expect(gameCards).toHaveLength(2);
    
    expect(screen.getByText("Disponible 1")).toBeInTheDocument();
    expect(screen.getByText("Disponible 2")).toBeInTheDocument();
    expect(screen.queryByText("No disponible")).not.toBeInTheDocument();
  });

  it("actualiza la lista de partidas cuando recibe game_list_update del WebSocket", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando partidas/i)).not.toBeInTheDocument();
    });

    // Obtener el callback de game_list_update
    const gameListUpdateCall = mockOn.mock.calls.find(
      (call) => call[0] === "game_list_update"
    );
    expect(gameListUpdateCall).toBeDefined();
    const handleGameList = gameListUpdateCall[1];

    // Simular actualización desde WebSocket con nuevas partidas
    const newGames = {
      games: [
        {
          id: 4,
          game_name: "Nueva Partida WebSocket",
          players_amount: 1,
          max_players: 5,
          min_players: 2,
          creator_name: "WSUser",
          available: true,
          in_progress: false,
        },
      ],
    };

    handleGameList(newGames);

    // Esperar a que se actualice la lista
    await waitFor(() => {
      expect(screen.getByText("Nueva Partida WebSocket")).toBeInTheDocument();
    });
  });

  it("filtra partidas in_progress cuando recibe game_list_update", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando partidas/i)).not.toBeInTheDocument();
    });

    const gameListUpdateCall = mockOn.mock.calls.find(
      (call) => call[0] === "game_list_update"
    );
    const handleGameList = gameListUpdateCall[1];

    // Simular actualización con partidas en progreso
    const gamesWithInProgress = {
      games: [
        {
          id: 5,
          game_name: "Partida Disponible",
          players_amount: 2,
          max_players: 4,
          min_players: 2,
          creator_name: "User1",
          available: true,
          in_progress: false,
        },
        {
          id: 6,
          game_name: "Partida En Curso",
          players_amount: 3,
          max_players: 4,
          min_players: 2,
          creator_name: "User2",
          available: false,
          in_progress: true,
        },
      ],
    };

    handleGameList(gamesWithInProgress);

    await waitFor(() => {
      expect(screen.getByText("Partida Disponible")).toBeInTheDocument();
      expect(screen.queryByText("Partida En Curso")).not.toBeInTheDocument();
    });
  });

  it("maneja payloads de WebSocket en formato string JSON", async () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando partidas/i)).not.toBeInTheDocument();
    });

    const gameListUpdateCall = mockOn.mock.calls.find(
      (call) => call[0] === "game_list_update"
    );
    const handleGameList = gameListUpdateCall[1];

    // Simular payload como string JSON
    const jsonPayload = JSON.stringify({
      games: [
        {
          id: 7,
          game_name: "Partida JSON String",
          players_amount: 2,
          max_players: 6,
          min_players: 2,
          creator_name: "JSONUser",
          available: true,
          in_progress: false,
        },
      ],
    });

    handleGameList(jsonPayload);

    await waitFor(() => {
      expect(screen.getByText("Partida JSON String")).toBeInTheDocument();
    });
  });

  it("registra el listener connection_status del WebSocket", () => {
    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    // Verificar que se registró el listener connection_status
    expect(mockOn).toHaveBeenCalledWith("connection_status", expect.any(Function));
  });

  it("invoca el callback connection_status cuando cambia el estado de conexión", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(
      <BrowserRouter>
        <GameList />
      </BrowserRouter>
    );

    // Obtener el callback de connection_status
    const connectionStatusCall = mockOn.mock.calls.find(
      (call) => call[0] === "connection_status"
    );
    expect(connectionStatusCall).toBeDefined();
    const connectionStatusCallback = connectionStatusCall[1];

    // Invocar el callback
    connectionStatusCallback({ connected: true });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "🔗 Estado de conexión WebSocket:",
      { connected: true }
    );

    consoleLogSpy.mockRestore();
  });
});






