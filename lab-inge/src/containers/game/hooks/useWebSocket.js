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
  setMovedCardsCount
) => {
  const [showConnectionError, setShowConnectionError] = useState(false);

  useEffect(() => {
    if (!gameId || !myPlayerId) return;

    console.log("Inicializando conexión WebSocket...");

    wsService.connect();

    const handleEndGameEvent = (dataPublic) => {
      const endGame = dataPublic.end_game;

      if (endGame?.game_status === "Finished") {
        console.log("🏁 Fin de la partida detectado:", endGame);

        const winners = endGame.winners || [];
        const regpileCount = dataPublic?.regpile?.count ?? 0;
        const players = dataPublic.players || [];

        // Detectar si todos menos el asesino están en desgracia
        const murderer = players.find((p) => p.role === "MURDERER");
        const others = players.filter((p) => p.id !== murderer?.id);
        const allInDisgrace = others.length > 0 && others.every((p) => p.in_disgrace);

        const formattedWinnerData = {
          winners,
          regpileCount,
          gameStatus: endGame?.game_status || dataPublic?.game_state || null,
        };


        setWinnerData(formattedWinnerData);
        setShowEndDialog(true);
      }
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

    wsService.on("game_public_update", handleGamePublicUpdate);
    wsService.on("player_private_update", handlePlayerPrivateUpdate);
    wsService.on("connection_status", handleConnectionStatus);
    wsService.on("reconnecting", handleReconnecting);
    wsService.on("connection_failed", handleConnectionFailed);

    return () => {
      console.log("Limpiando conexión WebSocket...");

      wsService.off("game_public_update", handleGamePublicUpdate);
      wsService.off("player_private_update", handlePlayerPrivateUpdate);
      wsService.off("connection_status", handleConnectionStatus);
      wsService.off("reconnecting", handleReconnecting);
      wsService.off("connection_failed", handleConnectionFailed);

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
