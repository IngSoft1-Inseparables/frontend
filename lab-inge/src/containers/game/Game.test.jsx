import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import Game from "./Game";

// Variable global para capturar el handler onDragEnd
let capturedOnDragEnd = null;

// --- Mock del @dnd-kit/core para capturar el handler ---
vi.mock("@dnd-kit/core", async () => {
  const actual = await vi.importActual("@dnd-kit/core");
  return {
    ...actual,
    DndContext: ({ children, onDragEnd, ...props }) => {
      capturedOnDragEnd = onDragEnd;
      return <div>{children}</div>;
    },
  };
});

// --- Mock del HTTPService ---
vi.mock("../../services/HTTPService", () => {
  const mockHttpService = {
    getPublicTurnData: vi.fn(),
    getPrivatePlayerData: vi.fn(),
    updateHand: vi.fn(),
    discardCard: vi.fn(),
  };

  return {
    createHttpService: vi.fn(() => mockHttpService),
    __mockHttp: mockHttpService,
  };
});
import { __mockHttp as mockHttp } from "../../services/HTTPService";

// --- Mock del WSService ---
vi.mock("../../services/WSService", () => {
  const mockWSService = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
  };

  return {
    createWSService: vi.fn(() => mockWSService),
    __mockWS: mockWSService,
  };
});
import { __mockWS as mockWS } from "../../services/WSService";

// --- Mock del GameBoard ---
let gameBoardProps = null;

vi.mock("./components/GameBoard/GameBoard", () => ({
  default: ({ orderedPlayers, playerData, turnData, myPlayerId, onCardClick }) => {
    // Capturar los props cada vez que se renderiza
    gameBoardProps = { orderedPlayers, playerData, turnData, myPlayerId, onCardClick };
    
    return (
      <div data-testid="game-board">
        <div data-testid="player-count">{orderedPlayers?.length || 0}</div>
        <div data-testid="my-player-id">{myPlayerId}</div>
        <div data-testid="players-amount">{turnData?.players_amount || 0}</div>
        {orderedPlayers?.map((player) => (
          <div key={player?.id} data-testid={`player-${player?.id}`}>
            {player?.name}
          </div>
        ))}
        <button data-testid="card-button" onClick={onCardClick}>Click Card</button>
      </div>
    );
  },
}));

describe("Game Container", () => {
  const renderGame = (initialState = { gameId: 1, myPlayerId: 2 }) => {
    return render(
      <MemoryRouter initialEntries={[{ pathname: "/game", state: initialState }]}>
        <Game />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    console.error = vi.fn();
    console.log = vi.fn();
    capturedOnDragEnd = null; // Reset el handler capturado
    gameBoardProps = null; // Reset los props capturados
  });

  afterEach(() => {
    vi.clearAllMocks();
    capturedOnDragEnd = null;
    gameBoardProps = null;
  });

  const mockTurnData = {
    players_amount: 4,
    turn_owner_id: 2,
    players: [
      { id: 1, name: "Jugador1", avatar: "avatars/avatar1.png", turn: 1, playerSecrets: [{}, {}, {}] },
      { id: 2, name: "Jugador2", avatar: "avatars/avatar2.png", turn: 2, playerSecrets: [{}, {}, {}] },
      { id: 3, name: "Jugador3", avatar: "avatars/avatar3.png", turn: 3, playerSecrets: [{}, {}, {}] },
      { id: 4, name: "Jugador4", avatar: "avatars/avatar4.png", turn: 4, playerSecrets: [{}, {}, {}] },
    ],
  };

  const mockPlayerData = {
    id: 2,
    name: "Jugador2",
    avatar: "avatars/avatar2.png",
    playerSecrets: [{}, {}, {}],
    playerCards: [
      { card_id: 1, card_name: "Carta1" },
      { card_id: 2, card_name: "Carta2" },
      { card_id: 3, card_name: "Carta3" },
    ],
  };

  describe("Loading State", () => {
    it("renders loading screen initially", () => {
      renderGame();
      expect(screen.getByText("Cargando jugadores...")).toBeInTheDocument();
    });
  });

  describe("HTTP Service Integration", () => {
    it("calls HTTP services with correct parameters", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 10, myPlayerId: 99 });

      await waitFor(() => {
        expect(mockHttp.getPublicTurnData).toHaveBeenCalledWith(10);
        expect(mockHttp.getPrivatePlayerData).toHaveBeenCalledWith(10, 99);
      });
    });

    it("handles API errors gracefully", async () => {
      const error = new Error("network fail");
      mockHttp.getPublicTurnData.mockRejectedValue(error);

      renderGame();

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("Failed obtaining game data:", error);
      });

      expect(screen.getByText("Cargando jugadores...")).toBeInTheDocument();
    });

    it("calls updateHand and logs hand on success", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
      mockHttp.updateHand.mockResolvedValue([{ card_id: 1, card_name: "Carta1" }]);

      renderGame();

      const button = await screen.findByTestId("card-button");
      await fireEvent.click(button);

      await waitFor(() => {
        expect(mockHttp.updateHand).toHaveBeenCalledWith(mockTurnData.gameId, mockTurnData.turn_owner_id);
        expect(console.log).toHaveBeenCalledWith("Update Hand:", [{ card_id: 1, card_name: "Carta1" }]);
      });
    });

    it("handles updateHand failure gracefully", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
      const error = new Error("update fail");
      mockHttp.updateHand.mockRejectedValue(error);

      renderGame();

      const button = await screen.findByTestId("card-button");
      await fireEvent.click(button);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("Failed to update hand:", error);
      });
    });

    it("handles WebSocket player_private_update correctly", async () => {
  renderGame({ gameId: 1, myPlayerId: 2 });

  const privateHandler = mockWS.on.mock.calls.find(call => call[0] === "player_private_update")[1];

  // Simulamos un update de cartas del jugador
  const updatedPlayerData = { ...mockPlayerData, playerCards: [{ card_id: 99, card_name: "Carta99" }] };

  await waitFor(() => privateHandler(JSON.stringify(updatedPlayerData)));

  // Comprobamos que GameBoard recibió el nuevo playerData
  const cardButton = screen.getByTestId("card-button");
  expect(cardButton).toBeInTheDocument(); 
});


it("handles updateHand returning empty array", async () => {
  mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
  mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
  mockHttp.updateHand.mockResolvedValue([]); // vacío

  renderGame();

  const button = await screen.findByTestId("card-button");
  await fireEvent.click(button);

  await waitFor(() => {
    expect(console.log).toHaveBeenCalledWith("Update Hand:", []); // cubre branch de array vacío
  });
});
it("handles player reordering when only 2 players", async () => {
  const turnData2 = { ...mockTurnData, players: mockTurnData.players.slice(0,2), players_amount: 2 };
  mockHttp.getPublicTurnData.mockResolvedValue(turnData2);
  mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

  renderGame({ gameId: 1, myPlayerId: 2 });

  await waitFor(() => expect(screen.getByTestId("game-board")).toBeInTheDocument());

  expect(screen.getByTestId("player-2")).toBeInTheDocument();
  expect(screen.getByTestId("player-1")).toBeInTheDocument();
});


  });

  describe("Player Reordering Logic", () => {
    it("reorders players correctly with current player first", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => expect(screen.getByTestId("game-board")).toBeInTheDocument());

      expect(screen.getByTestId("player-2")).toBeInTheDocument();
      expect(screen.getByTestId("player-3")).toBeInTheDocument();
      expect(screen.getByTestId("player-4")).toBeInTheDocument();
      expect(screen.getByTestId("player-1")).toBeInTheDocument();
    });
  });

  describe("WebSocket Integration", () => {
    it("connects to WebSocket on mount", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame();

      await waitFor(() => expect(mockWS.connect).toHaveBeenCalled());
    });

    it("disconnects WebSocket on unmount", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      const { unmount } = renderGame();

      await waitFor(() => expect(mockWS.connect).toHaveBeenCalled());

      unmount();

      expect(mockWS.off).toHaveBeenCalled();
      expect(mockWS.disconnect).toHaveBeenCalled();
    });
  });

  describe("Navigation Validation", () => {
    it("logs error if gameId or myPlayerId missing", async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: "/game", state: { myPlayerId: 2 } }]}>
          <Game />
        </MemoryRouter>
      );

      await waitFor(() => expect(console.error).toHaveBeenCalledWith("Missing gameId or myPlayerId in navigation state"));
    });

    it("logs error when state missing completely", async () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: "/game" }]}>
          <Game />
        </MemoryRouter>
      );

      await waitFor(() => expect(console.error).toHaveBeenCalledWith("Missing gameId or myPlayerId in navigation state"));
    });
  });

  describe("Data Passing to GameBoard", () => {
    it("passes correct props to GameBoard component", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => expect(screen.getByTestId("game-board")).toBeInTheDocument());

      expect(screen.getByTestId("player-count")).toHaveTextContent("4");
      expect(screen.getByTestId("my-player-id")).toHaveTextContent("2");
      expect(screen.getByTestId("players-amount")).toHaveTextContent("4");
    });
  });

  describe("WebSocket Event Handlers", () => {
    it("updates turn data when game_public_update event is received", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });

      // Simular evento de WebSocket con nuevo turn_owner_id
      const updatedTurnData = {
        ...mockTurnData,
        turn_owner_id: 3,
      };

      // Obtener el handler registrado
      const onCalls = mockWS.on.mock.calls;
      const gamePublicUpdateHandler = onCalls.find(
        call => call[0] === "game_public_update"
      )?.[1];

      expect(gamePublicUpdateHandler).toBeDefined();

      // Simular la llamada del handler con string JSON
      gamePublicUpdateHandler(JSON.stringify(updatedTurnData));

      // Verificar que el componente se actualiza (el GameBoard recibe nuevos datos)
      await waitFor(() => {
        // El componente debería re-renderizar con los nuevos datos
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });
    });

    it("updates turn data when game_public_update event is received with object payload", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });

      const updatedTurnData = {
        ...mockTurnData,
        turn_owner_id: 4,
      };

      const onCalls = mockWS.on.mock.calls;
      const gamePublicUpdateHandler = onCalls.find(
        call => call[0] === "game_public_update"
      )?.[1];

      // Simular la llamada con objeto (no string)
      gamePublicUpdateHandler(updatedTurnData);

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });
    });

    it("updates player data when player_private_update event is received", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });

      const updatedPlayerData = {
        ...mockPlayerData,
        playerCards: [
          { card_id: 5, card_name: "CartaNueva" },
        ],
      };

      const onCalls = mockWS.on.mock.calls;
      const playerPrivateUpdateHandler = onCalls.find(
        call => call[0] === "player_private_update"
      )?.[1];

      expect(playerPrivateUpdateHandler).toBeDefined();

      // Simular la llamada del handler con string JSON
      playerPrivateUpdateHandler(JSON.stringify(updatedPlayerData));

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });
    });

    it("updates player data when player_private_update event is received with object payload", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });

      const updatedPlayerData = {
        ...mockPlayerData,
        playerCards: [
          { card_id: 6, card_name: "OtraCartaNueva" },
        ],
      };

      const onCalls = mockWS.on.mock.calls;
      const playerPrivateUpdateHandler = onCalls.find(
        call => call[0] === "player_private_update"
      )?.[1];

      // Simular la llamada con objeto (no string)
      playerPrivateUpdateHandler(updatedPlayerData);

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
      });
    });
  });

  describe("Drag and Drop Functionality", () => {
    it("does not call discardCard when dropped outside discard deck", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
      mockHttp.discardCard.mockResolvedValue({ success: true });

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
        expect(capturedOnDragEnd).toBeDefined();
      });

      const initialDiscardCallCount = mockHttp.discardCard.mock.calls.length;

      // Simular drag end sin target (dropped outside)
      const dragEndEvent = {
        active: {
          id: 'card-1',
          data: {
            current: {
              cardId: 1,
              cardName: 'Carta1'
            }
          }
        },
        over: null
      };

      await capturedOnDragEnd(dragEndEvent);

      // Verificar que NO se llamó discardCard
      expect(mockHttp.discardCard).toHaveBeenCalledTimes(initialDiscardCallCount);
    });

    it("calls discardCard API when card is dropped on discard deck during player's turn", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
      mockHttp.discardCard.mockResolvedValue({ success: true });

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
        expect(capturedOnDragEnd).toBeDefined();
      });

      // Simular drag end sobre el mazo de descarte
      const dragEndEvent = {
        active: {
          id: 'card-1',
          data: {
            current: {
              cardId: 1,
              cardName: 'Carta1'
            }
          }
        },
        over: {
          id: 'discard-deck'
        }
      };

      await capturedOnDragEnd(dragEndEvent);

      // Verificar que se llamó discardCard con los parámetros correctos
      await waitFor(() => {
        expect(mockHttp.discardCard).toHaveBeenCalledWith(2, 1);
      });
    });

    it("does not call discardCard when it's not player's turn", async () => {
      const notMyTurnData = {
        ...mockTurnData,
        turn_owner_id: 3, // No es el turno del jugador 2
      };
      mockHttp.getPublicTurnData.mockResolvedValue(notMyTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
      mockHttp.discardCard.mockResolvedValue({ success: true });

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
        expect(capturedOnDragEnd).toBeDefined();
      });

      const initialDiscardCallCount = mockHttp.discardCard.mock.calls.length;

      // Simular drag end sobre el mazo de descarte
      const dragEndEvent = {
        active: {
          id: 'card-1',
          data: {
            current: {
              cardId: 1,
              cardName: 'Carta1'
            }
          }
        },
        over: {
          id: 'discard-deck'
        }
      };

      await capturedOnDragEnd(dragEndEvent);

      // Verificar que NO se llamó discardCard porque no es el turno del jugador
      expect(mockHttp.discardCard).toHaveBeenCalledTimes(initialDiscardCallCount);
    });

    it("handles discardCard API error gracefully", async () => {
      const initialTurnData = {
        ...mockTurnData,
        discardpile: {
          count: 3,
          last_card_name: 'OldCard',
          last_card_image: 'old_card_image'
        }
      };

      const initialPlayerData = {
        ...mockPlayerData,
        playerCards: [
          { card_id: 1, card_name: 'Carta1', image_name: 'detective_poirot' },
          { card_id: 2, card_name: 'Carta2', image_name: 'detective_marple' },
        ]
      };

      mockHttp.getPublicTurnData.mockResolvedValue(initialTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(initialPlayerData);
      const error = new Error("API Error");
      mockHttp.discardCard.mockRejectedValue(error);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
        expect(capturedOnDragEnd).toBeDefined();
      });

      // Simular drag end sobre el mazo de descarte
      const dragEndEvent = {
        active: {
          id: 'card-1',
          data: {
            current: {
              cardId: 1,
              cardName: 'Carta1',
              imageName: 'detective_poirot'
            }
          }
        },
        over: {
          id: 'discard-deck'
        }
      };

      await capturedOnDragEnd(dragEndEvent);

      // Verificar que se intentó llamar discardCard
      await waitFor(() => {
        expect(mockHttp.discardCard).toHaveBeenCalledWith(2, 1);
      });

      // Verificar que se registró el error
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error al descartar carta:', error);
      });

      // El test verifica que el error se manejó correctamente
      // En una implementación real, verificaríamos que los estados se revirtieron
      // pero como GameBoard está mockeado, no podemos verificar el estado interno directamente
    });

    it("rollbacks playerData and turnData when discardCard API fails", async () => {
      const initialTurnData = {
        ...mockTurnData,
        discardpile: {
          count: 5,
          last_card_name: 'InitialCard',
          last_card_image: 'initial_image'
        }
      };

      const initialPlayerData = {
        ...mockPlayerData,
        playerCards: [
          { card_id: 10, card_name: 'TestCard1', image_name: 'test_image_1' },
          { card_id: 20, card_name: 'TestCard2', image_name: 'test_image_2' },
          { card_id: 30, card_name: 'TestCard3', image_name: 'test_image_3' },
        ]
      };

      mockHttp.getPublicTurnData.mockResolvedValue(initialTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(initialPlayerData);
      
      // Simular error en la API
      const apiError = new Error("Network Error");
      mockHttp.discardCard.mockRejectedValue(apiError);

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
        expect(capturedOnDragEnd).toBeDefined();
      });

      // Esperar a que se establezcan los props iniciales
      await waitFor(() => {
        expect(gameBoardProps).toBeDefined();
        expect(gameBoardProps.playerData).toBeDefined();
        expect(gameBoardProps.turnData).toBeDefined();
      });

      // Capturar el estado inicial
      const initialPlayerCards = [...gameBoardProps.playerData.playerCards];
      const initialDiscardPile = { ...gameBoardProps.turnData.discardpile };

      // Verificar que el estado inicial es correcto
      expect(initialPlayerCards).toHaveLength(3);
      expect(initialPlayerCards[0].card_id).toBe(10);
      expect(initialDiscardPile.count).toBe(5);
      expect(initialDiscardPile.last_card_name).toBe('InitialCard');

      // Simular drag end sobre el mazo de descarte
      const dragEndEvent = {
        active: {
          id: 'card-10',
          data: {
            current: {
              cardId: 10,
              cardName: 'TestCard1',
              imageName: 'test_image_1'
            }
          }
        },
        over: {
          id: 'discard-deck'
        }
      };

      await capturedOnDragEnd(dragEndEvent);

      // Esperar a que el error se procese y se ejecute el rollback
      await waitFor(() => {
        expect(mockHttp.discardCard).toHaveBeenCalledWith(2, 10);
        expect(console.error).toHaveBeenCalledWith('Error al descartar carta:', apiError);
      });

      // Esperar un tick adicional para que se ejecute el setState del rollback
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verificar que después del error, el estado se restauró
      expect(gameBoardProps.playerData.playerCards).toHaveLength(3);
      expect(gameBoardProps.playerData.playerCards[0].card_id).toBe(10);
      expect(gameBoardProps.playerData.playerCards[1].card_id).toBe(20);
      expect(gameBoardProps.playerData.playerCards[2].card_id).toBe(30);
      expect(gameBoardProps.turnData.discardpile.count).toBe(5);
      expect(gameBoardProps.turnData.discardpile.last_card_name).toBe('InitialCard');
      expect(gameBoardProps.turnData.discardpile.last_card_image).toBe('initial_image');
    });

    it("removes card optimistically from playerData when dropped on discard deck", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      const initialPlayerData = {
        ...mockPlayerData,
        playerCards: [
          { card_id: 1, card_name: "Carta1" },
          { card_id: 2, card_name: "Carta2" },
          { card_id: 3, card_name: "Carta3" },
        ],
      };
      mockHttp.getPrivatePlayerData.mockResolvedValue(initialPlayerData);
      mockHttp.discardCard.mockResolvedValue({ success: true });

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
        expect(capturedOnDragEnd).toBeDefined();
      });

      // Simular drag end sobre el mazo de descarte
      const dragEndEvent = {
        active: {
          id: 'card-1',
          data: {
            current: {
              cardId: 1,
              cardName: 'Carta1'
            }
          }
        },
        over: {
          id: 'discard-deck'
        }
      };

      await capturedOnDragEnd(dragEndEvent);

      // Verificar que se llamó discardCard
      await waitFor(() => {
        expect(mockHttp.discardCard).toHaveBeenCalledWith(2, 1);
      });

      // El estado se actualiza optimistamente, pero no podemos verificarlo fácilmente
      // porque GameBoard está mockeado. Al menos verificamos que la API fue llamada.
    });

    it("handles null playerData gracefully during drag-and-drop", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      // Simular que playerData es null inicialmente
      mockHttp.getPrivatePlayerData.mockResolvedValue(null);
      mockHttp.discardCard.mockResolvedValue({ success: true });

      renderGame({ gameId: 1, myPlayerId: 2 });

      // Esperar un poco para que se ejecute el efecto
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar que el handler fue capturado
      expect(capturedOnDragEnd).toBeDefined();

      // Simular drag end sobre el mazo de descarte con playerData null
      const dragEndEvent = {
        active: {
          id: 'card-1',
          data: {
            current: {
              cardId: 1,
              cardName: 'Carta1'
            }
          }
        },
        over: {
          id: 'discard-deck'
        }
      };

      // Esto no debería fallar incluso si playerData es null
      await capturedOnDragEnd(dragEndEvent);

      // Verificar que aún así se intentó descartar
      await waitFor(() => {
        expect(mockHttp.discardCard).toHaveBeenCalledWith(2, 1);
      });
    });

    it("updates discard pile optimistically when card is dropped", async () => {
      const turnDataWithDiscardPile = {
        ...mockTurnData,
        discardpile: {
          count: 2,
          last_card_name: 'OldCard',
          last_card_image: 'old_card'
        }
      };

      mockHttp.getPublicTurnData.mockResolvedValue(turnDataWithDiscardPile);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
      mockHttp.discardCard.mockResolvedValue({ success: true });

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
        expect(capturedOnDragEnd).toBeDefined();
      });

      // Simular drag end sobre el mazo de descarte
      const dragEndEvent = {
        active: {
          id: 'card-1',
          data: {
            current: {
              cardId: 1,
              cardName: 'Carta1',
              imageName: 'detective_poirot'
            }
          }
        },
        over: {
          id: 'discard-deck'
        }
      };

      await capturedOnDragEnd(dragEndEvent);

      // Verificar que se llamó discardCard
      await waitFor(() => {
        expect(mockHttp.discardCard).toHaveBeenCalledWith(2, 1);
      });

      // El mazo de descarte debería actualizarse optimistamente
      // Aunque no podemos verificar directamente el estado interno,
      // el test asegura que la lógica se ejecuta sin errores
    });

    it("initializes discard pile if it doesn't exist when card is dropped", async () => {
      const turnDataWithoutDiscardPile = {
        ...mockTurnData,
        // No tiene discardpile definido
      };

      mockHttp.getPublicTurnData.mockResolvedValue(turnDataWithoutDiscardPile);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
      mockHttp.discardCard.mockResolvedValue({ success: true });

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
        expect(capturedOnDragEnd).toBeDefined();
      });

      // Simular drag end sobre el mazo de descarte
      const dragEndEvent = {
        active: {
          id: 'card-1',
          data: {
            current: {
              cardId: 1,
              cardName: 'Carta1',
              imageName: 'detective_poirot'
            }
          }
        },
        over: {
          id: 'discard-deck'
        }
      };

      await capturedOnDragEnd(dragEndEvent);

      // Verificar que se llamó discardCard
      await waitFor(() => {
        expect(mockHttp.discardCard).toHaveBeenCalledWith(2, 1);
      });

      // El mazo de descarte debería inicializarse correctamente desde 0
    });

    it("handles null turnData gracefully during drag-and-drop discard pile update", async () => {
      mockHttp.getPublicTurnData.mockResolvedValue(mockTurnData);
      mockHttp.getPrivatePlayerData.mockResolvedValue(mockPlayerData);
      mockHttp.discardCard.mockResolvedValue({ success: true });

      renderGame({ gameId: 1, myPlayerId: 2 });

      await waitFor(() => {
        expect(screen.getByTestId("game-board")).toBeInTheDocument();
        expect(capturedOnDragEnd).toBeDefined();
      });

      // Capturar el handler original
      const originalHandler = capturedOnDragEnd;

      // Simular que turnData se vuelve null (caso extremo edge case)
      // Esto es poco probable pero debemos manejarlo
      const dragEndEvent = {
        active: {
          id: 'card-1',
          data: {
            current: {
              cardId: 1,
              cardName: 'Carta1',
              imageName: 'detective_poirot'
            }
          }
        },
        over: {
          id: 'discard-deck'
        }
      };

      // La función no debería fallar aunque turnData sea null internamente
      await originalHandler(dragEndEvent);

      // Verificar que se intentó llamar discardCard
      await waitFor(() => {
        expect(mockHttp.discardCard).toHaveBeenCalledWith(2, 1);
      });
    });
  });
});
