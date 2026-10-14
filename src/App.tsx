import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import './vessel.css'
import { BootSequence } from './components/BootSequence'
import { CursorEffect } from './components/CursorEffect'
import { HudFrame } from './components/HudFrame'
import { Narrator } from './components/Narrator'
import { ShipConsole } from './components/ShipConsole'
import { ScrollToTop } from './components/ScrollToTop'
import { SiteHeader } from './components/SiteHeader'
import { SoundToggle } from './components/SoundToggle'
import { DeckSync } from './world/DeckSync'
import { useVessel } from './world/store'
import {
  HomePage,
  AboutPage,
  ArsenalPage,
  BeyondPage,
  JourneyPage,
  LabPage,
  MissionsPage,
  NotFoundPage,
  SignalPage,
} from './pages'

// three.js is heavy; the page renders first and the world fades in behind it.
const World = lazy(() => import('./world/World'))

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
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#content">Skip to content</a>
      <DeckSync />
      <ScrollToTop />
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <HudFrame />
      <CursorEffect />
      <SiteHeader />
      <SoundToggle />
      <ShipConsole />
      <Narrator />
      <DeckView />
      <BootSequence />
    </BrowserRouter>
  )
}

export default App
