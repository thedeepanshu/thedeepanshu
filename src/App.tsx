import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { CursorEffect } from './components/CursorEffect'
import { ScrollToTop } from './components/ScrollToTop'
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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CursorEffect />
      <Routes>
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
    </BrowserRouter>
  )
}

export default App
