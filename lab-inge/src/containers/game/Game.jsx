import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createHttpService } from "../../services/HTTPService.js";
import { createWSService } from "../../services/WSService.js";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import GameBoard from "./components/GameBoard/GameBoard.jsx";

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

  const handleCardClick = async () => {
  try {
    const hand = await httpService.updateHand(
      turnData.gameId,
      turnData.turn_owner_id,
    );
    console.log("Update Hand:", hand);
  } catch (error) {
    console.error("Failed to update hand:", error);
  }
};
    const fetchGameData = async () => {
        try {
            setIsLoading(true);

            const fetchedTurnData = await httpService.getPublicTurnData(gameId);
            const fetchedPlayerData = await httpService.getPrivatePlayerData(gameId, myPlayerId);

            setPlayerData(fetchedPlayerData);
            setTurnData(fetchedTurnData);

            console.log(fetchedTurnData);
            
            console.log("Draft recibido (GET):", fetchedTurnData?.draft);
            const draft = fetchedTurnData?.draft;
            if (draft) {
            console.table([
                { num: 1, img: draft.card_1_image },
                { num: 2, img: draft.card_2_image },
                { num: 3, img: draft.card_3_image },
            ]);
            }

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
            console.log("Draft recibido:", dataPublic?.draft);
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
    }, []);



    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Handler para cuando se suelta una carta
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || myPlayerId != turnData.turn_owner_id) return;

        // Si se soltó sobre el mazo de descarte
        if (over.id === 'discard-deck') {
            const cardId = active.data.current?.cardId;
            const cardName = active.data.current?.cardName;
            const imageName = active.data.current?.imageName;

            // Guardar el estado anterior para poder hacer rollback
            const previousPlayerData = playerData;
            const previousTurnData = turnData;

            // Actualizar optimisticamente la mano del jugador
            setPlayerData(prevData => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    playerCards: prevData.playerCards.filter(card => card.card_id !== cardId)
                };
            });

            // Actualizar optimisticamente el mazo de descarte
            setTurnData(prevTurnData => {
                return {
                    ...prevTurnData,
                    discardpile: {
                        count: (prevTurnData.discardpile?.count || 0) + 1,
                        last_card_name: cardName,
                        last_card_image: imageName
                    }
                };
            });

            try {
                await httpService.discardCard(myPlayerId, cardId);
            } catch (error) {
                console.error('Error al descartar carta:', error);
                
                // Revertir los cambios optimistas en caso de error
                setPlayerData(previousPlayerData);
                setTurnData(previousTurnData);
            }
        }
    };


    if (isLoading || orderedPlayers.length === 0) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
                <p className="text-white text-xl">Cargando jugadores...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden">
             <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToWindowEdges]}
            >
            <GameBoard
                data-testid="game-board"
                orderedPlayers={orderedPlayers}
                playerData={playerData}
                turnData={turnData}
                myPlayerId={myPlayerId}
                onCardClick = {handleCardClick}
            />
            </DndContext>
        </div>
    );
}

export default Game;
