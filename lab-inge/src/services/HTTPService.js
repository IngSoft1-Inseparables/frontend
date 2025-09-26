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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    };

    const getGames = () => request("/games");

    const getGame = (id) => request(`/game/${id}`);


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
        getGames
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