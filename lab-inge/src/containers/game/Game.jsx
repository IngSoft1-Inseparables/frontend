import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService.js";
import GameBoard from "./components/GameBoard.jsx";

function Game() {
    const navigate = useNavigate();
    const location = useLocation();
    const { gameId, myPlayerId } = location.state || {};

    const [turnData, setTurnData] = useState(null);
    const [orderedPlayers, setOrderedPlayers] = useState([]);
    const [playerData, setPlayerData] = useState(null);
    const [httpService] = useState(() => createHttpService());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!gameId || !myPlayerId) {
            console.error('Missing gameId or myPlayerId in navigation state');
            navigate('/home', { replace: true });
        }
    }, [gameId, myPlayerId, navigate]);

    const fetchGameData = async () => {
        try {
            setIsLoading(true);
            
            const fetchedTurnData = await httpService.getPublicTurnData(gameId);
            const fetchedPlayerData = await httpService.getPrivatePlayerData(gameId, myPlayerId);

            setPlayerData(fetchedPlayerData);
            setTurnData(fetchedTurnData);

            const sortedByTurn = fetchedTurnData.players.sort((a, b) => a.turn - b.turn);
            const myPlayerIndex = sortedByTurn.findIndex(player => player.id === parseInt(myPlayerId));
            
            const myPlayer = sortedByTurn[myPlayerIndex];
            const playersAfterMe = sortedByTurn.slice(myPlayerIndex + 1);
            const playersBeforeMe = sortedByTurn.slice(0, myPlayerIndex);
            
            const reorderedPlayers = [myPlayer, ...playersAfterMe, ...playersBeforeMe];
            setOrderedPlayers(reorderedPlayers);
        } catch (error) {
            console.error("Failed obtaining game data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (gameId && myPlayerId) {
            fetchGameData();
        }
    }, [gameId, myPlayerId]);

    
    if (isLoading || orderedPlayers.length === 0) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
                <p className="text-white text-xl">Cargando jugadores...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen">
            <GameBoard 
                orderedPlayers={orderedPlayers}
                playerData={playerData}
                turnData={turnData}
                myPlayerId={myPlayerId}
            />
        </div>
    );
}

export default Game;
