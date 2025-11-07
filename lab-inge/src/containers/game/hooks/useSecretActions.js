import { useState, useEffect } from "react";

/**
 * Hook para manejar las acciones relacionadas con secretos
 */
export const useSecretActions = (
  httpService,
  gameId,
  myPlayerId,
  fetchGameData
) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectionAction, setSelectionAction] = useState(null);
  const [selectionMode, setSelectionMode] = useState(null);
  const [stolenPlayer, setStolenPlayer] = useState(null);
  const [fromPlayer, setFromPlayer] = useState(null);
  const [prevData, setPrevData] = useState(null);

  const revealMySecret = async (secretId) => {
    try {
      console.log("revelando secreto propio:", secretId);

      await httpService.revealSecret({
        gameId,
        playerId: myPlayerId,
        secretId,
      });

      await fetchGameData();
    } catch (err) {
      console.log("error al revelar secreto propio:", err);
    } finally {
      setSelectionMode(null);
    }
  };

  const revealOtherPlayerSecret = async (playerId, secretId) => {
    setSelectionMode("select-other-secret");
    try {
      console.log(
        "revelando secreto ajeno:",
        secretId,
        "del jugador:",
        playerId
      );
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

  const hideMySecret = async (secretId) => {
    try {
      console.log("ocultando secreto propio:", secretId);

      await httpService.hideSecret({
        gameId,
        playerId: myPlayerId,
        secretId,
      });

      await fetchGameData();
    } catch (err) {
      console.log("error al ocultar secreto propio:", err);
    }
  };

  const hideOtherPlayerSecret = async (playerId, secretId) => {
    try {
      console.log(
        "ocultando secreto ajeno:",
        secretId,
        "del jugador:",
        playerId
      );

      await httpService.hideSecret({
        gameId,
        playerId,
        secretId,
      });

      await fetchGameData();
    } catch (err) {
      console.log("error al ocultar secreto ajeno:", err);
    }
  };

  const handleStealSecret = async () => {
    if (!selectedPlayer) {
      console.error("❌ No hay jugador seleccionado para robar secreto");
      return;
    }
    try {
      setStolenPlayer(selectedPlayer);

      await forcePlayerRevealSecret(selectedPlayer);
    } catch (error) {
      console.error("❌ ERROR al forzar revelación:", error);
      setStolenPlayer(null);
      setPrevData(null);
      setSelectionAction(null);
    }
  };

  const handleStealSecretEvent = async (selectedSecret) => {
    if (!selectedSecret || !selectedPlayer) {
      console.log("No hay secreto seleccionado");
      return;
    }
    setFromPlayer(selectedPlayer);
    setSelectedPlayer(null);
    setSelectionMode("select-player");
  };

  const handlePlayerSelection = (playerId) => {
    setSelectedPlayer(playerId);
    console.log(playerId);
  };

  const handleSecretSelection = (playerId, secretId) => {
    setSelectedPlayer(playerId);
    console.log(`Player selected: "${playerId}`);
    setSelectedSecret(secretId);
    console.log(`Secret selected: "${secretId}`);
  };

  const handleSetSelection = (playerId, setIndex) => {
    setSelectedPlayer(playerId);
    setSelectedSet(setIndex);
  };

  const handleStealSet = async (fromPlayerId, setIndex) => {
    if (!fromPlayerId || setIndex === null || setIndex === undefined) {
      console.error("❌ No hay jugador o set seleccionado para robar");
      return;
    }

    try {
      console.log(`🎯 Robando set ${setIndex} del jugador ${fromPlayerId} hacia jugador ${myPlayerId}`);

      const response = await httpService.stealSet(
        gameId,
        setIndex,
        myPlayerId,
        fromPlayerId
      );
      console.log("TIPO DE SET:", response);
      console.log("✅ Set robado exitosamente");

      setSelectedPlayer(null);
      setSelectedSet(null);
      setSelectionMode(null);

      try {
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
        console.error("Error al ejecutar accion de set:", error);
      }

      // Actualizar los datos del juego
      await fetchGameData();
    } catch (error) {
      console.error("❌ ERROR al robar set:", error);
      setSelectedPlayer(null);
      setSelectedSet(null);
      setSelectionMode(null);
    }
  };
  // const handleCardAriadneOliver(){

  // }


  return {
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
    handleStealSet
  };
};
