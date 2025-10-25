import { useState, useEffect } from "react";

/**
 * Hook para manejar la lógica compleja del robo de secretos
 */
export const useStealSecretLogic = (
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
) => {
  useEffect(() => {
    if (
      !prevData ||
      !turnData ||
      !stolenPlayer ||
      selectionAction?.toLowerCase() !== "specials"
    ) {
      return;
    }

    const previousPlayerData = prevData?.players?.find(
      (p) => p.id === parseInt(stolenPlayer)
    );

    const currentPlayerData = turnData?.players?.find(
      (p) => p.id === parseInt(stolenPlayer)
    );

    if (!previousPlayerData || !currentPlayerData) {
      return;
    }

    // Buscar el secreto que cambió de oculto (revealed=false) a revelado (revealed=true)
    const secretToSteal = currentPlayerData?.playerSecrets?.find(
      (currentSecret) => {
        const prevSecret = previousPlayerData?.playerSecrets?.find(
          (s) => s.secret_id === currentSecret.secret_id
        );

        const wasHidden = prevSecret?.revealed === false;
        const isNowRevealed = currentSecret.revealed === true;

        return isNowRevealed && wasHidden;
      }
    );

    if (secretToSteal) {
      setPrevData(null);

      (async () => {
        try {
          await httpService.stealSecret({
            gameId,
            secretId: secretToSteal.secret_id,
            fromPlayerId: stolenPlayer,
            toPlayerId: myPlayerId,
          });

          await new Promise((resolve) => setTimeout(resolve, 100));

          await httpService.hideSecret({
            gameId,
            playerId: myPlayerId,
            secretId: secretToSteal.secret_id,
          });

          await fetchGameData();

          setSelectedPlayer(null);
          setSelectionAction(null);
          setStolenPlayer(null);
        } catch (error) {
          console.error("❌ ERROR al robar secreto:", error);
          console.error("Detalles del error:", error.message);
          setStolenPlayer(null);
          setSelectionAction(null);
        }
      })();
    }
  }, [turnData, prevData, stolenPlayer, selectionAction, gameId, myPlayerId]);
};
