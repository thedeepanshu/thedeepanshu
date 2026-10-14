import { create } from 'zustand'
import { deckForPath, type DeckId } from './decks'

export type QualityTier = 'high' | 'low'

type VesselState = {
  deck: DeckId
  tier: QualityTier
  reducedMotion: boolean
  setDeck: (deck: DeckId) => void
  setTier: (tier: QualityTier) => void
  setReducedMotion: (reducedMotion: boolean) => void
}

function detectTier(): QualityTier {
  if (typeof window === 'undefined') return 'high'
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const smallScreen = window.innerWidth < 900
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4
  return coarsePointer || smallScreen || fewCores ? 'low' : 'high'
}

/** React-facing state: changes rarely and is safe to subscribe to. */
export const useVessel = create<VesselState>((set) => ({
  deck: typeof window === 'undefined' ? 'bridge' : deckForPath(window.location.pathname).id,
  tier: detectTier(),
  reducedMotion: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  setDeck: (deck) => set({ deck }),
  setTier: (tier) => set({ tier }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}))

/**
 * Per-frame values. Mutated inside the render loop and read by shaders and the
 * HUD without going through React, so nothing re-renders 60 times a second.
 */
export const motion = {
  /** 0 = cruising, 1 = peak of a warp jump. */
  warp: 0,
  /** Pointer position, -1..1 on both axes. */
  pointer: { x: 0, y: 0 },
  camera: { x: 0, y: 0, z: 0 },
}
