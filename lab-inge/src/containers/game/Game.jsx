import background from "/src/assets/game/game_bg.png"

function Game() {
    // Player Card
    const PlayerCard = ({ playerName }) => (
        <div className="rounded-lg bg-neutral-900/80 p-3 shadow-xl backdrop-blur-sm border border-gray-600/50 w-[12vw] h-[15vh] min-w-[140px] min-h-[100px] max-w-[200px] max-h-[150px] flex items-center">
            <div className="w-full h-[85%] flex flex-col justify-between">
                {/* nombre y avatar */}
                <div className="flex items-center justify-evenly h-[10%]">
                    <div className="flex justify-center">
                        <div className="bg-red-500 border border-gray-400 rounded-full shadow-md w-[2vw] h-[2vw] min-w-[20px] min-h-[20px] max-w-[35px] max-h-[35px] flex-shrink-0" />
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-white font-bold text-[1vw] min-text-[8px] max-text-[14px] truncate px-1">{playerName}</p>
                    </div>
                </div>

                {/* 3 secretos */}
                <div className="flex justify-center gap-[0.3vw] h-[90%] items-center">
                    <div
                        className="w-[1.5vw] h-[3vh] min-w-[18px] min-h-[24px] max-w-[25px] max-h-[35px] border border-gray-400 rounded-sm shadow-md bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: "url(/src/assets/game/05-secret_front.png)" }}
                    />
                    <div
                        className="w-[1.5vw] h-[3vh] min-w-[18px] min-h-[24px] max-w-[25px] max-h-[35px] border border-gray-400 rounded-sm shadow-md bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: "url(/src/assets/game/05-secret_front.png)" }}
                    />
                    <div
                        className="w-[1.5vw] h-[3vh] min-w-[18px] min-h-[24px] max-w-[25px] max-h-[35px] border border-gray-400 rounded-sm shadow-md bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: "url(/src/assets/game/05-secret_front.png)" }}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(${background})` }}>

            {/* Player Card Superior */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                <PlayerCard playerName="Jugador1" />
            </div>

            {/* Player Cards Izquierda */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 space-y-[10vh] z-10">
                <PlayerCard playerName="Jugador2" />
                <PlayerCard playerName="Jugador3" />
            </div>

            {/* Player Cards Derecha */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 space-y-[10vh] z-10">
                <PlayerCard playerName="Jugador4" />
                <PlayerCard playerName="Jugador5" />
            </div>

            {/* Player Card Inferior */}
            <div className="absolute bottom-2 left-1/5 transform -translate-x-1/2 z-10">
                <PlayerCard playerName="Jugador6" />
            </div>

            {/* Cuadro Central */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[75vw] h-[75vh] bg-orange-950/90 border-4 border-amber-950 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center">
                </div>
            </div>

        </div>
    )
}

export default Game;