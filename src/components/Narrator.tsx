import { useEffect, useRef, useState } from 'react'
import { missions, skills } from '../content/portfolio'
import { decks, type DeckId } from '../world/decks'
import { useVessel } from '../world/store'
import { PALETTE_SHORTCUT } from './shortcuts'
import './Narrator.css'

const DECK_LINES: Record<DeckId, string> = {
  bridge: 'Bridge online. All systems nominal.',
  origin: 'Pilot dossier loaded. Identity verified.',
  missions: `Hangar open. ${missions.length} missions on file.`,
  arsenal: `Star map aligned. ${skills.length} domains charted.`,
  journey: 'Flight path plotted. Scroll to travel the route.',
  lab: 'Reactor stable. Experiments in containment.',
  beyond: 'Observation deck. No rush here.',
  signal: 'Comms array ready. Fill in the form to charge the dish.',
  void: 'Warning: this sector is not on any chart.',
}

const CHARTED_DECKS = decks.filter((deck) => deck.id !== 'void').length
const HOLD_MS = 5200
const TYPE_MS = 22
// Phones have little room at the bottom, so the AI speaks less there.
const QUIET_QUERY = '(max-width: 640px), (hover: none) and (pointer: coarse)'

/**
 * VESSEL//AI: short, contextual lines typed into the HUD. It greets each deck,
 * marks exploration progress, offers one console hint, and confirms sends.
 * Decorative, so it's hidden from assistive tech; the pages carry the content.
 */
export function Narrator() {
  const narration = useVessel((state) => state.narration)
  const narrate = useVessel((state) => state.narrate)
  const deck = useVessel((state) => state.deck)
  const booted = useVessel((state) => state.bootPhase === 'done')
  const signalShots = useVessel((state) => state.signalShots)
  const text = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  const visited = useRef(new Set<DeckId>())
  const lastShots = useRef(signalShots)

  // Arrival lines, plus milestones for exploring the ship.
  useEffect(() => {
    if (!booted) return
    const firstVisit = deck !== 'void' && !visited.current.has(deck)
    if (deck !== 'void') visited.current.add(deck)
    // Quiet mode greets each deck once instead of on every return.
    if (!firstVisit && deck !== 'void' && window.matchMedia(QUIET_QUERY).matches) return
    const count = visited.current.size
    let line = DECK_LINES[deck]
    if (firstVisit && count === CHARTED_DECKS) line = 'Every deck explored. Nice flying, pilot.'
    else if (firstVisit && count === 4) line = `${line} ${count} of ${CHARTED_DECKS} decks explored.`
    // Let the warp settle before speaking.
    const timer = window.setTimeout(() => narrate(line), 1100)
    return () => window.clearTimeout(timer)
  }, [deck, booted, narrate])

  // One shortcut hint, once, after a little time aboard. It's a keyboard
  // feature, so touch devices (where its button is hidden) skip it.
  useEffect(() => {
    if (!booted || window.matchMedia('(hover: none) and (pointer: coarse)').matches) return
    const timer = window.setTimeout(() => narrate(`Tip: press ${PALETTE_SHORTCUT} to jump anywhere on the ship.`), 25000)
    return () => window.clearTimeout(timer)
  }, [booted, narrate])

  useEffect(() => {
    if (signalShots === lastShots.current) return
    lastShots.current = signalShots
    narrate('Transmission away. Check your email app to send it.')
  }, [signalShots, narrate])

  // Type each new line, hold it, then fade out.
  useEffect(() => {
    const element = text.current
    if (!narration || !element) return
    const reducedMotion = useVessel.getState().reducedMotion
    let index = reducedMotion ? narration.text.length : 0
    element.textContent = narration.text.slice(0, index)
    const showTimer = window.setTimeout(() => setVisible(true), 0)
    const typer = window.setInterval(() => {
      index += 1
      element.textContent = narration.text.slice(0, index)
      if (index >= narration.text.length) window.clearInterval(typer)
    }, TYPE_MS)
    const hide = window.setTimeout(() => setVisible(false), HOLD_MS + narration.text.length * TYPE_MS)
    return () => {
      window.clearTimeout(showTimer)
      window.clearInterval(typer)
      window.clearTimeout(hide)
    }
  }, [narration])

  return (
    <div className={`narrator${visible ? ' is-visible' : ''}`} aria-hidden="true">
      <span className="narrator-tag"><i />VESSEL//AI</span>
      <span className="narrator-text" ref={text} />
    </div>
  )
}
