import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHttpService} from "../../services/HTTPService.js"
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
      
      const gameId = response.id;
      const myPlayerId = response.creator_id;

      onClose?.();

      setIsFormOpen(false);

      navigate("/waiting", {
        state: {
          gameId,
          myPlayerId,
        },
        replace: true,
      });
    } catch (error) {
      console.error(error);
      const attemptedName = formDataGame?.nameGame?.toString().trim() || "este nombre";
      alert(`El nombre '${attemptedName}' ya está en uso. Ingresa un nombre distinto.`);
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