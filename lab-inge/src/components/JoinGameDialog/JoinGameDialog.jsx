import { useState } from 'react'
import './JoinGameDialog.css'

export default function JoinGameDialog({ onClose, onSubmit }) {
  const [form, setForm] = useState({ nombreUsuario: '', fechaNacimiento: '' })

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}              // cerrar al clickear el fondo
    
    >
      <div
        className="rounded-lg p-6 w-96 my-form"
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
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </label>

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
