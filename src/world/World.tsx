import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { CameraRig } from './CameraRig'
import { Effects } from './Effects'
import { Nebula } from './Nebula'
import { Starfield } from './Starfield'
import { Swarm } from './Swarm'
import { FlightPath } from './setpieces/FlightPath'
import { Hangar } from './setpieces/Hangar'
import { StarMap } from './setpieces/StarMap'
import { CommsArray } from './setpieces/CommsArray'
import { ObservationDeck } from './setpieces/ObservationDeck'
import { PortraitHologram } from './setpieces/PortraitHologram'
import { ReactorCore } from './setpieces/ReactorCore'
import { Wreckage } from './setpieces/Wreckage'
import { useVessel } from './store'

const tierSettings = {
  high: { dpr: [1, 1.75] as [number, number], stars: 7000, streaks: 1800, octaves: 5, swarm: 42000, portrait: 16000, sparks: 900 },
  low: { dpr: [1, 1.25] as [number, number], stars: 2800, streaks: 700, octaves: 3, swarm: 16000, portrait: 7000, sparks: 350 },
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
        <Hangar />
        <StarMap />
        <FlightPath />
        <PortraitHologram maxPoints={settings.portrait} />
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
