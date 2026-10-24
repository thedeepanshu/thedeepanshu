import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { decks } from '@/world/decks'

import { familyChannel, learning, listening, watching } from './beyond'
import { dossier, missions, socialLinks } from './portfolio'

/** A site path like /images/x.webp must exist in public/. */
const inPublic = (path: string) => existsSync(resolve(process.cwd(), 'public', path.replace(/^\//, '')))

describe('content integrity', () => {
  it('every image the content references exists in public/', () => {
    const images = [
      dossier.portrait,
      ...missions.map((mission) => mission.visual.src),
      ...watching.map((item) => item.poster),
      ...listening.map((artist) => artist.art),
      learning.avatar,
      familyChannel.avatar,
    ]
    for (const image of images) expect(inPublic(image), image).toBe(true)
  })

  it('every track on the music shelf can be played', () => {
    for (const artist of listening) {
      for (const track of artist.tracks) expect(Boolean(track.spotify || track.youtube), `${artist.name}: ${track.title}`).toBe(true)
    }
  })

  it('missions have unique ids and numbers', () => {
    expect(new Set(missions.map((mission) => mission.id)).size).toBe(missions.length)
    expect(new Set(missions.map((mission) => mission.number)).size).toBe(missions.length)
  })

  it('social links are https or mailto', () => {
    for (const link of socialLinks) expect(link.url, link.name).toMatch(/^(https:\/\/|mailto:)/)
  })

  it('decks have unique ids, paths and numbers', () => {
    for (const key of ['id', 'path', 'number'] as const) {
      expect(new Set(decks.map((deck) => deck[key])).size, key).toBe(decks.length)
    }
  })
})
