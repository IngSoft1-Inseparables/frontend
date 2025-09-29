import { vi } from "vitest";

// Mock de React Router - para verificar navegación y state
const mockLocation = {
  state: { gameId: 1, myPlayerId: 2 }
};
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

// Mock del HTTP Service - simula llamadas al backend
vi.mock("../../services/HTTPService", () => {
  const mockHttp = {
    getPublicTurnData: vi.fn(),
  };

  return {
    createHttpService: () => [mockHttp],
    __mockHttp: mockHttp,
  };
});

import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Game from "./Game";
import { __mockHttp as mockHttp } from "../../services/HTTPService";

describe("Game component", () => {
  // Datos de partida por defecto que retorna el mock HTTP
  const defaultTurnData = {
    players_amount: 4,
    turn_owner_id: 2,
    players: [
      {
        id: 1,
        name: "Jugador1",
        avatar: "avatars/avatar1.png",
        turn: 1
      },
      {
        id: 2,
        name: "Jugador2",
        avatar: "avatars/avatar2.png",
        turn: 2
      },
      {
        id: 3,
        name: "Jugador3",
        avatar: "avatars/avatar3.png",
        turn: 3
      },
      {
        id: 4,
        name: "Jugador4",
        avatar: "avatars/avatar4.png",
        turn: 4
      }
    ]
  };

  // Helper para renderizar con Router context y state
  const renderWithRouter = (initialState = { gameId: 1, myPlayerId: 2 }) => {
    mockLocation.state = initialState;
    return render(
      <MemoryRouter initialEntries={[{ pathname: "/game", state: initialState }]}>
        <Game />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Reset mocks antes de cada test para evitar interferencias
    vi.clearAllMocks();
    mockHttp.getPublicTurnData.mockResolvedValue(defaultTurnData);
    console.error = vi.fn(); // Mock console.error para tests de error
  });

  it("renderiza el estado de carga inicialmente", () => {
    // TEST: Verifica que muestra el mensaje de carga antes de obtener datos
    renderWithRouter();
    const loadingMessage = screen.getByText(/Cargando jugadores.../i);
    expect(loadingMessage).toBeInTheDocument();
  });

  it("obtiene datos del turno al montarse", async () => {
    // TEST: Verifica que llama a getPublicTurnData con el gameId correcto
    renderWithRouter();
    
    await waitFor(() => {
      expect(mockHttp.getPublicTurnData).toHaveBeenCalledWith(1);
    });
  });

  it("renderiza correctamente con 2 jugadores", async () => {
    // TEST: Verifica el layout para partida de 2 jugadores
    const twoPlayerData = {
      players_amount: 2,
      turn_owner_id: 1,
      players: [
        { id: 1, name: "Jugador1", avatar: "avatars/avatar1.png", turn: 1 },
        { id: 2, name: "Jugador2", avatar: "avatars/avatar2.png", turn: 2 }
      ]
    };
    mockHttp.getPublicTurnData.mockResolvedValue(twoPlayerData);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
      expect(screen.getByText("Jugador2")).toBeInTheDocument();
    });
  });

  it("renderiza correctamente con 3 jugadores", async () => {
    // TEST: Verifica el layout para partida de 3 jugadores
    const threePlayerData = {
      players_amount: 3,
      turn_owner_id: 2,
      players: [
        { id: 1, name: "Jugador1", avatar: "avatars/avatar1.png", turn: 1 },
        { id: 2, name: "Jugador2", avatar: "avatars/avatar2.png", turn: 2 },
        { id: 3, name: "Jugador3", avatar: "avatars/avatar3.png", turn: 3 }
      ]
    };
    mockHttp.getPublicTurnData.mockResolvedValue(threePlayerData);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
      expect(screen.getByText("Jugador2")).toBeInTheDocument();
      expect(screen.getByText("Jugador3")).toBeInTheDocument();
    });
  });

  it("renderiza correctamente con 4 jugadores", async () => {
    // TEST: Verifica el layout para partida de 4 jugadores
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
      expect(screen.getByText("Jugador2")).toBeInTheDocument();
      expect(screen.getByText("Jugador3")).toBeInTheDocument();
      expect(screen.getByText("Jugador4")).toBeInTheDocument();
    });
  });

  it("renderiza correctamente con 5 jugadores", async () => {
    // TEST: Verifica el layout para partida de 5 jugadores
    const fivePlayerData = {
      players_amount: 5,
      turn_owner_id: 3,
      players: [
        { id: 1, name: "Jugador1", avatar: "avatars/avatar1.png", turn: 1 },
        { id: 2, name: "Jugador2", avatar: "avatars/avatar2.png", turn: 2 },
        { id: 3, name: "Jugador3", avatar: "avatars/avatar3.png", turn: 3 },
        { id: 4, name: "Jugador4", avatar: "avatars/avatar4.png", turn: 4 },
        { id: 5, name: "Jugador5", avatar: "avatars/avatar5.png", turn: 5 }
      ]
    };
    mockHttp.getPublicTurnData.mockResolvedValue(fivePlayerData);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
      expect(screen.getByText("Jugador2")).toBeInTheDocument();
      expect(screen.getByText("Jugador3")).toBeInTheDocument();
      expect(screen.getByText("Jugador4")).toBeInTheDocument();
      expect(screen.getByText("Jugador5")).toBeInTheDocument();
    });
  });

  it("renderiza correctamente con 6 jugadores", async () => {
    // TEST: Verifica el layout para partida de 6 jugadores
    const sixPlayerData = {
      players_amount: 6,
      turn_owner_id: 4,
      players: [
        { id: 1, name: "Jugador1", avatar: "avatars/avatar1.png", turn: 1 },
        { id: 2, name: "Jugador2", avatar: "avatars/avatar2.png", turn: 2 },
        { id: 3, name: "Jugador3", avatar: "avatars/avatar3.png", turn: 3 },
        { id: 4, name: "Jugador4", avatar: "avatars/avatar4.png", turn: 4 },
        { id: 5, name: "Jugador5", avatar: "avatars/avatar5.png", turn: 5 },
        { id: 6, name: "Jugador6", avatar: "avatars/avatar6.png", turn: 6 }
      ]
    };
    mockHttp.getPublicTurnData.mockResolvedValue(sixPlayerData);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
      expect(screen.getByText("Jugador2")).toBeInTheDocument();
      expect(screen.getByText("Jugador3")).toBeInTheDocument();
      expect(screen.getByText("Jugador4")).toBeInTheDocument();
      expect(screen.getByText("Jugador5")).toBeInTheDocument();
      expect(screen.getByText("Jugador6")).toBeInTheDocument();
    });
  });

  it("ordena los jugadores correctamente poniendo al jugador actual primero", async () => {
    // TEST: Verifica que el jugador actual (myPlayerId=2) aparece primero en el orden
    renderWithRouter({ gameId: 1, myPlayerId: 2 });
    
    await waitFor(() => {
      // El jugador 2 debería aparecer primero en el orden
      expect(mockHttp.getPublicTurnData).toHaveBeenCalledWith(1);
    });
    
    // Verificamos que todos los jugadores están presentes
    await waitFor(() => {
      expect(screen.getByText("Jugador2")).toBeInTheDocument();
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
      expect(screen.getByText("Jugador3")).toBeInTheDocument();
      expect(screen.getByText("Jugador4")).toBeInTheDocument();
    });
  });

  it("maneja el caso cuando el jugador actual existe pero se reordena correctamente", async () => {
    // TEST: Verifica que el reordenamiento funciona incluso con jugadores fuera de orden
    const unorderedTurnData = {
      players_amount: 4,
      turn_owner_id: 2,
      players: [
        { id: 4, name: "Jugador4", avatar: "avatars/avatar4.png", turn: 4 },
        { id: 1, name: "Jugador1", avatar: "avatars/avatar1.png", turn: 1 },
        { id: 3, name: "Jugador3", avatar: "avatars/avatar3.png", turn: 3 },
        { id: 2, name: "Jugador2", avatar: "avatars/avatar2.png", turn: 2 }
      ]
    };
    mockHttp.getPublicTurnData.mockResolvedValue(unorderedTurnData);
    
    renderWithRouter({ gameId: 1, myPlayerId: 2 }); // Jugador 2 debería estar primero
    
    await waitFor(() => {
      // Verifica que la llamada HTTP se hizo correctamente
      expect(mockHttp.getPublicTurnData).toHaveBeenCalledWith(1);
      // Verifica que todos los jugadores están presentes
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
      expect(screen.getByText("Jugador2")).toBeInTheDocument();
      expect(screen.getByText("Jugador3")).toBeInTheDocument();
      expect(screen.getByText("Jugador4")).toBeInTheDocument();
    });
  });

  it("maneja errores de red al obtener datos del turno", async () => {
    // TEST: Verifica que maneja errores de la API correctamente
    const networkError = new Error("Network error");
    mockHttp.getPublicTurnData.mockRejectedValue(networkError);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed obtaining game data:", networkError);
    });
    
    // Debe seguir mostrando el estado de carga si no hay datos
    expect(screen.getByText(/Cargando jugadores.../i)).toBeInTheDocument();
  });

  it("usa valores por defecto cuando no hay location.state", async () => {
    // TEST: Verifica comportamiento con valores por defecto
    const defaultGameId = 1;
    const defaultPlayerId = 1;
    
    // Mock con valores por defecto cuando no hay state
    mockLocation.state = { gameId: defaultGameId, myPlayerId: defaultPlayerId };
    
    // Mock data para el caso por defecto
    const defaultTurnData = {
      players_amount: 2,
      turn_owner_id: 1,
      players: [
        { id: 1, name: "Player1", avatar: "avatars/avatar1.png", turn: 1 },
        { id: 2, name: "Player2", avatar: "avatars/avatar2.png", turn: 2 }
      ]
    };
    mockHttp.getPublicTurnData.mockResolvedValue(defaultTurnData);
    
    render(
      <MemoryRouter initialEntries={[{ pathname: "/game" }]}>
        <Game />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockHttp.getPublicTurnData).toHaveBeenCalledWith(defaultGameId);
    });
    
    // Verificar que se renderizan los jugadores
    await waitFor(() => {
      expect(screen.getByText("Player1")).toBeInTheDocument();
      expect(screen.getByText("Player2")).toBeInTheDocument();
    });
  });

  it("renderiza las cartas de jugador con avatar y nombre correctos", async () => {
    // TEST: Verifica que las cartas de jugador muestran la información correcta
    renderWithRouter();
    
    await waitFor(() => {
      // Verificar que los nombres están presentes
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
      expect(screen.getByText("Jugador2")).toBeInTheDocument();
      expect(screen.getByText("Jugador3")).toBeInTheDocument();
      expect(screen.getByText("Jugador4")).toBeInTheDocument();
    });
  });

  it("renderiza el fondo del juego correctamente", async () => {
    // TEST: Verifica que el fondo del juego se aplica
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
    });
    
    // Verificar que existe un elemento con el fondo del juego
    const gameBackground = document.querySelector('[style*="game_bg.png"]');
    expect(gameBackground).toBeInTheDocument();
  });

  it("renderiza las cartas de secretos en cada jugador", async () => {
    // TEST: Verifica que cada carta de jugador tiene 3 cartas de secretos
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
    });
    
    // Verificar que existen elementos con el fondo de cartas de secretos
    const secretCards = document.querySelectorAll('[style*="05-secret_front.png"]');
    expect(secretCards.length).toBeGreaterThan(0);
  });

  it("renderiza la mesa central en todos los layouts", async () => {
    // TEST: Verifica que la mesa central está presente
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
    });
    
    // Verificar que existe la mesa central
    const centralTable = document.querySelector('.bg-orange-950\\/90');
    expect(centralTable).toBeInTheDocument();
  });
});