import { useEffect, useRef } from "react";

/**
 * Hook para manejar la lógica de selección basada en el modo de selección actual
 */
export const useSelectionEffects = (
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
  handleCardAriadneOliver,
  ariadneCardId,
  turnData,
  setSelectedSet,
  setAriadneCardId,
  setShowTradeDialog,
  setOpponentId,
  myPlayerId
) => {
  // Revelar secreto propio
  useEffect(() => {
    if (selectionMode === "select-my-not-revealed-secret" && selectedSecret) {
      console.log("revelando secreto propio:", selectedSecret);
      revealMySecret(selectedSecret);
      setSelectedSecret(null);
      setSelectedPlayer(null);
      setSelectionMode(null);
    }
  }, [selectionMode, selectedSecret]);

  // Revelar secreto ajeno
  useEffect(() => {
    if (
      selectionMode === "select-other-not-revealed-secret" &&
      selectedSecret &&
      selectedPlayer
    ) {
      console.log(
        "revelando secreto ajeno:",
        selectedSecret,
        "de jugador:",
        selectedPlayer
      );
      revealOtherPlayerSecret(selectedPlayer, selectedSecret);
      setSelectedSecret(null);
      setSelectedPlayer(null);
      setSelectionMode(null);
    }
  }, [selectionMode, selectedSecret, selectedPlayer]);

  // Forzar revelación de secreto (solo si la acción NO es Card Trade ni Specials)
  useEffect(() => {
    if (
      selectionMode === "select-other-player" &&
      selectedPlayer &&
      (!selectionAction ||
        (selectionAction.toLowerCase() !== "card trade" &&
          selectionAction.toLowerCase() !== "specials" &&
          selectionAction.toLowerCase() !== "cards off the table" &&
          selectionAction.toLowerCase() !== "point"))
    ) {
      console.log(
        "Jugador seleccionado para forzar revelación:",
        selectedPlayer
      );

      forcePlayerRevealSecret(selectedPlayer);
      setSelectionMode(null);
    }
  }, [selectionMode, selectedPlayer, selectionAction]);

  // Ocultar secreto propio
  useEffect(() => {
    if (selectionMode === "select-my-revealed-secret" && selectedSecret) {
      console.log("ocultando secreto propio:", selectedSecret);
      hideMySecret(selectedSecret);
      setSelectedSecret(null);
      setSelectedPlayer(null);
      setSelectionMode(null);
    }
  }, [selectionMode, selectedSecret]);

  // Ocultar secreto ajeno
  useEffect(() => {
    if (
      selectionMode === "select-revealed-secret" &&
      selectedSecret &&
      selectedPlayer
    ) {
      console.log(
        "ocultando secreto ajeno:",
        selectedSecret,
        "de jugador:",
        selectedPlayer
      );
      hideOtherPlayerSecret(selectedPlayer, selectedSecret);
      setSelectedSecret(null);
      setSelectedPlayer(null);
      setSelectionMode(null);
    }
  }, [selectionMode, selectedSecret, selectedPlayer]);

  // Robar secreto con carta especial satherwhite
  useEffect(() => {
    if (
      selectionMode === "select-other-player" &&
      selectedPlayer &&
      selectionAction?.toLowerCase() === "specials"
    ) {
      console.log(
        "jugador seleccionado para forzar revelación:",
        selectedPlayer
      );

      handleStealSecret(selectedPlayer);
      setSelectionMode(null);
    }
  }, [selectionMode, selectedPlayer]);

  // Robar secreto revelado con "one more"
  useEffect(() => {
    if (
      selectionMode === "select-other-revealed-secret" &&
      selectedSecret &&
      selectionAction?.toLowerCase() === "one more"
    ) {
      console.log(
        "jugador al que se le va a robar un secreto:",
        selectedPlayer
      );

      handleStealSecretEvent(selectedSecret, selectedPlayer);
    }
  }, [selectionMode, selectedSecret]);

  // Asignar secreto robado a otro jugador
  useEffect(() => {
    if (
      selectionMode === "select-player" &&
      selectedSecret &&
      selectedPlayer &&
      selectionAction?.toLowerCase() === "one more"
    ) {
      console.log(
        "jugador seleccionado para asignarle un secreto:",
        selectedPlayer
      );

      (async () => {
        try {
          await httpService.stealSecret({
            gameId,
            secretId: selectedSecret,
            fromPlayerId: fromPlayer,
            toPlayerId: selectedPlayer,
          });

          await httpService.hideSecret({
            gameId,
            playerId: selectedPlayer,
            secretId: selectedSecret,
          });

          await fetchGameData();

          setSelectedPlayer(null);
          setSelectionAction(null);
          setFromPlayer(null);
          selectedSecret(null);
        } catch (error) {
          console.error("Error al asignar secreto:", error);
          setFromPlayer(null);
          setSelectionAction(null);
          setSelectedSecret(null);
        }
      })();

      setSelectionMode(null);
    }
  }, [selectionMode, selectedSecret, selectedPlayer]);

  useEffect(() => {
    if (selectionAction === "paddington" || selectionAction === "delay") {
      (async () => {
        try {
          let response;
          if (selectionAction === "paddington") {
            response = await httpService.sixCardsToDiscardpile(gameId);
          } else {
            response = await httpService.fiveCardsToRegpile(gameId);
          }
          // Guardar la cantidad de cartas movidas
          if (response && response.moved_count !== undefined) {
            setMovedCardsCount(response.moved_count);
          }
          await fetchGameData();
        } catch (error) {
          setSelectionAction(null);
        }
      })();
    } else if (selectionAction !== null) {
      setMovedCardsCount(null);
    }
  }, [selectionAction]);
  // Robar set seleccionado con "another victim"
  useEffect(() => {
    if (
      selectionMode === "select-set" &&
      selectedSet != null &&
      selectedPlayer &&
      selectionAction === "another"
    ) {
      console.log("Robando set:", selectedSet, "del jugador:", selectedPlayer);

      handleStealSet(selectedPlayer, selectedSet);
    }
  }, [selectionMode, selectedSet, selectedPlayer]);

  // 🎯 Ref para evitar ejecuciones múltiples de Ariadne
  const ariadneExecutingRef = useRef(false);

  useEffect(() => {
    // Si no es mi turno y esta la interfaz de ariadne activa, la desactivo
    if(selectionMode === "select-set" &&
      selectedSet === null &&
      turnData?.turn_owner_id != myPlayerId &&
      selectionAction === "ariadne"
    ){
      setSelectionMode(null);
      setSelectionAction(null);
      return;
    }

    if (
      selectionMode === "select-set" &&
      selectedSet != null &&
      selectedPlayer &&
      selectionAction === "ariadne" &&
      turnData &&
      ariadneCardId &&
      !ariadneExecutingRef.current // 🎯 Prevenir ejecuciones múltiples
    ) {
      //Buscar el jugador seleccionado
      const targetPlayer = turnData.players.find(
        (p) => p.id === selectedPlayer
      );

      if (!targetPlayer || !targetPlayer.setPlayed) {
        console.error("❌ No se encontró el jugador o sus sets");
        return;
      }

      // Obtener el set usando el índice
      const targetSet = targetPlayer.setPlayed[selectedSet];

      if (!targetSet || !targetSet.set_id) {
        console.error("❌ No se encontró el set o no tiene set_id");
        return;
      }

      const setId = targetSet.set_id;
      console.log("Ejecutando Ariadne con cardId:", ariadneCardId);
      console.log("Parámetros:", { selectedPlayer, setId, ariadneCardId });

      // Marcar como ejecutando
      ariadneExecutingRef.current = true;

      // Llamar a la función
      handleCardAriadneOliver(selectedPlayer, setId, ariadneCardId).finally(
        () => {
          // Resetear el flag cuando termine (éxito o error)
          ariadneExecutingRef.current = false;
          // Limpiar estados
          setSelectedPlayer(null);
          setSelectedSet(null);
          setSelectionMode(null);
          setSelectionAction(null);
          setAriadneCardId(null);
        }
      );
    }
  }, [
    selectionMode,
    selectedSet,
    selectedPlayer,
    selectionAction,
    ariadneCardId,
    turnData,
  ]);
  useEffect(() => {
    if (
      selectionMode === "select-other-player" &&
      selectedPlayer &&
      selectionAction &&
      selectionAction.toLowerCase() === "point"
    ) {
      const votedPlayerId = selectedPlayer;

      setSelectedPlayer(null);
      setSelectionMode(null);
      setSelectionAction(null);

      httpService
        .voteSuspicion(gameId, myPlayerId, votedPlayerId)
        .then((response) => {
          console.log("Voto registrado:", response);
        })
        .catch((error) => {
          console.error("Error al votar:", error);
          if (
            error.status === 400 &&
            error.data?.detail?.includes("already voted")
          ) {
            console.error("Error al votar:", error);
          }
        });
    }
  }, [selectionMode, selectedPlayer, selectionAction]);

  // Card Trade → seleccionar jugador y abrir diálogo
  useEffect(() => {
    if (
      selectionMode === "select-other-player" &&
      selectedPlayer &&
      selectionAction &&
      selectionAction.toLowerCase().replace(/\s+/g, "") === "cardtrade"
    ) {
      setSelectionMode(null);
      setSelectionAction(null);
      setShowTradeDialog(true);
      setOpponentId(selectedPlayer);
      setSelectedPlayer(null);
    }
  }, [selectionMode, selectedPlayer, selectionAction]);

  // Cards off the Table → eliminar Not So Fast! del jugador seleccionado
  useEffect(() => {
    if (
      selectionMode === "select-other-player" &&
      selectedPlayer &&
      selectionAction &&
      selectionAction.toLowerCase().replace(/\s+/g, "") === "cardsoffthetable"
    ) {
      console.log(
        "Ejecutando efecto de Cards off the Table en jugador:",
        selectedPlayer
      );

      (async () => {
        try {
          await httpService.removeNotSoFast(gameId, selectedPlayer);
          await fetchGameData();
          console.log("Not So Fast eliminadas del jugador:", selectedPlayer);
        } catch (error) {
          console.error("Error en Cards off the Table:", error);
        } finally {
          setSelectedPlayer(null);
          setSelectionMode(null);
          setSelectionAction(null);
        }
      })();
    }
  }, [selectionMode, selectedPlayer, selectionAction]);
};
