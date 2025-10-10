import { render, screen } from '@testing-library/react'
import FaceCard from './FaceCard.jsx'
import '@testing-library/jest-dom'
import { describe, test, expect } from 'vitest'

describe('FaceCard', () => {
  test('renderiza la carta con el frente correcto', () => {
    render(<FaceCard imageName="detective_poirot" cardName="Poirot" />)

    const card = screen.getByRole('img', { name: /Poirot/i })
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('src', expect.stringContaining('detective_poirot.png'))
  })

  test('renderiza otra carta si cambian props', () => {
    render(<FaceCard imageName="detective_marple" cardName="Marple" />)

    const card = screen.getByRole('img', { name: /Marple/i })
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('src', expect.stringContaining('detective_marple.png'))
  })

  test('renderiza el dorso si showBack es true y hay imageBackName', () => {
    render(
      <FaceCard
        imageName="detective_poirot"
        cardName="Poirot"
        showBack={true}
        imageBackName="card_back"
      />
    )

    const card = screen.getByRole('img', { name: /Poirot/i })
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('src', expect.stringContaining('card_back.png'))
  })

  test('no renderiza nada si no hay imageName', () => {
    const { container } = render(<FaceCard />)
    expect(container).toBeEmptyDOMElement()
  })
})
