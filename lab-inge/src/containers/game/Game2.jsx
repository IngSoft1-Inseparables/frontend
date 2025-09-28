import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import background from "/src/assets/game/game_bg.png"

function Game2() {

    const location = useLocation();

    const { gameId, myplayerId, playersCount } = location.state || {};

    const fetchTurnData = async () => {
        try{
            const turnData = await httpService.getTurn(gameId);
        } catch (error) {
            console.error("Failed obtaining game data:", error);
        }
    };

    useEffect(() => {
        fetchGameData();
    });

    const PlayerCardH = () => (
        <div className="h-full w-full flex flex-col items-center max-w-80 max-h-50 p-2">
            {/* Avatar y Nombre */}
            <div className="flex items-center h-[30%] gap-2 p-1">
                <div className="rounded-full bg-cover border border-gray-400 h-[100%] aspect-square"
                    style={{ backgroundImage: "url(/src/assets/game/05-secret_front.png)" }}></div>
                <p className="text-white text-s">SexMachine2000</p>
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

    return (
        <div className="h-screen w-screen grid grid-rows-[20%_60%_20%]">
            {/* bloque superior (3 players card horizontales)*/}
            <div className="bg-red-400 flex justify-evenly items-center">
                <PlayerCardH />
                <PlayerCardH />
                <PlayerCardH />
            </div>

            <div className="grid grid-cols-[15%_70%_15%]">
                {/* bloque izquierdo (1 player card vertical)*/}
                <div className="flex bg-green-400 items-center">
                    <PlayerCardH />
                </div>
                {/* bloque central (mesa)*/}
                <div className="bg-blue-400"></div>
                {/* bloque derecho (2 player card vertical)*/}
                <div className="flex bg-yellow-400 items-center">
                    <PlayerCardH />
                </div>
            </div>

            {/* bloque inferior (1 player card horizontal y mazo del jugador)*/}
            <div className="bg-purple-400">
                <PlayerCardH />
            </div>
        </div>
    )
}

export default Game2;