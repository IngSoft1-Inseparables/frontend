import background from "/src/assets/waiting_room_bg.png"

function WaitingRoom() {

    return (
        <div className="min-h-screen bg-gray-800 w-full bg-cover bg-center flex flex-col relative" style={{ backgroundImage: `url(${background})` }}>
            <div className="absolute inset-0 bg-black/40 z-0"></div>
            
            <div className="flex flex-col lg:flex-row lg:justify-around lg:items-center items-center gap-6 lg:gap-0 mt-8 sm:mt-12 lg:mt-[10vh] px-4 sm:px-6 lg:px-8 relative z-10">
                <h1 className="font-bold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center lg:text-left leading-tight">
                    El juego comenzará pronto
                </h1>
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 rounded-full bg-[#c07c35]/84 text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold flex-shrink-0">
                    2/6
                </div>
            </div>
            
            <div className="flex justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 mt-auto relative z-10">
                <button 
                    type="button" 
                    name="Iniciar Partida" 
                    className="w-48 sm:w-56 md:w-64 lg:w-72 text-lg sm:text-xl md:text-2xl lg:text-2xl p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-[#CA8747]/70 to-[#A56A30]/70 text-white rounded-xl lg:rounded-2xl font-bold hover:from-[#CA8747] hover:to-[#A56A30] transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                    Iniciar<br/>Partida
                </button>
            </div>

        </div>
    )
}

export default WaitingRoom;
