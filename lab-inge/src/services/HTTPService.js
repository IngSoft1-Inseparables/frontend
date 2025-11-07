const createHttpService = () => {
  const baseUrl = import.meta.env.VITE_SERVER_URI || "http://localhost:8000";

  const request = async (endpoint, options = {}) => {
    const url = `${baseUrl}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        responseData = { detail: `HTTP error! status: ${response.status}` };
      }

      if (!response.ok) {
        const error = new Error(
          responseData.detail || `HTTP error! status: ${response.status}`
        );
        error.status = response.status;
        error.data = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  };

  const getGames = () => request("/games/list");

  const getGame = (gameId) => request(`/games/${gameId}`);

  const startGame = (gameId, playerId) => {
    if (!gameId) {
      throw new Error("Game ID is required");
    }
    if (!playerId) {
      throw new Error("Player ID is required");
    }
    return request(`/games/${gameId}/start`, {
      method: "PATCH",
    });
  };

  const joinGame = (partida_id, nombre_usuario, fecha_nacimiento, avatar) =>
    request(`/players/join`, {
      method: "POST",
      body: JSON.stringify({
        partida_id,
        nombre_usuario,
        fecha_nacimiento,
        avatar,
      }),
    });

  const leaveGame = (game_id, player_id) =>
    request(`/players/leave`, {
      method: "DELETE",
      body: JSON.stringify({
        game_id,
        player_id,
      }),
    });

  const getPublicTurnData = (gameId) => {
    if (!gameId) {
      throw new Error("Game ID is required");
    }
    return request(`/games/${gameId}/turn`);
  };

  const getPrivatePlayerData = (gameId, playerId) => {
    if (!gameId) {
      throw new Error("Game ID is required");
    }
    if (!playerId) {
      throw new Error("Player ID is required");
    }
    return request(`/games/${gameId}/turn/${playerId}`);
  };

  const createGame = (formData) =>
    request("/games/create", {
      method: "POST",
      body: JSON.stringify(formData),
    });

  const updateHand = (gameId, playerId) => {
    if (!gameId) {
      throw new Error("Game ID is required");
    }
    if (!playerId) {
      throw new Error("Player ID is required");
    }
    return request("/players/replenish", {
      method: "POST",
      body: JSON.stringify({ gameId, playerId }),
    });
  };

  const discardCard = (playerId, cardId) => {
    if (!playerId) {
      throw new Error("Game ID is required");
    }
    if (!cardId) {
      throw new Error("Card ID is required");
    }

    return request("/players/discard", {
      method: "POST",
      body: JSON.stringify({
        playerId,
        cardId,
      }),
    });
  };

  const hideSecret = ({ gameId, playerId, secretId }) => {
    if (!gameId) {
      throw new Error("Game ID is required");
    }
    if (!playerId) {
      throw new Error("Player ID is required");
    }
    if (!secretId) {
      throw new Error("Secret ID is required");
    }

    return request("/secrets/hide", {
      method: "PATCH",
      body: JSON.stringify({
        game_id: gameId,
        player_id: playerId,
        secret_id: secretId,
      }),
    });
  };

  const playSets = (game_Id, player_Id, cardIds) => {
    if (!game_Id) {
      throw new Error("Game ID is required");
    }
    if (!player_Id) {
      throw new Error("Player ID is required");
    }
    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      throw new Error("Card IDs array is required and must not be empty");
    }

    return request("/sets/set", {
      method: "POST",
      body: JSON.stringify({
        game_id: game_Id,
        player_id: player_Id,
        cards: cardIds,
      }),
    });
  };

  const playEvent = (gameId, playerId, cardId, cardName) => {
    return request("/players/play/event", {
      method: "POST",
      body: JSON.stringify({
        gameId,
        playerId,
        cardId,
        cardName,
      }),
    });
  };

  const revealSecret = ({ gameId, playerId, secretId }) => {
    if (!gameId) {
      throw new Error("Game ID is required");
    }
    if (!playerId) {
      throw new Error("Player ID is required");
    }
    if (!secretId) {
      throw new Error("Secret ID is required");
    }

    return request("/secrets/reveal", {
      method: "PATCH",
      body: JSON.stringify({
        game_id: gameId,
        player_id: playerId,
        secret_id: secretId,
      }),
    });
  };

  const forcePlayerReveal = ({ gameId, playerId }) => {
    if (!gameId) {
      throw new Error("Game ID is required");
    }
    if (!playerId) {
      throw new Error("Player ID is required");
    }

    return request(`/games/${gameId}/forceReveal/${playerId}`, {
      method: "PATCH",
    });
  };

  const stealSecret = ({ gameId, secretId, fromPlayerId, toPlayerId }) => {
    if (!gameId) {
      throw new Error("Game ID is required");
    }
    if (!secretId) {
      throw new Error("secret ID is required");
    }
    return request(`/secrets/${gameId}/secrets/${secretId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({
        fromPlayerId,
        toPlayerId,
      }),
    });
  };

  const replenishFromDraft = (gameId, playerId, carta) => {
    if (!gameId) {
      throw new Error("Game ID is required");
    }
    if (!playerId) {
      throw new Error("Player ID is required");
    }

    return request("/players/replenish/draft", {
      method: "POST",
      body: JSON.stringify({ gameId, playerId, cardId: carta.id }),
    });
  };

  const getDiscardTop5 = (gameId) => {
    if (!gameId) {
      throw new Error("Game ID is required");
    }
    return request(`/games/${gameId}/discardPile/top5`);
  };

  const replenishFromDiscard = (gameId, playerId, cardId) => {
    if (!gameId) throw new Error("Game ID is required");
    if (!playerId) throw new Error("Player ID is required");
    if (!cardId) throw new Error("Card ID is required");

    return request("/players/replenish/discard", {
      method: "POST",
      body: JSON.stringify({ gameId, playerId, cardId }),
    });
  };
 //post games/{gameId}/fivecards
  const fiveCardsToRegpile = (gameId) => {
     return request(`/games/${gameId}/fivecards`, {
      method: "PATCH",
    });
  };

  const sixCardsToDiscardpile = (gameId) => {
     return request(`/games/${gameId}/sixcards`, {
      method: "PATCH",
    });
  };

  const stealSet = (gameId, selectedSet, myPlayerId, selectedPlayer) => {
    if (!gameId) throw new Error("Game ID is required");
    if (selectedSet == null) throw new Error("Selected set is required");
    if (!myPlayerId) throw new Error("My player ID is required");
    if (!selectedPlayer) throw new Error("Selected Player ID is required");

    return request("/sets/set/steal", {
      method: "PATCH",
      body: JSON.stringify({
        gameId,
        selectedSet,
        myPlayerId,
        selectedPlayer,
      }),
    });
  };

  const addCardToSet = (gameId, myPlayerId, card_id, set_id) => {
    if (!set_id) throw new Error("Set Id is required");
    if (!myPlayerId) throw new Error("My player ID is required");
    if (!card_id) throw new Error("Card ID is required");

    return request(`/sets/${set_id}/AddToSet`, {
      method: "POST",
      body: JSON.stringify({
        playerId: myPlayerId,
        cardId: card_id,
      }),
    });
  };

    const removeNotSoFast = (gameId, playerId) => {
      if (!gameId) throw new Error("Game ID is required");
      if (!playerId) throw new Error("Player ID is required");

      return request(`/players/${gameId}/remove_not_so_fast/${playerId}`, {
        method: "POST",
      });
    };
  const getOpponentHand = (gameId, currentPlayerId, opponentId) => {
    // currentPlayerId = turn_owner_id
    // opponentId = jugador del cual quiero ver las cartas
    return request(`/players/${gameId}/hand/${opponentId}/${currentPlayerId}`);
  };


  const exchangeCards = ({ game_id, player1_id, player2_id, card1_id, card2_id }) => {
    return request("/players/exchangeCards", {
      method: "PATCH",
      body: JSON.stringify({ game_id, player1_id, player2_id, card1_id, card2_id }),
    });
  };


  return {
    getGame,
    getGames,
    startGame,
    joinGame,
    getPublicTurnData,
    getPrivatePlayerData,
    createGame,
    updateHand,
    discardCard,
    playSets,
    leaveGame,
    playEvent,
    hideSecret,
    revealSecret,
    forcePlayerReveal,
    stealSecret,
    replenishFromDraft,
    getDiscardTop5,
    replenishFromDiscard,
    stealSet,
    addCardToSet,
    fiveCardsToRegpile,
    sixCardsToDiscardpile,
    stealSet,
    removeNotSoFast,
    getOpponentHand,
    exchangeCards,
  };
};

export { createHttpService };
