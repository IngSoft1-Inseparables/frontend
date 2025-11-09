import { useState, useEffect, useMemo, useRef } from "react";

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
  startDiscardTop5Action,
  timer,
  setTimer
) => {

  const [pendingEffect, setPendingEffect] = useState(null);

  // si estoy en desgracia social

  const inDisgrace = useMemo(() => {
    if (!turnData?.players || !myPlayerId) return false;
    const me = turnData.players.find(p => p.id === parseInt(myPlayerId));
    return !!me?.in_disgrace;
  }, [turnData, myPlayerId]);

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
  const handleSwitch = (response) => {
    switch (response.toLowerCase()) {
      case "poirot":
      case "marple":
        setSelectionMode("select-other-not-revealed-secret");
        break;

      case "ladybrent":
        setSelectionMode("select-other-player");
        break;

      case "tommyberestford":
      case "tuppenceberestford":
        setSelectionMode("select-other-player");
        break;

      case "tommytuppence":
        setSelectionMode("select-other-player");
        break;

      case "satterthwaite":
        setSelectionMode("select-other-player");
        break;

      case "specialsatterthwaite":
        setSelectionMode("select-other-player");
        setSelectionAction("specials");
        break;

      case "pyne":
        setSelectionMode("select-revealed-secret");
        break;

      default:
        break;
    }
  };
  const [disgraceDiscarded, setDisgraceDiscarded] = useState(false);
  const disgraceDiscardedRef = useRef(false);
  const disgraceLockedRef = useRef(false);

  useEffect(() => {
    setDisgraceDiscarded(false);
    disgraceDiscardedRef.current = false;
    disgraceLockedRef.current = false;
  }, [turnData?.turn_owner_id]);

  useEffect(() => {
    const executePendingEffect = async () => {
      if (timer === 0 && pendingEffect) {

        if (turnData?.turn_state.toLowerCase() != "playing") {
          setPendingEffect(null);
          return;
        }

        const { type, response, droppedCard } = pendingEffect;

        try {
          if (type === "event") {
            switch (response.cardName.toLowerCase()) {
              case "look into the ashes":
                await fetchGameData();
                startDiscardTop5Action();
                break;
              case "and then there was one more...":
                setSelectionMode("select-other-revealed-secret");
                setSelectionAction("one more");
                break;
              case "early train to paddington":
                setSelectionAction("paddington");
                break;
              case "delay the murderer's escape!":
                setSelectionAction("delay");
                break;
              case "another victim":
                setSelectionMode("select-set");
                break;
              case "card trade":
                setSelectionMode("select-other-player");
                setSelectionAction("card trade");
                break;
              case "cards off the table":
                setSelectionMode("select-other-player");
                setSelectionAction("cards off the table");
              break; 
              default:
                break;
            }
          } else if (type === "set") {
            handleSwitch(response);
          }
        } catch (error) {
          console.error("Error ejecutando efecto pendiente:", error);
        } finally {
          setPendingEffect(null);
        }
      }
    };

    executePendingEffect();
  }, [timer, pendingEffect, turnData, setSelectionMode, setSelectionAction, fetchGameData, startDiscardTop5Action, handleSwitch]);


  const handlePlaySetAction = async (myPlayerId, gameId, currentSetCards) => {
    if (!currentSetCards || currentSetCards.length === 0) return;

    // En desgracia social no se puede jugar sets
    if (inDisgrace) return;

    const cardIds = currentSetCards.map((card) => card.card_id);

    try {
      const response = await httpService.playSets(gameId, myPlayerId, cardIds);
      setTimer(response?.timer);
      console.log("TIPO DE SET:", response);
      console.log("✅ Set enviado al backend, iniciando temporizador...");


      setPendingEffect({
        type: "set",
        response: response.set_type,
      });
    } catch (error) {
      console.error("Error al cargar los sets:", error);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const cardId = active.data.current?.cardId;
    const cardName = active.data.current?.cardName;
    const imageName = active.data.current?.imageName;

    //En desgracia no se pueden jugar cartas de evento

    // En desgracia, solo se puede jugar la carta "Not So Fast"
    if (inDisgrace && (over.id === "play-card-zone" || over.id === "set-play-area")) {
      const droppedCard = playerData?.playerCards?.find(c => c.card_id === active.data.current?.cardId);
      const isNotSoFast =
        droppedCard?.type?.toLowerCase() === "instant" ||
        droppedCard?.card_name?.toLowerCase() === "not so fast";

      if (!isNotSoFast) {
        console.log(" Solo podés jugar 'Not So Fast' mientras estás en desgracia social.");
        return;
      }
    }


    // Si se soltó sobre el mazo de descarte
    if (over.id === "discard-deck") {
      if (turnData.turn_state != "None" && turnData.turn_state != "Discarding" || myPlayerId != turnData.turn_owner_id)
        return;

      // Si ya hay un bloqueo de descarte (previo) evitamos otra llamada.
      if (disgraceLockedRef.current) {
        console.log("Ya descartaste (desgracia): no podés descartar otra.");
        return;
      }

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
        // 1) Marcar inmediatamente en los refs para evitar llamadas concurrentes
        if (inDisgrace) {
          disgraceDiscardedRef.current = true;
          disgraceLockedRef.current = true;
        }

        // 2) Descartar
        await httpService.discardCard(myPlayerId, cardId);

        if (inDisgrace) {
          // 3) Marcar que ya descarté en desgracia (estado react)
          setDisgraceDiscarded(true);

          // 4) Reponer hasta 6 o hasta que el turno cambie
          for (let i = 0; i < 6; i++) {
            try {
              await httpService.updateHand(gameId, myPlayerId);
            } catch (e) {
              // falla si ya tenés 6 o ya no es tu turno → cortamos
              break;
            }

            let refreshed;
            try {
              refreshed = await fetchGameData();
            } catch (e) {
              // si falla, continuamos; WS puede actualizar
            }

            const newTurnOwner = refreshed?.turnData?.turn_owner_id;
            const myHandSize = refreshed?.playerData?.playerCards?.length;

            // Si ya no es mi turno, corto
            if (newTurnOwner !== parseInt(myPlayerId)) break;

            // Si ya llegué a 6, el próximo updateHand hará end_turn → corto
            if (typeof myHandSize === "number" && myHandSize >= 6) break;
          }
        } else {
          // No auto-reponer; que el jugador elija (evento/set/reponer manual)
          try {
            await fetchGameData();
          } catch (e) {
            console.error("Falló fetchGameData post-descartar (no desgracia):", e);
          }
        }

        // 4) Refrescar datos de juego
        try {
          await fetchGameData();
        } catch (e) {
          console.error("Falló fetchGameData post-acción:", e);
        }
      } catch (error) {
        console.error("Error al descartar carta:", error);
        setPlayerData(previousPlayerData);
        setTurnData(previousTurnData);
      }

    }

    // Si se soltó sobre la zona de juego
    if (over.id === "play-card-zone") {
      /*if (inDisgrace) return;*/

      const droppedCard = playerData?.playerCards?.find(
        (card) => card.card_id === cardId
      );

      if (droppedCard?.type.toLowerCase() === "event") {
        if (turnData.turn_state != "None" || playedActionCard || myPlayerId != turnData.turn_owner_id) return;

        const previousPlayerData = playerData;

        // Actualizar UI: remover carta de la mano y mostrarla como jugada
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
          setTimer(response?.timer);

          console.log("✅ Carta de evento enviada al backend, iniciando temporizador...");

          setPendingEffect({
            type: "event",
            response: response,
            droppedCard
          });
        } catch (error) {
          console.error("Failed playing event card:", error);
          setPlayerData(previousPlayerData);
          setPlayedActionCard(null);
        }

      } else if (droppedCard?.type?.toLowerCase() === "instant") {
        if (timer <= 0) {
          return;
        }

        if (turnData.turn_state.toLowerCase() !== "playing" &&
          turnData.turn_state.toLowerCase() !== "discarding") {
          return;
        }

        try {
          const response = await httpService.playNotSoFast(gameId, myPlayerId, cardId);
          setTimer(response?.timer);
          console.log("✅ Not So Fast ejecutado exitosamente");
        } catch (error) {
          console.error("Error ejecutando Not So Fast:", error);
        }

      } else {
        console.log("Card played not valid.");
      }
    }
  };

  const handleAddCardToSet = async (
    setIndex,
    matchingSets,
    currentSetCards
  ) => {
    // Verificar que el set esté en matchingSets
    const matchingSet = matchingSets.find(
      (match) => match.setIndex === setIndex
    );

    if (!matchingSet || currentSetCards.length !== 1) {
      return;
    }

    const card = currentSetCards[0];
    const setType = matchingSet.setType;
    const setId = matchingSet.setId;

    try {
      const response = await httpService.addCardToSet(gameId, myPlayerId, card.card_id, setId);

      await fetchGameData();
      await new Promise(resolve => setTimeout(resolve, 100));

      setPendingEffect({
        type: "set",
        response: response.set_type,
      });
    } catch (error) {
      console.error("Error al agregar carta al set:", error);
    }
  };

  return {
    handleCardClick,
    handlePlaySetAction,
    handleDragEnd,
    handleAddCardToSet,
    pendingEffect,
  };
};
