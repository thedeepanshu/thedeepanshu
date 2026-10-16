import './BootSequence.css'

import { useEffect, useRef, useState } from 'react'

import { playWarp } from '@/audio/soundEngine'
import { type BootPhase, preferredSoundMode, useVessel } from '@/world/store'

const PHASE_ORDER: BootPhase[] = ['power', 'boot', 'transmission', 'choice', 'boarding', 'done']
const LAST_DOCKED_KEY = 'vessel:last-docked'
/** Set once the visitor has boarded in this browser session (survives refresh). */
const SESSION_KEY = 'vessel:session'

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

type Session = { sound: boolean }

function readSession(): Session | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session>
    return { sound: parsed.sound === true }
  } catch {
    return null
  }
}

function saveSession(session: Session) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Not critical: the next refresh just plays the full intro.
  }
}

// Already boarded this session: play the short version and default to the
// sound choice made last time.
const session = readSession()
const quick = session !== null
const preferSound = session?.sound ?? true

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
  const { bootPhase, reducedMotion, setSoundMode } = useVessel.getState()
  if (bootPhase === 'boarding' || bootPhase === 'done') return
  recordVisit()
  saveSession({ sound: withSound })
  // Explicit both ways: boarding silently always leaves the engine off.
  // With sound, the visitor's last preset (ambient or minimal) comes back.
  setSoundMode(withSound ? preferredSoundMode() : 'off')
  if (withSound) playWarp(2.2)
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
 * COLD BOOT: the welcome sequence. The first visit of a session plays it in full
 * (it doubles as the real loader: progress waits for the 3D world to draw); a
 * refresh or return in the same session gets a short power-on straight to the
 * choice, with the last sound choice pre-selected. Skippable with Escape.
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

    // Returning this session: a short power-on, then straight to the choice.
    if (quick) {
      timers.push(window.setTimeout(() => advance('choice'), 500))
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
      // Skipping keeps this session's sound choice (silent on a first visit).
      if (event.key === 'Escape') board(session?.sound ?? false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (phase === 'choice') boardButton.current?.focus({ preventScroll: true })
  }, [phase])

  if (phase === 'done') return null

  const transmitting = PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf('transmission')
  const greeting = quick
    ? 'Welcome back aboard, pilot.'
    : visit.lastDocked
      ? `Welcome back, pilot. Last docked ${visit.lastDocked}.`
      : `${visit.greeting}, traveler.`

  return (
    <div
      className={`boot boot--${phase}${worldReady ? ' boot--world' : ''}${reducedMotion ? ' boot--calm' : ''}${quick ? ' boot--quick' : ''}`}
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
        <strong>
          <span ref={progressValue}>000</span>%
        </strong>
        <span className="boot-progress-track">
          <span ref={progressBar} />
        </span>
      </div>

      <div className="boot-stage">
        <p className="boot-transmission" aria-hidden="true">
          <span className="boot-radar" />
          Incoming transmission — origin: unknown
        </p>
        <h2 className="boot-name" aria-label="Deepanshu">
          <ScrambleText text="DEEPANSHU" active={transmitting} instant={reducedMotion} />
        </h2>
        <p className="boot-role">
          Frontend developer <span>//</span> pilot of this vessel
        </p>

        <div className="boot-choice">
          <p className="boot-greeting">{greeting}</p>
          <div className="boot-actions">
            {/* Fixed positions and styles: the remembered choice only gets focus
                and a small tag, so nothing moves under a visitor's mouse. */}
            <button ref={preferSound ? boardButton : undefined} type="button" className="boot-board" onClick={() => board(true)}>
              Board with sound <span aria-hidden="true">↗</span>
              {quick && preferSound && <em className="boot-last">Last</em>}
            </button>
            <button ref={preferSound ? undefined : boardButton} type="button" className="boot-board boot-board-quiet" onClick={() => board(false)}>
              Board silently
              {quick && !preferSound && <em className="boot-last">Last</em>}
            </button>
          </div>
          <p className="boot-hint">
            {quick ? `Press Enter to board ${preferSound ? 'with sound' : 'silently'} (your last choice)` : 'Ambient sound · headphones recommended'}
          </p>
        </div>
      </div>

      <button type="button" className="boot-skip" onClick={() => board(false)}>
        Skip intro <kbd>Esc</kbd>
      </button>
    </div>
  )
}
