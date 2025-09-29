import { useNavigate } from "react-router-dom";

function Lobby() {
    const navigate = useNavigate();

    const handleJoinGame = async () => {
        navigate('/waiting', {
            state: {
                gameId: 1,
                myPlayerId: 2
            },
            replace: true
        });

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