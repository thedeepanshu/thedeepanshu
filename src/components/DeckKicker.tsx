import { deckById, type DeckId } from '../world/decks'

/**
 * "Deck 07 · Comms array / contact": the one numbering system. Numbers and
 * labels come from the deck list, the same source as the nav logo and HUD rail.
 */
export function DeckKicker({ deck, topic, className = 'section-kicker' }: { deck: DeckId; topic: string; className?: string }) {
  const { number, label } = deckById(deck)
  return (
    <p className={`${className} deck-kicker`}>
      <span>Deck {number}</span> · {label} <i aria-hidden="true">/</i> {topic}
    </p>
  )
}
