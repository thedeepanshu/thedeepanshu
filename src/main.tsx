import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted Space Grotesk (variable, all weights): no third-party font request.
import '@fontsource-variable/space-grotesk'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
