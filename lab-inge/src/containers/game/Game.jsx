import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService";

function Game() {
    const location = useLocation();

    const { gameId, myPlayerId } = location.state || {};

    const [turnData, setTurnData] = useState(null);
    const [orderedPlayers, setOrderedPlayers] = useState([]);
    const [httpService] = createHttpService();

    const fetchTurnData = async () => {

        try {
            const turnData = await httpService.getPublicTurnData(gameId);
            // const turnData = {
            //     "id": 1,
            //     "game_name": "Misterio en la Mansión",
            //     "min_players": 2,
            //     "max_players": 6,
            //     "players_amount": 6,
            //     "in_progress": false,
            //     "available": true,
            //     "creator_name": "Detective John",
            //     "creator_id": 101,
            //     "turn_owner_id": 6,
            //     "players": [
            //         {
            //             "id": 1,
            //             "name": "Alice",
            //             "birth_date": "1998-05-21",
            //             "avatar": "avatar/avatar1.png",
            //             "turn": 1,
            //             "game_id": 1,
            //             "hand": [
            //                 {
            //                     "card_id": 10,
            //                     "type": "personaje",
            //                     "is_discard": false,
            //                     "card_name": "Coronel Mostaza",
            //                     "image_name": "coronel_mostaza.png",
            //                     "image_back_name": "back_personaje.png",
            //                     "player_id": 1,
            //                     "game_id": 1
            //                 },
            //                 {
            //                     "card_id": 11,
            //                     "type": "arma",
            //                     "is_discard": false,
            //                     "card_name": "Candelabro",
            //                     "image_name": "candelabro.png",
            //                     "image_back_name": "back_arma.png",
            //                     "player_id": 1,
            //                     "game_id": 1
            //                 }
            //             ],
            //             "secrets": [

            //             ]
            //         },
            //         {
            //             "id": 2,
            //             "name": "Bob",
            //             "birth_date": "2000-11-02",
            //             "avatar": "avatar/avatar2.png",
            //             "turn": 2,
            //             "game_id": 1,
            //             "hand": [
            //                 {
            //                     "card_id": 12,
            //                     "type": "habitacion",
            //                     "is_discard": false,
            //                     "card_name": "Biblioteca",
            //                     "image_name": "biblioteca.png",
            //                     "image_back_name": "back_habitacion.png",
            //                     "player_id": 2,
            //                     "game_id": 1
            //                 }
            //             ]
            //         },
            //         {
            //             "id": 3,
            //             "name": "Charlie",
            //             "birth_date": "1995-03-15",
            //             "avatar": "avatar/avatar3.png",
            //             "turn": 3,
            //             "game_id": 1,
            //             "hand": []
            //         }, {
            //             "id": 4,
            //             "name": "Charlie",
            //             "birth_date": "1995-03-15",
            //             "avatar": "avatar/avatar4.png",
            //             "turn": 4,
            //             "game_id": 1,
            //             "hand": []
            //         }, {
            //             "id": 5,
            //             "name": "Charlie",
            //             "birth_date": "1995-03-15",
            //             "avatar": "avatar/avatar5.png",
            //             "turn": 5,
            //             "game_id": 1,
            //             "hand": []
            //         }, {
            //             "id": 6,
            //             "name": "Charlie",
            //             "birth_date": "1995-03-15",
            //             "avatar": "avatar/avatar6.png",
            //             "turn": 6,
            //             "game_id": 1,
            //             "hand": []
            //         }
            //     ]
            // };

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



    const PlayerCard = ({ player }) => (
        <div className={player.id === turnData.turn_owner_id ?
            "h-full w-full flex flex-col items-center max-w-80 max-h-50 p-2 rounded-xl bg-orange-950/50"
            :
            "h-full w-full flex flex-col items-center max-w-80 max-h-50 p-2"
        }>
            {/* Avatar y Nombre */}
            < div className="flex items-center h-[30%] gap-2 p-1" >
                <div className={player.id === turnData.turn_owner_id ?
                    "rounded-full bg-cover border border-yellow-400 h-[100%] aspect-square scale-125 transition-all duration-300 transform"
                    :
                    "rounded-full bg-cover border border-gray-400 h-[100%] aspect-square"}
                    style={{ backgroundImage: `url(public/${player.avatar})` }}></div>
                <p className={
                    player.id === turnData.turn_owner_id ?
                        "text-white text-s font-bold"
                        :
                        "text-white text-s"
                } > {player.name}</p>
            </div >

            {/* Secretos */}
            < div className="flex justify-around items-center gap-3 h-[70%] m-3" >
                <div className="aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm h-[100%]"
                    style={{ backgroundImage: "url(/src/assets/game/05-secret_front.png)" }}>
                </div>
                <div className="aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm h-[100%]"
                    style={{ backgroundImage: "url(/src/assets/game/05-secret_front.png)" }}>
                </div>
                <div className="aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm h-[100%]"
                    style={{ backgroundImage: "url(/src/assets/game/05-secret_front.png)" }}>
                </div>
            </div >
        </div >
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
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5"></div>
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
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5"></div>
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
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5"></div>
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
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5"></div>
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
                            <div className="bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl m-5"></div>
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