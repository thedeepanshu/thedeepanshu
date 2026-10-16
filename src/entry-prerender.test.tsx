import { describe, expect, it } from 'vitest'

import seo from '@/content/seo.json'

import { render } from './entry-prerender'

describe('build-time prerender', () => {
  // Every route must render to real HTML: crawlers that don't run JavaScript
  // read this, and a page touching `window` during render would break it.
  it.each(Object.keys(seo.pages))('renders %s with its heading and the shared header and footer', (route) => {
    const html = render(route)
    expect(html).toMatch(/<h1[\s>]/)
    expect(html).toContain('site-header')
    expect(html).toContain('vessel-footer')
    expect(
      html
        .replace(/<[^>]+>/g, ' ')
        .split(/\s+/)
        .filter(Boolean).length,
    ).toBeGreaterThan(100)
  })

  it('renders the not-found page for unknown routes', () => {
    expect(render('/no-such-deck')).toMatch(/not found/i)
  })
})
