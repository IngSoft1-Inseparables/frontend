import { render, screen } from '@testing-library/react'
import RegularDeck from './RegularDeck.jsx'
import '@testing-library/jest-dom'
import { expect, test } from 'vitest'

test('render del mazo regular', () => {
  render(<RegularDeck />)

  const imgs = screen.getAllByRole('img')
  expect(imgs.length).toBeGreaterThan(0) // el mazo no está vacío
})

test('la primera carta del mazo regular es Murder Escapes', () => {
  render(<RegularDeck />)

  const imgs = screen.getAllByRole('img')
  const firstCard = imgs[0] // index === 0 -> la de abajo de todo
  expect(firstCard).toHaveAttribute('src', '/cards/02-murder_escapes.png')
  expect(firstCard).toHaveAttribute('alt', 'MurderEscapes')
})

test('todas las demás cartas tienen el reverso', () => {
  render(<RegularDeck />)

  const imgs = screen.getAllByRole('img')
  const rest = imgs.slice(1) // todas menos la primera
  rest.forEach(img => {
    expect(img).toHaveAttribute('src', '/cards/01-card_back.png')
  })
})
