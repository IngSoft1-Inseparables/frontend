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

  // Estado para guardar el efecto pendiente hasta que el timer llegue a 0
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
  };
  const [disgraceDiscarded, setDisgraceDiscarded] = useState(false);
  const disgraceDiscardedRef = useRef(false);
  const disgraceLockedRef = useRef(false);

  useEffect(() => {
    setDisgraceDiscarded(false);
    disgraceDiscardedRef.current = false;
    disgraceLockedRef.current = false;
  }, [turnData?.turn_owner_id]);

  // useEffect para ejecutar efectos pendientes cuando el timer llegue a 0
  useEffect(() => {
    const executePendingEffect = async () => {
      if (timer === 0 && pendingEffect) {
        console.log("⏰ Timer llegó a 0, ejecutando efecto pendiente automáticamente");
        const { type, response, droppedCard } = pendingEffect;
        
        try {
          if (type === "event") {
            // Activar los efectos según el tipo de carta de evento
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
              default:
                break;
            }
            console.log("✅ Efecto de carta de evento ejecutado exitosamente");
          } else if (type === "set") {
            // Activar los efectos según el tipo de set
            handleSwitch(response);
            console.log("✅ Efecto de set ejecutado exitosamente");
          }
        } catch (error) {
          console.error("❌ Error ejecutando efecto pendiente:", error);
        } finally {
          setPendingEffect(null); // Limpiar el efecto pendiente
        }
      }
    };

    executePendingEffect();
  }, [timer, pendingEffect, setSelectionMode, setSelectionAction, fetchGameData, startDiscardTop5Action, handleSwitch]);



  const handlePlaySetAction = async (myPlayerId, gameId, currentSetCards) => {
    if (!currentSetCards || currentSetCards.length === 0) return;

    // En desgracia social no se puede jugar sets
    if (inDisgrace) return;

    const cardIds = currentSetCards.map((card) => card.card_id);

    try {
      // 1. Enviar endpoint inmediatamente
      const response = await httpService.playSets(gameId, myPlayerId, cardIds);
      console.log("TIPO DE SET:", response);
      console.log("✅ Set enviado al backend, iniciando temporizador...");
      setTimer(5);
      
      // 2. Guardar el efecto para ejecutarlo cuando el timer llegue a 0
      setPendingEffect({
        type: "set",
        response: response.set_type,
      });
      
      // NO ejecutar handleSwitch aquí, se ejecutará cuando timer === 0
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

    // Si se soltó sobre la zona de juego
    if (over.id === "play-card-zone") {
      if (inDisgrace) return;


      const droppedCard = playerData?.playerCards?.find(
        (card) => card.card_id === cardId
      );

      if (droppedCard?.type.toLowerCase() === "event") {
        if (turnData.turn_state != "None" || playedActionCard) return;

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
          // 1. Enviar endpoint inmediatamente
          const response = await httpService.playEvent(
            gameId,
            myPlayerId,
            cardId,
            cardName
          );
          setTimer(5);
          console.log("✅ Carta de evento enviada al backend, iniciando temporizador...");
          
          // 2. Guardar el efecto para ejecutarlo cuando el timer llegue a 0
          setPendingEffect({
            type: "event",
            response: response,
            droppedCard
          });
          
          // NO ejecutar los efectos aquí, se ejecutarán cuando timer === 0
        } catch (error) {
          console.error("Failed playing event card:", error);
          setPlayerData(previousPlayerData);
          setPlayedActionCard(null);
        }

      } else if (droppedCard.type.toLowerCase() === "instant") {
        // Not So Fast se ejecuta INMEDIATAMENTE, no espera al timer
        // Solo validamos que el timer esté activo y el estado del turno sea válido
        if (timer <= 0) {
          console.log("⏰ Timer ya expiró, no se puede jugar Not So Fast");
          return;
        }
        
        // Validar estado del turno
        if (turnData.turn_state.toLowerCase() !== "playing" && 
            turnData.turn_state.toLowerCase() !== "discarding") {
          console.log("⚠️ Estado del turno inválido para jugar Not So Fast");
          return;
        }
        
        console.log("⚡ Ejecutando Not So Fast inmediatamente...");
        console.log("Timer actual:", timer);
        
        // Ejecutar la carta inmediatamente
        try {
          await httpService.playNotSoFast(gameId, myPlayerId, cardId);
          setTimer(5);
          console.log("✅ Not So Fast ejecutado exitosamente");
        } catch (error) {
          console.error("❌ Error ejecutando Not So Fast:", error);
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
      console.log("❌ Click en set inválido o no hay carta seleccionada");
      return;
    }

    const card = currentSetCards[0];
    const setType = matchingSet.setType; // Obtener el tipo de set
    const setId = matchingSet.setId;
    console.log("✅ Agregando carta al set:", { card, setIndex, setType, setId });

    try {
      // 1. Enviar endpoint inmediatamente
      const response = await httpService.addCardToSet(gameId, myPlayerId, card.card_id, setId);
      console.log("✅ Carta agregada al set, iniciando temporizador...");
      
      // Actualizar datos del juego desde el backend
      await fetchGameData();
      // Pequeño delay para asegurar que el WebSocket haya propagado el cambio de estado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 2. Guardar el efecto para ejecutarlo cuando el timer llegue a 0
      setPendingEffect({
        type: "set",
        response: response.set_type,
      });
      
      // NO ejecutar handleSwitch aquí, se ejecutará cuando timer === 0
    } catch (error) {
      console.error("Error al agregar carta al set:", error);
    }
  };

  return {
    handleCardClick,
    handlePlaySetAction,
    handleDragEnd,
    handleAddCardToSet,
    pendingEffect, // Exportar para feedback visual de efecto pendiente
  };
};
