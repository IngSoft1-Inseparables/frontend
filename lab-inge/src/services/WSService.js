// services/WSService.js

const createWSService = (gameId = null, playerId = null) => {
  let ws = null;
  let wsUrl = import.meta.env.VITE_WS_URI || 'ws://localhost:8000/ws';
  const listeners = {};
  
  // Variables para reconexión
  let reconnectAttempts = 0;
  let maxReconnectAttempts = 5;
  let reconnectDelay = 1000;
  let isManualDisconnect = false;
  let heartbeatInterval = null;
  let heartbeatTimeout = null;

  // Construir URL con parámetros
  const params = new URLSearchParams();
  if (gameId) params.append('game_id', gameId);
  if (playerId) params.append('player_id', playerId);
  if (params.toString()) {
    wsUrl += `?${params.toString()}`;
  }

  // Función para emitir eventos
  const emit = (event, data) => {
    if (listeners[event]) {
      listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error en listener de '${event}':`, error);
        }
      });
    }
  };

  // Sistema de heartbeat (ping-pong)
  const startHeartbeat = () => {
    stopHeartbeat();
    
    // Enviar ping cada 30 segundos
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping' }));
          
          // Timeout si no hay respuesta en 10 segundos
          heartbeatTimeout = setTimeout(() => {
            console.warn('⚠️ No se recibió pong, reconectando...');
            ws.close();
          }, 10000);
        } catch (error) {
          console.error('Error enviando ping:', error);
        }
      }
    }, 30000);
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
  };

  const resetHeartbeatTimeout = () => {
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
  };

  // Función de reconexión con backoff exponencial
  const attemptReconnect = () => {
    if (isManualDisconnect) {
      console.log('🛑 Reconexión cancelada (desconexión manual)');
      return;
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('❌ Máximo de intentos de reconexión alcanzado');
      emit('connection_failed', { attempts: reconnectAttempts });
      return;
    }

    reconnectAttempts++;
    const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts - 1), 30000);

    console.log(`🔄 Reintentando conexión en ${delay}ms (intento ${reconnectAttempts}/${maxReconnectAttempts})`);
    emit('reconnecting', { attempt: reconnectAttempts, delay });

    setTimeout(() => {
      if (!isManualDisconnect) {
        connect();
      }
    }, delay);
  };

  // Función de conexión
  const connect = () => {
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
      console.log('⚠️ Ya existe una conexión activa o en proceso');
      return;
    }

    isManualDisconnect = false;
    console.log('🔌 Conectando WebSocket...', wsUrl);

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        reconnectAttempts = 0; // Reset contador
        emit('connection_status', { status: 'connected' });
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Resetear timeout del heartbeat al recibir cualquier mensaje
          resetHeartbeatTimeout();

          // Si es un pong, no hacer nada más
          if (data.type === 'pong') {
            return;
          }

          // Manejar mensaje según su tipo
          if (data.type) {
            emit(data.type, data.payload || data);
          } else {
            // Compatibilidad con formato anterior
            if (data.game_public_update) {
              emit('game_public_update', data.game_public_update);
            }
            if (data.player_private_update) {
              emit('player_private_update', data.player_private_update);
            }
          }
        } catch (error) {
          console.error('❌ Error al parsear mensaje:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔴 WebSocket cerrado:', event.code, event.reason);
        stopHeartbeat();
        emit('connection_status', { status: 'disconnected', code: event.code });

        // Reconectar automáticamente si no fue cierre manual
        if (!isManualDisconnect && event.code !== 1000) {
          attemptReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        emit('connection_error', { error });
      };
    } catch (error) {
      console.error('❌ Failed to connect to WebSocket:', error);
      attemptReconnect();
    }
  };

  // Registrar event listener
  const on = (event, callback) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    // Evitar duplicados
    if (!listeners[event].includes(callback)) {
      listeners[event].push(callback);
    }
  };

  // Remover event listener
  const off = (event, callback) => {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    }
  };

  // Desconectar manualmente
  const disconnect = () => {
    console.log('🔌 Desconectando WebSocket manualmente...');
    isManualDisconnect = true;
    stopHeartbeat();
    
    if (ws) {
      ws.close(1000, 'Cierre normal');
      ws = null;
    }
    
    // Limpiar todos los listeners
    Object.keys(listeners).forEach(key => delete listeners[key]);
  };

  // Verificar si está conectado
  const isConnected = () => {
    return ws && ws.readyState === WebSocket.OPEN;
  };

  // Enviar mensaje
  const send = (data) => {
    if (isConnected()) {
      try {
        ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('❌ Error al enviar mensaje:', error);
      }
    } else {
      console.warn('⚠️ No se puede enviar mensaje, WebSocket no conectado');
    }
  };

  return {
    connect,
    on,
    off,
    disconnect,
    isConnected,
    send
  };
};

export { createWSService };