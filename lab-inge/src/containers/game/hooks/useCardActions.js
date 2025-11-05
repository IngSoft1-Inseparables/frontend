import { useEffect, useState, useEffect, useMemo, useRef } from "react";

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

  const [disgraceDiscarded, setDisgraceDiscarded] = useState(false);
  const disgraceDiscardedRef = useRef(false);
  const disgraceLockedRef = useRef(false);

  useEffect(() => {
    setDisgraceDiscarded(false);
    disgraceDiscardedRef.current = false;
    disgraceLockedRef.current = false;
  }, [turnData?.turn_owner_id]);

  const handlePlaySetAction = async (myPlayerId, gameId, currentSetCards) => {
    if (!currentSetCards || currentSetCards.length === 0) return;

    // En desgracia social no se puede jugar sets
    if (inDisgrace) return;

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

    //En desgracia no se pueden jugar cartas de evento

    if (inDisgrace && (over.id === "play-card-zone" || over.id === "set-play-area")) {
      console.log("No se puede jugar cartas mientras estás en desgracia social.");
      return;
    }

    // Si se soltó sobre el mazo de descarte
    if (over.id === "discard-deck") {
      if (turnData.turn_state != "None" && turnData.turn_state != "Discarding")
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

    // Si se soltó sobre la zona de eventos
    if (over.id === "play-card-zone") {
      if (inDisgrace) return;

      const droppedCard = playerData?.playerCards?.find(
        (card) => card.card_id === cardId
      );

      if (droppedCard?.type.toLowerCase() === "event") {
        if (turnData.turn_state != "None" || playedActionCard) return;

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
          case "early train to paddington":
            setSelectionAction("paddington");
            break;
          case "delay the murderer's escape!":
            setSelectionAction("delay");
            case "another victim":
              setSelectionMode("select-set");
              break;
            default:
              break;
          }
        } catch (error) {
          console.error("Failed playing event card:", error);
          setPlayerData(previousPlayerData);
          setPlayedActionCard(null);
        }

      } else if (droppedCard.type.toLowerCase() === "instant") {
        if (timer <= 0) return;
        if (turnData.turn_state.toLowerCase() != "playing" && turnData.turn_state.toLowerCase() != "replenish") return;
        try {
          await httpService.playNotSoFast(gameId, myPlayerId, cardId);
        } catch {
          console.log("Failed playing Not So Fast...")
        }
      } else {
        console.log("Card played not valid.");
      }
    }
  };

  return {
    handleCardClick,
    handlePlaySetAction,
    handleDragEnd,
  };
};
