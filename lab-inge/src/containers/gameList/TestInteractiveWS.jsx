//Este es una simulacion del websocket para usarlo en los componentes, para usarlo:
// se debe cambiar el nombre del archivo de TestInteractiveWss.jsx -> TestInteractiveWss.test.jsx
// luego en Game list, se debe comentar la importacion del verdadero websocket y decomentar la linea que importa este archivo 

export function createWSService() {
  let listeners = {};

  const connect = () => {
    console.log("🧪 Mock WS conectado (sin backend)");

    // Cada 5 segundos simulamos un cambio en la lista de partidas
    setInterval(() => {
      const fakeGames = [
        {
          id: 1,
          game_name: "Aventura",
          players_amount: Math.floor(Math.random() * 4),
          max_players: 4,
          min_players: 2,
          available: Math.random() > 0.3, // a veces deja de estar disponible
          creator_name: "Micaela",
        },
        {
          id: 2,
          game_name: "Estrategia",
          players_amount: Math.floor(Math.random() * 6),
          max_players: 6,
          min_players: 3,
          available: Math.random() > 0.5,
          creator_name: "Norma",
        },
      ];

      // Disparamos un evento como si viniera del servidor
      if (listeners["game_list_update"]) {
        listeners["game_list_update"](fakeGames);
      }
    }, 5000);
  };

  const on = (event, handler) => {
    listeners[event] = handler;
  };

  const off = (event) => {
    delete listeners[event];
  };

  const disconnect = () => {
    console.log("Mock WS desconectado");
  };

  return { connect, on, off, disconnect };
}
