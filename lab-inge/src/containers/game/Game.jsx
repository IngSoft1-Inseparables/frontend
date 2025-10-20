import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService.js";
import { createWSService } from "../../services/WSService.js";
// import ConnectionStatus from './components/ConnectionStatus/ConnectionStatus';
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
import DiscardTop5Dialog from "./components/DiscardTop5Dialog/DiscardTop5Dialog.jsx";


const reorderPlayers = (playersArray, myPlayerId) => {
  const mutableArray = [...playersArray];
  const sortedByTurn = mutableArray.sort((a, b) => a.turn - b.turn);
  const myPlayerIndex = sortedByTurn.findIndex((player) => player.id === parseInt(myPlayerId));

  if (myPlayerIndex === -1) return sortedByTurn;

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
  const [playedActionCard, setPlayedActionCard] = useState(null);
  const [message, setMessage] = useState(" ");
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);


  useEffect(() => {
    if (!gameId || !myPlayerId) {
      console.error("Missing gameId or myPlayerId in navigation state");
      navigate("/home", { replace: true });
    }
  }, [gameId, myPlayerId, navigate]);

  const getPlayerNameById = (playerId) => {
    if (!orderedPlayers || orderedPlayers.length === 0) return "Jugador";
    const player = orderedPlayers.find(p => p?.id === parseInt(playerId));
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


  // función simple: activa el flujo de descarte (el dialogo hace el GET solo)
  const startDiscardTop5Action = () => {
    setShowDiscardDialog(true);
  };


  //funcion para reponer del dialog 
  const handleReplenishFromDiscard = async (card) => {
    if (!card || !gameId || !myPlayerId) return;

    try {
      const response = await httpService.replenishFromDiscard(
        gameId,
        myPlayerId,
        card.card_id
      );
      console.log("Replenish desde descarte:", response);

      //  Agregar la nueva carta a mi mano
      setPlayerData((prev) => ({
        ...prev,
        playerCards: [...(prev?.playerCards || []), response.newCard],
      }));

      // Actualizar el descarte con el nuevo estado devuelto por el back
      setTurnData((prev) => ({
        ...prev,
        discardpile: {
          ...prev?.discardpile,
          count: response.newDiscard.length,
          last_card_image:
            response.newDiscard.at(-1)?.image_name || prev?.discardpile?.last_card_image,
          last_card_name:
            response.newDiscard.at(-1)?.card_name || prev?.discardpile?.last_card_name,
        },
      }));

      // cerrar diálogo
      setShowDiscardDialog(false);
    } catch (err) {
      console.error("Error al reponer desde descarte:", err);
      
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


  // ACCIONES PARA OCULTAR SECRETO (propio/ajeno)

  const hideMySecret = async (secretId) => {
    try {
      console.log("ocultando secreto propio:", secretId);

      await httpService.hideSecret({
        gameId,
        playerId: myPlayerId,
        secretId,
      });

      console.log("Respuesta hideSecret:", response);

      await fetchGameData();
    } catch (err) {
      console.log("error al ocultar secreto propio:", err);  
    }
  };

  const hideOtherPlayerSecret = async (playerId, secretId) => {
    try {
      console.log("ocultando secreto ajeno:", secretId, "del jugador:", playerId);

      await httpService.hideSecret({
        gameId,
        playerId,
        secretId,
      });

      console.log("Respuesta hideSecret:", response);

      await fetchGameData();
    } catch (err) {
      console.log("error al ocultar secreto ajeno:", err);
    }
  };

  const fetchGameData = async () => {
    try {
      setIsLoading(true);

      const fetchedTurnData = await httpService.getPublicTurnData(gameId);
      const fetchedPlayerData = await httpService.getPrivatePlayerData(gameId, myPlayerId);

      setPlayerData(fetchedPlayerData);
      setTurnData(fetchedTurnData);

      const reorderedPlayersData = reorderPlayers(fetchedTurnData.players, myPlayerId);
      setOrderedPlayers(reorderedPlayersData);

      console.log(fetchedTurnData);
    } catch (error) {
      console.error("Failed obtaining game data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!gameId || !myPlayerId) return;

    console.log("🎮 Inicializando conexión WebSocket...");

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
        const reorderedPlayersData = reorderPlayers(dataPublic.players, myPlayerId);
        setOrderedPlayers(reorderedPlayersData);
      }

      handleEndGameEvent(dataPublic);

    };

    const handlePlayerPrivateUpdate = (payload) => {
      const dataPlayer =
        typeof payload === "string" ? JSON.parse(payload) : payload;
      setPlayerData(dataPlayer);
    };
    // Handler para estado de conexión
    const handleConnectionStatus = ({ status }) => {
      console.log(`🔌 Estado de conexión: ${status}`);

      if (status === "connected") {
        // Refrescar datos cuando se reconecta
        fetchGameData();
      }
    };

    // Handler para reconexiones
    const handleReconnecting = ({ attempt, delay }) => {
      console.log(`🔄 Reconectando... (intento ${attempt})`);
      // Aquí podrías mostrar un toast o indicador visual
    };

    // Handler para fallo de conexión
    const handleConnectionFailed = ({ attempts }) => {
      console.error(`❌ Falló la conexión después de ${attempts} intentos`);
      setShowConnectionError(true);
    };
    wsService.on("game_public_update", handleGamePublicUpdate);
    wsService.on("player_private_update", handlePlayerPrivateUpdate);
    wsService.on("connection_status", handleConnectionStatus);
    wsService.on("reconnecting", handleReconnecting);
    wsService.on("connection_failed", handleConnectionFailed);
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

    // Cleanup: remover TODOS los listeners y desconectar
    return () => {
      console.log("🧹 Limpiando conexión WebSocket...");

      wsService.off("game_public_update", handleGamePublicUpdate);
      wsService.off("player_private_update", handlePlayerPrivateUpdate);
      wsService.off("connection_status", handleConnectionStatus);
      wsService.off("reconnecting", handleReconnecting);
      wsService.off("connection_failed", handleConnectionFailed);

      wsService.off("hasToReveal");
      wsService.disconnect();
    };
  }, [gameId, myPlayerId]);

  
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


    useEffect(() => {
      if (selectionMode === "select-my-revealed-secret" && selectedSecret) 
        {
          console.log("ocultando secreto propio:", selectedSecret);
          hideMySecret(selectedSecret);
          setSelectedSecret(null);
          setSelectedPlayer(null);
          setSelectionMode(null);
        }
    }, [selectionMode, selectedSecret]);

    
    useEffect(() => {
      if (selectionMode === "select-revealed-secret" && selectedSecret && selectedPlayer) 
        {
          console.log("ocultando secreto ajeno:", selectedSecret, "de jugador:", selectedPlayer);
          hideOtherPlayerSecret(selectedPlayer, selectedSecret);
          setSelectedSecret(null);
          setSelectedPlayer(null);
          setSelectionMode(null);
        }
    }, [selectionMode, selectedSecret, selectedPlayer]);


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  

  // 🔄 useEffect disparado - turnData cambió
  // 👤 Mi jugador actual: {id: 1, name: "...", setPlayed: [{id: 123, set_type: "poirot"}]}
  // 👤 Mi jugador previo: {id: 1, name: "...", setPlayed: []}
  // 📊 Sets previos: []
  // 📊 Sets nuevos: [{id: 123, set_type: "poirot"}]
  // 🎯 Sets nuevos confirmados: [{id: 123, set_type: "poirot"}]
  // 🎮 Ejecutando efecto para set: poirot
  // ✅ Activando modo: select-not-revealed-secret

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

        // 🔹 Si la carta jugada es "Look into the ashes", iniciar acción de descarte
        if (cardName?.toLowerCase() === "look into the ashes") {
          console.log("🔥 Evento Look into the ashes jugado → mostrando top5 del descarte");
          await fetchGameData();
          startDiscardTop5Action(); // abre el diálogo que hace el GET automático
          return; // no necesitamos continuar el resto del flujo
        }


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

      // setPlayerData((prevData) => {
      //   if (!prevData) return prevData;

      //   return {
      //     ...prevData,
      //     playerCards: prevData.playerCards.filter(
      //       (card) => !cardIds.includes(card.card_id)
      //     ),
      //   };
      // });
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
          setPlayerData={setPlayerData} 
          turnData={turnData}
          setTurnData={setTurnData}  
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

        {showDiscardDialog && (
          <DiscardTop5Dialog
            gameId={gameId}
            open={showDiscardDialog}
            onClose={() => setShowDiscardDialog(false)}
            onSelect={handleReplenishFromDiscard} // ← al hacer click en una carta
          />
        )}


      </DndContext>
      {/* <ConnectionStatus wsService={wsService} /> */}
    </div>
  );
}

export default Game;
