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

  const joinLobby = (partida_id, nombre_usuario, fecha_nacimiento) =>
    request(`/players/join`, {
      method: "POST",
      body: JSON.stringify({
        partida_id,
        nombre_usuario,
        fecha_nacimiento,
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
      throw new Error('Game ID is required');
    }
    if (!playerId) {
      throw new Error('Player ID is required');
    }
    return request("/players/replenish", {
      method: "POST",
      body: JSON.stringify({ gameId, playerId })
    });
  }
  //     Object.entries(filters).forEach(([key, value]) => {
  //       if (value) params.append(key, value);
  //     });
  //     const queryString = params.toString();
  //     return request(`/contacts${queryString ? `?${queryString}` : ''}`);
  //   };

  //   const getContact = async (id) => {
  //     return request(`/contacts/${id}`);
  //   };

  //   const createContact = async (contactData) => {
  //     return request('/contacts', {
  //       method: 'POST',
  //       body: JSON.stringify(contactData),
  //     });
  //   };

  //   const deleteContact = async (id) => {
  //     return request(`/contacts/${id}`, {
  //       method: 'DELETE',
  //     });
  //   };

  //   const getTags = async () => {
  //     return request('/tags');
  //   };

  return {
    getGame,
    getGames,
    startGame,
    joinLobby,
    getPublicTurnData,
    getPrivatePlayerData,
    createGame,
    updateHand,
    // getContacts,
    // getContact,
    // createContact,
    // deleteContact,
    // getTags
  };
};

export { createHttpService };
