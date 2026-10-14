import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import './vessel.css'
import { CursorEffect } from './components/CursorEffect'
import { HudFrame } from './components/HudFrame'
import { ScrollToTop } from './components/ScrollToTop'
import { SiteHeader } from './components/SiteHeader'
import { DeckSync } from './world/DeckSync'
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

/** Remounts the page on each route so it can arrive after the warp. */
function DeckView() {
  const location = useLocation()

  return (
    <div className="deck-view" key={location.pathname}>
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
      <DeckSync />
      <ScrollToTop />
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <HudFrame />
      <CursorEffect />
      <SiteHeader />
      <DeckView />
    </BrowserRouter>
  )
}

export default App
