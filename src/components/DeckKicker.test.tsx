import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DeckKicker } from './DeckKicker'

describe('DeckKicker', () => {
  it('reads "Deck NN · label / topic" from the deck list', () => {
    render(<DeckKicker deck="origin" topic="about" />)
    const kicker = screen.getByText(/Pilot dossier/)
    expect(kicker).toHaveTextContent('Deck 01 · Pilot dossier / about')
  })

  it('hides the decorative slash from assistive tech', () => {
    const { container } = render(<DeckKicker deck="signal" topic="contact" />)
    expect(container.querySelector('i')).toHaveAttribute('aria-hidden', 'true')
  })
})
