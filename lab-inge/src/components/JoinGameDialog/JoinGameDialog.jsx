import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createHttpService } from '../../services/HTTPService.js'

import './JoinGameDialog.css'

const AVATARS = [
  { id: 1, src: '/1.png', alt: 'Avatar 1' },
  { id: 2, src: '/2.png', alt: 'Avatar 2' },
  { id: 3, src: '/3.png', alt: 'Avatar 3' },
  { id: 4, src: '/4.png', alt: 'Avatar 4' },
  { id: 5, src: '/5.png', alt: 'Avatar 5' },
  { id: 6, src: '/6.png', alt: 'Avatar 6' },
]

export default function JoinGameDialog({ onClose, partidaId }) {
  const [form, setForm] = useState({ nombreUsuario: '', fechaNacimiento: '', idAvatar: null })
  const [avatarError, setAvatarError] = useState(false)
  const avatarsRef = useRef(null)
  const navigate = useNavigate()

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const selectAvatar = (id) => {
    setAvatarError(false)
    setForm((f) => ({ ...f, idAvatar: f.idAvatar === id ? null : id }))
  }

  const today = (() => {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  })()

  const minDate = (() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 115)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  })()

  const maxDate = (() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 18)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  })()



  const isFormValid =
    form.nombreUsuario.trim() !== '' &&
    form.fechaNacimiento !== '' &&
    form.fechaNacimiento <= today &&
    form.idAvatar !== null

    const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid) {
      setAvatarError(!form.idAvatar)
      return
    }

    const payload = {
      partidaId,
      nombre_usuario: form.nombreUsuario,
      fecha_nacimiento: form.fechaNacimiento,
      idAvatar: form.idAvatar,
    }

    try {
      const httpService = createHttpService()
      const data = await httpService.joinLobby(
        payload.partidaId,
        payload.nombre_usuario,
        payload.fecha_nacimiento
      )

      // Si llegamos aquí, la request fue exitosa (200)
      console.log('Unido exitosamente:', data)
      navigate('/waiting', {
        state: {
          gameId: data.partida_id,
          myPlayerId: data.jugador_id
        },
        replace: true,
      })

    } catch (error) {
      console.error('Error al unirse a la partida:', error)
      
      if (error.status === 400) {
        alert('La fecha de nacimiento es inválida o la partida está llena')
      } else {
        alert('Error al unirse a la partida')
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 my-form"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Unirse a una partida</h2>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1 label">
            Nombre de usuario
            <input
              name="nombreUsuario"
              value={form.nombreUsuario}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 "
              data-testid="input-username"
              required
              maxLength={35}
            />
          </label>

          <label className="grid gap-1">
            Fecha de nacimiento
            <input
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2"
              data-testid="input-fechaNacimiento"
              min={minDate}
              max={maxDate}
              required
            />
          </label>

          {/* Selección de Avatar */}
          <div className="grid gap-2">
            <div
              ref={avatarsRef}
              tabIndex={-1}
              className={`avatar-grid ${avatarError ? 'avatar-grid--error' : ''}`}
              role="radiogroup"
              aria-label="Selección de avatar"
              aria-invalid={avatarError ? 'true' : 'false'}
              data-testid="avatar-group"
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
              disabled={!isFormValid} 
              className={`my-button ${
                !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Unirse
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
