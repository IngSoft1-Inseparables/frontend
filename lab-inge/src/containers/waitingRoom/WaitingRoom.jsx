import background from "/src/assets/waitingRoom/waiting_room_bg.png"
import { useEffect, useState } from "react";
import { createWSService } from "../../services/WSService";
import { createHttpService } from "../../services/HTTPService";


function WaitingRoom({ gameId, myPlayerId }) {

    const [playersCount, setPlayersCount] = useState(1);
    const [isHost, setHostView] = useState(false);
    const [minPlayers, setMinPlayers] = useState(2);
    const [maxPlayers, setMaxPlayers] = useState(6);
    const [httpService] = useState(() => createHttpService());
    const [wsService] = useState(() => createWSService());

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const gameData = await httpService.getPartida(gameId);

                setHostView(gameData.hostId == myPlayerId);
                setMinPlayers(gameData.minPlayers);
                setMaxPlayers(gameData.maxPlayers);
                setPlayersCount(gameData.playersCount);
            } catch (error) {
                console.error("Failed obtaining game:", error);
            }
        };

        fetchGameData();

        wsService.connect();

        const handleCount = (payload) => {
            if (payload?.count != null) setPlayersCount(payload.count);
        };

        wsService.on("count", handleCount);

        return () => {
            wsService.off("count", handleCount);
            wsService.disconnect();
        };

    }, []);

    return (
        <div className="min-h-screen bg-gray-800 w-full bg-cover bg-center flex flex-col relative" style={{ backgroundImage: `url(${background})` }}>
            <div className="absolute inset-0 bg-black/40 z-0"></div>

            <div className="flex flex-col lg:flex-row lg:justify-around lg:items-center items-center gap-6 lg:gap-0 mt-8 sm:mt-12 lg:mt-[10vh] px-4 sm:px-6 lg:px-8 relative z-10">
                <h1 className="font-bold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center lg:text-left leading-tight">
                    El juego comenzará pronto
                </h1>
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 rounded-full bg-[#c07c35]/84 text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold flex-shrink-0">
                    {playersCount}/{maxPlayers}
                </div>
            </div>

            {isHost &&
                (
                    <div className="flex flex-col items-center gap-6 justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 mt-auto relative z-10">
                        {playersCount < minPlayers && (
                            <p className="text-white">
                                Se necesitan al menos {minPlayers} jugadores para iniciar la partida
                            </p>
                        )}
                        <button
                            disabled={playersCount < minPlayers}
                            type="button"
                            aria-label="Iniciar Partida"
                            name="Iniciar Partida"
                            className={
                                playersCount >= minPlayers
                                    ? "w-48 sm:w-56 md:w-64 lg:w-72 text-lg sm:text-xl md:text-2xl lg:text-2xl p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-[#CA8747]/70 to-[#A56A30]/70 text-white rounded-xl lg:rounded-2xl font-bold hover:from-[#CA8747] hover:to-[#A56A30] transition-all duration-300 transform hover:scale-105 active:scale-95"
                                    : "w-48 sm:w-56 md:w-64 lg:w-72 text-lg sm:text-xl md:text-2xl lg:text-2xl p-3 sm:p-4 lg:p-5 bg-gray-500/50 text-white rounded-xl lg:rounded-2xl font-bold"
                            }
                        >
                            Iniciar<br />Partida
                        </button>

                    </div>
                )}

        </div>
    )
}

export default WaitingRoom;
