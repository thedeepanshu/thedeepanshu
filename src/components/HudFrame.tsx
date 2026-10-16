import { useEffect, useRef, useState } from 'react'

import { deckById } from '@/world/decks'
import { motion, useVessel } from '@/world/store'

function formatCoordinate(value: number) {
  return (value >= 0 ? '+' : '−') + Math.abs(value).toFixed(2).padStart(6, '0')
}

/**
 * Fixed sci-fi frame around the viewport: corner brackets, a deck readout on the
 * left rail, live telemetry on the right rail and a warp banner on deck change.
 * Purely decorative, so it is hidden from assistive tech and ignores the pointer.
 */
export function HudFrame() {
  const deckId = useVessel((state) => state.deck)
  const deck = deckById(deckId)
  const coordinates = useRef<HTMLSpanElement>(null)
  const clock = useRef<HTMLSpanElement>(null)
  const [warpKey, setWarpKey] = useState(0)
  const [previousDeck, setPreviousDeck] = useState(deckId)

  // Show the warp banner on every deck change after the first.
  if (previousDeck !== deckId) {
    setPreviousDeck(deckId)
    setWarpKey((key) => key + 1)
  }

  // Telemetry is written straight to the DOM a few times a second rather than
  // through React state, so it never re-renders the tree.
  useEffect(() => {
    const update = () => {
      if (coordinates.current) {
        coordinates.current.textContent = `X ${formatCoordinate(motion.camera.x)}  Y ${formatCoordinate(motion.camera.y)}  Z ${formatCoordinate(motion.camera.z)}`
      }
      if (clock.current) {
        clock.current.textContent = new Date().toLocaleTimeString([], { hour12: false })
      }
    }
    update()
    const timer = window.setInterval(update, 120)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="hud-frame" aria-hidden="true">
      <span className="hud-corner hud-corner-tl" />
      <span className="hud-corner hud-corner-tr" />
      <span className="hud-corner hud-corner-bl" />
      <span className="hud-corner hud-corner-br" />

      <div className="hud-rail hud-rail-left">
        <i className="hud-pulse" />
        <span>Deck {deck.number}</span>
        <b>{deck.label}</b>
      </div>

      <div className="hud-rail hud-rail-right">
        <span ref={clock} />
        <span ref={coordinates} />
        <span className="hud-signal">
          SIG <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>

      {warpKey > 0 && (
        <div className="hud-warp" key={warpKey}>
          <span>Warp // engaged</span>
          <strong>
            Deck {deck.number} — {deck.label}
          </strong>
        </div>
      )}
    </div>
  )
}
