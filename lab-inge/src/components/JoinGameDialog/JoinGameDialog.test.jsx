import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JoinGameDialog from './JoinGameDialog.jsx'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

test('renderiza correctamente el formulario', () => {
  render(<JoinGameDialog onClose={() => {}} onSubmit={() => {}} />)

  // título
  expect(screen.getByRole('heading', { name: /unirse a una partida/i }))
    .toBeInTheDocument()

  // inputs
  expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument()

  // selección de avatar
  expect(screen.getByRole('radiogroup')).toBeInTheDocument()

  // botón submit
  expect(screen.getByRole('button', { name: /unirse/i })).toBeInTheDocument()
})

test('muestra error si se envía sin avatar seleccionado', async () => {
  const handleSubmit = vi.fn()
  const user = userEvent.setup()

  render(<JoinGameDialog onClose={() => {}} onSubmit={handleSubmit} />)

  // completar inputs
  await user.type(screen.getByLabelText(/nombre de usuario/i), 'Candela')
  await user.type(screen.getByLabelText(/fecha de nacimiento/i), '2002-02-16')

  // enviar sin elegir avatar
  await user.click(screen.getByRole('button', { name: /unirse/i }))

  // no se llama onSubmit
  expect(handleSubmit).not.toHaveBeenCalled()

  // se marca el grid con error
  expect(screen.getByRole('radiogroup')).toHaveClass('avatar-grid--error')
})

test('envía datos correctos cuando se completa el formulario', async () => {
  const handleSubmit = vi.fn()
  const user = userEvent.setup()

  render(<JoinGameDialog onClose={() => {}} onSubmit={handleSubmit} />)

  await user.type(screen.getByLabelText(/nombre de usuario/i), 'Candela')
  await user.type(screen.getByLabelText(/fecha de nacimiento/i), '2002-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))
  await user.click(screen.getByRole('button', { name: /unirse/i }))

  expect(handleSubmit).toHaveBeenCalledWith({
    nombreUsuario: 'Candela',
    fechaNacimiento: '2002-02-16',
    idAvatar: 2,
  })
})

test('botón tiene estilo de la clase .my-button', () => {
  render(<JoinGameDialog onClose={() => {}} onSubmit={() => {}} />)

  const button = screen.getByRole('button', { name: /unirse/i })
  expect(button).toHaveClass('my-button')
})
