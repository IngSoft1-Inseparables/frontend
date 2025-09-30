const createWSService = () => {
    let ws = null;
    let isConnected = false;
    const wsUrl = import.meta.env.VITE_WS_URI || 'ws://localhost:8000/ws';
    const listeners = {};
  
    const emit = (event, data) => {
      if (listeners[event]) {
        listeners[event].forEach(callback => callback(data));
      }
    };
  
    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          isConnected = true;
          console.log('WebSocket connected');
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            emit(data.type, data.payload);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          isConnected = false;
          setTimeout(() => connect(), 3000);
        };
        
        ws.onerror = (error) => {
          isConnected = false;
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        isConnected = false;
        console.error('Failed to connect to WebSocket:', error);
      }
    };
  
    const on = (event, callback) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    };
  
    const off = (event, callback) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(cb => cb !== callback);
      }
    };
  
    const disconnect = () => {
      if (ws) {
        ws.close();
      }
    };
  
    return {
      isConnected,
      connect,
      on,
      off,
      disconnect
    };
  };

  export {
    createWSService
  };