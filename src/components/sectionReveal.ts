/**
 * Small in-page motion between the big warp moments: as a section scrolls into
 * view its kicker decodes from scrambled glyphs (with a scan line sweeping
 * under it) and its heading wipes in.
 *
 * Only elements that start below the first screen take part, so a page's
 * arrival is still the warp's job. State lives in a `data-reveal` attribute,
 * which React never sets and so never overwrites; nothing is hidden until the
 * observer has claimed it.
 */

const TARGETS = '.section-kicker, h2'
const SKIP = '.page-intro, .boot'
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#+*'
const DECODE_MS = 650

/** Scrambles each text node, then settles it left to right on the real text. */
function decode(element: Element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const nodes: { node: Text; text: string; written: string }[] = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = (node as Text).data
    if (text.trim()) nodes.push({ node: node as Text, text, written: text })
  }
  const total = nodes.reduce((sum, entry) => sum + entry.text.length, 0)
  const start = performance.now()
  let frame = 0

  const tick = (now: number) => {
    const settled = Math.floor(Math.min(1, (now - start) / DECODE_MS) * total)
    let offset = 0
    for (const entry of nodes) {
      // React replaced this text since the last frame: leave its value alone.
      if (entry.node.data !== entry.written) continue
      const fixed = Math.max(0, settled - offset)
      entry.written =
        entry.text.slice(0, fixed) +
        Array.from(entry.text.slice(fixed), (char) => (/\s|[·/.,:]/.test(char) ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join('')
      entry.node.data = entry.written
      offset += entry.text.length
    }
    if (settled < total) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(frame)
    for (const entry of nodes) if (entry.node.data === entry.written) entry.node.data = entry.text
  }
}

/** Starts watching `root`'s section headings; returns a cleanup. */
export function observeSectionReveals(root: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return () => {}

  const stops: (() => void)[] = []
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const element = entry.target as HTMLElement
        observer.unobserve(element)
        element.dataset.reveal = 'in'
        if (element.matches('.section-kicker')) stops.push(decode(element))
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  )

  const fold = window.innerHeight
  root.querySelectorAll<HTMLElement>(TARGETS).forEach((element) => {
    if (element.closest(SKIP) || element.getBoundingClientRect().top < fold) return
    element.dataset.reveal = 'pending'
    observer.observe(element)
  })

  return () => {
    observer.disconnect()
    stops.forEach((stop) => stop())
  }
}
