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
  movedCardsCount,
  timer,
  selectionMode,
  playerData
) => {
  const [message, setMessage] = useState(" ");

  const getPlayerNameById = (playerId) => {
    if (!orderedPlayers || orderedPlayers.length === 0) return "Jugador";
    const player = orderedPlayers.find((p) => p?.id === parseInt(playerId));
    return player?.name || "Jugador";
  };

  useEffect(() => {
    if (!turnData) return;

    // Detectar si YO estoy en desgracia social
    const me = turnData.players?.find((p) => p.id === parseInt(myPlayerId));
    const inDisgrace = !!me?.in_disgrace;

    // Si es mi turno y estoy en desgracia, mostrar mensaje prioritario
    if (turnData.turn_owner_id === myPlayerId && inDisgrace) {
      setMessage(
        " Estás en desgracia social: solo podés descartar y reponer una carta."
      );
      return;
    }

    const currentPlayerName = getPlayerNameById(turnData.turn_owner_id);

    switch (turnData.turn_state) {
      case "None":
        setMessage(
          `${turnData.turn_owner_id === myPlayerId ?
            "¡Es tu turno! Jugá un set o una carta de evento. Si no querés realizar ninguna acción tenés que descartar al menos una carta."
            :
            `${currentPlayerName} está jugando su turno.`}`)
        break;
      case "Playing":
        setMessage(`${currentPlayerName} jugó ${turnData?.event_card_played ? turnData.event_card_played.card_name : turnData.set_played ? turnData.set_played.set_type : `${turnData?.set_add?.card_name} en el set ${turnData?.set_add?.set_type}`}.`)
        if (selectionMode === "select-other-not-revealed-secret") setMessage("Seleccioná un secreto oculto para revelarlo.");
        if (selectionMode === "select-other-player") setMessage("Seleccioná un jugador para forzarlo a revelar un secreto.");
        if (selectionMode === "select-other-player" && selectionAction === "cards off the table") setMessage("Seleccioná un jugador para forzarlo a descartar todas sus Not So Fast.")
        if (selectionMode === "select-other-player" && selectionAction === "specials") setMessage("Seleccioná un jugador para forzarlo a revelar un secreto y luego robárselo.");
        if (selectionMode === "select-revealed-secret") setMessage("Seleccioná un secreto para ocultarlo.");
        if (selectionMode === "select-other-revealed-secret" && selectionAction === "one more") setMessage("Seleccioná un secreto para ocultarlo y luego asignárselo a cualquier jugador.");
        if (selectionMode === "select-player" && selectionAction === "one more") setMessage("Selecciona un jugador para asignarle el secreto oculto.");
        if (selectionMode === "select-set") setMessage("Seleccioná un set para robarlo y ejecutar su efecto.");
        if (selectionMode === "select-set" && selectionAction === "ariadne") setMessage("Seleccioná un set para agregarle Ariadne Oliver.");
        if (selectionMode === "select-other-player" && selectionAction === "card trade") setMessage("Seleccioná un jugador para intercambiar una carta.");
        if (selectionMode === "select-my-not-revealed-secret") setMessage("Seleccioná un secreto propio para revelarlo.")
        if (turnData?.event_card_played?.card_name.toLowerCase() === "point your suspicions") {
          if (selectionMode === "select-other-player") setMessage("Votá al jugador de quien sospechás.");
          if (selectionMode === "select-my-not-revealed-secret") setMessage("¡Fuiste votado como sospechoso! Seleccioná un secreto propio para revelarlo.")
        }
        break;
      case "Waiting":
        if (turnData?.turn_owner_id === myPlayerId) setMessage("Esperá para continuar tu turno.");
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
              ? `Se ${effectiveMovedCount === 1 ? "ha movido" : "han movido"
              } ${effectiveMovedCount} ${effectiveMovedCount === 1 ? "carta" : "cartas"
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
              ? `Se ${movedCardsCount === 1 ? "ha movido" : "han movido"
              } ${movedCardsCount} ${movedCardsCount === 1 ? "carta" : "cartas"
              } del mazo de descarte al mazo de robo.`
              : "Se han movido cartas del mazo de descarte al mazo de robo.";
          setMessage(
            `${delayMessage} Ahora podés reponer o seguir descartando.`
          );
          // Limpiar después de mostrar el mensaje
          setTimeout(() => setSelectionAction(null), 4500);
        } else if (turnData.instant_played && timer > 0) {
          setMessage(`Se jugó una ${turnData.instant_played.card_name}`);
        } else if (turnData?.event_card_played?.card_name.toLowerCase() === "look into the ashes" && playerData?.playerCards.length === 6) {
          setMessage("Debés descartar al menos una carta.");
        } else {
          setMessage(
            `${turnData.turn_owner_id === myPlayerId ?
              "Podés reponer o seguir descartando."
              :
              `${currentPlayerName} está jugando su turno.`}`)
        }
        break;
      case "Replenish":
        setMessage("Debés tener seis cartas en mano para terminar el turno.");
        break;
      case "Complete":
        setMessage("Siguiente turno...");
        break;
      default:
        setMessage("");
        break;
    }
  }, [
    turnData?.turn_state,
    turnData?.turn_owner_id,
    turnData?.players,
    turnData?.event_card_played,
    turnData?.set_played,
    turnData?.instant_played,
    myPlayerId,
    orderedPlayers,
    selectionAction,
    movedCardsCount,
    timer,
    selectionMode,
    setSelectionAction,
  ]);

  return { message, getPlayerNameById };
};
