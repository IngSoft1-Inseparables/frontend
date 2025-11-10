import { useState, useEffect } from "react";

/**
 * Hook para manejar los datos del juego y el estado de carga
 */
export const useGameData = (httpService, gameId, myPlayerId) => {
  const [turnData, setTurnData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [orderedPlayers, setOrderedPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [timer, setTimer] = useState(0);

  const reorderPlayers = (playersArray, myPlayerId) => {
    const mutableArray = [...playersArray];
    const sortedByTurn = mutableArray.sort((a, b) => a.turn - b.turn);
    const myPlayerIndex = sortedByTurn.findIndex(
      (player) => player.id === parseInt(myPlayerId)
    );

    if (myPlayerIndex === -1) return sortedByTurn;

    const myPlayer = sortedByTurn[myPlayerIndex];
    const playersAfterMe = sortedByTurn.slice(myPlayerIndex + 1);
    const playersBeforeMe = sortedByTurn.slice(0, myPlayerIndex);

    return [myPlayer, ...playersAfterMe, ...playersBeforeMe];
  };

  const fetchGameData = async () => {
    try {
      setIsLoading(true);

      const fetchedTurnData = await httpService.getPublicTurnData(gameId);
      const fetchedPlayerData = await httpService.getPrivatePlayerData(
        gameId,
        myPlayerId
      );
      console.log(fetchedPlayerData);
      setPlayerData(fetchedPlayerData);
      setTurnData(fetchedTurnData);

      if (fetchedTurnData?.players) {
        const reorderedPlayersData = reorderPlayers(
          fetchedTurnData.players,
          myPlayerId
        );
        setOrderedPlayers(reorderedPlayersData);
      }

      console.log(fetchedTurnData);

      return { turnData: fetchedTurnData, playerData: fetchedPlayerData };
    } catch (error) {
      console.error("Failed obtaining game data:", error);
      throw error;
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  };

  useEffect(() => {
    if (!gameId || !myPlayerId) return;

    fetchGameData();
  }, [gameId, myPlayerId]);

  return {
    turnData,
    setTurnData,
    playerData,
    setPlayerData,
    orderedPlayers,
    setOrderedPlayers,
    isLoading,
    hasLoadedOnce,
    fetchGameData,
    reorderPlayers,
    timer,
    setTimer
  };
};
