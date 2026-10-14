import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { deckById } from '../world/decks'
import { useVessel } from '../world/store'
import './NavLogo.css'

const NAME = 'thedeepanshu'
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>_'

/** Decodes `element` from random glyphs into `text`, left to right. */
function scramble(element: HTMLElement, text: string, duration: number) {
  const start = performance.now()
  let frame = 0
  const tick = () => {
    const progress = (performance.now() - start) / duration
    element.textContent = text
      .split('')
      .map((char, index) => (char === ' ' || progress > index / text.length ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
      .join('')
    if (progress < 1) frame = requestAnimationFrame(tick)
    else element.textContent = text
  }
  frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}

function deckReadout(deckId: Parameters<typeof deckById>[0]) {
  const deck = deckById(deckId)
  return `Deck ${deck.number} · ${deck.label}`
}

/**
 * Nav logo: a HUD emblem (the "D." mark in lock-on brackets) beside the
 * wordmark, with a live readout of the current deck. Hover locks the brackets
 * on and decodes the name; every warp spins the emblem and decodes the new deck.
 */
export function NavLogo() {
  const deck = useVessel((state) => state.deck)
  const name = useRef<HTMLSpanElement>(null)
  const readout = useRef<HTMLSpanElement>(null)
  const firstDeck = useRef(true)
  const [warpKey, setWarpKey] = useState(0)
  const [previousDeck, setPreviousDeck] = useState(deck)

  // Retrigger the emblem's warp animation on each deck change (not the first).
  if (previousDeck !== deck) {
    setPreviousDeck(deck)
    setWarpKey((key) => key + 1)
  }

  useEffect(() => {
    const element = readout.current
    if (!element) return
    const text = deckReadout(deck)
    if (firstDeck.current || useVessel.getState().reducedMotion) {
      firstDeck.current = false
      element.textContent = text
      return
    }
    return scramble(element, text, 700)
  }, [deck])

  const onEnter = () => {
    if (!name.current || useVessel.getState().reducedMotion) return
    scramble(name.current, NAME, 420)
  }

  return (
    <Link className="nav-logo" to="/" aria-label="thedeepanshu, home" onPointerEnter={onEnter} onFocus={onEnter}>
      <svg key={warpKey} className={`nav-logo-emblem${warpKey ? ' is-warping' : ''}`} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="nav-logo-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7ef4db" />
            <stop offset="1" stopColor="#a17eff" />
          </linearGradient>
        </defs>
        <g className="nav-logo-brackets">
          <path d="M9 17V9h8" />
          <path d="M47 9h8v8" />
          <path d="M55 47v8h-8" />
          <path d="M17 55H9v-8" />
        </g>
        <path className="nav-logo-d" d="M20 18h9.5a14 14 0 0 1 0 28H20Z" pathLength={100} />
        <circle className="nav-logo-dot" cx="47.5" cy="43" r="3.6" />
      </svg>
      <span className="nav-logo-text" aria-hidden="true">
        <span className="nav-logo-name"><span ref={name}>{NAME}</span><b>.</b></span>
        <span className="nav-logo-readout"><i /><span ref={readout}>{deckReadout(deck)}</span></span>
      </span>
    </Link>
  )
}
