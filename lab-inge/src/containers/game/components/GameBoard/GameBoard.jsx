import HandCard from "../HandCard/HandCard.jsx";
import DiscardDeck from "../DiscardDeck/DiscardDeck.jsx";
import RegularDeck from "../RegularDeck/RegularDeck.jsx";
import PlayerCard from "../PlayerCard/PlayerCard.jsx";

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

function GameBoard({ orderedPlayers, playerData, turnData, myPlayerId }) {
    const playerCount = turnData.players_amount;
    const positions = PLAYER_POSITIONS[playerCount] || PLAYER_POSITIONS[2];

    return (
        <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover p-2"
            style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>

            {/* Bloque superior - Jugadores de arriba */}
            <div className="flex justify-evenly items-center px-4">
                {positions.top.map((index) => (
                    <PlayerCard
                        key={index}
                        player={orderedPlayers[index]}
                        turnData={turnData}
                        myPlayerId={myPlayerId}
                    />
                ))}
            </div>

            {/* Bloque central */}
            <div className="grid grid-cols-[20%_60%_20%]">
                {/* Jugador izquierdo */}
                <div className="flex items-center px-2">
                    {positions.left.map((index) => (
                        <PlayerCard
                            key={index}
                            player={orderedPlayers[index]}
                            turnData={turnData}
                            myPlayerId={myPlayerId}
                        />
                    ))}
                </div>

                {/* Mesa central - Mazos */}
                <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5">
                    <div className="h-full flex justify-evenly items-center">
                        <RegularDeck regpile={turnData?.regpile}/>
                        <DiscardDeck discardpile={turnData?.discardpile} />
                    </div>
                </div>

                {/* Jugador derecho */}
                <div className="flex items-center px-2">
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

            {/* Bloque inferior - Jugador actual y mano */}
            <div className="flex items-center px-4">
                <PlayerCard
                    player={playerData}
                    turnData={turnData}
                    myPlayerId={myPlayerId}
                />
                <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 ${playerCount < 6 ? 'z-20' : ''}`}>
                    <HandCard playerCards={playerData?.playerCards || []} />
                </div>
            </div>
        </div>
    );
}

export default GameBoard;
