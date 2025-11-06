import { useState, useEffect } from "react";
import { createHttpService } from "../../../../services/HTTPService";
import FaceCard from "../FaceCard/FaceCard";

export default function TradeDialog({
  open,
  gameId,
  myPlayerId,
  opponentId,
  onConfirm,
  onClose,
}) {
  const http = createHttpService();
  const [opponentCards, setOpponentCards] = useState([]);
  const [myCards, setMyCards] = useState([]);
  const [selectedOpponentCard, setSelectedOpponentCard] = useState(null);
  const [selectedMyCard, setSelectedMyCard] = useState(null);

  useEffect(() => {
    if (!open || !opponentId) return;

    const fetchData = async () => {
      try {
        const opp = await http.getOpponentHand(gameId, myPlayerId, opponentId);
        const mine = await http.getPrivatePlayerData(gameId, myPlayerId);
        setOpponentCards(opp.cards || []);
        setMyCards(mine.playerCards || []);
      } catch (err) {
        console.error("Error al cargar cartas para Card Trade:", err);
      }
    };
    fetchData();
  }, [open, opponentId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-orange-950/90 p-6 rounded-2xl shadow-2xl max-w-4xl w-full border border-orange-800">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Intercambio de cartas
        </h2>

        <p className="text-white text-center mb-2">Cartas del oponente:</p>
        <div className="flex justify-center gap-3 flex-wrap mb-6">
          {opponentCards.map((c) => (
            <FaceCard
              key={c.card_id}
              cardId={c.card_id}
              imageBackName={c.image_back_name.replace(".png", "")}
              showBack={true}
              isSelected={selectedOpponentCard?.card_id === c.card_id}
              onSelect={() => setSelectedOpponentCard(c)}
              isStatic={true}
            />
          ))}
        </div>

        <p className="text-white text-center mb-2">Tus cartas:</p>
        <div className="flex justify-center gap-3 flex-wrap mb-6">
          {myCards.map((c) => (
            <FaceCard
              key={c.card_id}
              cardId={c.card_id}
              imageName={c.image_name.replace(".png", "")}
              isSelected={selectedMyCard?.card_id === c.card_id}
              onSelect={() => setSelectedMyCard(c)}
              isStatic={false}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            disabled={!selectedOpponentCard || !selectedMyCard}
            onClick={() => onConfirm(selectedOpponentCard, selectedMyCard)}
            className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg"
          >
            Confirmar intercambio
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
