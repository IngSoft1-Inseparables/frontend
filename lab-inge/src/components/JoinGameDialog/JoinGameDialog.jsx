import { useState, useRef } from 'react'
import './JoinGameDialog.css'

const AVATARS = [
  { id: 1, src: '/1.png', alt: 'Avatar 1' },
  { id: 2, src: '/2.png', alt: 'Avatar 2' },
  { id: 3, src: '/3.png', alt: 'Avatar 3' },
  { id: 4, src: '/4.png', alt: 'Avatar 4' },
  { id: 5, src: '/5.png', alt: 'Avatar 5' },
  { id: 6, src: '/6.png', alt: 'Avatar 6' },
]

export default function JoinGameDialog({ onClose, onSubmit }) {
  const [form, setForm] = useState({ nombreUsuario: '', fechaNacimiento: '' , idAvatar: null})

  const [avatarError, setAvatarError] = useState(false)
  const avatarsRef = useRef(null)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const selectAvatar = (id) => {
    setAvatarError(false)
    setForm((f) => ({ ...f, idAvatar: f.idAvatar === id ? null : id }))
  }


  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.idAvatar) {
      setAvatarError(true)
      return
    }
    onSubmit?.(form)
  }

  const today = (() => {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
  return `${yyyy}-${mm}-${dd}`
})()

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}                     // cerrar al clickear el fondo
    
    >
      <div
        className="rounded-lg p-6 my-form"
        onClick={(e) => e.stopPropagation()} // no cerrar al click dentro
      >
        <h2 className="text-2xl font-bold mb-4">Unirse a una partida</h2>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1">
            Nombre de usuario
            <input
              name="nombreUsuario"
              value={form.nombreUsuario}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </label>

          <label className="grid gap-1">
            Fecha de nacimiento
            <input
              type="date"
              max = {today} // no permitir fechas futuras
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </label>

           {/*Seleccion de Avatar*/}
          <div className="grid gap-2">

              <div
              ref={avatarsRef}
              tabIndex={-1}
              className={`avatar-grid ${avatarError ? 'avatar-grid--error' : ''}`}
              role="radiogroup"
              aria-label="Selección de avatar"
              aria-invalid={avatarError ? 'true' : 'false'}
              >
              {AVATARS.map((a) => {
                const selected = form.idAvatar === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`avatar ${selected ? 'avatar--selected' : ''}`}
                    onClick={() => selectAvatar(a.id)}
                    role="radio"
                    aria-checked={selected}
                    aria-label={a.alt}
                    title={a.alt}
                  >
                    <img src={a.src} alt={a.alt} />
                  </button>
                )
              })}
            </div>
          </div>


          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="text-white px-4 py-2 rounded-lg my-button"
            >
              Unirse
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
