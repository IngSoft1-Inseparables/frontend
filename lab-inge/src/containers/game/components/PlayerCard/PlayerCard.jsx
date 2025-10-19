import { useState } from "react";

const PlayerCard = ({
  player,
  turnData,
  myPlayerId,
  onPlayerSelect,
  selectedPlayer,
  onSecretSelect,
  selectedSecret,
  selectionMode,
  openSetModal,
  playerSetsCount,
}) => {
  if (!player || !turnData) return null;

  const handlePlayerClick = () => {
    if (onPlayerSelect) {
      onPlayerSelect(player.id);
    }
  };

  const handleSecretClick = (secretId) => {
    if (onSecretSelect) {
      onSecretSelect(player.id, secretId);
    }
  };

  const isSecretSelectable = (secret) => {
    const revealed = secret.revealed;
    const isThisPlayerSecret = player.id === parseInt(myPlayerId);

    switch (selectionMode) {
      case "select-revealed-secret":
        return revealed ? !selectedSecret : false;
      case "select-not-revealed-secret":
        return !revealed ? !selectedSecret : false;
      case "select-other-revealed-secret":
        return revealed && !isThisPlayerSecret ? !selectedSecret : false;
      case "select-other-not-revealed-secret":
        return !revealed && !isThisPlayerSecret ? !selectedSecret : false;
      case "select-my-revealed-secret":
        return revealed && isThisPlayerSecret ? !selectedSecret : false;
      case "select-my-not-revealed-secret":
        return !revealed && isThisPlayerSecret ? !selectedSecret : false;
      default:
        return false;
    }
  };

  const isPlayerSelectable = () => {
    switch (selectionMode) {
      case "select-player":
        return !selectedPlayer;
      case "select-other-player":
        return myPlayerId != player.id && !selectedPlayer;
      default:
        return false;
    }
  };

  const isThisPlayerSelected =
    selectedPlayer === player.id && selectionMode?.includes("player");
  const isOtherPlayerSelected = selectedPlayer && selectedPlayer !== player.id;

  // Condición para la activación del modal
  const canOpenSetModal = player.setPlayed?.length > 0;
  // Determinamos si el jugador es el local (para el estilo opacidad)
  const isLocalPlayer = player.id === Number(myPlayerId);
  return (
    <div
      onClick={isPlayerSelectable() ? handlePlayerClick : null}
      className={`
                ${
                  player.id === turnData.turn_owner_id
                    ? "w-72 h-48 flex flex-col items-center rounded-xl bg-orange-800/60 flex-shrink-0"
                    : "w-72 h-48 flex flex-col items-center flex-shrink-0"
                }
                ${
                  isPlayerSelectable()
                    ? "border-2 border-gray-400/80 border-dashed cursor-pointer hover:border-solid rounded-xl hover:border-yellow-400/80 hover:scale-101 transition-all"
                    : ""
                }
                ${
                  isThisPlayerSelected
                    ? "border-2 border-solid rounded-xl border-yellow-400/80 scale-101"
                    : ""
                }
                ${isOtherPlayerSelected ? "" : ""}
                `}
    >
      {/* Avatar y Nombre */} {/*Sets*/}
      <div
        className={
          (player.setPlayed?.length || 0) > 0
            ? "flex items-center justify-between h-16 w-full gap-1"
            : "flex items-center justify-center h-16 w-full gap-2"
        }
      >
        <div className="flex flex-row  items-center gap-2">
          <div
            className={
              player.id === turnData.turn_owner_id
                ? "rounded-full bg-cover border-2 border-yellow-400 w-10 h-10 scale-110 transition-all duration-300 transform flex-shrink-0 ml-6"
                : "rounded-full bg-cover border-2 border-gray-400 w-10 h-10 flex-shrink-0 ml-6"
            }
            style={{ backgroundImage: `url(public/${player.avatar})` }}
          ></div>
          <p
            className={
              player.id === turnData.turn_owner_id
                ? "text-white text-sm font-bold truncate"
                : "text-white text-sm truncate"
            }
          >
            {player.name}
          </p>
        </div>

        {player.setPlayed?.length > 0 && (
          <div className="relative flex items-center justify-center gap-1 mr-3">
            {/* Contador de sets (izquierda del ícono) */}
            <span
              className={`
        absolute -left-3 top-1/2 transform -translate-y-1/2
        bg-[#b45f2a] text-white text-xs font-semi-bold 
        rounded-full h-6 w-6 flex items-center justify-center
        shadow-md border border-[#753a16]
        ${
          isLocalPlayer
            ? "opacity-80"
            : "group-hover:scale-110 transition-transform"
        }
      `}
            >
              {player.setPlayed.length}
            </span>

            {/* Ícono del set */}
            <img
              onClick={
                canOpenSetModal ? () => openSetModal(player.id) : undefined
              }
              src="/icons/Sets.png"
              className={`w-20 h-14 mx-auto transition-transform duration-300 ease-in-out drop-shadow-md ${
                isLocalPlayer
                  ? "opacity-60"
                  : "cursor-pointer hover:scale-110 hover:drop-shadow-xl hover:brightness-110"
              }`}
            />
          </div>
        )}
      </div>
      {/* Secretos */}
      <div className="flex justify-center items-center flex-1 w-full gap-1 p-2">
        {player.playerSecrets?.map((secret, index) => {
          const secretCount = player.playerSecrets?.length || 1;
          return (
            <div
              key={index}
              onClick={
                isSecretSelectable(player.playerSecrets[index])
                  ? () =>
                      handleSecretClick(player.playerSecrets[index].secret_id)
                  : null
              }
              className={`aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm flex-1 max-w-20 min-w-12 
                                ${
                                  player.id === parseInt(myPlayerId) &&
                                  !secret?.revealed
                                    ? "opacity-45"
                                    : "transition-all"
                                }
                                ${
                                  isSecretSelectable(
                                    player.playerSecrets[index]
                                  )
                                    ? "border-2 border-gray-500 border-dashed cursor-pointer hover:border-solid hover:border-yellow-400/80 hover:scale-105 transition-all opacity-100"
                                    : "transition-all"
                                }
                                ${
                                  selectedSecret ===
                                  player.playerSecrets[index].secret_id
                                    ? "border-2 border-solid rounded-sm border-yellow-400/80 scale-101"
                                    : ""
                                }
                                `}
              style={{
                maxWidth: `calc((100% - ${
                  Math.max(0, secretCount - 1) * 0.25
                }rem) / ${secretCount})`,
                backgroundImage:
                  secret?.revealed || player.id === parseInt(myPlayerId)
                    ? `url(/src/assets/game/secrets/${secret?.image_back_name}.png)`
                    : `url(/src/assets/game/secrets/${secret?.image_front_name}.png)`,
              }}
            >
              {player.id === parseInt(myPlayerId) && !secret?.revealed && (
                <div className="flex w-full h-full items-start justify-end">
                  <img
                    src="public/icons/eye-closed.svg"
                    alt="eye-closed"
                    className="w-[1.5em]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerCard;
