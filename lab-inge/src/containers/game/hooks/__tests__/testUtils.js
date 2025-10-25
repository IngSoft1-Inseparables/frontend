import { vi } from "vitest";

/**
 * Datos mock compartidos para los tests
 */
export const mockTurnData = {
  players_amount: 4,
  turn_owner_id: 2,
  turn_state: "None",
  players: [
    { id: 1, name: "Jugador1", avatar: "avatars/avatar1.png", turn: 1, playerSecrets: [{}, {}, {}] },
    { id: 2, name: "Jugador2", avatar: "avatars/avatar2.png", turn: 2, playerSecrets: [{}, {}, {}] },
    { id: 3, name: "Jugador3", avatar: "avatars/avatar3.png", turn: 3, playerSecrets: [{}, {}, {}] },
    { id: 4, name: "Jugador4", avatar: "avatars/avatar4.png", turn: 4, playerSecrets: [{}, {}, {}] },
  ],
};

export const mockPlayerData = {
  id: 2,
  name: "Jugador2",
  avatar: "avatars/avatar2.png",
  playerSecrets: [{}, {}, {}],
  playerCards: [
    { card_id: 1, card_name: "Carta1", image_name: "carta1.png", type: "Action" },
    { card_id: 2, card_name: "Carta2", image_name: "carta2.png", type: "Action" },
    { card_id: 3, card_name: "Carta3", image_name: "carta3.png", type: "Action" },
  ],
};

/**
 * Crea un mock del HTTPService
 */
export const createMockHttpService = () => ({
  getPublicTurnData: vi.fn(),
  getPrivatePlayerData: vi.fn(),
  updateHand: vi.fn(),
  discardCard: vi.fn(),
  playSets: vi.fn(),
  revealSecret: vi.fn(),
  hideSecret: vi.fn(),
  forcePlayerReveal: vi.fn(),
  stealSecret: vi.fn(),
  playEvent: vi.fn(),
  replenishFromDiscard: vi.fn(),
});

/**
 * Crea un mock del WSService
 */
export const createMockWSService = () => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  send: vi.fn(),
});

/**
 * Crea un evento de drag and drop simulado para tests
 */
export const createDragEvent = (cardId, cardName, imageName, targetId) => ({
  active: {
    id: `card-${cardId}`,
    data: {
      current: {
        cardId,
        cardName,
        imageName,
      },
    },
  },
  over: targetId ? { id: targetId } : null,
});


/**
 * Espera a que se complete una actualización asíncrona
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));
