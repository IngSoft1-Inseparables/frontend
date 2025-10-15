const PlayerCard = ({ player, turnData, myPlayerId, onPlayerSelect, selectedPlayer, selectionMode }) => {
    if (!player || !turnData) return null;

    const handlePlayerClick = () => {
        if (onPlayerSelect) {
            onPlayerSelect(player.id);
        }
    };

    const isPlayerSelectable = selectionMode === 'select-player' && !selectedPlayer;
    const isThisPlayerSelected = selectedPlayer === player.id;
    const isOtherPlayerSelected = selectedPlayer && selectedPlayer !== player.id;

    return (
        <div
            onClick={isPlayerSelectable ? handlePlayerClick : null}
            className={`
                ${player.id === turnData.turn_owner_id ?
                    "w-72 h-48 flex flex-col items-center rounded-xl bg-orange-800/60 flex-shrink-0"
                    :
                    "w-72 h-48 flex flex-col items-center flex-shrink-0"
                }
                ${isPlayerSelectable ? 'border-2 border-gray-400/80 border-dashed cursor-pointer hover:border-solid rounded-xl hover:border-yellow-400/80 hover:scale-101 transition-all' : ''}
                ${isThisPlayerSelected ? 'border-2 border-solid rounded-xl border-yellow-400/80 scale-101' : ''}
                ${isOtherPlayerSelected ? '' : ''}
                `}>
            {/* Avatar y Nombre */}
            <div className="flex items-center justify-center h-16 w-full gap-2">
                <div className={player.id === turnData.turn_owner_id ?
                    "rounded-full bg-cover border-2 border-yellow-400 w-10 h-10 scale-110 transition-all duration-300 transform flex-shrink-0"
                    :
                    "rounded-full bg-cover border-2 border-gray-400 w-10 h-10 flex-shrink-0"}
                    style={{ backgroundImage: `url(public/${player.avatar})` }}></div>
                <p className={
                    player.id === turnData.turn_owner_id ?
                        "text-white text-sm font-bold truncate"
                        :
                        "text-white text-sm truncate"
                }>{player.name}</p>
            </div>

            {/* Secretos */}
            <div className="flex justify-around items-center flex-1 w-full">
                <div className={player.id === parseInt(myPlayerId) && !player.playerSecrets?.[0]?.revealed ?
                    "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0 opacity-30"
                    :
                    "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0"
                }
                    style={
                        player.playerSecrets?.[0]?.revealed || player.id === myPlayerId
                            ? { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[0]?.image_back_name}.png)` }
                            : { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[0]?.image_front_name}.png)` }
                    }>
                </div>
                <div className={player.id === parseInt(myPlayerId) && !player.playerSecrets?.[1]?.revealed ?
                    "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0 opacity-30"
                    :
                    "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0"
                }
                    style={
                        player.playerSecrets?.[1]?.revealed || player.id === parseInt(myPlayerId)
                            ? { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[1]?.image_back_name}.png)` }
                            : { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[1]?.image_front_name}.png)` }
                    }>
                </div>
                <div className={player.id === parseInt(myPlayerId) && !player.playerSecrets?.[2]?.revealed ?
                    "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0 opacity-30"
                    :
                    "aspect-[734/1023] bg-cover bg-center border border-gray-400 rounded-sm w-20 flex-shrink-0"
                }
                    style={
                        player.playerSecrets?.[2]?.revealed || player.id === parseInt(myPlayerId)
                            ? { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[2]?.image_back_name}.png)` }
                            : { backgroundImage: `url(/src/assets/game/secrets/${player.playerSecrets?.[2]?.image_front_name}.png)` }
                    }>
                </div>
            </div>
        </div >
    );
};

export default PlayerCard;