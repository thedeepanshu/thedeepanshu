import { useEffect, useRef } from 'react'
import './CursorEffect.css'

const INTERACTIVE = 'a, button, [role="button"], select, summary'
const TEXT_FIELD = 'input:not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]'
const LOCK_PADDING = 7

/**
 * HUD targeting cursor. A crisp dot tracks the pointer exactly; a reticle ring
 * trails it and stretches with speed. Over anything clickable, corner brackets
 * lock onto the element. Clicks send out a pulse. Fine pointers only; hidden
 * for touch, keyboard use and reduced motion (see the CSS).
 */
export function CursorEffect() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const lock = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const body = document.body
    const pointer = { x: -100, y: -100 }
    const trail = { x: -100, y: -100 }
    const box = { x: 0, y: 0, w: 0, h: 0 }
    let target: Element | null = null
    let locked = false
    let frame = 0
    let lastTime = performance.now()

    const setTarget = (element: Element | null) => {
      const interactive = element?.closest(INTERACTIVE) ?? null
      body.classList.toggle('custom-cursor-text', Boolean(element?.closest(TEXT_FIELD)))
      if (interactive === target) return
      target = interactive
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      pointer.x = event.clientX
      pointer.y = event.clientY
      if (!body.classList.contains('custom-cursor-visible')) {
        trail.x = pointer.x
        trail.y = pointer.y
      }
      body.classList.add('has-custom-cursor', 'custom-cursor-visible')
      setTarget(event.target instanceof Element ? event.target : null)
    }

    const onOver = (event: PointerEvent) => setTarget(event.target instanceof Element ? event.target : null)

    const onLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) body.classList.remove('custom-cursor-visible')
    }

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      body.classList.add('custom-cursor-down')
      const pulse = document.createElement('span')
      pulse.className = 'cursor-pulse'
      pulse.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
      pulse.addEventListener('animationend', () => pulse.remove())
      document.body.appendChild(pulse)
    }
    const onUp = () => body.classList.remove('custom-cursor-down')

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') body.classList.remove('has-custom-cursor', 'custom-cursor-visible')
    }

    const tick = (time: number) => {
      frame = requestAnimationFrame(tick)
      // Time-based easing, so the trail feels the same at 60 Hz, 144 Hz or a dropped frame.
      const dt = Math.min(0.1, (time - lastTime) / 1000)
      lastTime = time
      const follow = 1 - Math.exp(-dt * 16)

      // Dot: exact. Ring: eased, stretched along its direction of travel.
      if (dot.current) dot.current.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`
      const dx = pointer.x - trail.x
      const dy = pointer.y - trail.y
      trail.x += dx * follow
      trail.y += dy * follow
      const speed = Math.min(Math.hypot(dx, dy) / 60, 0.45)
      const angle = Math.atan2(dy, dx)
      if (ring.current) {
        ring.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) rotate(${angle}rad) scale(${1 + speed}, ${1 - speed * 0.6})`
      }

      // Lock-on: brackets ease to the hovered element's box (re-measured every
      // frame, so it tracks scrolling and animating elements).
      let rect: DOMRect | null = null
      if (target && target.isConnected) {
        rect = target.getBoundingClientRect()
        if (rect.width > window.innerWidth * 0.7 || rect.height > window.innerHeight * 0.5 || rect.width === 0) rect = null
      }
      const nowLocked = Boolean(rect)
      if (nowLocked !== locked) {
        locked = nowLocked
        body.classList.toggle('custom-cursor-locked', locked)
        if (locked && rect) {
          // Start the brackets from the cursor so they visibly snap outward.
          box.x = pointer.x - 14
          box.y = pointer.y - 14
          box.w = 28
          box.h = 28
        }
      }
      if (rect) {
        const ease = 1 - Math.exp(-dt * 20)
        box.x += (rect.left - LOCK_PADDING - box.x) * ease
        box.y += (rect.top - LOCK_PADDING - box.y) * ease
        box.w += (rect.width + LOCK_PADDING * 2 - box.w) * ease
        box.h += (rect.height + LOCK_PADDING * 2 - box.h) * ease
        if (lock.current) {
          lock.current.style.transform = `translate3d(${box.x}px, ${box.y}px, 0)`
          lock.current.style.width = `${box.w}px`
          lock.current.style.height = `${box.h}px`
        }
      }

    }
    frame = requestAnimationFrame(tick)

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onLeave)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onLeave)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('keydown', onKey)
      body.classList.remove('has-custom-cursor', 'custom-cursor-visible', 'custom-cursor-locked', 'custom-cursor-text', 'custom-cursor-down')
    }
  }, [])

  return (
    <div className="site-cursor" aria-hidden="true">
      <div className="cursor-lock" ref={lock}>
        <i /><i /><i /><i />
      </div>
      <div className="cursor-ring" ref={ring}>
        <svg viewBox="0 0 40 40" width="40" height="40">
          <circle cx="20" cy="20" r="15" />
          <path d="M20 1v5M20 34v5M1 20h5M34 20h5" />
        </svg>
      </div>
      <div className="cursor-dot" ref={dot} />
    </div>
  )
}
