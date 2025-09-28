import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JoinGameDialog from './JoinGameDialog.jsx'
import '@testing-library/jest-dom'


test('render de fomrulario con inputs correctos', async () => {
  // ARRANGE
    render(<JoinGameDialog onClose={() => {}} onSubmit={() => {}} />)
  
  // ASSERT
  expect(screen.getByRole('heading')).toHaveTextContent('Unirse a una partida')
  expect(screen.getByTestId('input-username')).toBeInTheDocument()
  expect(screen.getByTestId('input-fechaNacimiento')).toBeInTheDocument()
  expect(screen.getByTestId('avatar-group')).toBeInTheDocument()
})


test('submit con datos correctos', async () => {
  // ARRANGE
  const handleSubmit = jest.fn()
  render(<JoinGameDialog onClose={() => {}} onSubmit={handleSubmit} />)
  const user = userEvent.setup()

    // ACT
    await user.type(screen.getByTestId('input-username'), 'Candelalu')
    await user.type(screen.getByTestId('input-fechaNacimiento'), '16/02/2002')
    await user.click(screen.getByLabelText('Avatar 2'))
    await user.click(screen.getByRole('button', {name: 'Unirse'}))
    
  // ASSERT

    expect(handleSubmit).toHaveBeenCalledWith({
        nombreUsuario: 'Candelalu',
        fechaNacimiento: '2002-02-16',
        idAvatar: 2
    })
})