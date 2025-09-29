import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHttpService} from "../../service/HTTPService.js"
import GenericButton from "../../components/GenericButton.jsx";
import CreateFormGame from "./CreateFormGame";

export default function GameModalController({isOpen, onClose}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  const [httpService] = useState(() => createHttpService());

  const handleSubmitFromChild = async (playerData, formDataGame) => {
    if (!isOpen) return null;
    try {
      const formData = {
        game_name: formDataGame.nameGame,
        min_players: parseInt(formDataGame.minPlayers),
        max_players: parseInt(formDataGame.maxPlayers),
        creator_name: playerData.name,
        birth_date: playerData.birthday,
        avatar: playerData.avatar, 
      };
      console.log("Enviando datos al backend:", formData);
      const response = await httpService.createGame(formData);
      onClose?.();

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
      {isOpen && (
        <CreateFormGame
          onSubmit={handleSubmitFromChild}
          onClose={onClose}
        />
      )}
    </div>
  );
}