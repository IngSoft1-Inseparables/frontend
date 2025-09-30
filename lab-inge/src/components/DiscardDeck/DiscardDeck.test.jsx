import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiscardDeck from './DiscardDeck.jsx' 
import '@testing-library/jest-dom'

import { expect, test, vi } from 'vitest'

test('render del mazo de descarte', async () => {
  // ARRANGE
    render(<DiscardDeck onClick={() => {}} />)
  
  // ASSERT
  const imgs = screen.getAllByRole('img')


  expect(imgs.length).toBeGreaterThan(0)
})


test('el top de la pila esta visible', async () => {
  render(<DiscardDeck onClick={()=> {}}/>)

  const imgs = screen.getAllByRole('img')
  expect(imgs[imgs.length - 1]).not.toHaveAttribute('src', '/cards/01-card_back.png')

})

test('todas las cartas menos el top tienen el reverso', async () => {
    render(<DiscardDeck onClick={()=> {}}/>)

    const imgs = screen.getAllByRole('img')
    const imgs_tail = imgs.slice(0, -1)
    imgs_tail.forEach(img => {
      expect(img).toHaveAttribute('src', '/cards/01-card_back.png')
    })
})

