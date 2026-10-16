import { PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { CameraRig } from './CameraRig'
import { Effects } from './Effects'
import { Nebula } from './Nebula'
import { CommsArray } from './setpieces/CommsArray'
import { FlightPath } from './setpieces/FlightPath'
import { Hangar } from './setpieces/Hangar'
import { IdentityCore } from './setpieces/IdentityCore'
import { ObservationDeck } from './setpieces/ObservationDeck'
import { PilotReveal } from './setpieces/PilotReveal'
import { ReactorCore } from './setpieces/ReactorCore'
import { StarMap } from './setpieces/StarMap'
import { Wreckage } from './setpieces/Wreckage'
import { Starfield } from './Starfield'
import { useVessel } from './store'
import { Swarm } from './Swarm'

// Both tiers share one look: a soft render (capped pixel ratio) and a smooth
// 3-octave nebula, so the scene sits calmly behind the text on every device
// and never changes mid-visit. Tiers only differ in how much there is.
const tierSettings = {
  high: { dpr: [1, 1.25] as [number, number], stars: 7000, streaks: 1800, octaves: 3, swarm: 42000, sparks: 900, identity: 9000 },
  low: { dpr: [1, 1.25] as [number, number], stars: 2800, streaks: 700, octaves: 3, swarm: 16000, sparks: 350, identity: 5000 },
}

/** Tells the welcome sequence the world has actually drawn, not just loaded. */
function ReadySignal() {
  const sent = useRef(false)
  useFrame(() => {
    if (sent.current) return
    sent.current = true
    useVessel.getState().setWorldReady()
  })
  return null
}

/**
 * The persistent 3D world. Mounted once behind every route; navigation moves
 * the camera through it instead of swapping scenes.
 */
export default function World() {
  const tier = useVessel((state) => state.tier)
  const setTier = useVessel((state) => state.setTier)
  const settings = tierSettings[tier]

  return (
    <div className="world-layer" aria-hidden="true">
      <Canvas
        dpr={settings.dpr}
        camera={{ fov: 50, near: 0.1, far: 1000, position: [0, 0, 12] }}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
        fallback={null}
      >
        <PerformanceMonitor onDecline={() => setTier('low')} />
        <Nebula octaves={settings.octaves} />
        <Starfield count={settings.stars} streakCount={settings.streaks} />
        <Swarm count={settings.swarm} />
        <PilotReveal />
        <Hangar />
        <StarMap />
        <FlightPath />
        <IdentityCore points={settings.identity} />
        <ReactorCore sparks={settings.sparks} />
        <ObservationDeck />
        <CommsArray />
        <Wreckage />
        <CameraRig />
        <Effects tier={tier} />
        <ReadySignal />
      </Canvas>
    </div>
  )
}
