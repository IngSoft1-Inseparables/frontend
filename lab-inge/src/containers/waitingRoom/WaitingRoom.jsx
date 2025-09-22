import background from "/src/assets/waiting_room_bg.png"

function App() {

    return (
        <div class="min-h-screen bg-gray-800 w-full bg-cover bg-center flex flex-col relative" style={{ backgroundImage: `url(${background})` }}>
            <div class="absolute inset-0 bg-black/40 z-0"></div>
            <div class="flex justify-around items-center mt-[10vh] relative z-10">
                <h1 class="font-bold text-white text-5xl ">El juego comenzará pronto</h1>
                <div class="flex items-center justify-center w-50 h-50 rounded-full bg-[#c07c35]/84 text-white text-5xl font-bold">2/6</div>
            </div>
            <div class="flex justify-end gap-8 p-10 mt-auto relative z-10">
                <button type="button" name="Abandonar Partida" class="w-64 text-2xl p-5 bg-gradient-to-r from-[#CA8747]/70 to-[#A56A30]/70 text-white rounded-2xl font-bold hover:from-[#CA8747] hover:to-[#A56A30] transition">Abandonar<br/>Partida</button>
                <button type="button" name="Iniciar Partida" class="w-64 text-2xl p-5 bg-gradient-to-r from-[#CA8747]/70 to-[#A56A30]/70 text-white rounded-2xl font-bold hover:from-[#CA8747] hover:to-[#A56A30] transition">Iniciar<br/>Partida</button>
            </div>

        </div>
    )
}

export default App;
