import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegularDeck from './RegularDeck.jsx'
import '@testing-library/jest-dom'
import { expect } from 'vitest/dist/index.js'


test('render del mazo regular', async () => {
  // ARRANGE
    render(<RegularDeck onClick={() => {}} />)
  
  // ASSERT
  const imgs = screen.getAllByRole('img')


  expect(imgs.length).toBeGreaterThan(0)
})


test('primera carta de la pila es murder escapes', async () => {
  render(<RegularDeck onClick={()=> {}}/>)

  const imgs = screen.getAllByRole('img')
  expect(imgs[0]).toHaveAttribute('alt', 'MurderEscapes')

})