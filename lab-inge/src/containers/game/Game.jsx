import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService.js";
import GameBoard from "./components/GameBoard.jsx";
import { createWSService } from "../../services/WSService.js";

function Game() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { gameId, myPlayerId } = location.state || {};
    const [turnData, setTurnData] = useState(null);
    const [orderedPlayers, setOrderedPlayers] = useState([]);
    const [playerData, setPlayerData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [httpService] = useState(() => createHttpService());
    const [wsService] = useState(() => createWSService(gameId, myPlayerId));

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
        fetchGameData();

        wsService.connect();

        // Handlers definidos como funciones estables
        const handleGamePublicUpdate = (payload) => {
            const dataPublic =
                typeof payload === "string" ? JSON.parse(payload) : payload;
            setTurnData(dataPublic);
        };

        const handlePlayerPrivateUpdate = (payload) => {
            const dataPlayer =
                typeof payload === "string" ? JSON.parse(payload) : payload;
            setPlayerData(dataPlayer);
        };

        // Registrar listeners una sola vez
        wsService.on("game_public_update", handleGamePublicUpdate);
        wsService.on("player_private_update", handlePlayerPrivateUpdate);

        // Cleanup exacto: eliminar los mismos handlers
        return () => {
            wsService.off("game_public_update", handleGamePublicUpdate);
            wsService.off("player_private_update", handlePlayerPrivateUpdate);
            wsService.disconnect();
        };
    }, []); // solo una ejecución al montar


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
