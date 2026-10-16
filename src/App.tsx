import './App.css'
import './vessel.css'

import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

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
import { AboutPage, ArsenalPage, BeyondPage, HomePage, JourneyPage, LabPage, MissionsPage, NotFoundPage, SignalPage } from './pages'
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
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/arsenal" element={<ArsenalPage />} />
        <Route path="/journey" element={<JourneyPage />} />
        <Route path="/lab" element={<LabPage />} />
        <Route path="/beyond" element={<BeyondPage />} />
        <Route path="/signal" element={<SignalPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <VesselFooter />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
