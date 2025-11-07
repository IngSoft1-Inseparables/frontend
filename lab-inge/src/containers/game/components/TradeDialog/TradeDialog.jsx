import { useState, useEffect } from "react";
import { createHttpService } from "../../../../services/HTTPService";
import FaceCard from "../FaceCard/FaceCard";

export default function TradeDialog({
  open,
  gameId,
  myPlayerId,
  opponentId,
  turnOwnerId,
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
        const opp = await http.getOpponentHand(gameId, turnOwnerId, opponentId);
        const mine = await http.getPrivatePlayerData(gameId, myPlayerId);

        // El back devuelve IDs, así que creamos objetos visibles
        const oppCards = (opp.hand || []).map((id) => ({
          card_id: id,
          image_back_name: opp.image_back_name || "01-card_back",
        }));

        setOpponentCards(oppCards);
        setMyCards(mine.playerCards || []);
      } catch (err) {
        console.error("Error al cargar cartas para Card Trade:", err);
      }
    };

    fetchData();
  }, [open, opponentId, gameId, turnOwnerId, myPlayerId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-orange-950/90 p-6 rounded-2xl shadow-2xl max-w-4xl w-full border border-orange-800">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Intercambio de cartas
        </h2>

        {/* Cartas del oponente */}
        <p className="text-white text-center mb-2">Cartas del oponente:</p>
        <div className="flex justify-center gap-3 flex-wrap mb-6">
          {opponentCards.map((c) => (
            <FaceCard
              key={c.card_id}
              cardId={c.card_id}
              imageName={c.image_back_name.replace(".png", "")}     // ✅ agrega imagen del dorso
              imageBackName={c.image_back_name.replace(".png", "")} // ✅ mantiene dorso
              showBack={true}                                       // ✅ fuerza mostrar dorso
              isSelected={selectedOpponentCard?.card_id === c.card_id}
              onSelect={() => setSelectedOpponentCard(c)}
              isStatic={false}
            />
          ))}
        </div>

        {/* Tus cartas */}
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

        {/* Botones */}
        <div className="flex justify-center gap-4">
          <button
            disabled={!selectedOpponentCard || !selectedMyCard}
            onClick={() => onConfirm(selectedOpponentCard, selectedMyCard)}
            className={`px-6 py-2 rounded-lg text-white ${
              !selectedOpponentCard || !selectedMyCard
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            Confirmar intercambio
          </button>
        </div>
      </div>
    </div>
  );
}
