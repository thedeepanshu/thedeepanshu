import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import seo from '@/content/seo.json'

import { profileUrls, structuredData, structuredDataScript } from './structuredData'

type Node = Record<string, unknown>
const graph = (route: string) => (structuredData(route) as { '@graph': Node[] })['@graph']
const person = () => graph('/').find((node) => node['@type'] === 'Person') as Node

describe('structured data', () => {
  it('links every profile to the same Person (sameAs)', () => {
    expect(profileUrls()).toEqual(
      expect.arrayContaining([
        'https://github.com/thedeepanshu',
        'https://www.linkedin.com/in/deepanshu-saini-a97229206/',
        'https://www.youtube.com/@DoliwithDeep',
        'https://instagram.com/deep22.01',
        'https://www.instagram.com/doliwithdeep/',
      ]),
    )
    expect(person().sameAs).toEqual(profileUrls())
  })

  it('describes the person as a Frontend Developer in Panipat', () => {
    expect(person()).toMatchObject({ name: 'Deepanshu Saini', alternateName: 'thedeepanshu', jobTitle: 'Frontend Developer' })
    expect(person().address).toMatchObject({ addressLocality: 'Panipat', addressCountry: 'IN' })
  })

  it.each(Object.keys(seo.pages))('builds a complete graph for %s (no undefined values)', (route) => {
    const json = JSON.stringify(structuredData(route))
    expect(json).not.toContain('undefined')
    const types = graph(route).map((node) => node['@type'])
    expect(types).toEqual(expect.arrayContaining(['WebSite', 'Person']))
    expect(types).toContain(route === '/' || route === '/about' ? 'ProfilePage' : 'WebPage')
  })

  it('lists the missions as projects on /missions', () => {
    const list = graph('/missions').find((node) => node['@type'] === 'ItemList') as { itemListElement: unknown[] }
    expect(list.itemListElement.length).toBeGreaterThanOrEqual(4)
  })

  it('is safe inside a <script> tag', () => {
    expect(structuredDataScript('/')).not.toContain('</')
  })
})

describe('identity consistency', () => {
  it('uses the one LinkedIn URL everywhere (content and résumé sources)', () => {
    for (const file of ['src/content/portfolio.ts', 'src/content/resumeData.ts', 'resume-source/simple-resume.html', 'resume-source/fancy-resume.html']) {
      expect(readFileSync(resolve(process.cwd(), file), 'utf8'), file).not.toContain('thedeepanshu-a97229206')
    }
  })
})
