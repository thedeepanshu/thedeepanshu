import { describe, expect, it } from 'vitest'

import { decks } from '@/world/decks'

import { metaForPath } from './seo'
import seo from './seo.json'

describe('metaForPath', () => {
  it('returns the page copy for known routes, ignoring a trailing slash', () => {
    expect(metaForPath('/about')).toMatchObject({ known: true, title: seo.pages['/about'].title })
    expect(metaForPath('/about/')).toMatchObject({ known: true, title: seo.pages['/about'].title })
  })

  it('returns the 404 copy for unknown routes', () => {
    expect(metaForPath('/nowhere')).toMatchObject({ known: false })
  })
})

describe('seo.json', () => {
  const pages = seo.pages as Record<string, { title: string; description: string }>

  it('has an entry for every charted deck', () => {
    for (const deck of decks.filter((item) => item.id !== 'void')) {
      expect(pages[deck.path], `missing SEO entry for ${deck.path}`).toBeDefined()
    }
  })

  it('gives every page a unique title and a description of sensible length', () => {
    const titles = Object.values(pages).map((page) => page.title)
    expect(new Set(titles).size).toBe(titles.length)
    for (const [path, page] of Object.entries(pages)) {
      expect(page.description.length, `${path} description`).toBeGreaterThan(50)
      expect(page.description.length, `${path} description`).toBeLessThanOrEqual(170)
    }
  })
})
