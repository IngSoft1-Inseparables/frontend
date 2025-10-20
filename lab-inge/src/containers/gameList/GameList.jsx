import { useState, useEffect } from "react";
import background from "../../assets/background.png";
import JoinGameDialog from "../../components/JoinGameDialog/JoinGameDialog";
import { createHttpService } from "../../services/HTTPService";
import { createWSService } from "../../services/WSService";
import { ChevronLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

function GameList() {
  const [open, setOpen] = useState(false);

  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [httpService] = useState(() => createHttpService());
  const [wsService] = useState(() => createWSService());
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const data = await httpService.getGames();
      const filtered = (data.games || []).filter((g) => !g.in_progress);
      setGames(filtered);
    } catch (error) {
      console.error("Error al levantar las partidas:", error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    console.log("🔌 Conectando WebSocket para lista de partidas...");
    wsService.connect();
    
    const handleGameList = (payload) => {
      console.log("📨 WebSocket recibió actualización de lista:", payload);
      const dataGameList =
        typeof payload === "string" ? JSON.parse(payload) : payload;
      console.log("📋 Datos parseados:", dataGameList);
      
      // Filtrar partidas que NO están en progreso (igual que en fetchGames)
      const filtered = (dataGameList.games || []).filter((g) => !g.in_progress);
      console.log("✅ Partidas filtradas (sin in_progress):", filtered);
      setGames(filtered);
    };
    
    wsService.on("game_list_update", handleGameList);
    
    // Escuchar estado de conexión para debug
    wsService.on("connection_status", (status) => {
      console.log("🔗 Estado de conexión WebSocket:", status);
    });
    
    return () => {
      console.log("🔌 Desconectando WebSocket de lista de partidas...");
      wsService.off("game_list_update", handleGameList);
      wsService.off("connection_status");
      wsService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar el componente
  const availableGames = games.filter((game) => game.available);

  const goBackHome = async () => {
    navigate("/home");
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
      onKeyDown={(e) => {
        console.log("apreta la tecla:", e.key);
        e.key === "Escape" && setOpen(false);
      }} // cerrar con Escape
    >
      <div className="p-6">
        <h2 className="flex justify-center text-xl text-white font-bold mb-4 ">
          Partidas disponibles
        </h2>

        {loading ? (
          <p className="text-white font-semibold text-xl text-center">
            Cargando partidas...
          </p>
        ) : availableGames.length === 0 ? (
          <p className="text-white font-semibold text-xl text-center">
            No hay partidas disponibles
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableGames.map((game) => (
              <div
                data-testid = "GameCard"
                key={game.id}
                onClick={() => {
                  setSelectedGameId(game.id);
                  setOpen(true);
                }}
                className="bg-[#7a6655]/70 
                            p-6 
                            rounded-lg 
                            shadow-lg 
                            text-white 
                            flex flex-col gap-4 
                            cursor-pointer 
                            hover:bg-[#7a6655]/90 
                            active:scale-95 
                            transition-all 
                            duration-150  
                          "
              >
                <div className="flex justify-between">
                  <h2 className="text-2xl font-bold">{game.game_name}</h2>
                  <div className="bg-[#303030] w-12 h-12 rounded-full flex items-center justify-center font-bold text-white">
                    {game.players_amount}/{game.max_players}
                  </div>
                </div>

                <div className="flex flex-row items-center gap-4">
                  <p className="text-white font-semibold text-xl">
                    {game.creator_name}
                  </p>
                </div>

                <p className="text-white font-medium text-lg">
                  Mínimo de jugadores: {game.min_players}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <JoinGameDialog
          onClose={() => setOpen(false)}
          partidaId={selectedGameId}
          data-testid = "joing-dialog"
        />
      )}
    </div>
  );
}

export default GameList;
