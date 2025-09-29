import { useState } from 'react'
import background from '../assets/background.png'
import JoinGameDialog from '../components/JoinGameDialog/JoinGameDialog.jsx'

function GameList() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
       onKeyDown={(e) => 
        {
            console.log("apreta la tecla:", e.key);
            e.key === 'Escape' && setOpen(false)}} // cerrar con Escape
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
            // llamar al backend (metodo POST.... etc)
            setOpen(false)  
          }}
        />
      )}
    </div>
  )
}

export default GameList
