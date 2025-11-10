import { useDroppable, useDndContext } from '@dnd-kit/core'

export default function PlayCardZone({ actionCard, turnData, myPlayerId, playerData, timer }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'play-card-zone',
  });

  const { active } = useDndContext();

  const isMyTurn = turnData && turnData.turn_owner_id === myPlayerId;

  if (turnData?.instant_played) {
    actionCard = turnData.instant_played;
  } else if (!isMyTurn && turnData?.event_card_played) {
    actionCard = turnData.event_card_played;
  }

  const draggingCardId = active?.data?.current?.cardId;
  const draggingCard = playerData?.playerCards?.find(
    (card) => card.card_id === draggingCardId
  );

  console.log("Card:", draggingCard);
  const isPlayableCard = draggingCard?.type?.toLowerCase() === "event" || draggingCard?.type?.toLowerCase() === "instant";


  if (!actionCard) {
    return (
      <div className="flex flex-col items-center gap-3">
        {timer > 0 && (
          <div className="text-m text-center font-medium text-white">
            Podés jugar Not So Fast para cancelar {
              turnData.instant_played ?
                turnData.instant_played.card_name
                :
                (turnData?.event_card_played ?
                  turnData.event_card_played.card_name
                  :
                  turnData?.set_played?.set_type)
            }
          </div>
        )}
        <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <span className="text-xl font-semibold text-white">
            {timer > 0 ? timer : "-"}
          </span>
        </div>
        <div ref={setNodeRef} className="relative w-24 h-36">
          <div className={`w-full h-full rounded flex items-center justify-center bg-red-500/20 ${isMyTurn && isOver && isPlayableCard ? "border border-2 border-dashed border-[#facc15] scale-105 transition-all" : "border-2 border-dashed border-white/40 transition-all"}`}>
            <img
              src="/icons/event-icon.png"
              className='rem-0.8 opacity-95 transition-all'
              alt="Card Zone"
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {timer > 0 && (
        <div className="text-m text-center font-medium text-white">
          Podés jugar Not So Fast para cancelar {
            turnData.instant_played ?
              turnData.instant_played.card_name
              :
              (turnData?.event_card_played ?
                turnData.event_card_played.card_name
                :
                turnData.set_played.set_type)
          }
        </div>
      )}
      <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
        <span className="text-xl font-semibold text-white">
          {timer > 0 ? timer : "-"}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className="relative w-24 h-36 overflow-hidden"
        style={{
          padding: '0',
          transition: 'all 0.2s ease',
        }}>
        <img
          src={`/cards/${actionCard.image_name}.png`}
          alt={actionCard.card_name}
          className="w-full h-full "
          style={{ pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}


