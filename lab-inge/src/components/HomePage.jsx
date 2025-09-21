import background from "../assets/background.png";
import nameGame from "../assets/nameGame.png";
import characters from "../assets/characters.png";

function Home() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center "
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="flex items-start md:items-center h-full ">
        <img
          src={nameGame}
          alt="Name Game"
          className="
          absolute
          top-[8%] left-[15%]
          w-[90%] sm:w-[70%] md:w-[55%] lg:w-[45%]
          max-w-[900px]
        "
        />
        <button
          className="
          absolute
          bottom-[30%] left-[25%] -translate-x-1/2
          bg-gradient-to-b from-orange-500 to-orange-600 
          text-white text-[20px] sm:text-[25px] md:text-[30px] lg:text-[35px] font-bold 
          hover:from-orange-600 hover:to-orange-700 transition-colors duration-300
           px-8 py-3
    rounded-xl shadow-lg font-serif
    w-[60%] sm:w-[50%] md:w-[40%] lg:w-[30%]
    max-w-[400px]
        "
        >
          Crear partida
        </button>

        <img
          src={characters}
          alt="characters"
          className="
          absolute
          bottom-0 right-0
          w-[70%] sm:w-[55%] md:w-[45%]
          max-w-[900px]
        "
        />

        {/* Botón */}
      </div>
    </div>
  );
}

export default Home;
