import { render, screen } from '@testing-library/react'
import DiscardDeck from './DiscardDeck.jsx'
import '@testing-library/jest-dom'
import { test, expect } from 'vitest'

test('no renderiza si discardpile es null o undefined', () => {
  const { container } = render(<DiscardDeck discardpile={null} />)
  expect(container.firstChild).toBeNull()

  const { container: container2 } = render(<DiscardDeck />)
  expect(container2.firstChild).toBeNull()
})

test('renderiza el slot de descarte cuando discardpile.count es 0', () => {
  const discardpile = { count: 0 }
  render(<DiscardDeck discardpile={discardpile} />)

  // El slot tiene una imagen con alt="Zona de descarte"
  const img = screen.getByRole('img', { name: /zona de descarte/i })
  expect(img).toBeInTheDocument()
  expect(img).toHaveAttribute('src', '/icons/discard-slot.png')
})

test('renderiza hasta 5 cartas cuando hay más descartadas', () => {
  const discardpile = {
    count: 10,
    last_card_image: '07-detective_poirot.png',
    last_card_name: 'Poirot',
  }

  render(<DiscardDeck discardpile={discardpile} />)

  const imgs = screen.getAllByRole('img')
  // máximo 5 visibles
  expect(imgs.length).toBe(5)
})

test('la última carta del mazo está boca arriba', () => {
  const discardpile = {
    count: 3,
    last_card_image: '08-detective_marple.png',
    last_card_name: 'Marple',
  }

  render(<DiscardDeck discardpile={discardpile} />)

  const imgs = screen.getAllByRole('img')
  const topCard = imgs[imgs.length - 1]

  expect(topCard).toHaveAttribute('src', '/cards/08-detective_marple.png')
})

test('todas las cartas menos la última tienen el reverso', () => {
  const discardpile = {
    count: 4,
    last_card_image: '09-detective_satterthwaite.png',
    last_card_name: 'Satterthwaite',
  }

  render(<DiscardDeck discardpile={discardpile} />)

  const imgs = screen.getAllByRole('img')
  const backs = imgs.slice(0, -1)
  backs.forEach(img => {
    expect(img).toHaveAttribute('src', '/cards/01-card_back.png')
  })
})
