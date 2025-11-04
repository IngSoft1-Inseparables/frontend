import { useEffect } from "react";

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
  handleStealSet
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

  // Forzar revelación de secreto
  useEffect(() => {
    if (selectionMode === "select-other-player" && selectedPlayer) {
      console.log(
        "jugador seleccionado para forzar revelación:",
        selectedPlayer
      );

      forcePlayerRevealSecret(selectedPlayer);
      setSelectionMode(null);
    }
  }, [selectionMode, selectedPlayer]);

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
      selectedPlayer
    ) {
      console.log(
        "🎯 Robando set:",
        selectedSet,
        "del jugador:",
        selectedPlayer
      );
      handleStealSet(selectedPlayer, selectedSet);

    }
  }, [selectionMode, selectedSet, selectedPlayer]);

};
