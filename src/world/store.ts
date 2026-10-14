import { create } from 'zustand'
import { deckForPath, type DeckId } from './decks'

export type QualityTier = 'high' | 'low'

/**
 * Welcome sequence stages. `power`/`boot` show static noise, `transmission`
 * and `choice` hold the name, `boarding` warps in, `done` is normal browsing.
 */
export type BootPhase = 'power' | 'boot' | 'transmission' | 'choice' | 'boarding' | 'done'

type VesselState = {
  deck: DeckId
  tier: QualityTier
  reducedMotion: boolean
  bootPhase: BootPhase
  /** The 3D world has loaded and drawn its first frame. */
  worldReady: boolean
  soundOn: boolean
  /** Set by the pages so each deck's set piece can follow what's on screen. */
  activeMission: string | null
  activeSkill: string
  activeMilestone: string | null
  activeExperiment: string | null
  activeMemory: string | null
  /** Comms array: how complete the contact form is (0–1), and a counter bumped on each send. */
  signalCharge: number
  signalShots: number
  /** Latest line from the ship's AI; `id` changes even when the text repeats. */
  narration: { id: number; text: string } | null
  consoleOpen: boolean
  setDeck: (deck: DeckId) => void
  setTier: (tier: QualityTier) => void
  setReducedMotion: (reducedMotion: boolean) => void
  setBootPhase: (bootPhase: BootPhase) => void
  setWorldReady: () => void
  setSoundOn: (soundOn: boolean) => void
  setActiveMission: (id: string | null) => void
  setActiveSkill: (id: string) => void
  setActiveMilestone: (id: string | null) => void
  setActiveExperiment: (id: string | null) => void
  setActiveMemory: (id: string | null) => void
  setSignalCharge: (charge: number) => void
  fireSignal: () => void
  narrate: (text: string) => void
  setConsoleOpen: (open: boolean) => void
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
  bootPhase: 'power',
  worldReady: false,
  soundOn: false,
  setBootPhase: (bootPhase) => set({ bootPhase }),
  setWorldReady: () => set({ worldReady: true }),
  setSoundOn: (soundOn) => set({ soundOn }),
  activeMission: null,
  activeSkill: 'core-frontend',
  activeMilestone: null,
  setActiveMission: (activeMission) => set({ activeMission }),
  setActiveSkill: (activeSkill) => set({ activeSkill }),
  setActiveMilestone: (activeMilestone) => set({ activeMilestone }),
  activeExperiment: null,
  activeMemory: null,
  signalCharge: 0,
  signalShots: 0,
  setActiveExperiment: (activeExperiment) => set({ activeExperiment }),
  setActiveMemory: (activeMemory) => set({ activeMemory }),
  setSignalCharge: (signalCharge) => set({ signalCharge }),
  fireSignal: () => set((state) => ({ signalShots: state.signalShots + 1 })),
  narration: null,
  consoleOpen: false,
  narrate: (text) => set((state) => ({ narration: { id: (state.narration?.id ?? 0) + 1, text } })),
  setConsoleOpen: (consoleOpen) => set({ consoleOpen }),
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
  /** Becomes true once the pointer has moved, so nothing reacts to a cursor that isn't there. */
  pointerActive: false,
  camera: { x: 0, y: 0, z: 0 },
  /**
   * Page scroll in viewport heights, eased in the render loop. Everything 3D
   * reads this one, so scrollbar drags (big, uneven jumps) still glide.
   */
  scroll: 0,
  /** Raw scroll position, written by the scroll listener. */
  scrollTarget: 0,
  /**
   * Lets a set piece steer the camera while its deck is parked (the Journey
   * flight path does). The rig eases toward this pose instead of the deck's.
   */
  /** Deck the current (or last) flight left from, and how far along it is. */
  fromDeck: null as DeckId | null,
  flightProgress: 1,
  director: {
    deck: null as DeckId | null,
    position: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
  },
}

/**
 * Whether a deck's set piece should render: on its own deck, and while a
 * flight is leaving it, so pieces never show up in another deck's view.
 */
export function deckInView(id: DeckId) {
  return useVessel.getState().deck === id || (motion.flightProgress < 1 && motion.fromDeck === id)
}

/** Dims a set piece as the page scrolls over it: 1 at the top, `floor` once well into the content. */
export function scrollDim(floor: number) {
  const t = Math.min(1, Math.max(0, (motion.scroll - 0.2) / 0.6))
  return 1 - t * t * (3 - 2 * t) * (1 - floor)
}
