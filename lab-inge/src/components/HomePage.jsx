import background from "../assets/background.png";
import nameGame from "../assets/nameGame.png";
import characters from "../assets/characters.png";

function Home() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center "
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="flex  md:items-center min-h-screen w-full ">
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
        <div className="flex flex-col items-start min-h-screen w-full px-20">
          {/* Imagen del título */}
          <img
            src={nameGame}
            alt="Name Game"
            className="w-[70%] sm:w-[65%] md:w-[60%] lg:w-[55%] mt-10"
          />

          {/* Botones debajo de la imagen */}
         {/* <div className="flex w-[70%] justify-center sm:w-[65%] md:w-[60%] lg:w-[55%] mt-6 gap-8">
            <button className="bg-pink-500  text-white px-24 py-4 rounded-lg ">
              agregar boton y solo se agrego donde deberian ir ubicados
            </button>
            <button className="bg-pink-500 text-white px-24 py-4 rounded-lg ">
              agregar boton
            </button>
          </div> */}

        </div>

    
      </div>
    </div>
  );
}

export default Home;
