import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { deckForPath, type DeckId } from './decks'
import { useVessel } from './store'

const PAGE_TITLES: Record<DeckId, string> = {
  bridge: 'thedeepanshu | Frontend Developer',
  origin: 'Origin · thedeepanshu',
  missions: 'Missions · thedeepanshu',
  arsenal: 'Arsenal · thedeepanshu',
  journey: 'Journey · thedeepanshu',
  lab: 'Lab · thedeepanshu',
  beyond: 'Beyond · thedeepanshu',
  signal: 'Signal · thedeepanshu',
  void: 'Lost in deep space · thedeepanshu',
}

/** Keeps the world's current deck in step with the route and motion preference. */
export function DeckSync() {
  const { pathname } = useLocation()
  const setDeck = useVessel((state) => state.setDeck)
  const setReducedMotion = useVessel((state) => state.setReducedMotion)
  const tier = useVessel((state) => state.tier)

  useEffect(() => {
    const deck = deckForPath(pathname).id
    setDeck(deck)
    document.title = PAGE_TITLES[deck]
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
