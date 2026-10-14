import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { deckById } from './decks'
import { motion, useVessel } from './store'

const FLIGHT_SECONDS = 1.6

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Flies the camera between deck poses. A flight is a smooth position/target
 * blend with a slight swoop, and `motion.warp` peaks mid-flight so the stars,
 * post effects and HUD can react to it.
 */
export function CameraRig() {
  const deckId = useVessel((state) => state.deck)
  const reducedMotion = useVessel((state) => state.reducedMotion)
  const camera = useThree((state) => state.camera)

  const flight = useRef({
    progress: 1,
    fromPosition: new THREE.Vector3(),
    toPosition: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    swoop: new THREE.Vector3(),
  })
  const lookTarget = useRef(new THREE.Vector3())
  const basePosition = useRef(new THREE.Vector3())
  const parallax = useRef(new THREE.Vector2())
  const initialised = useRef(false)

  useEffect(() => {
    const deck = deckById(deckId)
    const f = flight.current

    // First deck of the session: park there instead of flying in.
    if (!initialised.current || reducedMotion) {
      initialised.current = true
      basePosition.current.set(...deck.camera)
      lookTarget.current.set(...deck.target)
      f.progress = 1
      f.toPosition.set(...deck.camera)
      f.toTarget.set(...deck.target)
      return
    }

    f.fromPosition.copy(basePosition.current)
    f.fromTarget.copy(lookTarget.current)
    f.toPosition.set(...deck.camera)
    f.toTarget.set(...deck.target)
    // Bow the path sideways/up so long flights read as a banked arc, not a slide.
    const distance = f.fromPosition.distanceTo(f.toPosition)
    f.swoop.set(0, 1, 0).cross(new THREE.Vector3().subVectors(f.toPosition, f.fromPosition).normalize()).multiplyScalar(distance * 0.12)
    f.swoop.y += distance * 0.06
    f.progress = 0
  }, [deckId, reducedMotion])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      motion.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      motion.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  useFrame((_, delta) => {
    const f = flight.current

    if (f.progress < 1) {
      f.progress = Math.min(1, f.progress + delta / FLIGHT_SECONDS)
      const t = easeInOutCubic(f.progress)
      basePosition.current.lerpVectors(f.fromPosition, f.toPosition, t).addScaledVector(f.swoop, Math.sin(Math.PI * t))
      lookTarget.current.lerpVectors(f.fromTarget, f.toTarget, THREE.MathUtils.smootherstep(f.progress, 0.05, 0.85))
      motion.warp = Math.pow(Math.sin(Math.PI * f.progress), 1.5)
    } else {
      motion.warp = THREE.MathUtils.damp(motion.warp, 0, 6, delta)
    }

    // Gentle head-tracking toward the pointer while parked.
    const strength = reducedMotion ? 0 : 0.9
    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, motion.pointer.x * strength, 3, delta)
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, motion.pointer.y * strength * 0.6, 3, delta)

    camera.position.copy(basePosition.current)
    camera.lookAt(lookTarget.current)
    camera.translateX(parallax.current.x)
    camera.translateY(parallax.current.y)
    camera.lookAt(lookTarget.current)

    motion.camera.x = camera.position.x
    motion.camera.y = camera.position.y
    motion.camera.z = camera.position.z
  })

  return null
}
