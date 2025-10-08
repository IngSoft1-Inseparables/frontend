import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService.js"
import HandCard from "../../components/HandCard/HandCard.jsx"
import DiscardDeck from "../../components/DiscardDeck/DiscardDeck.jsx"
import RegularDeck from "../../components/RegularDeck/RegularDeck.jsx"

function Game() {
    const navigate = useNavigate();
    const location = useLocation();

    const { gameId, myPlayerId } = location.state || {};

    useEffect(() => {
        if (!gameId || !myPlayerId) {
            console.error('Missing gameId or myPlayerId in navigation state');
            navigate('/games', { replace: true });
            return;
        }
    }, [gameId, myPlayerId, navigate]);

    const [turnData, setTurnData] = useState(null);
    const [orderedPlayers, setOrderedPlayers] = useState([]);
    const [playerData, setPlayerData] = useState(null);
    const [httpService] = useState(() => createHttpService());

    const fetchTurnData = async () => {

        try {
            const turnData = await httpService.getPublicTurnData(gameId);
            const playerData = await httpService.getPrivatePlayerData(gameId, myPlayerId);

            setPlayerData(playerData);
            setTurnData(turnData);

            const sortedByTurn = turnData.players.sort((a, b) => a.turn - b.turn);
            const myPlayerIndex = sortedByTurn.findIndex(player => player.id === parseInt(myPlayerId));

            const myPlayer = sortedByTurn[myPlayerIndex];
            const playersAfterMe = sortedByTurn.slice(myPlayerIndex + 1);
            const playersBeforeMe = sortedByTurn.slice(0, myPlayerIndex);

            const reorderedPlayers = [myPlayer, ...playersAfterMe, ...playersBeforeMe];
            setOrderedPlayers(reorderedPlayers);

        } catch (error) {
            console.error("Failed obtaining game data:", error);
        }
    };

    useEffect(() => {
        fetchTurnData();

    }, []);



    const PlayerCard = ({ player }) => {
        if (!player || !turnData) return null;

        return (
            <div className={player.id === turnData.turn_owner_id ?
                "w-72 h-48 flex flex-col items-center rounded-xl bg-orange-800/60 flex-shrink-0"
                :
                "w-72 h-48 flex flex-col items-center flex-shrink-0"
            }>
                {/* Avatar y Nombre */}
                <div className="flex items-center justify-center h-16 w-full gap-2">
                    <div className={player.id === turnData.turn_owner_id ?
                        "rounded-full bg-cover border-2 border-yellow-400 w-10 h-10 scale-110 transition-all duration-300 transform flex-shrink-0"
                        :
                        "rounded-full bg-cover border-2 border-gray-400 w-10 h-10 flex-shrink-0"}
                        style={{ backgroundImage: `url(public/${player.avatar})` }}></div>
                    <p className={
                        player.id === turnData.turn_owner_id ?
                            "text-white text-sm font-bold truncate"
                            :
                            "text-white text-sm truncate"
                    }>{player.name}</p>
                </div>

                {/* Secretos */}
                <div className="flex justify-around items-center flex-1 w-full">
                    <div className={player.id === parseInt(myPlayerId) && !player.playerSecrets?.[0]?.revealed ?
                        "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0 opacity-30"
                        :
                        "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0"
                    }
                        style={
                            player.playerSecrets?.[0]?.revealed || player.id === myPlayerId
                                ? { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[0]?.image_back_name}.png)` }
                                : { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[0]?.image_front_name}.png)` }
                        }>
                    </div>
                    <div className={player.id === parseInt(myPlayerId) && !player.playerSecrets?.[1]?.revealed ?
                        "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0 opacity-30"
                        :
                        "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0"
                    }
                        style={
                            player.playerSecrets?.[1]?.revealed || player.id === parseInt(myPlayerId)
                                ? { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[1]?.image_back_name}.png)` }
                                : { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[1]?.image_front_name}.png)` }
                        }>
                    </div>
                    <div className={player.id === parseInt(myPlayerId) && !player.playerSecrets?.[2]?.revealed ?
                        "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0 opacity-30"
                        :
                        "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0"
                    }
                        style={
                            player.playerSecrets?.[2]?.revealed || player.id === parseInt(myPlayerId)
                                ? { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[2]?.image_back_name}.png)` }
                                : { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[2]?.image_front_name}.png)` }
                        }>
                    </div>
                </div>
            </div >
        );
    };

    const Players = () => {
        const playerCount = turnData.players_amount;
        switch (playerCount) {
            case 2:
                return (
                    <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover p-2"
                        style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>
                        {/* bloque superior (players cards)*/}
                        <div className="flex justify-evenly items-center px-4">
                            {<PlayerCard player={orderedPlayers[1]} />}
                        </div>

                        <div className="grid grid-cols-[20%_60%_20%]">
                            {/* bloque izquierdo */}
                            <div className="flex items-center px-2">
                            </div>
                            {/* bloque central (mesa)*/}
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5">
                                <div className="h-full flex justify-evenly items-center">
                                    <RegularDeck />
                                    <DiscardDeck />
                                </div>
                            </div>
                            {/* bloque derecho */}
                            <div className="flex items-center px-2">
                            </div>
                        </div>

                        {/* bloque inferior */}
                        <div className="flex items-center px-4">
                            {<PlayerCard player={playerData} />}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                                <HandCard playerCards={playerData?.playerCards || []} />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover p-2"
                        style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>
                        {/* bloque superior (players cards)*/}
                        <div className="flex justify-evenly items-center px-4">
                            {<PlayerCard player={orderedPlayers[1]} />}
                            {<PlayerCard player={orderedPlayers[2]} />}
                        </div>

                        <div className="grid grid-cols-[20%_60%_20%]">
                            {/* bloque izquierdo */}
                            <div className="flex items-center px-2">
                            </div>
                            {/* bloque central (mesa)*/}
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5">
                                <div className="h-full flex justify-evenly items-center">
                                    <RegularDeck />
                                    <DiscardDeck />
                                </div>
                            </div>
                            {/* bloque derecho */}
                            <div className="flex items-center px-2">
                            </div>
                        </div>

                        {/* bloque inferior */}
                        <div className="flex items-center px-4">
                            {<PlayerCard player={playerData} />}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                                <HandCard playerCards={playerData?.playerCards || []} />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover p-2"
                        style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>
                        {/* bloque superior (players cards)*/}
                        <div className="flex justify-evenly items-center px-4">
                            {<PlayerCard player={orderedPlayers[2]} />}
                        </div>

                        <div className="grid grid-cols-[20%_60%_20%]">
                            {/* bloque izquierdo */}
                            <div className="flex items-center px-2">
                                {<PlayerCard player={orderedPlayers[1]} />}
                            </div>
                            {/* bloque central (mesa)*/}
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5">
                                <div className="h-full flex justify-evenly items-center">
                                    <RegularDeck />
                                    <DiscardDeck />
                                </div>
                            </div>
                            {/* bloque derecho */}
                            <div className="flex items-center px-2">
                                {<PlayerCard player={orderedPlayers[3]} />}
                            </div>
                        </div>

                        {/* bloque inferior */}
                        <div className="flex items-center px-4">
                            {<PlayerCard player={playerData} />}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                                <HandCard playerCards={playerData?.playerCards || []} />
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover p-2"
                        style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>
                        {/* bloque superior (players cards)*/}
                        <div className="flex justify-evenly items-center px-4">
                            {<PlayerCard player={orderedPlayers[2]} />}
                            {<PlayerCard player={orderedPlayers[3]} />}
                        </div>

                        <div className="grid grid-cols-[20%_60%_20%]">
                            {/* bloque izquierdo */}
                            <div className="flex items-center px-2">
                                {<PlayerCard player={orderedPlayers[1]} />}
                            </div>
                            {/* bloque central (mesa)*/}
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5">
                                <div className="h-full flex justify-evenly items-center">
                                    <RegularDeck />
                                    <DiscardDeck />
                                </div>
                            </div>
                            {/* bloque derecho */}
                            <div className="flex items-center px-2">
                                {<PlayerCard player={orderedPlayers[4]} />}
                            </div>
                        </div>

                        {/* bloque inferior */}
                        <div className="flex items-center px-4">
                            {<PlayerCard player={playerData} />}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                                <HandCard playerCards={playerData?.playerCards || []} />
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover p-2"
                        style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>
                        {/* bloque superior (players cards)*/}
                        <div className="flex justify-evenly items-center px-4">
                            {<PlayerCard player={orderedPlayers[2]} />}
                            {<PlayerCard player={orderedPlayers[3]} />}
                            {<PlayerCard player={orderedPlayers[4]} />}
                        </div>

                        <div className="grid grid-cols-[20%_60%_20%]">
                            {/* bloque izquierdo */}
                            <div className="flex items-center px-2">
                                {<PlayerCard player={orderedPlayers[1]} />}
                            </div>
                            {/* bloque central (mesa)*/}
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5">
                                <div className="h-full flex justify-evenly items-center">
                                    <RegularDeck />
                                    <DiscardDeck />
                                </div>
                            </div>
                            {/* bloque derecho */}
                            <div className="flex items-center px-2">
                                {<PlayerCard player={orderedPlayers[5]} />}
                            </div>
                        </div>

                        {/* bloque inferior */}
                        <div className="flex items-center px-4">
                            {<PlayerCard player={playerData} />}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                                <HandCard playerCards={playerData?.playerCards || []} />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-screen w-screen">
            {orderedPlayers.length > 0 ? (
                <Players />
            ) : (
                <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
                    <p className="text-white text-xl">Cargando jugadores...</p>
                </div>
            )}
        </div>
    )
}

export default Game;