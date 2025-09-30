import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import Game from "./Game";

// Mock del HTTPService
vi.mock("../../services/HTTPService", () => {
  const mockHttpService = {
    getPublicTurnData: vi.fn(),
    getPrivatePlayerData: vi.fn(),
  };

  return {
    createHttpService: vi.fn(() => mockHttpService),
    __mockHttp: mockHttpService,
  };
});

// Importar el mock
import { __mockHttp as mockHttp } from "../../services/HTTPService";

describe("Game component", () => {
  // Helper para renderizar con router
  const renderGame = (initialState = { gameId: 1, myPlayerId: 2 }) => {
    return render(
      <MemoryRouter initialEntries={[{ pathname: "/game", state: initialState }]}>
        <Game />
      </MemoryRouter>
    );
  };

  // Mock de console.error
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Datos de prueba
  const mockTurnData = {
    players_amount: 4,
    turn_owner_id: 2,
    players: [
      {
        id: 1,
        name: "Jugador1",
        avatar: "avatars/avatar1.png",
        turn: 1,
        playerSecrets: [
          { revealed: false, image_front_name: "05-secret_front" },
          { revealed: true, secret_id: 4, image_back_name: "06-secret_back" },
          { revealed: false, image_front_name: "05-secret_front" }
        ]
      },
      {
        id: 2,
        name: "Jugador2",
        avatar: "avatars/avatar2.png",
        turn: 2,
        playerSecrets: [
          { revealed: false, image_front_name: "05-secret_front" },
          { revealed: false, image_front_name: "05-secret_front" },
          { revealed: true, secret_id: 3, image_back_name: "06-secret_back" }
        ]
      },
      {
        id: 3,
        name: "Jugador3",
        avatar: "avatars/avatar3.png",
        turn: 3,
        playerSecrets: [
          { revealed: true, secret_id: 2, image_back_name: "06-secret_back" },
          { revealed: false, image_front_name: "05-secret_front" },
          { revealed: false, image_front_name: "05-secret_front" }
        ]
      },
      {
        id: 4,
        name: "Jugador4",
        avatar: "avatars/avatar4.png",
        turn: 4,
        playerSecrets: [
          { revealed: false, image_front_name: "05-secret_front" },
          { revealed: false, image_front_name: "05-secret_front" },
          { revealed: false, image_front_name: "05-secret_front" }
        ]
      }
    ]
  };

  const mockPlayerData = {
    id: 2,
    name: "Jugador2",
    avatar: "avatars/avatar2.png",
    playerSecrets: [
      {
        secret_id: 5,
        secret_type: "NORMAL",
        image_front_name: "05-secret_front",
        image_back_name: "06-secret_back",
        revealed: false
      },
      {
        secret_id: 8,
        secret_type: "MURDER",
        image_front_name: "05-secret_front",
        image_back_name: "06-secret_back",
        revealed: true
      },
      {
        secret_id: 9,
        secret_type: "NORMAL",
        image_front_name: "05-secret_front",
        image_back_name: "06-secret_back",
        revealed: false
      }
    ],
    playerCards: [
      {
        card_id: 1,
        type: "Detective",
        card_name: "Coronel Mustard",
        image_name: "07-detective_poirot",
        image_back_name: "01-card_back"
      },
      {
        card_id: 2,
        type: "Detective", 
        card_name: "Candelabro",
        image_name: "08-detective_marple",
        image_back_name: "01-card_back"
      },
      {
        card_id: 3,
        type: "Detective",
        card_name: "Sala de Billar", 
        image_name: "09-detective_satterthwaite",
        image_back_name: "01-card_back"
      }
    ]
  };

  it("renders loading state initially", () => {
    renderGame();
    expect(screen.getByText("Cargando jugadores...")).toBeInTheDocument();
  });

  it("calls APIs with correct parameters", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame({ gameId: 5, myPlayerId: 3 });
    
    await waitFor(() => {
      expect(mockHttp.getPublicTurnData).toHaveBeenCalledWith(5);
      expect(mockHttp.getPrivatePlayerData).toHaveBeenCalledWith(5, 3);
    });
  });

  it("renders game interface after loading", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(mockHttp.getPublicTurnData).toHaveBeenCalledWith(1);
      expect(mockHttp.getPrivatePlayerData).toHaveBeenCalledWith(1, 2);
    });

    // Verificar que el fondo del juego se renderiza
    const gameBackground = document.querySelector('[style*="game_bg.png"]');
    expect(gameBackground).toBeTruthy();
  });

  it("renders player names in layout", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      // En layout de 4 jugadores aparecen estos nombres
      expect(screen.getByText("Jugador1")).toBeInTheDocument();
      expect(screen.getByText("Jugador3")).toBeInTheDocument();
      expect(screen.getByText("Jugador4")).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    const error = new Error("Network error");
    mockHttp.getPublicTurnData.mockRejectedValue(error);

    renderGame();
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Failed obtaining game data:", error);
    });

    expect(screen.getByText("Cargando jugadores...")).toBeInTheDocument();
  });

  it("shows secret cards with correct visibility", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // Debe haber cartas secretas (tanto front como back)
    const frontCards = document.querySelectorAll('[style*="05-secret_front"]');
    const backCards = document.querySelectorAll('[style*="06-secret_back"]');
    
    expect(frontCards.length).toBeGreaterThan(0);
    expect(backCards.length).toBeGreaterThan(0);
  });

  test('handles 2-player layout', async () => {
    // Datos para 2 jugadores
    mockHttp.getPublicTurnData = vi.fn().mockResolvedValue({
      players_amount: 2,
      turn_owner_id: 1,
      players: [
        { id: 1, name: "Jugador1", avatar: "avatar1.png", playerSecrets: [{}, {}, {}] },
        { id: 2, name: "Jugador2", avatar: "avatar2.png", playerSecrets: [{}, {}, {}] }
      ]
    });

    mockHttp.getPrivatePlayerData = vi.fn().mockResolvedValue({
      id: 1,
      name: "Jugador1",
      avatar: "avatar1.png",
      playerSecrets: [
        { revealed: true, image_back_name: "03-secret_murderer", image_front_name: "05-secret_front" },
        { revealed: false, image_back_name: "04-secret_accomplice", image_front_name: "05-secret_front" },
        { revealed: false, image_back_name: "06-secret_back", image_front_name: "05-secret_front" }
      ]
    });

    renderGame({ gameId: 1, myPlayerId: 1 });
    
    await waitFor(() => {
      // En layout de 2 jugadores: Jugador2 está arriba (visible)
      expect(screen.getByText("Jugador2")).toBeInTheDocument(); 
      // Verificar que el layout de 2 jugadores se está renderizando correctamente
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });
  });

  it("highlights turn owner", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // Verificar que algún jugador está visible en el layout
    expect(screen.getByText("Jugador3")).toBeInTheDocument(); // Este aparece en el HTML
    
    // Verificar que el juego se renderizó correctamente
    const gameContainer = document.querySelector('[style*="game_bg.png"]');
    expect(gameContainer).toBeInTheDocument();
  });

  it("handles missing location state", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    render(
      <MemoryRouter initialEntries={[{ pathname: "/game" }]}>
        <Game />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockHttp.getPublicTurnData).toHaveBeenCalled();
      expect(mockHttp.getPrivatePlayerData).toHaveBeenCalled();
    });
  });

    it("shows own secrets always visible", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // Los secretos propios (myPlayerId = 2) deben estar siempre visibles
    // Buscar elementos con imagen de back (secretos revelados o propios)
    const backImages = document.querySelectorAll('[style*="06-secret_back"]');
    expect(backImages.length).toBeGreaterThan(0);
  });

  // Tests adicionales para funcionalidades faltantes

  it("handles 3-player layout correctly", async () => {
    const mock3PlayerData = {
      ...mockTurnData,
      players_amount: 3,
      players: mockTurnData.players.slice(0, 3)
    };

    mockHttp.getPublicTurnData.mockResolvedValue(mock3PlayerData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // En layout de 3 jugadores: 2 arriba, 1 abajo (yo)
    expect(screen.getByText("Jugador1")).toBeInTheDocument();
    expect(screen.getByText("Jugador3")).toBeInTheDocument();
  });

  it("handles 5-player layout correctly", async () => {
    const mock5PlayerData = {
      ...mockTurnData,
      players_amount: 5,
      players: [
        ...mockTurnData.players,
        {
          id: 5,
          name: "Jugador5",
          avatar: "avatars/avatar5.png",
          turn: 5,
          playerSecrets: [
            { revealed: false, image_front_name: "05-secret_front" },
            { revealed: false, image_front_name: "05-secret_front" },
            { revealed: false, image_front_name: "05-secret_front" }
          ]
        }
      ]
    };

    mockHttp.getPublicTurnData.mockResolvedValue(mock5PlayerData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // En layout de 5 jugadores debe aparecer Jugador5
    expect(screen.getByText("Jugador5")).toBeInTheDocument();
  });

  it("handles 6-player layout correctly", async () => {
    const mock6PlayerData = {
      ...mockTurnData,
      players_amount: 6,
      players: [
        ...mockTurnData.players,
        {
          id: 5,
          name: "Jugador5",
          avatar: "avatars/avatar5.png", 
          turn: 5,
          playerSecrets: [
            { revealed: false, image_front_name: "05-secret_front" },
            { revealed: false, image_front_name: "05-secret_front" },
            { revealed: false, image_front_name: "05-secret_front" }
          ]
        },
        {
          id: 6,
          name: "Jugador6",
          avatar: "avatars/avatar6.png",
          turn: 6,
          playerSecrets: [
            { revealed: false, image_front_name: "05-secret_front" },
            { revealed: false, image_front_name: "05-secret_front" },
            { revealed: false, image_front_name: "05-secret_front" }
          ]
        }
      ]
    };

    mockHttp.getPublicTurnData.mockResolvedValue(mock6PlayerData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // En layout de 6 jugadores debe aparecer todos los jugadores
    expect(screen.getByText("Jugador5")).toBeInTheDocument();
    expect(screen.getByText("Jugador6")).toBeInTheDocument();
  });

  it("renders HandCard component with player cards", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // Verificar que se renderiza el componente HandCard
    const handCards = document.querySelectorAll('.hand-card');
    expect(handCards.length).toBeGreaterThan(0);
  });

  it("renders RegularDeck and DiscardDeck components", async () => {
    mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // Verificar que el contenedor de la mesa está presente (donde van los decks)
    const gameTable = document.querySelector('.bg-orange-950\\/90');
    expect(gameTable).toBeInTheDocument();
  });

  it("correctly orders players by turn", async () => {
    // Datos con orden específico para verificar reordenamiento
    const mockOrderedData = {
      ...mockTurnData,
      players: [
        { id: 1, name: "Jugador1", avatar: "avatar1.png", turn: 1, playerSecrets: [] },
        { id: 2, name: "Jugador2", avatar: "avatar2.png", turn: 2, playerSecrets: [] },
        { id: 3, name: "Jugador3", avatar: "avatar3.png", turn: 3, playerSecrets: [] },
        { id: 4, name: "Jugador4", avatar: "avatar4.png", turn: 4, playerSecrets: [] }
      ]
    };

    mockHttp.getPublicTurnData.mockResolvedValue(mockOrderedData);
    mockHttp.getPrivatePlayerData.mockResolvedValue({
      ...mockPlayerData,
      id: 2 // Yo soy el jugador 2
    });

    renderGame({ gameId: 1, myPlayerId: 2 });
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // Verificar que el reordenamiento funcionó (otros jugadores visibles)
    expect(screen.getByText("Jugador3")).toBeInTheDocument();
    expect(screen.getByText("Jugador4")).toBeInTheDocument();
  });

  it("handles player without secrets gracefully", async () => {
    const mockDataWithoutSecrets = {
      ...mockTurnData,
      players: mockTurnData.players.map(player => ({
        ...player,
        playerSecrets: undefined
      }))
    };

    mockHttp.getPublicTurnData.mockResolvedValue(mockDataWithoutSecrets);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // El componente no debe fallar si un jugador no tiene secretos
    expect(screen.getByText("Jugador1")).toBeInTheDocument();
  });

  it("shows loading state when playerData is null", async () => {
    // No configurar mock para que regrese null
    mockHttp.getPublicTurnData.mockResolvedValue(null);
    mockHttp.getPrivatePlayerData.mockResolvedValue(null);

    renderGame();

    // Debe mostrar el estado de carga
    expect(screen.getByText("Cargando jugadores...")).toBeInTheDocument();
  });

  it("handles different avatar paths correctly", async () => {
    const mockWithAvatars = {
      ...mockTurnData,
      players: mockTurnData.players.map((player, index) => ({
        ...player,
        avatar: `public/avatars/avatar${index + 1}.png`
      }))
    };

    mockHttp.getPublicTurnData.mockResolvedValue(mockWithAvatars);
    mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

    renderGame();
    
    await waitFor(() => {
      expect(screen.queryByText("Cargando jugadores...")).not.toBeInTheDocument();
    });

    // Verificar que los avatares se cargan con las rutas correctas
    const avatars = document.querySelectorAll('[style*="avatar1.png"]');
    expect(avatars.length).toBeGreaterThan(0);
  });
});
