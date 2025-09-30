import { render, screen } from '@testing-library/react'
import FaceCard from './FaceCard.jsx'
import '@testing-library/jest-dom'
import { describe, test, expect } from 'vitest'

describe('FaceCard', () => {
  test('renderiza la carta correcta según id', () => {
    render(<FaceCard cardId={1} />)

    const card = screen.getByRole('img', { name: /Poirot/i })
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('src', expect.stringContaining('detective_poirot.png'))
  })

  test('renderiza otra carta si el id cambia', () => {
    render(<FaceCard cardId={2} />)

    const card = screen.getByRole('img', { name: /Marple/i })
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('src', expect.stringContaining('detective_marple.png'))
  })

  test('no renderiza nada si el id no existe', () => {
    const { container } = render(<FaceCard cardId={999} />)
    expect(container).toBeEmptyDOMElement()
  })
})
