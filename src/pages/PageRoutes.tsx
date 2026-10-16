import { type Location, Route, Routes } from 'react-router-dom'

import { AboutPage, ArsenalPage, BeyondPage, HomePage, JourneyPage, LabPage, MissionsPage, NotFoundPage, SignalPage } from '.'

/**
 * The page for each route. Shared by the app (inside the deck view) and the
 * build-time prerender, so both always render the same pages.
 */
export function PageRoutes({ location }: { location?: Location }) {
  return (
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
  )
}
