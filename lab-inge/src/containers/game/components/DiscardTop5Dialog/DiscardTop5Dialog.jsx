import { useEffect, useState } from "react";
import { createHttpService } from "../../../../services/HTTPService";
import FaceCard from "../FaceCard/FaceCard";

export default function DiscardTop5Dialog({ gameId, open, onClose }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const http = createHttpService();

  useEffect(() => {
    if (!open || !gameId) return;

    const fetchTop5 = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await http.getDiscardTop5(gameId);
        console.log("🟢 Respuesta del backend:", data);
        setCards(data.cards || []);
      } catch (err) {
        console.error("Error al obtener top5:", err);
        setError("No se pudieron cargar las cartas.");
      } finally {
        setLoading(false);
      }
    };

    fetchTop5();
  }, [open, gameId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-orange-950/90 p-6 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 border border-orange-800">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Primeras 5 cartas del mazo de descarte
        </h2>

        {loading && (
          <p className="text-center text-white text-lg">Cargando...</p>
        )}

        {error && (
          <p className="text-center text-red-400 font-semibold">{error}</p>
        )}

        {!loading && !error && cards.length > 0 && (
          <div className="flex justify-center flex-wrap gap-4">
            {cards.map((card) => (
            <div
                key={card.card_id}
                className="transform transition-transform hover:scale-105"
            >
                <FaceCard
                cardId={card.card_id}
                imageName={card.image_name.replace(".png", "")}
                cardName={card.card_name}
                imageBackName={card.image_back_name.replace(".png", "")}
                isStatic={true}
                />
            </div>
            ))}

          </div>
        )}

        {!loading && !error && cards.length === 0 && (
          <p className="text-center text-white text-lg">
            No hay cartas para mostrar.
          </p>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
