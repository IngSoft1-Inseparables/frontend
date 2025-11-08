import { useEffect, useState } from "react";

/**
 * Hook para manejar la conexión WebSocket y sus eventos
 */
export const useWebSocket = (
  wsService,
  gameId,
  myPlayerId,
  setTurnData,
  setPlayerData,
  setOrderedPlayers,
  setWinnerData,
  setShowEndDialog,
  fetchGameData,
  reorderPlayers,
  setSelectionAction,
  setMovedCardsCount,
  setSelectionMode,
  setHasVotedInCurrentRound,
  hasVotedInCurrentRound
) => {
  const [showConnectionError, setShowConnectionError] = useState(false);

  useEffect(() => {
    if (!gameId || !myPlayerId) return;

    console.log("Inicializando conexión WebSocket...");

    wsService.connect();

    const handleEndGameEvent = (dataPublic) => {
      if (dataPublic.end_game?.game_status === "Finished") {
        console.log("Fin de la partida detectado:", dataPublic.end_game);

        const winners = dataPublic.end_game.winners;
        const regpileCount = dataPublic?.regpile?.count ?? 0;

        setWinnerData({ winners, regpileCount });
        setShowEndDialog(true);
      }
    };
    const handlePlayedCardEvent = (dataPublic) => {
      // Verificar si hay una carta de evento jugada
      const playedEvent = dataPublic?.event_card_played;

      if (!playedEvent) {
        console.log("📋 No hay carta jugada actualmente");
        if (setHasVotedInCurrentRound) {
          setHasVotedInCurrentRound(false);
        }
        return;
      }

      console.log("🎴 Carta detectada:", playedEvent);
      if (playedEvent.card_name?.toLowerCase() === "point your suspicions") {
        console.log("🎯 Activando selección de jugador");
        if (!hasVotedInCurrentRound && setSelectionMode) {
          console.log("🎯 Activando selección de jugador");
          setSelectionMode("select-other-player");
          setSelectionAction("point");
        }
      }
    };

    // const handleHasToReveal = (payload) => {
    //   console.log("🎯 Evento hasToReveal recibido:", payload);
    //   const playerId = payload?.playerId;
      
    //   if (playerId === myPlayerId) {
    //     console.log("🎯 Debo revelar un secreto");
    //     setSelectionMode("select-my-not-revealed-secret");
    //   }
    // };

    const handleGamePublicUpdate = (payload) => {
      const dataPublic =
        typeof payload === "string" ? JSON.parse(payload) : payload;

      setTurnData(dataPublic);
      if (dataPublic.players) {
        const reorderedPlayersData = reorderPlayers(
          dataPublic.players,
          myPlayerId
        );
        setOrderedPlayers(reorderedPlayersData);
      }
      handlePlayedCardEvent(dataPublic);

      handleEndGameEvent(dataPublic);
    };

    const handlePlayerPrivateUpdate = (payload) => {
      const dataPlayer =
        typeof payload === "string" ? JSON.parse(payload) : payload;
      setPlayerData(dataPlayer);
    };

    const handleConnectionStatus = ({ status }) => {
      console.log(`Estado de conexión: ${status}`);

      if (status === "connected") {
        fetchGameData();
      }
    };

    const handleReconnecting = ({ attempt }) => {
      console.log(`Reconectando... (intento ${attempt})`);
    };

    const handleConnectionFailed = ({ attempts }) => {
      console.error(`Falló la conexión después de ${attempts} intentos`);
      setShowConnectionError(true);
    };

    wsService.on("game_public_update", handleGamePublicUpdate);
    wsService.on("player_private_update", handlePlayerPrivateUpdate);
    wsService.on("connection_status", handleConnectionStatus);
    wsService.on("reconnecting", handleReconnecting);
    wsService.on("connection_failed", handleConnectionFailed);
    // wsService.on("hasToReveal", handleHasToReveal);

    return () => {
      console.log("Limpiando conexión WebSocket...");

      wsService.off("game_public_update", handleGamePublicUpdate);
      wsService.off("player_private_update", handlePlayerPrivateUpdate);
      wsService.off("connection_status", handleConnectionStatus);
      wsService.off("reconnecting", handleReconnecting);
      wsService.off("connection_failed", handleConnectionFailed);
      // wsService.off("hasToReveal", handleHasToReveal);

      wsService.disconnect();
    };
  }, [gameId, myPlayerId]);

  useEffect(() => {
    if (!wsService || !setSelectionAction || !setMovedCardsCount) return;

    const handleEarlyTrainCardPlayed = (payload) => {
      const data = typeof payload === "string" ? JSON.parse(payload) : payload;
      setSelectionAction({
        type: "paddington-discarded",
        movedCount: data.moved_count,
      });
    };

    wsService.on("early_train_card_played", handleEarlyTrainCardPlayed);

    return () => {
      wsService.off("early_train_card_played", handleEarlyTrainCardPlayed);
    };
  }, [wsService, setSelectionAction, setMovedCardsCount]);

  return { showConnectionError };
};
