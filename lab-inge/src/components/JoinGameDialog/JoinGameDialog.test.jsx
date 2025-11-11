import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JoinGameDialog from './JoinGameDialog.jsx'
import '@testing-library/jest-dom'
import { vi } from 'vitest'


const joinGameMock = vi.fn()

vi.mock('../../services/HTTPService.js', () => {
  return {
    createHttpService: () => ({
      joinGame: joinGameMock,
    }),
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


beforeEach(() => {
  vi.clearAllMocks()
})




test('render de formulario con inputs correctos', async () => {
  render(<JoinGameDialog onClose={() => {}} onSubmit={() => {}} />)

  expect(screen.getByRole('heading')).toHaveTextContent('Unirse a una partida')
  expect(screen.getByTestId('input-username')).toBeInTheDocument()
  expect(screen.getByTestId('input-fechaNacimiento')).toBeInTheDocument()
  expect(screen.getByTestId('avatar-group')).toBeInTheDocument()
})

test('no permite escribir más de 35 caracteres en el Nombre de Usuario', async () => {
  render(<JoinGameDialog onClose={() => {}} onSubmit={() => {}} />)
  const user = userEvent.setup()

  const input = screen.getByTestId('input-username')
  const longText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ'
  await user.type(input, longText)

  expect(input.value.length).toBeLessThanOrEqual(35)
  expect(input.value).toBe(longText.slice(0, 35))
})

test('submit con datos correctos navega al waiting', async () => {
  render(<JoinGameDialog onClose={() => {}} partidaId={123} />)
  const user = userEvent.setup()

  joinGameMock.mockResolvedValueOnce({
    partida_id: 123,
    jugador_id: 999,
  })

  await user.type(screen.getByTestId('input-username'), 'Candelalu')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2002-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))
  await user.click(screen.getByRole('button', { name: 'Unirse' }))

  expect(mockNavigate).toHaveBeenCalledWith(
    '/waiting',
    expect.objectContaining({
      state: expect.objectContaining({
        gameId: 123,
        myPlayerId: 999,
      }),
      replace: true,
    })
  )
})

test('submit con fecha futura deshabilita el botón', async () => {
  const handleSubmit = vi.fn()
  render(<JoinGameDialog onClose={() => {}} onSubmit={handleSubmit} />)
  const user = userEvent.setup()

  await user.type(screen.getByTestId('input-username'), 'Candelalu')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2050-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))

  const submitButton = screen.getByRole('button', { name: 'Unirse' })
  expect(submitButton).toBeDisabled()
  expect(handleSubmit).not.toHaveBeenCalled()
})

test('submit con datos correctos pero el servidor responde error muestra alert', async () => {
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
  const errorResponse = new Error('400 badRequest')
  errorResponse.status = 400
  joinGameMock.mockRejectedValueOnce(errorResponse)

  render(<JoinGameDialog onClose={() => {}} partidaId={123} />)
  const user = userEvent.setup()

  await user.type(screen.getByTestId('input-username'), 'Candelalu')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2002-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))
  await user.click(screen.getByRole('button', { name: 'Unirse' }))

  expect(alertMock).toHaveBeenCalledWith(
    'La fecha de nacimiento es inválida o la partida está llena'
  )
})

test('submit cuando el backend no está disponible', async () => {
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
  joinGameMock.mockRejectedValueOnce(new Error('Network error'))

  render(<JoinGameDialog onClose={() => {}} partidaId={123} />)
  const user = userEvent.setup()

  await user.type(screen.getByTestId('input-username'), 'Candelalu')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2002-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))
  await user.click(screen.getByRole('button', { name: 'Unirse' }))

  expect(alertMock).toHaveBeenCalledWith('Error al unirse a la partida')
})

test('el input de fecha tiene min y max correspondientes a 115 y 18 años atrás', async () => {
  render(<JoinGameDialog onClose={() => {}} partidaId={1} />)

  const inputFecha = screen.getByTestId('input-fechaNacimiento')
  expect(inputFecha).toBeInTheDocument()

  const today = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const maxDate = `${today.getFullYear() - 18}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const minDate = `${today.getFullYear() - 115}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  expect(inputFecha).toHaveAttribute('max', maxDate)
  expect(inputFecha).toHaveAttribute('min', minDate)
})


test('envía el avatar correcto al backend al unirse', async () => {
  render(<JoinGameDialog onClose={() => {}} partidaId={321} />)
  const user = userEvent.setup()

  joinGameMock.mockResolvedValueOnce({
    partida_id: 321,
    jugador_id: 777,
  })

  await user.type(screen.getByTestId('input-username'), 'CandeAvatar')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2000-10-10')
  await user.click(screen.getByLabelText('Avatar 3')) 
  await user.click(screen.getByRole('button', { name: 'Unirse' }))


  expect(joinGameMock).toHaveBeenCalledTimes(1)

  const [partida_id, nombre_usuario, fecha_nacimiento, avatar] = joinGameMock.mock.calls[0]

  expect(partida_id).toBe(321)
  expect(nombre_usuario).toBe('CandeAvatar')
  expect(fecha_nacimiento).toBe('2000-10-10')
  expect(avatar).toBe('avatar/avatar3.png') 
})

test('el botón se deshabilita durante el submit (isSubmitting)', async () => {
  // Mock que simula una petición lenta
  joinGameMock.mockImplementation(() => new Promise((resolve) => {
    setTimeout(() => resolve({ partida_id: 123, jugador_id: 999 }), 20)
  }))

  render(<JoinGameDialog onClose={() => {}} partidaId={123} />)
  const user = userEvent.setup()

  await user.type(screen.getByTestId('input-username'), 'TestUser')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2002-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))

  const submitButton = screen.getByRole('button', { name: 'Unirse' })
  
  // Antes del submit, el botón debe estar habilitado
  expect(submitButton).not.toBeDisabled()
  
  // Hacer click en el botón
  await user.click(submitButton)
  
  // Durante el submit, el botón debe estar deshabilitado
  expect(submitButton).toBeDisabled()
  
  // Esperar a que termine la petición y navegue
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalled()
  })
})

test('previene doble click en el botón Unirse', async () => {
  // Mock que simula una petición lenta
  joinGameMock.mockImplementation(() => new Promise((resolve) => {
    setTimeout(() => resolve({ partida_id: 123, jugador_id: 999 }), 20)
  }))

  render(<JoinGameDialog onClose={() => {}} partidaId={123} />)
  const user = userEvent.setup()

  await user.type(screen.getByTestId('input-username'), 'TestUser')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2002-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))

  const submitButton = screen.getByRole('button', { name: 'Unirse' })
  
  // Hacer doble click rápido
  await user.click(submitButton)
  await user.click(submitButton)
  
  // Esperar a que termine la petición
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalled()
  })
  
  // La petición debe haberse llamado solo una vez
  expect(joinGameMock).toHaveBeenCalledTimes(1)
})

test('isSubmitting se resetea después de un error', async () => {
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
  
  // Mock que rechaza la petición
  joinGameMock.mockRejectedValueOnce(new Error('Network error'))

  render(<JoinGameDialog onClose={() => {}} partidaId={123} />)
  const user = userEvent.setup()

  await user.type(screen.getByTestId('input-username'), 'TestUser')
  await user.type(screen.getByTestId('input-fechaNacimiento'), '2002-02-16')
  await user.click(screen.getByLabelText('Avatar 2'))

  const submitButton = screen.getByRole('button', { name: 'Unirse' })
  
  // Hacer click en el botón
  await user.click(submitButton)
  
  // Esperar a que se procese el error y el botón se habilite nuevamente
  await waitFor(() => {
    expect(submitButton).not.toBeDisabled()
  })
  
  expect(alertMock).toHaveBeenCalledWith('Error al unirse a la partida')
})
