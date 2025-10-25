import { useState } from "react";

/**
 * Hook para manejar las acciones de las cartas (jugar, descartar, drag and drop)
 */
export const useCardActions = (
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
  startDiscardTop5Action
) => {
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

  const handlePlaySetAction = async (myPlayerId, gameId, currentSetCards) => {
    if (!currentSetCards || currentSetCards.length === 0) return;

    const cardIds = currentSetCards.map((card) => card.card_id);

    try {
      const response = await httpService.playSets(gameId, myPlayerId, cardIds);
      console.log("TIPO DE SET:", response);

      switch (response.set_type?.toLowerCase()) {
        case "poirot":
        case "marple":
          console.log("✅ Activando modo: select-not-revealed-secret");
          setSelectionMode("select-other-not-revealed-secret");
          break;

        case "ladybrent":
          console.log("✅ Activando modo: select-other-player");
          setSelectionMode("select-other-player");
          break;

        case "tommyberestford":
        case "tuppenceberestford":
          console.log("✅ Activando modo: select-other-player");
          setSelectionMode("select-other-player");
          break;

        case "tommytuppence":
          console.log("✅ Activando modo: select-other-player (no cancelable)");
          setSelectionMode("select-other-player");
          break;

        case "satterthwaite":
          console.log("✅ Activando modo: select-other-player");
          setSelectionMode("select-other-player");
          break;

        case "specialsatterthwaite":
          console.log("✅ Activando modo: select-other-player");
          setSelectionMode("select-other-player");
          setSelectionAction("specials");
          break;

        case "pyne":
          console.log("✅ Activando modo: select-revealed-secret");
          setSelectionMode("select-revealed-secret");
          break;

        default:
          console.log("⚠️ Set sin efecto:", response.set_type);
          break;
      }
    } catch (error) {
      console.error("Error al cargar los sets:", error);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || myPlayerId != turnData.turn_owner_id) return;

    const cardId = active.data.current?.cardId;
    const cardName = active.data.current?.cardName;
    const imageName = active.data.current?.imageName;

    // Si se soltó sobre el mazo de descarte
    if (over.id === "discard-deck") {
      if (turnData.turn_state != "None" && turnData.turn_state != "Discarding")
        return;

      const previousPlayerData = playerData;
      const previousTurnData = turnData;

      setPlayerData((prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          playerCards: prevData.playerCards.filter(
            (card) => card.card_id !== cardId
          ),
        };
      });

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

      const droppedCard = playerData?.playerCards?.find(
        (card) => card.card_id === cardId
      );

      if (!droppedCard) {
        console.error("Card not found in player's hand");
        return;
      }

      if (
        droppedCard.type.toLowerCase() != "event" &&
        (cardName.toLowerCase() === "look into the ashes" ||
          cardName.toLowerCase() === "and then there was one more")
      ) {
        console.log("Card played not valid.");
        return;
      }

      const previousPlayerData = playerData;

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
        const response = await httpService.playEvent(
          gameId,
          myPlayerId,
          cardId,
          cardName
        );

        switch (response.cardName.toLowerCase()) {
          case "look into the ashes":
            await fetchGameData();
            startDiscardTop5Action();
            break;
          case "and then there was one more...":
            setSelectionMode("select-other-revealed-secret");
            setSelectionAction("one more");
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Failed playing event card:", error);
        setPlayerData(previousPlayerData);
        setPlayedActionCard(null);
      }
    }
  };

  return {
    handleCardClick,
    handlePlaySetAction,
    handleDragEnd,
  };
};
