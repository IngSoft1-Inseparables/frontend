import { useNavigate } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService";


function Lobby() {

    const navigate = useNavigate();
    const httpService = createHttpService();

    const handleJoinGame = async () => {

        const data = {
            "partida_id": 1,
            "nombre_usuario": "Juan Perez",
            "fecha_nacimiento": "2000-05-14"
        }

        try{
            await httpService.joinGame(data);

            navigate('/waiting', {
                state: {
                    gameId: 1,
                    myPlayerId: 4
                },
                replace: true
            });
            
        }catch (error){
            console.error(error);
        }


        // Si no especifico gameId y playerId WaitingRoom lo toma como mal y redirige al lobby
        // navigate('/waiting');
    };

    return (
        <div>
            <button onClick={handleJoinGame}>Unirse!</button>
        </div>
    )
}

export default Lobby;