import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // three.js is one large chunk by nature; scripts/size-budget.mjs guards real growth.
  // (A modulepreload for the World chunk was measured and rejected: on slow links it
  // splits bandwidth with the main bundle and delays the welcome screen more than it
  // speeds up the world.)
  build: { chunkSizeWarningLimit: 1200 },
})
