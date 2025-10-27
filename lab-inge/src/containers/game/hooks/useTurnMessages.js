import { useState, useEffect } from "react";

/**
 * Hook para manejar los mensajes mostrados al usuario según el estado del turno
 */
export const useTurnMessages = (
  turnData,
  myPlayerId,
  orderedPlayers,
  selectionAction,
  setSelectionAction,
  movedCardsCount
) => {
  const [message, setMessage] = useState(" ");

  const getPlayerNameById = (playerId) => {
    if (!orderedPlayers || orderedPlayers.length === 0) return "Jugador";
    const player = orderedPlayers.find((p) => p?.id === parseInt(playerId));
    return player?.name || "Jugador";
  };

  useEffect(() => {
    if (!turnData) return;

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
        const actionType =
          typeof selectionAction === "object"
            ? selectionAction?.type
            : selectionAction;
        const effectiveMovedCount =
          typeof selectionAction === "object"
            ? selectionAction?.movedCount
            : movedCardsCount;
        if (
          actionType === "paddington" ||
          actionType === "paddington-discarded"
        ) {
          const paddingtonMessage =
            effectiveMovedCount > 0
              ? `Se ${
                  effectiveMovedCount === 1 ? "ha movido" : "han movido"
                } ${effectiveMovedCount} ${
                  effectiveMovedCount === 1 ? "carta" : "cartas"
                } del mazo de robo al mazo de descarte.`
              : "Se han movido cartas del mazo de robo al mazo de descarte.";
          const fullMessage = `${paddingtonMessage} Ahora podés reponer o seguir descartando.`;
          setMessage(fullMessage);
          // Limpiar después de mostrar el mensaje (más tiempo para que se vea)
          setTimeout(() => {
            setSelectionAction(null);
          }, 4500);
        } else if (selectionAction === "delay") {
          const delayMessage =
            movedCardsCount > 0
              ? `Se ${
                  movedCardsCount === 1 ? "ha movido" : "han movido"
                } ${movedCardsCount} ${
                  movedCardsCount === 1 ? "carta" : "cartas"
                } del mazo de descarte al mazo de robo.`
              : "Se han movido cartas del mazo de descarte al mazo de robo.";
          setMessage(
            `${delayMessage} Ahora podés reponer o seguir descartando.`
          );
          // Limpiar después de mostrar el mensaje
          setTimeout(() => setSelectionAction(null), 4500);
        } else {
          setMessage("Podés reponer o seguir descartando.");
        }
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
    selectionAction,
    movedCardsCount,
  ]);

  return { message, getPlayerNameById };
};
