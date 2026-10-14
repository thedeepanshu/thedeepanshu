import { useEffect, useRef } from 'react'

export function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!pointerQuery.matches) return

    const cursor = cursorRef.current
    if (!cursor) return

    const body = document.body
    const updateCursorMode = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null
      const interactive = element?.closest('a, button, [role="button"], select, summary')
      const textField = element?.closest('input:not([type="button"]), textarea, [contenteditable="true"]')

      body.classList.toggle('custom-cursor-hover', Boolean(interactive))
      body.classList.toggle('custom-cursor-text', Boolean(textField))
    }

    const updateCursor = (event: PointerEvent) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
      body.classList.add('has-custom-cursor', 'custom-cursor-visible')
      updateCursorMode(event.target)
    }

    const updateHoverMode = (event: PointerEvent) => updateCursorMode(event.target)

    const hideForKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        body.classList.remove('has-custom-cursor', 'custom-cursor-visible')
      }
    }

    const hideWhenPointerLeaves = (event: PointerEvent) => {
      updateCursorMode(event.relatedTarget)
      if (!event.relatedTarget) {
        body.classList.remove('custom-cursor-visible')
      }
    }

    document.addEventListener('pointermove', updateCursor, { passive: true })
    document.addEventListener('pointerover', updateHoverMode)
    document.addEventListener('keydown', hideForKeyboard)
    document.addEventListener('pointerout', hideWhenPointerLeaves)

    return () => {
      document.removeEventListener('pointermove', updateCursor)
      document.removeEventListener('pointerover', updateHoverMode)
      document.removeEventListener('keydown', hideForKeyboard)
      document.removeEventListener('pointerout', hideWhenPointerLeaves)
      body.classList.remove('has-custom-cursor', 'custom-cursor-visible', 'custom-cursor-hover', 'custom-cursor-text')
    }
  }, [])

  return (
    <div className="site-cursor" ref={cursorRef} aria-hidden="true">
      <span className="site-cursor-reticle" />
      <span className="site-cursor-core" />
    </div>
  )
}