import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { deckForPath } from './decks'
import { useVessel } from './store'

/** Keeps the world's current deck in step with the route and motion preference. */
export function DeckSync() {
  const { pathname } = useLocation()
  const setDeck = useVessel((state) => state.setDeck)
  const setReducedMotion = useVessel((state) => state.setReducedMotion)

  useEffect(() => {
    setDeck(deckForPath(pathname).id)
  }, [pathname, setDeck])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [setReducedMotion])

  return null
}
