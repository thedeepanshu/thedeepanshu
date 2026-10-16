import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

const ROUTES = ['/', '/about', '/missions', '/arsenal', '/journey', '/lab', '/beyond', '/signal']

/** Console noise that isn't ours: Vercel's analytics scripts only exist on Vercel, and R3F's internal Clock. */
const IGNORED = [/_vercel\//, /THREE\.Clock/, /status of 404/]

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && !IGNORED.some((pattern) => pattern.test(message.text()))) errors.push(message.text())
  })
  return errors
}

/** Load a route and skip the welcome sequence. */
async function board(page: Page, route: string) {
  await page.goto(route)
  // Wait for the app to replace the static prerendered frame, or the click lands on a picture of the button.
  await expect(page.locator('#prerender')).toHaveCount(0)
  // Software WebGL keeps the main thread busy compiling shaders, so boarding can take a while here.
  const skip = page.getByRole('button', { name: /skip intro/i })
  await expect(async () => {
    // Escape runs the same skip as the button, without waiting for its animation to settle.
    if (await skip.count()) await page.keyboard.press('Escape')
    await expect(skip).toHaveCount(0, { timeout: 5000 })
  }).toPass({ timeout: 30_000 })
  await expect(page.locator('h1').first()).toBeVisible()
}

for (const route of ROUTES) {
  test.describe(route, () => {
    test('renders its page with no console errors', async ({ page }) => {
      const errors = collectErrors(page)
      await board(page, route)
      await expect(page).toHaveTitle(/Deepanshu Saini/)
      await expect(page.locator('h1')).toHaveCount(1)
      expect(errors).toEqual([])
    })

    test('has no accessibility violations (WCAG 2.2 AA)', async ({ page }) => {
      await board(page, route)
      // Let the arrival animations finish so colours are measured at rest.
      await page.waitForTimeout(3000)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
      expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)).toEqual([])
    })

    test('ships real content and structured data in its HTML (for crawlers)', async ({ request }) => {
      const html = await (await request.get(route)).text()
      expect(html).toMatch(/<h1[\s>]/)
      expect(html).toContain('application/ld+json')
      expect(html).toMatch(/<link rel="canonical" href="https?:\/\/[^"]+"/)
    })
  })
}

test('unknown routes show the not-found deck', async ({ page }) => {
  await board(page, '/no-such-deck')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/not found/i)
})

test('the command palette opens with Ctrl/Cmd+K and closes with Escape', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard shortcut')
  await board(page, '/')
  await page.keyboard.press('ControlOrMeta+k')
  await expect(page.getByRole('dialog', { name: 'Quick navigation' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Quick navigation' })).toBeHidden()
})

test('the contact form clears after opening the email draft', async ({ page }) => {
  await board(page, '/signal')
  // Headless Chrome has no mail app, so the mailto: navigation leaves the page as it is.
  await page.getByLabel(/your name/i).fill('Test Visitor')
  await page.locator('.topic-chip').first().click()
  await page.getByLabel(/message/i).fill('Hello from the end-to-end test.')
  await page.getByRole('button', { name: /open email draft/i }).click()
  await page.getByRole('button', { name: /compose another/i }).click()
  await expect(page.getByLabel(/your name/i)).toHaveValue('')
  await expect(page.getByLabel(/your name/i)).toBeFocused()
})
