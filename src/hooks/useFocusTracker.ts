import { useEffect } from 'react'

/**
 * Reports which `[data-focus-id]` element sits at (or nearest to) the reading
 * line, 42% down the viewport, as the page scrolls, so a deck's 3D set piece can follow the
 * content. `key` re-measures when the list changes (e.g. after filtering).
 */
export function useFocusTracker(onFocus: (id: string) => void, key?: unknown) {
  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const line = window.innerHeight * 0.42
      let best: string | null = null
      let bestDistance = Infinity
      document.querySelectorAll<HTMLElement>('[data-focus-id]').forEach((element) => {
        const rect = element.getBoundingClientRect()
        const distance = rect.top <= line && rect.bottom >= line ? 0 : Math.min(Math.abs(rect.top - line), Math.abs(rect.bottom - line))
        if (distance < bestDistance) {
          bestDistance = distance
          best = element.dataset.focusId ?? null
        }
      })
      if (best) onFocus(best)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [onFocus, key])
}
