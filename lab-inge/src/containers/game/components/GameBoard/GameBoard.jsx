import HandCard from "../HandCard/HandCard.jsx";
import DiscardDeck from "../DiscardDeck/DiscardDeck.jsx";
import RegularDeck from "../RegularDeck/RegularDeck.jsx";
import DraftDeck from "../DraftDeck/DraftDeck.jsx";
import PlayerCard from "../PlayerCard/PlayerCard.jsx";
import SetDeck from "../SetDeck/SetDeck.jsx";
import EventDeck from "../EventDeck/SetDeck/EventDeck.jsx";
import { useState, useEffect } from "react";

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
  turnData,
  myPlayerId,
  onCardClick,
  setCards,
  onPlayerSelect,
  selectedPlayer,
  selectionMode,
}) {
  const playerCount = turnData.players_amount;
  const positions = PLAYER_POSITIONS[playerCount] || PLAYER_POSITIONS[2];

  const isRegpileAvailable =
    turnData.turn_owner_id === myPlayerId && playerData.playerCards.length < 6;
  const availableToPlay = turnData.turn_owner_id === myPlayerId;
  const currentTurnState = turnData?.turn_state || "None".toLowerCase();
  const [playedSets, setPlayedSets] = useState([]);
  const [isSetReady, setIsSetReady] = useState(false);
  const [currentSetCards, setCurrentSetCards] = useState([]);

  const handleSetStateChange = (isPlayable, cards) => {
    setIsSetReady(isPlayable);
    setCurrentSetCards(cards);
  };

  const handlePlaySetClick = () => {
    if (setCards) {
      setCards(myPlayerId, turnData.gameId, currentSetCards);
    }
    setPlayedSets([...playedSets, { cards: [...currentSetCards] }]); // ELIMINAR: luego de conexion con websocket
    setCurrentSetCards([]); // ELIMINAR: luego de conexion con websocket
  };

  return (
    <div
      className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover p-2"
      style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}
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
            selectionMode={selectionMode}
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
              selectionMode={selectionMode}
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
                    turnData?.turn_owner_id === myPlayerId &&
                    playerData?.playerCards?.length < 6
                  }
                  onCardClick={onCardClick}
                />
              </div>

              <div className="flex justify-center items-end gap-2 mb-10">
                <EventDeck />
              </div>

              {/* Grupo derecho: mazo de descarte */}
              <div className="flex justify-center items-center gap-2">
                <DiscardDeck
                  discardpile={turnData?.discardpile}
                  turnData={turnData}
                  myPlayerId={myPlayerId}
                />
              </div>
            </div>

            <div className="flex h-full w-full flex-wrap">
              {/* <SetDeck setPlayed={turnData.players.player.playerSet || []} /> //CONEXION CON WEBSOCKET */}
              <SetDeck setPlayed={playedSets} />{" "}
              {/* ELIMINAR: cuando se conecte con websokcet eliminar esat linea y la  */}
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
            />
          ))}
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
                            selectionMode={selectionMode}
                        />
                    ))}
                </div>
            </div>

      {/* Bloque inferior - Jugador actual y mano */}
      <div className="flex items-end justify-between px-6 ">
        <PlayerCard
          player={playerData}
          turnData={turnData}
          myPlayerId={myPlayerId}
                    onPlayerSelect={onPlayerSelect}
                    selectedPlayer={selectedPlayer}
                    selectionMode={selectionMode}
        />
        <div
          className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 ${
            playerCount < 6 ? "z-20" : ""
          }`}
        >
          <HandCard
            playerCards={playerData?.playerCards || []}
            availableToPlay={availableToPlay}
            turnState={currentTurnState}
            onSetStateChange={handleSetStateChange}
          />

          <div>
            <p
              className={
                turnData.turn_owner_id === myPlayerId
                  ? "text-white text-center"
                  : "invisible"
              }
            >
              Arrastrá una carta al mazo de descarte para descartarla.
            </p>
          </div>
        </div>
        <div className=" flex justify-rigth mr-12 mb-6">
          {isSetReady && availableToPlay && (
            <button
              onClick={handlePlaySetClick}
              className="bg-red-700/80 hover:bg-red-700/50 text-white font-semibold py-1 px-6 rounded-xl shadow-lg text-base transition duration-150"
            >
              BAJAR SET DE{" "}
              {currentSetCards[0]?.card_name === "Harley Quin Wildcard"
                ? currentSetCards[1]?.card_name.toUpperCase()
                : currentSetCards[0]?.card_name.toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
