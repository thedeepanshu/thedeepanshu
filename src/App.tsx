import './App.css'
import './vessel.css'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'

import { BootSequence } from './components/BootSequence'
import { CommandPalette, PaletteToggle } from './components/CommandPalette'
import { CursorEffect } from './components/CursorEffect'
import { HudFrame } from './components/HudFrame'
import { Narrator } from './components/Narrator'
import { ScrollToTop } from './components/ScrollToTop'
import { observeSectionReveals } from './components/sectionReveal'
import { ShipConsole } from './components/ShipConsole'
import { SiteHeader } from './components/SiteHeader'
import { SoundToggle } from './components/SoundToggle'
import { VesselFooter } from './components/VesselFooter'
import { PageRoutes } from './pages/PageRoutes'
import { DeckSync } from './world/DeckSync'
import { useVessel } from './world/store'

// three.js is heavy; the page renders first and the world fades in behind it.
// The world also waits for the display font: the particle name and 3D labels are
// drawn to canvas, which would silently fall back to another font if it weren't ready.
const World = lazy(() =>
  Promise.all([import('./world/World'), document.fonts.load("700 64px 'Space Grotesk Variable'").catch(() => [])]).then(([module]) => module),
)

/**
 * Remounts the page on each route so it can arrive after the warp. While the
 * welcome sequence runs the page is held back and inert.
 */
function DeckView() {
  const location = useLocation()
  const held = useVessel((state) => state.bootPhase !== 'boarding' && state.bootPhase !== 'done')
  const view = useRef<HTMLDivElement>(null)
  const firstRoute = useRef(true)

  // After a warp, move focus to the new deck's content so keyboard and screen
  // reader users start where sighted users do (not on the link they pressed).
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false
      return
    }
    view.current?.focus({ preventScroll: true })
  }, [location.pathname])

  // Section headings further down each deck decode as they scroll into view.
  useEffect(() => (view.current ? observeSectionReveals(view.current) : undefined), [location.pathname])

  return (
    <div ref={view} id="content" tabIndex={-1} className={`deck-view${held ? ' deck-view--held' : ''}`} key={location.pathname} inert={held}>
      <PageRoutes location={location} />
      <VesselFooter />
    </div>
  )
}

/**
 * The built HTML carries a prerendered copy of the page (for crawlers that
 * don't run JavaScript) under a cover showing the welcome screen's first frame.
 * Once the app's first render has committed, drop it, before the browser
 * paints, so there's never a flash, a layout shift or two copies on screen.
 */
function RemovePrerender() {
  useLayoutEffect(() => {
    document.getElementById('prerender')?.remove()
  }, [])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <RemovePrerender />
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <DeckSync />
      <ScrollToTop />
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <HudFrame />
      <CursorEffect />
      <SiteHeader />
      <div className="hud-dock">
        <PaletteToggle />
        <SoundToggle />
      </div>
      <ShipConsole />
      <CommandPalette />
      <Narrator />
      <DeckView />
      <BootSequence />
      {/* Cookie-free page views and real-visitor Core Web Vitals (served from this domain on Vercel). */}
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  )
}

export default App
