const createHttpService = () => {
    const baseUrl = import.meta.env.VITE_SERVER_URI || 'http://localhost:8000';

    const request = async (endpoint, options = {}) => {
        const url = `${baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            // Intentar parsear el JSON de la respuesta
            let responseData;
            try {
                responseData = await response.json();
            } catch (parseError) {
                responseData = { detail: `HTTP error! status: ${response.status}` };
            }

            if (!response.ok) {
                // Crear un error personalizado con la información del servidor
                const error = new Error(responseData.detail || `HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = responseData;
                throw error;
            }

            return responseData;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    };



    const getGames = () => request("/games");

    const getGame = (gameId) => request(`/games/${gameId}`);

    const joinGame = (data) => request(`/players/unirse`, {
        method: 'POST',
        body: JSON.stringify(data)
    })

    const startGame = (gameId, playerId) => {
        if (!gameId) {
            throw new Error('Game ID is required');
        }
        if (!playerId) {
            throw new Error('Player ID is required');
        }
        return request(`/games/${gameId}/start/`, {
            method: 'PATCH'
        });
    };

    const getPublicTurnData = (gameId) => {
        
    };

    //   const getContacts = async (filters = {}) => {
    //     const params = new URLSearchParams();
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
        joinGame
        // getContacts,
        // getContact,
        // createContact,
        // deleteContact,
        // getTags
    };
};

export {
    createHttpService
};