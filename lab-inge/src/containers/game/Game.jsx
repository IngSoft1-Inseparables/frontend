import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService.js";
import { createWSService } from "../../services/WSService.js";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import GameBoard from "./components/GameBoard/GameBoard.jsx";
import EndGameDialog from "./components/EndGameDialog/EndGameDialog.jsx";
import DiscardTop5Dialog from "./components/DiscardTop5Dialog/DiscardTop5Dialog.jsx";
import TradeDialog from "./components/TradeDialog/TradeDialog.jsx";


// Importar los custom hooks
import {
  useGameData,
  useWebSocket,
  useSecretActions,
  useSelectionEffects,
  useCardActions,
  useTurnMessages,
  useStealSecretLogic,
  useGameDialogs,
} from "./hooks";

function Game() {
  const navigate = useNavigate();
  const location = useLocation();

  const { gameId, myPlayerId } = location.state || {};
  const [httpService] = useState(() => createHttpService());
  const [wsService] = useState(() => createWSService(gameId, myPlayerId));

  // Usar los custom hooks
  const {
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
  } = useGameData(httpService, gameId, myPlayerId);

  const {
    showEndDialog,
    setShowEndDialog,
    winnerData,
    setWinnerData,
    showDiscardDialog,
    setShowDiscardDialog,
    playedActionCard,
    setPlayedActionCard,
    startDiscardTop5Action,
    handleReplenishFromDiscard: replenishFromDiscard,
    showTradeDialog,
    setShowTradeDialog,
    opponentId,
    setOpponentId,
    startCardTrade,
  } = useGameDialogs(turnData, myPlayerId, null, wsService);

  const {
    selectedPlayer,
    setSelectedPlayer,
    selectedSecret,
    setSelectedSecret,
    selectionAction,
    setSelectionAction,
    selectionMode,
    setSelectionMode,
    stolenPlayer,
    setStolenPlayer,
    fromPlayer,
    setFromPlayer,
    prevData,
    setPrevData,
    revealMySecret,
    revealOtherPlayerSecret,
    forcePlayerRevealSecret,
    hideMySecret,
    hideOtherPlayerSecret,
    handleStealSecret,
    handleStealSecretEvent,
    handlePlayerSelection,
    handleSecretSelection,
    handleSetSelection,
    selectedSet,
    setSelectedSet,
    handleStealSet,
  } = useSecretActions(httpService, gameId, myPlayerId, fetchGameData, timer, setTimer);

  const [movedCardsCount, setMovedCardsCount] = useState(0);

  const { message } = useTurnMessages(
    turnData,
    myPlayerId,
    orderedPlayers,
    selectionAction,
    setSelectionAction,
    movedCardsCount,
    timer,
    selectionMode
  );

  // WebSocket connection
  useWebSocket(
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
    timer,
    setTimer
  );

  // Selection effects
  useSelectionEffects(
    selectionMode,
    selectedSecret,
    selectedPlayer,
    selectedSet,
    selectionAction,
    fromPlayer,
    revealMySecret,
    revealOtherPlayerSecret,
    forcePlayerRevealSecret,
    hideMySecret,
    hideOtherPlayerSecret,
    handleStealSecret,
    handleStealSecretEvent,
    httpService,
    gameId,
    fetchGameData,
    setSelectedPlayer,
    setSelectionAction,
    setFromPlayer,
    setSelectedSecret,
    setSelectionMode,
    setMovedCardsCount,
    handleStealSet,
    setShowTradeDialog, 
    setOpponentId,
  );

  // Steal secret logic
  useStealSecretLogic(
    turnData,
    prevData,
    stolenPlayer,
    selectionAction,
    gameId,
    myPlayerId,
    httpService,
    fetchGameData,
    setSelectedPlayer,
    setSelectionAction,
    setStolenPlayer,
    setPrevData
  );

  const { handleCardClick, handlePlaySetAction, handleDragEnd, handleAddCardToSet } =
    useCardActions(
      httpService,
      gameId,
      myPlayerId,
      turnData,
      playerData,
      setPlayerData,
      setTurnData,
      fetchGameData,
      playedActionCard,
      setPlayedActionCard,
      setSelectionMode,
      setSelectionAction,
      startDiscardTop5Action,
      timer,
      setTimer
    );

  const handleReplenishFromDiscard = (card) => {
    return replenishFromDiscard(
      card,
      httpService,
      gameId,
      myPlayerId,
      fetchGameData
    );
  };

  // Configurar listener para forzar revelación desde WebSocket
  useEffect(() => {
    if (!wsService) return;

    const handleHasToReveal = (payload) => {
      if (payload && payload.playerId === parseInt(myPlayerId)) {
        setSelectionMode("select-my-not-revealed-secret");
      }
    };

    wsService.on("hasToReveal", handleHasToReveal);

    return () => {
      wsService.off("hasToReveal", handleHasToReveal);
    };
  }, [wsService, myPlayerId]);

  // Handle steal secret when data updates
  useEffect(() => {
    if (
      selectedPlayer &&
      selectionAction?.toLowerCase() === "specials" &&
      !prevData
    ) {
      setPrevData(JSON.parse(JSON.stringify(turnData)));
    }
  }, [selectedPlayer, selectionAction]);

  useEffect(() => {
    if (!gameId || !myPlayerId) {
      console.error("Missing gameId or myPlayerId in navigation state");
      navigate("/home", { replace: true });
    }
  }, [gameId, myPlayerId, navigate]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (!hasLoadedOnce && (isLoading || orderedPlayers.length === 0)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">Cargando jugadores...</p>
      </div>
    );
  }

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
          onSetSelect={handleSetSelection}
          selectedSet={selectedSet}
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
          setCards={handlePlaySetAction}
          onAddCardToSet={handleAddCardToSet}
          playedActionCard={playedActionCard}
          message={message}
          setSelectionAction={setSelectionAction}
          timer={timer}
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
            onSelect={handleReplenishFromDiscard}
          />
        )}

        {showTradeDialog && (
          <TradeDialog
            open={showTradeDialog}
            gameId={gameId}
            myPlayerId={myPlayerId}
            opponentId={opponentId}
            turnOwnerId={turnData?.turn_owner_id}
            onConfirm={(opponentCard, myCard) =>
              startCardTrade(opponentCard, myCard, httpService, gameId, myPlayerId, fetchGameData)
            }
            onClose={() => setShowTradeDialog(false)}
          />
        )}

      </DndContext>
    </div>
  );
}

export default Game;
