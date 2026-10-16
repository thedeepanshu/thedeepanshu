import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end checks against the production build (`npm run build` first):
 * every route renders, has no console errors and no axe violations, on a
 * desktop and a phone viewport. CI installs Playwright's Chromium; locally
 * set CHROME_PATH to use an installed Chrome instead.
 */
const launchOptions = {
  executablePath: process.env.CHROME_PATH || undefined,
  // Software WebGL so the 3D world renders on machines without a GPU (CI).
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
}

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  // Each page renders the WebGL world in software; a few workers keep the machine responsive.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, launchOptions } },
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions } },
  ],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
