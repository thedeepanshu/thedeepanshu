import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import seo from '@/content/seo.json'

type Header = { key: string; value: string }
const vercel = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
  rewrites: { source: string; destination: string }[]
  headers: { source: string; headers: Header[] }[]
}

describe('vercel.json', () => {
  it('rewrites every real route to its prerendered HTML (unknown URLs then get a real 404)', () => {
    for (const route of Object.keys(seo.pages).filter((path) => path !== '/')) {
      expect(vercel.rewrites, route).toContainEqual({ source: route, destination: `${route}/index.html` })
    }
    expect(vercel.rewrites.some((rule) => rule.source === '/(.*)')).toBe(false)
  })

  it('allows in its CSP every origin the app embeds in a frame', () => {
    const csp = vercel.headers.flatMap((rule) => rule.headers).find((header) => header.key === 'Content-Security-Policy')?.value ?? ''
    const frameSrc = csp.split(';').find((directive) => directive.trim().startsWith('frame-src')) ?? ''
    for (const origin of ['https://www.youtube-nocookie.com', 'https://open.spotify.com']) expect(frameSrc).toContain(origin)
    expect(csp).toContain("script-src 'self';")
    expect(csp).toContain("frame-ancestors 'none'")
  })
})
