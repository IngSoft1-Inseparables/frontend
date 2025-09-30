import { vi } from "vitest";

// Mock de React Router - para verificar navegación
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock del WebSocket Service - simula conexiones en tiempo real
vi.mock("../../services/WSService", () => {
  const listeners = {};
  const mockWS = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn((event, cb) => {
      (listeners[event] ||= []).push(cb);
    }),
    off: vi.fn((event, cb) => {
      listeners[event] = (listeners[event] || []).filter((fn) => fn !== cb);
    }),

    // Helpers para tests - permiten disparar eventos manualmente
    __emit: (event, payload) => {
      (listeners[event] || []).forEach((fn) => fn(payload));
    },
    __reset: () => {
      for (const k of Object.keys(listeners)) delete listeners[k];
    },
  };

  return {
    createWSService: () => mockWS,
    __mockWS: mockWS,
  };
});

// Mock del HTTP Service - simula llamadas al backend
vi.mock("../../services/HTTPService", () => {
  const mockHttp = {
    getGame: vi.fn(),
    startGame: vi.fn(),  // ✅ Agregar mock de startGame
  };

  return {
    createHttpService: () => mockHttp,
    __mockHttp: mockHttp,
  };
});

import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import WaitingRoom from "./WaitingRoom";
import { __mockWS as mockWS } from "../../services/WSService";
import { __mockHttp as mockHttp } from "../../services/HTTPService";

describe("WaitingRoom component", () => {
  // Props estándar usadas en la mayoría de tests
  const defaultProps = {
    gameId: "test-game-123",
    myPlayerId: "player-456"
  };

  // Datos de partida por defecto que retorna el mock HTTP
  const defaultGameData = {
    hostId: "player-456",      // El jugador actual es host
    minPlayers: 2,             // Mínimo 2 jugadores
    maxPlayers: 6,             // Máximo 6 jugadores  
    playersCount: 1            // Actualmente 1 jugador
  };

  // Helper para renderizar con Router context y state
  const renderWithRouter = (initialState = { gameId: "test-game-123", myPlayerId: "player-456" }) => {
    return render(
      <MemoryRouter initialEntries={[{ pathname: "/waiting", state: initialState }]}>
        <WaitingRoom />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Reset mocks antes de cada test para evitar interferencias
    mockWS.__reset();
    vi.clearAllMocks();
    mockNavigate.mockClear(); // ✅ Reset del mock de navigate
    mockHttp.getGame.mockResolvedValue(defaultGameData);
    mockHttp.startGame.mockResolvedValue({ success: true }); // ✅ Mock startGame
  });

  it("renderiza el título del juego", () => {
    // TEST: Verifica que el componente muestra el título principal
    renderWithRouter();
    const title = screen.getByRole("heading", { name: /El juego comenzará pronto/i });
    expect(title).toBeInTheDocument();
  });

  it("muestra el contador de jugadores inicial desde HTTP", async () => {
    // TEST: Verifica que el contador se carga desde la API HTTP
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("1/6")).toBeInTheDocument();
    });
  });

  it("actualiza el contador de jugadores cuando recibe mensajes WS", async () => {
    // TEST: Verifica que el contador se actualiza con mensajes WebSocket
    renderWithRouter();
    
    // Espera carga inicial desde HTTP
    await waitFor(() => {
      expect(screen.getByText("1/6")).toBeInTheDocument();
    });

    // Simula mensaje WebSocket cambiando contador a 3
    mockWS.__emit("players_amount", { players_amount: 3 });
    expect(await screen.findByText("3/6")).toBeInTheDocument();

    // Prueba otro valor para confirmar funcionamiento
    mockWS.__emit("players_amount", { players_amount: 5 });
    expect(await screen.findByText("5/6")).toBeInTheDocument();
  });

  it("no muestra el botón si no es host", async () => {
    // TEST: Verifica que el botón solo aparece para el host
    mockHttp.getGame.mockResolvedValue({
      ...defaultGameData,
      hostId: "another-player"  // Otro jugador es el host
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(mockHttp.getGame).toHaveBeenCalledWith("test-game-123");
    });

    // Botón NO debe aparecer para jugadores no-host
    expect(screen.queryByRole("button", { name: /Iniciar Partida/i })).not.toBeInTheDocument();
  });

  it("muestra el botón de iniciar partida cuando es host", async () => {
    // TEST: Verifica que el botón aparece cuando el jugador es host
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Iniciar Partida/i })).toBeInTheDocument();
    });
  });

  it("deshabilita el botón cuando no hay suficientes jugadores", async () => {
    // TEST: Verifica que el botón está deshabilitado con pocos jugadores
    mockHttp.getGame.mockResolvedValue({
      ...defaultGameData,
      playersCount: 1,    // Solo 1 jugador
      minPlayers: 2       // Mínimo 2 requeridos
    });

    renderWithRouter();
    
    const button = await screen.findByRole("button", { name: /Iniciar Partida/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/Se necesitan al menos 2 jugadores/i)).toBeInTheDocument();
  });

  it("habilita el botón cuando hay suficientes jugadores", async () => {
    // TEST: Verifica que el botón se habilita con suficientes jugadores
    mockHttp.getGame.mockResolvedValue({
      ...defaultGameData,
      playersCount: 3,    // 3 jugadores
      minPlayers: 2       // Más que el mínimo requerido
    });

    renderWithRouter();
    
    const button = await screen.findByRole("button", { name: /Iniciar Partida/i });
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
    // No debe mostrar mensaje de jugadores insuficientes
    expect(screen.queryByText(/Se necesitan al menos/i)).not.toBeInTheDocument();
  });

  it("permite clickear el botón cuando está habilitado", async () => {
    // TEST: Verifica que se puede hacer click en el botón habilitado
    const user = userEvent.setup();
    mockHttp.getGame.mockResolvedValue({
      ...defaultGameData,
      playersCount: 3,
      minPlayers: 2,
      hostId: "player-456"  // Asegurar que el jugador es host
    });

    renderWithRouter();
    
    const button = await screen.findByRole("button", { name: /Iniciar Partida/i });
    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    // Simula click del usuario
    await act(async () => {
      await user.click(button);
    });
    
    // Verificar que startGame fue llamado
    expect(mockHttp.startGame).toHaveBeenCalledWith("test-game-123", "player-456");
  });

  it("navega a la pantalla de game al presionar iniciar partida exitosamente", async () => {
    // TEST: Verifica que navega a /game cuando startGame es exitoso
    const user = userEvent.setup();
    mockHttp.getGame.mockResolvedValue({
      ...defaultGameData,
      playersCount: 3,
      minPlayers: 2,
      hostId: "player-456"
    });

    renderWithRouter();
    
    const button = await screen.findByRole("button", { name: /Iniciar Partida/i });
    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    // Simula click del usuario
    await act(async () => {
      await user.click(button);
    });
    
    // Verificar que se llamó a startGame
    expect(mockHttp.startGame).toHaveBeenCalledWith("test-game-123", "player-456");
    
    // Verificar que navega a la pantalla de game con los estados correctos
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/game', {
        state: {
          gameId: "test-game-123",
          myPlayerId: "player-456"
        },
        replace: true
      });
    });
  });

  it("conecta y desconecta el WebSocket correctamente", async () => {
    // TEST: Verifica el ciclo de vida completo del WebSocket
    const { unmount } = renderWithRouter();
    
    // Verifica que se conecta y registra listeners
    await waitFor(() => {
      expect(mockWS.connect).toHaveBeenCalled();
      expect(mockWS.on).toHaveBeenCalledWith("players_amount", expect.any(Function));
    });

    // Simula desmontaje del componente
    unmount();

    // Verifica cleanup correcto
    expect(mockWS.off).toHaveBeenCalledWith("players_amount", expect.any(Function));
    expect(mockWS.disconnect).toHaveBeenCalled();
  });

  it("maneja errores de HTTP Service gracefully", async () => {
    // TEST: Verifica manejo robusto de errores de red
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockHttp.getGame.mockRejectedValue(new Error("Network error"));

    renderWithRouter();
    
    await waitFor(() => {
      expect(mockHttp.getGame).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Failed obtaining game:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("actualiza el estado cuando WS envía players_amount null o undefined", async () => {
    // TEST: Verifica manejo de datos WebSocket inválidos
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("1/6")).toBeInTheDocument();
    });

    // Payloads inválidos NO deben cambiar el estado
    mockWS.__emit("players_amount", { players_amount: null });
    expect(screen.getByText("1/6")).toBeInTheDocument();

    mockWS.__emit("players_amount", {});
    expect(screen.getByText("1/6")).toBeInTheDocument();

    // Payload válido SÍ debe cambiar el estado
    mockWS.__emit("players_amount", { players_amount: 4 });
    expect(await screen.findByText("4/6")).toBeInTheDocument();
  });

  it("muestra el contador con maxPlayers personalizado", async () => {
    // TEST: Verifica soporte para configuración personalizada
    mockHttp.getGame.mockResolvedValue({
      ...defaultGameData,
      maxPlayers: 8,    // Diferente del valor por defecto (6)
      playersCount: 5
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText("5/8")).toBeInTheDocument();
    });
  });

  it("aplica las clases CSS correctas según el estado del botón", async () => {
    // TEST: Verifica que los estilos CSS cambian correctamente
    mockHttp.getGame.mockResolvedValue({
      ...defaultGameData,
      playersCount: 1,    // Insuficientes jugadores
      minPlayers: 2
    });

    renderWithRouter();
    
    const button = await screen.findByRole("button", { name: /Iniciar Partida/i });
    
    // Verifica estilos de botón deshabilitado
    expect(button).toHaveClass("bg-gray-500/50");

    // Simula cambio a estado habilitado via WebSocket
    mockWS.__emit("players_amount", { players_amount: 3 });
    
    // Verifica estilos de botón habilitado
    await waitFor(() => {
      expect(button).not.toHaveClass("cursor-not-allowed");
      expect(button).toHaveClass("bg-gradient-to-r");
    });
  });
});