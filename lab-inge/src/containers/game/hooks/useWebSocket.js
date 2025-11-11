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
  timer,
  setTimer
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

        setWinnerData(prev => ({
          ...prev,
          winners,
          regpileCount,
          type: prev?.type || null,
        }));

        setShowEndDialog(true);
      }
    };
   const handlePointSuspicionsPlayed = (payload) => {
  setSelectionMode("select-other-player");
  setSelectionAction("point");
};


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

    const handleTimer = (payload) => {
      setTimer(payload.timer);
    };

    wsService.on("game_public_update", handleGamePublicUpdate);
    wsService.on("player_private_update", handlePlayerPrivateUpdate);
    wsService.on("connection_status", handleConnectionStatus);
    wsService.on("reconnecting", handleReconnecting);
    wsService.on("connection_failed", handleConnectionFailed);
    wsService.on("point_suspicions_played", handlePointSuspicionsPlayed);
    wsService.on("game_timer", handleTimer);

    return () => {
      console.log("Limpiando conexión WebSocket...");

      wsService.off("game_public_update", handleGamePublicUpdate);
      wsService.off("player_private_update", handlePlayerPrivateUpdate);
      wsService.off("connection_status", handleConnectionStatus);
      wsService.off("reconnecting", handleReconnecting);
      wsService.off("connection_failed", handleConnectionFailed);
      wsService.off("point_suspicions_played", handlePointSuspicionsPlayed);
      wsService.off("game_timer", handleTimer);

      wsService.disconnect();
    };
  }, [gameId, myPlayerId]);

  useEffect(() => {
    if (!wsService || !setSelectionAction || !setMovedCardsCount) return;

    const handleEarlyTrainCardPlayed = (payload) => {
      const data = typeof payload === "string" ? JSON.parse(payload) : payload;
      setSelectionAction({ type: "paddington-discarded", movedCount: data.moved_count });
    };

    wsService.on("early_train_card_played", handleEarlyTrainCardPlayed);

    return () => {
      wsService.off("early_train_card_played", handleEarlyTrainCardPlayed);
    };
  }, [wsService, setSelectionAction, setMovedCardsCount]);

  return { showConnectionError };
};
