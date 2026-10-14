import { useEffect, useRef, useState } from 'react'
import { playWarp, setSoundEnabled } from '../audio/soundEngine'
import { useVessel, type BootPhase } from '../world/store'
import './BootSequence.css'

const PHASE_ORDER: BootPhase[] = ['power', 'boot', 'transmission', 'choice', 'boarding', 'done']
const LAST_DOCKED_KEY = 'vessel:last-docked'

const BOOT_LINES = [
  { label: 'power bus', needsWorld: false },
  { label: 'life support', needsWorld: false },
  { label: 'navigation core', needsWorld: true },
  { label: 'star charts', needsWorld: true },
  { label: 'particle core', needsWorld: true },
  { label: 'comms array', needsWorld: false },
]

function relativeTime(ms: number) {
  const minutes = Math.round(ms / 60000)
  if (minutes < 2) return 'moments ago'
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

// Read once per page load: time-of-day greeting and when this browser last boarded.
function readVisit() {
  const now = Date.now()
  const hour = new Date(now).getHours()
  const greeting = hour < 5 ? 'Late shift' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 22 ? 'Good evening' : 'Late shift'
  let lastDocked: string | null = null
  try {
    const stored = Number(window.localStorage.getItem(LAST_DOCKED_KEY))
    if (stored > 0 && stored < now) lastDocked = relativeTime(now - stored)
  } catch {
    // Storage blocked (private mode, sandbox): fall back to the plain greeting.
  }
  return { greeting, lastDocked }
}

const visit = readVisit()

// Set before React's first paint so the header and HUD never flash in early.
document.documentElement.dataset.boot = 'active'

function recordVisit() {
  try {
    window.localStorage.setItem(LAST_DOCKED_KEY, String(Date.now()))
  } catch {
    // Not critical.
  }
}

/** Moves the boot forward only; late timers can never rewind a skipped intro. */
function advance(to: BootPhase) {
  const { bootPhase, setBootPhase } = useVessel.getState()
  if (PHASE_ORDER.indexOf(to) > PHASE_ORDER.indexOf(bootPhase)) setBootPhase(to)
}

/** Ends the welcome sequence and warps in, optionally switching sound on. */
function board(withSound: boolean) {
  const { bootPhase, reducedMotion, setSoundOn } = useVessel.getState()
  if (bootPhase === 'boarding' || bootPhase === 'done') return
  recordVisit()
  if (withSound) {
    setSoundEnabled(true)
    setSoundOn(true)
    playWarp(2.2)
  }
  advance('boarding')
  document.documentElement.dataset.boot = 'done'
  window.setTimeout(() => advance('done'), reducedMotion ? 350 : 1700)
}

const GLYPHS = '!<>-_\\/[]{}=+*^?#ABCDEF0123456789'

/** Decodes `text` from random glyphs, left to right, once `active` turns true. */
function ScrambleText({ text, active, instant }: { text: string; active: boolean; instant: boolean }) {
  const output = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = output.current
    if (!element || !active) return
    if (instant) {
      element.textContent = text
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = () => {
      const elapsed = performance.now() - start
      let done = true
      element.textContent = text
        .split('')
        .map((char, index) => {
          if (elapsed > 250 + index * 95) return char
          done = false
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        })
        .join('')
      if (!done) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text, active, instant])

  return <span ref={output} aria-hidden="true" />
}

/**
 * COLD BOOT: the welcome sequence shown on every visit. It doubles as the real
 * loader (progress waits for the 3D world to draw), then hands over to the
 * world by warping in. Skippable at any point with the button or Escape.
 */
export function BootSequence() {
  const phase = useVessel((state) => state.bootPhase)
  const worldReady = useVessel((state) => state.worldReady)
  const reducedMotion = useVessel((state) => state.reducedMotion)
  const [linesShown, setLinesShown] = useState(() => (useVessel.getState().reducedMotion ? BOOT_LINES.length : 0))
  const progressValue = useRef<HTMLSpanElement>(null)
  const progressBar = useRef<HTMLSpanElement>(null)
  const boardButton = useRef<HTMLButtonElement>(null)

  // Timeline. Progress is real: it cannot pass 86% until the world has drawn
  // (or 8s pass without WebGL, in which case the site continues without it).
  useEffect(() => {
    const timers: number[] = []
    let frame = 0

    if (useVessel.getState().reducedMotion) {
      advance('choice')
      return () => timers.forEach(window.clearTimeout)
    }

    timers.push(window.setTimeout(() => advance('boot'), 700))
    BOOT_LINES.forEach((_, index) => {
      timers.push(window.setTimeout(() => setLinesShown(index + 1), 950 + index * 270))
    })

    const start = performance.now()
    let shown = 0
    const tick = () => {
      const elapsed = performance.now() - start
      const ready = useVessel.getState().worldReady || elapsed > 8000
      const timeTarget = Math.max(0, ((elapsed - 700) / 2600) * 100)
      shown = Math.max(shown, Math.min(timeTarget, ready ? 100 : 86))
      if (progressValue.current) progressValue.current.textContent = String(Math.floor(shown)).padStart(3, '0')
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${shown / 100})`
      if (shown >= 100) {
        advance('transmission')
        timers.push(window.setTimeout(() => advance('choice'), 2700))
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      timers.forEach(window.clearTimeout)
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') board(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (phase === 'choice') boardButton.current?.focus({ preventScroll: true })
  }, [phase])

  if (phase === 'done') return null

  const transmitting = PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf('transmission')
  const greeting = visit.lastDocked ? `Welcome back, pilot. Last docked ${visit.lastDocked}.` : `${visit.greeting}, traveler.`

  return (
    <div
      className={`boot boot--${phase}${worldReady ? ' boot--world' : ''}${reducedMotion ? ' boot--calm' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the portfolio of Deepanshu Saini"
    >
      <div className="boot-crt" aria-hidden="true" />

      <div className="boot-log" aria-hidden="true">
        <p className="boot-log-title">VESSEL OS v3.0 // cold boot</p>
        {BOOT_LINES.slice(0, linesShown).map((line) => {
          const pending = line.needsWorld && !worldReady
          return (
            <p key={line.label} className="boot-log-line">
              <span>▸ {line.label}</span>
              <i />
              <b className={pending ? 'is-pending' : ''}>{pending ? 'sync' : 'ok'}</b>
            </p>
          )
        })}
      </div>

      <div className="boot-progress" aria-hidden="true">
        <span>Systems</span>
        <strong><span ref={progressValue}>000</span>%</strong>
        <span className="boot-progress-track"><span ref={progressBar} /></span>
      </div>

      <div className="boot-stage">
        <p className="boot-transmission" aria-hidden="true">
          <span className="boot-radar" />
          Incoming transmission — origin: unknown
        </p>
        <h2 className="boot-name" aria-label="Deepanshu">
          <ScrambleText text="DEEPANSHU" active={transmitting} instant={reducedMotion} />
        </h2>
        <p className="boot-role">Frontend developer <span>//</span> pilot of this vessel</p>

        <div className="boot-choice">
          <p className="boot-greeting">{greeting}</p>
          <div className="boot-actions">
            <button ref={boardButton} type="button" className="boot-board" onClick={() => board(true)}>
              Board with sound <span aria-hidden="true">↗</span>
            </button>
            <button type="button" className="boot-board boot-board-quiet" onClick={() => board(false)}>
              Board silently
            </button>
          </div>
          <p className="boot-hint">Ambient sound · headphones recommended</p>
        </div>
      </div>

      <button type="button" className="boot-skip" onClick={() => board(false)}>
        Skip intro <kbd>Esc</kbd>
      </button>
    </div>
  )
}
