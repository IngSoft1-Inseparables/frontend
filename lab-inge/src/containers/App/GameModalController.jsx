import { useState } from "react";
import { createHttpService } from "../../service/HTTPService";
import GenericButton from "../../components/JoinGameDialog/GenericButton";
import CreateFormGame from "./CreateFormGame";

export default function GameModalController() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

  const handleSubmitFromChild = async (playerData, formDataGame) => {
    try {
      await createHttpService.creatGame(playerData, formDataGame);
      setIsFormOpen(false);
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
