import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService.js";
import { createWSService } from "../../services/WSService.js";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import GameBoard from "./components/GameBoard/GameBoard.jsx";
import EndGameDialog from "./components/EndGameDialog/EndGameDialog.jsx";

function Game() {
  const navigate = useNavigate();
  const location = useLocation();

  const { gameId, myPlayerId } = location.state || {};
  const [turnData, setTurnData] = useState(null);
  const [winnerData, setWinnerData] = useState(null);
  const [orderedPlayers, setOrderedPlayers] = useState([]);
  const [playerData, setPlayerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [httpService] = useState(() => createHttpService());
  const [wsService] = useState(() => createWSService(gameId, myPlayerId));
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [selectionMode, setSelectionMode] = useState(null); // "select-player", "select-other-player", "select-other-revealed-secret", "select-my-revealed-secret", "select-revealed-secret", "select-other-not-revealed-secret", "select-my-not-revealed-secret", "select-not-revealed-secret"
  const [showEndDialog, setShowEndDialog] = useState(false);

  useEffect(() => {
    if (!gameId || !myPlayerId) {
      console.error('Missing gameId or myPlayerId in navigation state');
      navigate('/home', { replace: true });
    }
  }, [gameId, myPlayerId, navigate]);

  const handlePlayerSelection = (playerId) => {
    setSelectedPlayer(playerId);
    console.log(playerId);
  }

  const handleSecretSelection = (playerId, secretId) => {
    setSelectedPlayer(playerId);
    console.log(`Player selected: "${playerId}`);
    setSelectedSecret(secretId);
    console.log(`Secret selected: "${secretId}`);
  }

  const handleCardClick = async () => {
    try {
      const hand = await httpService.updateHand(
        turnData.gameId,
        turnData.turn_owner_id,
      );
      console.log("Update Hand:", hand);
    } catch (error) {
      console.error("Failed to update hand:", error);
    }
  };

  // ACCIONES PARA REVELAR UN SECRETO (propio/ajeno)

  const revealMySecret = async (secretId) => {
    try{
      console.log("revelando secreto propio:", secretId);

      await httpService.revealSecret({
        gameId,
        playerId: myPlayerId,
        secretId,
      });

      await fetchGameData();
    } catch (err) {
      console.log("error al revelar secreto propio:", err);
    }
  };

  const revealOtherPlayerSecret = async (playerId, secretId) => {
    try {
      console.log("revelando secreto ajeno:", secretId, "del jugador:", playerId);

      await httpService.revealSecret({
        gameId,
        playerId,
        secretId,
      });
      await fetchGameData();
    } catch (err) {
      console.log("error al revelar secreto ajeno:", err);
    }
  };

  const forcePlayerRevealSecret = async (playerId) => {
    try {
      console.log("forzando al jugador a revelar secreto:", playerId);
      
      const response = await httpService.forcePlayerReveal({
        gameId,
        playerId,
      });

      console.log("respuesta del backend:", response);
    } catch (err) {
      console.log("error al forzar revelacion de secreto:", err);
    } finally {
      setSelectedPlayer(null);
    }
  };

  const fetchGameData = async () => {
    try {
      setIsLoading(true);

      const fetchedTurnData = await httpService.getPublicTurnData(gameId);
      const fetchedPlayerData = await httpService.getPrivatePlayerData(gameId, myPlayerId);

      setPlayerData(fetchedPlayerData);
      setTurnData(fetchedTurnData);

      const sortedByTurn = fetchedTurnData.players.sort((a, b) => a.turn - b.turn);
      const myPlayerIndex = sortedByTurn.findIndex((player) => player.id === parseInt(myPlayerId));

      const myPlayer = sortedByTurn[myPlayerIndex];
      const playersAfterMe = sortedByTurn.slice(myPlayerIndex + 1);
      const playersBeforeMe = sortedByTurn.slice(0, myPlayerIndex);

      const reorderedPlayers = [myPlayer, ...playersAfterMe, ...playersBeforeMe];
      setOrderedPlayers(reorderedPlayers);
      
      console.log(fetchedTurnData);
    } catch (error) {
      console.error("Failed obtaining game data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();

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

    const handleGamePublicUpdate = (payload) => {
      const dataPublic = typeof payload === "string" ? JSON.parse(payload) : payload;

      setTurnData(dataPublic);

      handleEndGameEvent(dataPublic);

    };

    const handlePlayerPrivateUpdate = (payload) => {
      const dataPlayer = typeof payload === "string" ? JSON.parse(payload) : payload;
      setPlayerData(dataPlayer);
    };

    wsService.on("game_public_update", handleGamePublicUpdate);
    wsService.on("player_private_update", handlePlayerPrivateUpdate);
    wsService.on("hasToReveal", (payload) => {
      console.log("evento WS: hasToReveal recibido", payload);

      if (payload.playerId === parseInt(myPlayerId)) {
        console.log("este jugador fue forzado a revelar un secreto");
        setSelectionMode("select-my-not-revealed-secret");
      }
      if (!payload) {
        return;
      }
    });

    // Cleanup exacto: eliminar los mismos handlers
    return () => {
      wsService.off("game_public_update", handleGamePublicUpdate);
      wsService.off("player_private_update", handlePlayerPrivateUpdate);
      wsService.off("hasToReveal");
      wsService.disconnect();
    };
  }, []);

  
  useEffect(() => {
    if (selectionMode === "select-my-not-revealed-secret" && selectedSecret) {
      console.log("revelando secreto propio:", selectedSecret);
      revealMySecret(selectedSecret);
      setSelectedSecret(null);
      setSelectedPlayer(null);
      setSelectionMode(null);
    }
  }, [selectionMode, selectedSecret]);

  
  useEffect(() => {
    if (selectionMode === "select-other-not-revealed-secret" && selectedSecret && selectedPlayer) {
      console.log("revelando secreto ajeno:", selectedSecret, "de jugador:", selectedPlayer);
      revealOtherPlayerSecret(selectedPlayer, selectedSecret);
      setSelectedSecret(null);
      setSelectedPlayer(null);
      setSelectionMode(null);
    }
  }, [selectionMode, selectedSecret, selectedPlayer]);


  
  useEffect(() => {
    if (selectionMode === "select-other-player" && selectedPlayer) {
      console.log("jugador seleccionado para forzar revelación:", selectedPlayer);

      forcePlayerRevealSecret(selectedPlayer);
      setSelectionMode(null);
    } 
  }, [selectionMode, selectedPlayer]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handler para cuando se suelta una carta
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || myPlayerId != turnData.turn_owner_id) return;

    // Si se soltó sobre el mazo de descarte
    if (over.id === 'discard-deck') {
      const cardId = active.data.current?.cardId;
      const cardName = active.data.current?.cardName;
      const imageName = active.data.current?.imageName;

      // Guardar el estado anterior para poder hacer rollback
      const previousPlayerData = playerData;
      const previousTurnData = turnData;

      // Actualizar optimisticamente la mano del jugador
      setPlayerData(prevData => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          playerCards: prevData.playerCards.filter(card => card.card_id !== cardId)
        };
      });

      setTurnData(prevTurnData => {
        return {
          ...prevTurnData,
          discardpile: {
            count: (prevTurnData.discardpile?.count || 0) + 1,
            last_card_name: cardName,
            last_card_image: imageName
          }
        };
      });

      try {
        await httpService.discardCard(myPlayerId, cardId);
      } catch (error) {
        console.error('Error al descartar carta:', error);
        setPlayerData(previousPlayerData);
        setTurnData(previousTurnData);
      }
    }
  };


  if (isLoading || orderedPlayers.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">Cargando jugadores...</p>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen relative overflow-hidden">
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <GameBoard
          orderedPlayers={orderedPlayers}
          playerData={playerData}
          turnData={turnData}
          myPlayerId={myPlayerId}
          onCardClick={handleCardClick}
          onPlayerSelect={handlePlayerSelection}
          selectedPlayer={selectedPlayer}
          onSecretSelect={handleSecretSelection}
          selectedSecret={selectedSecret}
          selectionMode={selectionMode}
        />

        {showEndDialog && winnerData && (
          <EndGameDialog
            winners={winnerData}
            onClose={() => setShowEndDialog(false)}
          />
        )}
      </DndContext>
    </div>
  );
}

export default Game;
