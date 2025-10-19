import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService.js";
import { createWSService } from "../../services/WSService.js";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import GameBoard from "./components/GameBoard/GameBoard.jsx";
import EndGameDialog from "./components/EndGameDialog/EndGameDialog.jsx";

const reorderPlayers = (playersArray, myPlayerId) => {
  // Aseguramos que la entrada sea un array y no mutamos el original
  const mutableArray = [...playersArray];
  const sortedByTurn = mutableArray.sort((a, b) => a.turn - b.turn);
  const myPlayerIndex = sortedByTurn.findIndex(
    (player) => player.id === parseInt(myPlayerId)
  );

  if (myPlayerIndex === -1) return sortedByTurn; // Fallback si no se encuentra

  const myPlayer = sortedByTurn[myPlayerIndex];
  const playersAfterMe = sortedByTurn.slice(myPlayerIndex + 1);
  const playersBeforeMe = sortedByTurn.slice(0, myPlayerIndex);

  return [myPlayer, ...playersAfterMe, ...playersBeforeMe];
};

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
  const [prevTurnData, setPrevTurnData] = useState(null);

  useEffect(() => {
    if (!gameId || !myPlayerId) {
      console.error("Missing gameId or myPlayerId in navigation state");
      navigate("/home", { replace: true });
    }
  }, [gameId, myPlayerId, navigate]);

  const handlePlayerSelection = (playerId) => {
    setSelectedPlayer(playerId);
    console.log(playerId);
  };

  const handleSecretSelection = (playerId, secretId) => {
    setSelectedPlayer(playerId);
    console.log(`Player selected: "${playerId}`);
    setSelectedSecret(secretId);
    console.log(`Secret selected: "${secretId}`);
  };

  const handleCardClick = async () => {
    try {
      const hand = await httpService.updateHand(
        turnData.gameId,
        turnData.turn_owner_id
      );
      console.log("Update Hand:", hand);
    } catch (error) {
      console.error("Failed to update hand:", error);
    }
  };

  const fetchGameData = async () => {
    try {
      setIsLoading(true);

      const fetchedTurnData = await httpService.getPublicTurnData(gameId);
      const fetchedPlayerData = await httpService.getPrivatePlayerData(
        gameId,
        myPlayerId
      );

      setPlayerData(fetchedPlayerData);
      setTurnData(fetchedTurnData);

      // ARREGLO: Usamos la función reorderPlayers para limpiar el código
      const reorderedPlayersData = reorderPlayers(
        fetchedTurnData.players,
        myPlayerId
      );
      setOrderedPlayers(reorderedPlayersData);

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

    wsService.on("game_public_update", handleGamePublicUpdate);
    wsService.on("player_private_update", handlePlayerPrivateUpdate);

    // Cleanup exacto: eliminar los mismos handlers
    return () => {
      wsService.off("game_public_update", handleGamePublicUpdate);
      wsService.off("player_private_update", handlePlayerPrivateUpdate);
      wsService.disconnect();
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
 useEffect(() => {
  // Si aún no hay datos de turno, no hacemos nada
  if (!turnData) return;

  // Si es la primera vez que recibimos datos, solo inicializamos
  if (!prevTurnData) {
    setPrevTurnData(turnData);
    return;
  }

  // --- Detección de sets nuevos ---
  const myPlayer = turnData.players.find((p) => p.id === myPlayerId);
  const prevPlayer = prevTurnData.players.find((p) => p.id === myPlayerId);

  const prevSets = prevPlayer?.setPlayed || [];
  const newSets = myPlayer?.setPlayed || [];

  const setsToTrigger = newSets.filter(
    (newSet) => !prevSets.some((prevSet) => prevSet.id === newSet.id)
  );

  if (setsToTrigger.length > 0) {
    console.log("Sets nuevos confirmados:", setsToTrigger);
  }

  // --- Disparo de efectos según tipo de set ---
  setsToTrigger.forEach((set) => {
    console.log("Ejecutando efecto para set:", set.set_type);

    switch (set.set_type?.toLowerCase()) {
      case "poirot":
      case "marple":
        setSelectionMode("select-not-revealed-secret");
        break;

      case "ladybrent":
      case "tommyberestford":
      case "tuppenceberestbord":
      case "satterthwaite":
      case "tommytuppence":
        setSelectionMode("select-other-not-revealed-secret");
        break;

      case "special_satterthwaite":
        console.log("Efecto de 'special_satterthwaite' aún no implementado");
        break;

      case "pyne":
        setSelectionMode("select-revealed-secret");
        break;

      default:
        console.log("Set sin efecto:", set.set_type);
    }
  });

  // Actualizamos el estado previo para el próximo cambio
  setPrevTurnData(turnData);
}, [turnData]);

  // Handler para cuando se suelta una carta
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || myPlayerId != turnData.turn_owner_id) return;

    // Si se soltó sobre el mazo de descarte
    if (over.id === "discard-deck") {
      const cardId = active.data.current?.cardId;
      const cardName = active.data.current?.cardName;
      const imageName = active.data.current?.imageName;

      // Guardar el estado anterior para poder hacer rollback
      const previousPlayerData = playerData;
      const previousTurnData = turnData;

      // Actualizar optimisticamente la mano del jugador
      setPlayerData((prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          playerCards: prevData.playerCards.filter(
            (card) => card.card_id !== cardId
          ),
        };
      });

      // Actualizar optimisticamente el mazo de descarte
      setTurnData((prevTurnData) => {
        return {
          ...prevTurnData,
          discardpile: {
            count: (prevTurnData.discardpile?.count || 0) + 1,
            last_card_name: cardName,
            last_card_image: imageName,
          },
        };
      });

      try {
        await httpService.discardCard(myPlayerId, cardId);
      } catch (error) {
        console.error("Error al descartar carta:", error);
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
  const handlePlaySetAction = async (myPlayerId, gameId, currentSetCards) => {
    if (!currentSetCards || currentSetCards.length === 0) return;

    const cardIds = currentSetCards.map((card) => card.card_id);

    try {
      const response = await httpService.playSets(gameId, myPlayerId, cardIds);
    } catch (error) {
      console.error("Error al cargar los sets:", error);
    }
  };
  return (
    <div className="h-screen w-screen relative overflow-hidden">
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
          setCards={handlePlaySetAction}
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
