import background from "../../assets/background.png";
import nameGame from "../../assets/nameGame.png";
import characters from "../../assets/characters.png";
import GenericButton from "../../components/GenericButton";
import GameModalController from "../formCreateGame/GameModalController";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Home() {
  const navigate = useNavigate();
  const handleOpenGameList = async () => {
    navigate("/games");
  };
  const [open, setOpen] = useState(false);
  const handleOpenForm = () => setOpen(true);

  return (
    <div
      data-testid="Home-container"
      className="min-h-screen w-full bg-cover bg-center "
      draggable="false"
      onDragStart={(e) => e.preventDefault()}
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="flex  md:items-center min-h-screen w-full ">
        <img
          data-testid="characters-img"
          src={characters}
          alt="characters"
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
          className="
          absolute
          bottom-0 right-0
          w-[70%] sm:w-[55%] md:w-[45%]
          max-w-[800px]
        "
        />
        <div className="flex flex-col items-start min-h-screen w-full px-20">
          {/* Imagen del título */}
          <img
            data-testid="title-img"
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            src={nameGame}
            alt="Name Game"
            className="w-[70%] sm:w-[65%] md:w-[60%] lg:w-[55%] mt-10"
          />
          <div className="flex flex-col items-start mt-6 gap-8 sm:flex-row sm:gap-6">
            <div className="ml-0 sm:ml-8 md:ml-16 lg:ml-[16rem] flex flex-col sm:flex-row gap-6">
              <GenericButton
                functionClick={() => setOpen(true)}
                nameButton="Crear una partida"
                 className="
                w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 font-bold
                text-white bg-pink-500 rounded-lg
                transition-transform transform
                hover:scale-105 
                active:scale-95 
              "
              />

              <GameModalController
                isOpen={open}
                onClose={() => setOpen(false)} // <- esto cierra el modal
              />

              <GenericButton
                functionClick={handleOpenGameList}
                nameButton="Unirse a una partida"
                className="
                w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 font-bold
                text-white bg-pink-500 rounded-lg
                transition-transform transform
                hover:scale-105 
                active:scale-95 
              "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
