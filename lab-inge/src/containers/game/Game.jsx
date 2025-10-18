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
  const [playedActionCard, setPlayedActionCard] = useState(null);
  const [message, setMessage] = useState(" ");

  useEffect(() => {
    if (!gameId || !myPlayerId) {
      console.error("Missing gameId or myPlayerId in navigation state");
      navigate("/home", { replace: true });
    }
  }, [gameId, myPlayerId, navigate]);

  const getPlayerNameById = (playerId) => {
    const player = orderedPlayers.find(p => p.id === parseInt(playerId));
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
        setMessage(`¡Es tu turno! Jugá un set o una carta de evento. Si no querés realizar ninguna acción tenés que descartar al menos una carta.`);
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
  }, [turnData?.turn_state, turnData?.turn_owner_id, myPlayerId, orderedPlayers]);

  const handlePlayerSelection = (playerId) => {
    setSelectedPlayer(playerId);
    console.log(playerId);
  }

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
      const fetchedPlayerData = await httpService.getPrivatePlayerData(gameId, myPlayerId);

      setPlayerData(fetchedPlayerData);
      setTurnData(fetchedTurnData);

      console.log("Info privada:", fetchedPlayerData);

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
      const dataPublic =
        typeof payload === "string" ? JSON.parse(payload) : payload;

      setTurnData(dataPublic);

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

  // Handler para cuando se suelta una carta
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || myPlayerId != turnData.turn_owner_id) return;

    const cardId = active.data.current?.cardId;
    const cardName = active.data.current?.cardName;
    const imageName = active.data.current?.imageName;

    // Si se soltó sobre el mazo de descarte
    if (over.id === "discard-deck") {
      if (turnData.turn_state != "None" && turnData.turn_state != "Discarding") return;

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

    // Si se soltó sobre la zona de eventos
    if (over.id === "play-card-zone") {
      if (turnData.turn_state != "None") return;

      if (playedActionCard) {
        return;
      }
      // Encontrar la carta completa desde playerData
      const droppedCard = playerData?.playerCards?.find(
        (card) => card.card_id === cardId
      );

      if (!droppedCard) {
        console.error("Card not found in player's hand");
        return;
      }

      if (droppedCard.type != "Event") {
        console.log("Card played not valid.");
        return;
      }

      // Guardar el estado anterior para rollback
      const previousPlayerData = playerData;

      // Actualizar optimisticamente: remover de la mano y agregar a zona de eventos
      setPlayerData((prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          playerCards: prevData.playerCards.filter(
            (card) => card.card_id !== cardId
          ),
        };
      });

      setPlayedActionCard(droppedCard);

      try {
        await httpService.playEvent(gameId, myPlayerId, cardId, cardName);
      } catch (error) {
        console.error("Failed playing event card:", error);
        setPlayerData(previousPlayerData);
        setPlayedActionCard(null);
      }
    }
  };

  // const [draggingCards, setDraggingCards] = useState([]);
  // const handleDragFromHand = ({ cards }) => {
  //   // Ahora 'cards' es el array de objetos carta.
  //   // Solo se necesita una validación para asegurar que es un array.
  //   const cardsArray = Array.isArray(cards) ? cards : [cards];
  //   setDraggingCards(cardsArray);
  // };

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

      setPlayerData((prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          playerCards: prevData.playerCards.filter(
            (card) => !cardIds.includes(card.card_id)
          ),
        };
      });
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
          playedActionCard={playedActionCard}
          message={message}
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
