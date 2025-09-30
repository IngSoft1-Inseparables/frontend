import { useState, useEffect } from "react";
import background from "../../assets/background.png";
import JoinGameDialog from "../../components/JoinGameDialog/JoinGameDialog";
import { createHttpService } from "../../services/HTTPService";

function GameList() {
  const [open, setOpen] = useState(false);

  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [httpService] = useState(() => createHttpService());

  /*es un httpService simulado */
  // const httpService = {
  //   getGames: async () => {
  //     // Simulamos tiempo de respuesta
  //     await new Promise((res) => setTimeout(res, 500));

  //     // Retornamos datos falsos
  //     return [
  //       {
  //         id: 1,
  //         game_name: "Aventura",
  //         players_amount: 2,
  //         max_players: 4,
  //         min_players: 2,
  //         avatar: "avatar/avatar1.png",
  //         creator_name: "Micaela",
  //       },
  //       {
  //         id: 2,
  //         game_name: "Estrategia",
  //         players_amount: 4,
  //         max_players: 6,
  //         min_players: 3,
  //         avatar: "avatar/avatar2.png",
  //         creator_name: "Norma",
  //       },
  //     ];
  //   },
  // };

  const [loading, setLoading] = useState(false);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const data = await httpService.getGames(); 
      // La respuesta viene como {games: [...]} así que extraemos el array
      setGames(data.games || []);
    } catch (error) {
      console.error("Error al levantar las partidas:", error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

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
        <div className="flex justify-center mb-4">
          <button
            onClick={fetchGames}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#CA8747] to-[#A56A30] text-white font-semibold hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></span>
                Actualizando...
              </>
            ) : (
              "Actualizar partidas"
            )}
          </button>
        </div>

        {loading ? (
          <p className="text-white font-semibold text-xl text-center">
            Cargando partidas...
          </p>
        ) : games.length === 0 ? (
          <p className="text-white font-semibold text-xl text-center">
            No hay partidas disponibles
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  setSelectedGameId(game.id); 
                  setOpen(true); 
                }}
                className="
                bg-[#7a6655]/70 
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
                  {/* <img
                    src={`${game.avatar}`}
                    alt={`Avatar de ${game.creator_name}`}
                    className="w-16 h-16 rounded-full object-cover mt-2"
                  /> */}
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
        />
      )}
    </div>
  );
}

export default GameList;
