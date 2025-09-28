import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHttpService } from "../../service/HTTPService";
import GenericButton from "../../components/JoinGameDialog/GenericButton";
import CreateFormGame from "./CreateFormGame";

export default function GameModalController() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);
  const navigate = useNavigate();
  const [httpService] = useState(() => createHttpService());

  const handleSubmitFromChild = async (playerData, formDataGame) => {
    try {
      
      const response = await httpService.createGame(playerData, formDataGame);

      setIsFormOpen(false);
      const { gameId, myPlayerId } = response;

      navigate("/waiting", {
        state: {
          gameId,
          myPlayerId,
        },
        replace: true,
      });
    } catch (error) {
      console.error(error);
      alert("There was an error creating the game");
    }
  };

  return (
    <div>
      <GenericButton
        functionClick={handleOpenForm}
        className="px-8 py-4"
        nameButton="Crear partida"
      />
      {isFormOpen && (
        <CreateFormGame
          onSubmit={handleSubmitFromChild}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
