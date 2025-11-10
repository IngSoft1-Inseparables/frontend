import { useState, useEffect } from "react";

/**
 * Hook para manejar la lógica de la carta jugada y los diálogos
 */
export const useGameDialogs = (
  turnData,
  myPlayerId,
  playedActionCard,
  wsService
) => {
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [winnerData, setWinnerData] = useState(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [playedActionCardState, setPlayedActionCard] = useState(null);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [opponentId, setOpponentId] = useState(null);

  useEffect(() => {
    if (!turnData) return;

    if (turnData.event_card_played) {
      setPlayedActionCard(turnData.event_card_played);
    } else if (!turnData.event_card_played) {
      setPlayedActionCard(null);
    } else if (turnData.turn_owner_id !== myPlayerId && playedActionCard) {
      setPlayedActionCard(null);
    } else if (
      turnData.turn_owner_id === myPlayerId &&
      turnData.turn_state === "None" &&
      !turnData.event_card_played
    ) {
      setPlayedActionCard(null);
    }
  }, [
    turnData?.event_card_played,
    turnData?.turn_owner_id,
    turnData?.turn_state,
    myPlayerId,
    playedActionCard,
  ]);

  const startDiscardTop5Action = () => {
    setShowDiscardDialog(true);
  };

  const handleReplenishFromDiscard = async (
    card,
    httpService,
    gameId,
    myPlayerId,
    fetchGameData
  ) => {
    if (!card || !gameId || !myPlayerId) return;

    console.log(card);

    try {
      const response = await httpService.replenishFromDiscard(
        gameId,
        myPlayerId,
        card.card_id
      );
      console.log("Replenish desde descarte:", response);

      await fetchGameData();

      setShowDiscardDialog(false);
      setPlayedActionCard(null);
    } catch (err) {
      console.error("Error al reponer desde descarte:", err);
    }
  };

  const startCardTrade = async (
    opponentCard,
    myCard,
    httpService,
    gameId,
    myPlayerId,
    fetchGameData
  ) => {
    try {
      await httpService.exchangeCards({
        game_id: gameId,
        player1_id: myPlayerId,
        player2_id: opponentId,
        card1_id: myCard.card_id,
        card2_id: opponentCard.card_id,
      });
      await fetchGameData();
      setShowTradeDialog(false);
      setOpponentId(null);
    } catch (err) {
      console.error("Error al intercambiar cartas:", err);
    }
  };

  // Configurar listener para forzar revelación
  useEffect(() => {
    if (!wsService) return;

    const handleHasToReveal = (payload) => {
      if (payload.playerId === parseInt(myPlayerId)) {
        return "select-my-not-revealed-secret";
      }
      return null;
    };

    wsService.on("hasToReveal", handleHasToReveal);

    return () => {
      wsService.off("hasToReveal", handleHasToReveal);
    };
  }, [wsService, myPlayerId]);


  // detectar fin de partida por desgracia social o asesino revelado
  useEffect(() => {
    if (!turnData) return;
    console.log("turnData changed:", turnData);
    if (turnData.end_reason === "all_in_disgrace") {
      console.log("Fin de partida: desgracia social detectada");
      setWinnerData({ type: "social_disgrace", winners: [] });
      setShowEndDialog(true);
    }

    if (turnData.end_reason === "murder_revealed") {
      console.log(" Fin de partida: asesino revelado");
      setWinnerData({ type: "murder_revealed", winners: [] });
      setShowEndDialog(true);
    }
  }, [turnData]);


  return {
    showEndDialog,
    setShowEndDialog,
    winnerData,
    setWinnerData,
    showDiscardDialog,
    setShowDiscardDialog,
    playedActionCard: playedActionCardState,
    setPlayedActionCard,
    startDiscardTop5Action,
    handleReplenishFromDiscard,
    showTradeDialog,
    setShowTradeDialog,
    opponentId,
    setOpponentId,
    startCardTrade,
  };
};
