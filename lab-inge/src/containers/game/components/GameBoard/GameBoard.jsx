import HandCard from "../HandCard/HandCard.jsx";
import DiscardDeck from "../DiscardDeck/DiscardDeck.jsx";
import RegularDeck from "../RegularDeck/RegularDeck.jsx";
import DraftDeck from "../DraftDeck/DraftDeck.jsx";
import PlayerCard from "../PlayerCard/PlayerCard.jsx";
import SetDeck from "../SetDeck/SetDeck.jsx";
import PlayCardZone from "../PlayCardZone/PlayCardZone.jsx";
import PlayerSetsModal from "../PlayerSetModal/PlayerSetModal.jsx";
import { createHttpService } from "../../../../services/HTTPService";

import { useState, useEffect, useCallback } from "react";

// Configuración de posiciones de jugadores según la cantidad
const PLAYER_POSITIONS = {
  2: {
    top: [1],
    left: [],
    right: [],
  },
  3: {
    top: [1, 2],
    left: [],
    right: [],
  },
  4: {
    top: [2],
    left: [1],
    right: [3],
  },
  5: {
    top: [2, 3],
    left: [1],
    right: [4],
  },
  6: {
    top: [2, 3, 4],
    left: [1],
    right: [5],
  },
};

function GameBoard({
  orderedPlayers,
  playerData,
  setPlayerData,
  turnData,
  setTurnData,
  myPlayerId,
  onCardClick,
  setCards,
  onPlayerSelect,
  selectedPlayer,
  onSecretSelect,
  selectedSecret,
  onSetSelect,
  selectedSet,
  selectionMode,
  playedActionCard,
  message,
  setSelectionMode,
  onAddCardToSet,
  setSelectionAction,
  setAriadneCardId,
  timer
}) {
  const playerCount = turnData.players_amount;

  const httpService = createHttpService();

  const positions = PLAYER_POSITIONS[playerCount] || PLAYER_POSITIONS[2];

  const isRegpileAvailable =
    turnData.turn_owner_id === myPlayerId && playerData.playerCards.length < 6 && (turnData.turn_state === "Replenish" || turnData.turn_state === "Discarding");
  const availableToPlay = turnData.turn_owner_id === myPlayerId;
  const currentTurnState = turnData?.turn_state || "None";
  const [playedSets, setPlayedSets] = useState([]);
  const [isSetReady, setIsSetReady] = useState(false);
  const [currentSetCards, setCurrentSetCards] = useState([]);

  const [modalPlayerId, setModalPlayerId] = useState(null);
  const openSetModal = (playerId) => setModalPlayerId(playerId);
  const closeSetModal = () => setModalPlayerId(null);
  const [matchingSets, setMatchingSets] = useState([]);
  const [addToSet, setAddToSet] = useState(false);

  if (!turnData || !playerData || orderedPlayers.length === 0) {
    return (
      console.log("info publica:", turnData),
      console.log("info privada:", playerData),
      console.log("orden de los jugadores:", orderedPlayers)
    );
  }
  const handleCardSelected = useCallback(
    (tempMatches) => {
      console.log("🔍 Matches recibidos:", tempMatches);
      if (!tempMatches || tempMatches.length === 0) {
        setMatchingSets([]);

        return;
      }

      setMatchingSets(tempMatches);

      if (tempMatches[0]?.isAriadne) {
        console.log("✅ Ariadne Oliver detectada - guardando ID");
        setAriadneCardId(tempMatches[0].card.card_id);
      }
    },
    [setAriadneCardId]
  );

  const handleSetStateChange = (isPlayable, cards) => {
    setIsSetReady(isPlayable);
    setCurrentSetCards(cards);
  };

const handlePlaySetClick = () => {
  const player = turnData.players.find((p) => p.id === myPlayerId);
  const setPlayed = player?.setPlayed || [];
  
  const otrosJugadoresTienenSets = turnData.players
    .filter((p) => p.id !== Number(myPlayerId))
    .some((p) => Array.isArray(p.setPlayed) && p.setPlayed.length > 0);
  
  // Detectar si es Ariadne Oliver
  const esAriadneOliver = 
    currentSetCards.length === 1 &&
    currentSetCards[0]?.card_name?.toLowerCase() === "adriane oliver";
  
  if (esAriadneOliver) {
    if (otrosJugadoresTienenSets) {
      console.log("Jugando Ariadne Oliver - activando selección");
      setSelectionMode("select-set");
      setSelectionAction("ariadne");
      return; 
    } else {
      console.log(" No se puede jugar Ariadne Oliver - no hay sets disponibles");
      return; 
    }
  }
  
  // Solo llega aquí si NO es Ariadne Oliver
  console.log("Cartas del set jugado:", setPlayed);
  if (setCards) {
    setCards(myPlayerId, turnData.gameId, currentSetCards);
  }
};

  const handleSetClick = (setIndex) => {
    if (onAddCardToSet) {
      onAddCardToSet(setIndex, matchingSets, currentSetCards);
      // Limpiar selección
      setMatchingSets([]);
      setAddToSet(false);
    }
  };

  const handleReplenishFromDraft = async (carta) => {
    try {
      console.log("→ Robando carta del mazo de draft...");

      const res = await httpService.replenishFromDraft(
        turnData.gameId,
        myPlayerId,
        carta
      );

      // Actualizar el draft con las nuevas cartas
      setTurnData((prev) => ({
        ...prev,
        draft: {
          count: res.newDraft.length,
          card_1: res.newDraft[0],
          card_2: res.newDraft[1],
          card_3: res.newDraft[2],
        },
      }));

      console.log("Carta y draft actualizados correctamente.");
    } catch (error) {
      console.error("Error al reponer carta desde draft:", error);
    }
  };

  return (
    <div
      className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover p-2"
      style={{ backgroundImage: "url(/game_bg.png)" }}
    >
      {/* Bloque superior - Jugadores de arriba */}
      <div className="flex justify-evenly items-center px-4">
        {positions.top.map((index) => (
          <PlayerCard
            key={index}
            player={orderedPlayers[index]}
            turnData={turnData}
            myPlayerId={myPlayerId}
            onPlayerSelect={onPlayerSelect}
            selectedPlayer={selectedPlayer}
            onSecretSelect={onSecretSelect}
            selectedSecret={selectedSecret}
            selectionMode={selectionMode}
            openSetModal={openSetModal}
            playerData={playerData}
          />
        ))}
      </div>

      {/* Bloque central */}
      <div className="grid grid-cols-[15%_70%_15%]">
        {/* Jugador izquierdo */}
        <div className="flex items-center justify-center px-2">
          {positions.left.map((index) => (
            <PlayerCard
              key={index}
              player={orderedPlayers[index]}
              turnData={turnData}
              myPlayerId={myPlayerId}
              onPlayerSelect={onPlayerSelect}
              selectedPlayer={selectedPlayer}
              onSecretSelect={onSecretSelect}
              selectedSecret={selectedSecret}
              selectionMode={selectionMode}
              openSetModal={openSetModal}
              playerData={playerData}

            />
          ))}
        </div>

        {/* Mesa central - Mazos */}

        <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl ">
          <div className="h-full grid grid-rows-[70%_30%] items-center">
            <div className="h-full grid grid-cols-[40%_20%_40%]">
              {/* Grupo izquierdo: mazo regular + draft */}

              <div className="flex flex-col justify-center items-center gap-2">
                <RegularDeck
                  regpile={turnData?.regpile}
                  isAvailable={isRegpileAvailable}
                  onCardClick={onCardClick}
                />
                <DraftDeck
                  draft={turnData?.draft}
                  isAvailable={
                    isRegpileAvailable
                  }
                  onCardClick={handleReplenishFromDraft}
                />
              </div>

              <div className="flex justify-center items-end gap-2 mb-10">
                <PlayCardZone actionCard={playedActionCard} turnData={turnData} myPlayerId={myPlayerId} playerData={playerData} timer={timer} />
              </div>

              {/* Grupo derecho: mazo de descarte */}
              <div className="flex justify-center items-center gap-2">
                <DiscardDeck
                  discardpile={turnData?.discardpile}
                  turnData={turnData}
                  myPlayerId={myPlayerId}
                  setSelectionAction={setSelectionAction}
                />
              </div>
            </div>

            <div className="flex h-full w-full flex-wrap">
              <SetDeck
                setPlayed={
                  turnData.players.find((p) => p.id === myPlayerId)
                    ?.setPlayed || []
                }
                matchingSets={matchingSets}
                onSetClick={handleSetClick}
                availableToPlay={availableToPlay}
                turnState={currentTurnState}
              />
            </div>
          </div>
        </div>

        {/* Jugador derecho */}
        <div className="flex items-center justify-center px-2">
          {positions.right.map((index) => (
            <PlayerCard
              key={index}
              player={orderedPlayers[index]}
              turnData={turnData}
              myPlayerId={myPlayerId}
              onPlayerSelect={onPlayerSelect}
              selectedPlayer={selectedPlayer}
              onSecretSelect={onSecretSelect}
              selectedSecret={selectedSecret}
              selectionMode={selectionMode}
              openSetModal={openSetModal}
              playerData={playerData}

            />
          ))}
        </div>
      </div>

      {/* Bloque inferior - Jugador actual y mano */}
      <div className="flex items-end justify-between px-6 ">
        <PlayerCard
          key={0}
          player={playerData}
          turnData={turnData}
          myPlayerId={myPlayerId}
          onPlayerSelect={onPlayerSelect}
          selectedPlayer={selectedPlayer}
          onSecretSelect={onSecretSelect}
          selectedSecret={selectedSecret}
          selectionMode={selectionMode}
          openSetModal={openSetModal}
          playerData={playerData}

        />
        <div
          className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 ${playerCount < 6 ? "z-20" : ""
            }`}
        >
          <HandCard
            playerCards={playerData?.playerCards || []}
            availableToPlay={availableToPlay}
            turnState={currentTurnState}
            onSetStateChange={handleSetStateChange}
            onCardStateChange={handleCardSelected}
            setsPlayed={
              turnData.players.find((p) => p.id === myPlayerId)?.setPlayed || []
            }
            setSelectionMode={setSelectionMode}
            inDisgrace={
              turnData?.players?.find((p) => p.id === parseInt(myPlayerId))
                ?.in_disgrace
            }
          />

          <div>
            <p className="text-white text-center">{message}</p>
          </div>
        </div>
        <div className=" flex justify-rigth mr-12 mb-6">
          {isSetReady && availableToPlay && (
            <button
              onClick={handlePlaySetClick}
              className="bg-red-700/80 hover:bg-red-700/50 text-white font-semibold py-1 px-6 rounded-xl shadow-lg text-base transition duration-150"
            >
              {currentSetCards.length === 1 &&
              currentSetCards[0]?.card_name?.toLowerCase() === "adriane oliver" 
                ? "JUGAR ARIADNE OLIVER"
                : `BAJAR SET DE ${currentSetCards[0]?.card_name === "Harley Quin Wildcard"
                  ? currentSetCards[1]?.card_name.toUpperCase()
                  : currentSetCards[0]?.card_name.toUpperCase()
                }`}
            </button>
          )}
        </div>
      </div>

      <PlayerSetsModal
        modalPlayerId={modalPlayerId}
        orderedPlayers={orderedPlayers}
        closeSetModal={closeSetModal}
        onSetSelect={onSetSelect}
        selectedSet={selectedSet}
        selectionMode={selectionMode}
      />
    </div>
  );
}

export default GameBoard;
