import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { CameraRig } from './CameraRig'
import { Effects } from './Effects'
import { Nebula } from './Nebula'
import { Starfield } from './Starfield'
import { useVessel } from './store'

const tierSettings = {
  high: { dpr: [1, 1.75] as [number, number], stars: 7000, streaks: 1800, octaves: 5 },
  low: { dpr: [1, 1.25] as [number, number], stars: 2800, streaks: 700, octaves: 3 },
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
        <CameraRig />
        <Effects tier={tier} />
      </Canvas>
    </div>
  )
}
