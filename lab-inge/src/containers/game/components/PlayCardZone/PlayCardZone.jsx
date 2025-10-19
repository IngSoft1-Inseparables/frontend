import { useDroppable, useDndContext } from '@dnd-kit/core'

export default function PlayCardZone({ actionCard, turnData, myPlayerId, playerData }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'play-card-zone',
  });

  const { active } = useDndContext();

  const isMyTurn = turnData && turnData.turn_owner_id === myPlayerId;

  const draggingCardId = active?.data?.current?.cardId;
  const draggingCard = playerData?.playerCards?.find(
    (card) => card.card_id === draggingCardId
  );

  const isEventCard = draggingCard?.type === "Event";
  const shouldShowDropStyle = isMyTurn && isOver && isEventCard && turnData.turn_state === "None";

  if (!actionCard) {
    return (
      <div ref={setNodeRef} className="relative w-24 h-36">
        <div className={`w-full h-full rounded flex items-center justify-center bg-red-500/20 ${shouldShowDropStyle ? "border border-2 border-dashed border-[#facc15] scale-105 transition-all" : "border-2 border-dashed border-white/40 transition-all"}`}>
          <img
            src="public/icons/event-icon.png"
            className='rem-0.8 opacity-95 transition-all'
            alt="Card Zone"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      </div>
    );
  }

  return (
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
  );
}


