import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import type { ChromaticAberrationEffect } from 'postprocessing'
import * as THREE from 'three'
import { motion, type QualityTier } from './store'

export function Effects({ tier }: { tier: QualityTier }) {
  const chromatic = useRef<ChromaticAberrationEffect>(null)
  const offset = useMemo(() => new THREE.Vector2(0, 0), [])

  // Colour fringing is the "light speed" tell: zero while parked, peaks mid-warp.
  useFrame(() => {
    const amount = 0.0004 + motion.warp * 0.006
    chromatic.current?.offset.set(amount, amount * 0.6)
  })

  // One clean grade everywhere: soft bloom and no film grain. Capable devices
  // add only the warp's colour fringing, which is invisible while parked.
  if (tier === 'low') {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.42} luminanceSmoothing={0.3} />
        <Vignette offset={0.3} darkness={0.65} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.42} luminanceSmoothing={0.3} />
      <ChromaticAberration ref={chromatic} offset={offset} radialModulation modulationOffset={0.25} />
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  )
}
