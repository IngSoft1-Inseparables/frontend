import { useState } from 'react'
import background from '../assets/background.png'
import JoinGameDialog from '../components/JoinGameDialog/JoinGameDialog.jsx'
import { createHttpService } from '../services/HTTPService.js'
import { useNavigate } from "react-router-dom";


function GameList() {
  const [open, setOpen] = useState(false)
  /* const navigate = useNavigate(); */

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
       onKeyDown={(e) => 
        {
            console.log("apreta la tecla:", e.key);
            e.key === 'Escape' && setOpen(false)
        }
       } // cerrar con Escape
    >
      {/* botón para abrir el diálogo */}
      <button
        className="bg-pink-500 text-white px-24 py-4 rounded-lg"
        onClick={() => setOpen(true)}
      >
        Mostrar JoinGameDialog
      </button>

      {/* acá sí se RENDERIZA condicionalmente */}
      {open && (
        <JoinGameDialog
          onClose={() => setOpen(false)}
          onSubmit={(payload) => {
            console.log('Unirse:', payload)
            
            const httpService = createHttpService()
            httpService.joinLobby(payload.partidaId, payload.nombre_usuario, payload.fecha_nacimiento)
              .then((data) => {
                if (data.status_code === 200) {
                  // redirigir a lobby/waintingRoom
                  navigate('/waiting', {
                    state: {
                        gameId: payload.partidaId,
                        myPlayerId: payload.nombre_usuario
                    },
                    replace: true
                });
                }
                else if (data.status_code === 400) {
                  alert("La fecha de nacimiento es inválida o la partida está llena ")
                }
              })
              .catch((error) => {
                console.error('Error al unirse a la partida:', error)
                alert("Error al unirse a la partida")
              })
            }
          }
          />
        
      )}
    </div>
  )
}

export default GameList
