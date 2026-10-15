import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { applyPageMeta } from '../content/seo'
import { deckForPath } from './decks'
import { useVessel } from './store'

/** Keeps the world's current deck in step with the route and motion preference. */
export function DeckSync() {
  const { pathname } = useLocation()
  const setDeck = useVessel((state) => state.setDeck)
  const setReducedMotion = useVessel((state) => state.setReducedMotion)
  const tier = useVessel((state) => state.tier)

  useEffect(() => {
    const deck = deckForPath(pathname).id
    setDeck(deck)
    applyPageMeta(pathname)
    // Lets CSS restyle the ship per deck (Beyond warms the lights).
    document.documentElement.dataset.deck = deck
  }, [pathname, setDeck])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [setReducedMotion])

  // Lets CSS opt into heavier effects (like frosted glass) on capable devices.
  useEffect(() => {
    document.documentElement.dataset.tier = tier
  }, [tier])

  return null
}
