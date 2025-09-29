import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JoinGameDialog from './JoinGameDialog.jsx'
import '@testing-library/jest-dom'

import { vi } from 'vitest'


const joinLobbyMock = vi.fn()


vi.mock('../../services/HTTPService.js', () => {
  return {
    createHttpService: () => ({
      joinLobby: joinLobbyMock
    })
  }
})

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})



test('render de fomrulario con inputs correctos', async () => {
  // ARRANGE
    render(<JoinGameDialog onClose={() => {}} onSubmit={() => {}} />)
  
  // ASSERT
  expect(screen.getByRole('heading')).toHaveTextContent('Unirse a una partida')
  expect(screen.getByTestId('input-username')).toBeInTheDocument()
  expect(screen.getByTestId('input-fechaNacimiento')).toBeInTheDocument()
  expect(screen.getByTestId('avatar-group')).toBeInTheDocument()
})


test('submit con datos correctos navega al waiting', async () => {
  render(
      <JoinGameDialog onClose={() => {}} partidaId={123} />
  )
  const user = userEvent.setup()
  joinLobbyMock.mockResolvedValueOnce({ status_code: 200 }) //
  

  await user.type(screen.getByTestId('input-username'), 'Candelalu')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2002-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))
  await user.click(screen.getByRole('button', { name: 'Unirse' }))

  expect(mockNavigate).toHaveBeenCalledWith(
    '/waiting',
    expect.objectContaining({
      state: expect.objectContaining({
        gameId: 123,
        myPlayerId: 'Candelalu',
      }),
      replace: true
    })
  )
})

test('submit con fecha futura deshabilita el botón', async () => {
  // ARRANGE
  const handleSubmit = vi.fn()
  render(
      <JoinGameDialog onClose={() => {}} onSubmit={handleSubmit} />

  )
  const user = userEvent.setup()

  // ACT
  await user.type(screen.getByTestId('input-username'), 'Candelalu')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2050-02-16') // ✅ formato válido ISO
  await user.click(screen.getByLabelText('Avatar 2'))

  const submitButton = screen.getByRole('button', { name: 'Unirse' })

  // ASSERT
  expect(submitButton).toBeDisabled() // ✅ botón deshabilitado
  expect(handleSubmit).not.toHaveBeenCalled()
})


test('submit con datos correctos pero el servidor responde error muestra alert', async () => {
  // ARRANGE
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
  const errorResponse = new Error('400 badRequest')
  errorResponse.status = 400
  joinLobbyMock.mockRejectedValueOnce(errorResponse)

  render(
      <JoinGameDialog onClose={() => {}} partidaId={123} />
  )
  const user = userEvent.setup()
  
  // ACT
  await user.type(screen.getByTestId('input-username'), 'Candelalu')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2002-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))
  await user.click(screen.getByRole('button', { name: 'Unirse' }))
  
  // ASSERT
  expect(alertMock).toHaveBeenCalledWith('La fecha de nacimiento es inválida o la partida está llena')
})

test('submit cuando el backend no está disponible', async () => {
  // ARRANGE
  
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
  joinLobbyMock.mockRejectedValueOnce(new Error('Network error')) // 👈 mismo mock

  
  render(
      <JoinGameDialog onClose={() => {}} partidaId={123} />
  )
  const user = userEvent.setup()
  
  // ACT
  await user.type(screen.getByTestId('input-username'), 'Candelalu')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2002-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))
  await user.click(screen.getByRole('button', { name: 'Unirse' }))
  
  // ASSERT
  
  expect(alertMock).toHaveBeenCalledWith('Error al unirse a la partida')
})


 