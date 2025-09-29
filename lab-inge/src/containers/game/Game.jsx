import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService";

function Game() {
    const location = useLocation();

    const { gameId = 1, myplayerId = 2 } = location.state || {};

    const [turnData, setTurnData] = useState(null);
    const [orderedPlayers, setOrderedPlayers] = useState([]);
    const [httpService] = createHttpService();

    const fetchTurnData = async () => {
        try {
            const turnData = await httpService.getPublicTurnData(gameId);

            setTurnData(turnData);

            const sortedByTurn = turnData.players.sort((a, b) => a.turn - b.turn);
            const myPlayerIndex = sortedByTurn.findIndex(player => player.id === (myplayerId));

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



    const PlayerCard = ({ player }) => (
        <div className="h-full w-full flex flex-col items-center max-w-80 max-h-50 p-2">
            {/* Avatar y Nombre */}
            <div className="flex items-center h-[30%] gap-2 p-1">
                <div className="rounded-full bg-cover border border-gray-400 h-[100%] aspect-square"
                    style={{ backgroundImage: `url(public/${player.avatar})` }}></div>
                <p className="text-white text-s">{player.name}</p>
            </div>

            {/* Secretos */}
            <div className="flex justify-around items-center gap-3 h-[70%] m-3">
                <div className="aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm h-[100%]"
                    style={{ backgroundImage: "url(/src/assets/game/05-secret_front.png)" }}>
                </div>
                <div className="aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm h-[100%]"
                    style={{ backgroundImage: "url(/src/assets/game/05-secret_front.png)" }}>
                </div>
                <div className="aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm h-[100%]"
                    style={{ backgroundImage: "url(/src/assets/game/05-secret_front.png)" }}>
                </div>
            </div>
        </div>
    );

    const Players = () => {
        const playerCount = turnData.players_amount;
        switch (playerCount) {
            case 2:
                return (
                    <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover"
                        style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>
                        {/* bloque superior (players cards)*/}
                        <div className="flex justify-evenly items-center">
                            {<PlayerCard player={orderedPlayers[1]} />}
                        </div>

                        <div className="grid grid-cols-[15%_70%_15%]">
                            {/* bloque izquierdo */}
                            <div className="flex items-center">
                            </div>
                            {/* bloque central (mesa)*/}
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl"></div>
                            {/* bloque derecho */}
                            <div className="flex items-center">
                            </div>
                        </div>

                        {/* bloque inferior */}
                        <div className="flex items-center">
                            {<PlayerCard player={orderedPlayers[0]} />}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover"
                        style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>
                        {/* bloque superior (players cards)*/}
                        <div className="flex justify-evenly items-center">
                            {<PlayerCard player={orderedPlayers[1]} />}
                            {<PlayerCard player={orderedPlayers[2]} />}
                        </div>

                        <div className="grid grid-cols-[15%_70%_15%]">
                            {/* bloque izquierdo */}
                            <div className="flex items-center">
                            </div>
                            {/* bloque central (mesa)*/}
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl"></div>
                            {/* bloque derecho */}
                            <div className="flex items-center">
                            </div>
                        </div>

                        {/* bloque inferior */}
                        <div className="flex items-center">
                            {<PlayerCard player={orderedPlayers[0]} />}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover"
                        style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>
                        {/* bloque superior (players cards)*/}
                        <div className="flex justify-evenly items-center">
                            {<PlayerCard player={orderedPlayers[2]} />}
                        </div>

                        <div className="grid grid-cols-[15%_70%_15%]">
                            {/* bloque izquierdo */}
                            <div className="flex items-center">
                                {<PlayerCard player={orderedPlayers[1]} />}
                            </div>
                            {/* bloque central (mesa)*/}
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl"></div>
                            {/* bloque derecho */}
                            <div className="flex items-center">
                                {<PlayerCard player={orderedPlayers[3]} />}
                            </div>
                        </div>

                        {/* bloque inferior */}
                        <div className="flex items-center">
                            {<PlayerCard player={orderedPlayers[0]} />}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover"
                        style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>
                        {/* bloque superior (players cards)*/}
                        <div className="flex justify-evenly items-center">
                            {<PlayerCard player={orderedPlayers[2]} />}
                            {<PlayerCard player={orderedPlayers[3]} />}
                        </div>

                        <div className="grid grid-cols-[15%_70%_15%]">
                            {/* bloque izquierdo */}
                            <div className="flex items-center">
                                {<PlayerCard player={orderedPlayers[1]} />}
                            </div>
                            {/* bloque central (mesa)*/}
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl"></div>
                            {/* bloque derecho */}
                            <div className="flex items-center">
                                {<PlayerCard player={orderedPlayers[4]} />}
                            </div>
                        </div>

                        {/* bloque inferior */}
                        <div className="flex items-center">
                            {<PlayerCard player={orderedPlayers[0]} />}
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="h-screen w-screen grid grid-rows-[20%_60%_20%] bg-cover"
                        style={{ backgroundImage: "url(/src/assets/game/game_bg.png)" }}>
                        {/* bloque superior (players cards)*/}
                        <div className="flex justify-evenly items-center">
                            {<PlayerCard player={orderedPlayers[2]} />}
                            {<PlayerCard player={orderedPlayers[3]} />}
                            {<PlayerCard player={orderedPlayers[4]} />}
                        </div>

                        <div className="grid grid-cols-[15%_70%_15%]">
                            {/* bloque izquierdo */}
                            <div className="flex items-center">
                                {<PlayerCard player={orderedPlayers[1]} />}
                            </div>
                            {/* bloque central (mesa)*/}
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl"></div>
                            {/* bloque derecho */}
                            <div className="flex items-center">
                                {<PlayerCard player={orderedPlayers[5]} />}
                            </div>
                        </div>

                        {/* bloque inferior */}
                        <div className="flex items-center">
                            {<PlayerCard player={orderedPlayers[0]} />}
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