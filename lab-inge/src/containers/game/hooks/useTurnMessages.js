import { useState, useEffect } from "react";

/**
 * Hook para manejar los mensajes mostrados al usuario según el estado del turno
 */
export const useTurnMessages = (turnData, myPlayerId, orderedPlayers) => {
  const [message, setMessage] = useState(" ");

  const getPlayerNameById = (playerId) => {
    if (!orderedPlayers || orderedPlayers.length === 0) return "Jugador";
    const player = orderedPlayers.find((p) => p?.id === parseInt(playerId));
    return player?.name || "Jugador";
  };

  useEffect(() => {
    if (!turnData) return;


    // Detectar si YO estoy en desgracia social
    const me = turnData.players?.find(
      (p) => p.id === parseInt(myPlayerId)
    );
    const inDisgrace = !!me?.in_disgrace;

    // Si es mi turno y estoy en desgracia, mostrar mensaje prioritario
    if (turnData.turn_owner_id === myPlayerId && inDisgrace) {
      setMessage(
        "⚠️ Estás en desgracia social: solo podés descartar una carta y reponer hasta tener 6."
      );
      return; 
    }

    if (turnData.turn_owner_id !== myPlayerId) {
      const currentPlayerName = getPlayerNameById(turnData.turn_owner_id);
      setMessage(`${currentPlayerName} está jugando su turno.`);
      return;
    }

    switch (turnData.turn_state) {
      case "None":
        setMessage(
          `¡Es tu turno! Jugá un set o una carta de evento. Si no querés realizar ninguna acción tenés que descartar al menos una carta.`
        );
        break;
      case "Playing":
        setMessage("Seguí las indicaciones para continuar el turno.");
        break;
      case "Waiting":
        setMessage("Esperá para continuar tu turno.");
        break;
      case "Discarding":
        setMessage("Podés reponer o seguir descartando.");
        break;
      case "Replenish":
        setMessage("Debés tener seis cartas en mano para terminar el turno.");
        break;
      case "Complete":
        setMessage("Siguiente turno...");
        break;
      default:
        setMessage(" ");
        break;
    }
  }, [
    turnData?.turn_state,
    turnData?.turn_owner_id,
    myPlayerId,
    orderedPlayers,
  ]);

  return { message, getPlayerNameById };
};
