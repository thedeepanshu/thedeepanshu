import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { deckById } from './decks'
import { motion, useVessel } from './store'

const FLIGHT_SECONDS = 1.6
const BOARDING_SECONDS = 2.2
/** How far back from its deck the camera waits during the welcome sequence. */
const APPROACH_DISTANCE = 35

const desiredPosition = new THREE.Vector3()
const desiredTarget = new THREE.Vector3()

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
  const bootPhase = useVessel((state) => state.bootPhase)
  const camera = useThree((state) => state.camera)

  const flight = useRef({
    progress: 1,
    duration: FLIGHT_SECONDS,
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
  const waitingToBoard = useRef(false)
  const previousDeck = useRef(deckId)

  useEffect(() => {
    const deck = deckById(deckId)
    const f = flight.current

    // First deck of the session: park there instead of flying in. While the
    // welcome sequence runs, park further back so boarding can push in.
    if (!initialised.current || reducedMotion) {
      initialised.current = true
      basePosition.current.set(...deck.camera)
      lookTarget.current.set(...deck.target)
      if (!reducedMotion && useVessel.getState().bootPhase !== 'done') {
        const back = new THREE.Vector3(...deck.camera).sub(lookTarget.current).normalize()
        basePosition.current.addScaledVector(back, APPROACH_DISTANCE)
        waitingToBoard.current = true
      }
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
    f.swoop
      .set(0, 1, 0)
      .cross(new THREE.Vector3().subVectors(f.toPosition, f.fromPosition).normalize())
      .multiplyScalar(distance * 0.12)
    f.swoop.y += distance * 0.06
    f.duration = FLIGHT_SECONDS
    f.progress = 0
    motion.fromDeck = previousDeck.current
    previousDeck.current = deckId
  }, [deckId, reducedMotion])

  // Boarding: a straight push from the waiting position onto the deck.
  useEffect(() => {
    if (bootPhase !== 'boarding' || !waitingToBoard.current) return
    waitingToBoard.current = false
    const f = flight.current
    f.fromPosition.copy(basePosition.current)
    f.fromTarget.copy(lookTarget.current)
    f.swoop.set(0, 0, 0)
    f.duration = BOARDING_SECONDS
    f.progress = 0
  }, [bootPhase])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      motion.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      motion.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
      motion.pointerActive = true
    }
    const onScroll = () => {
      motion.scrollTarget = window.scrollY / Math.max(1, window.innerHeight)
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      motion.scrollRemaining = (scrollable - window.scrollY) / Math.max(1, window.innerHeight)
    }
    onScroll()
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useFrame((_, delta) => {
    // Ease scroll toward the real position: smooth for wheel, keys and scrollbar drags alike.
    motion.scroll = THREE.MathUtils.damp(motion.scroll, motion.scrollTarget, reducedMotion ? 30 : 9, delta)

    const f = flight.current

    if (f.progress < 1) {
      f.progress = Math.min(1, f.progress + delta / f.duration)
      const t = easeInOutCubic(f.progress)
      basePosition.current.lerpVectors(f.fromPosition, f.toPosition, t).addScaledVector(f.swoop, Math.sin(Math.PI * t))
      lookTarget.current.lerpVectors(f.fromTarget, f.toTarget, THREE.MathUtils.smootherstep(f.progress, 0.05, 0.85))
      motion.warp = Math.pow(Math.sin(Math.PI * f.progress), 1.5)
      motion.flightProgress = f.progress
    } else if (!waitingToBoard.current) {
      motion.warp = THREE.MathUtils.damp(motion.warp, 0, 6, delta)

      // Parked: ease toward the deck pose, or the set piece's directed pose.
      const director = motion.director
      const directed = director.deck !== null && director.deck === useVessel.getState().deck
      if (directed) {
        desiredPosition.set(director.position.x, director.position.y, director.position.z)
        desiredTarget.set(director.target.x, director.target.y, director.target.z)
      } else {
        desiredPosition.copy(f.toPosition)
        desiredTarget.copy(f.toTarget)
      }
      const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 2.2)
      basePosition.current.lerp(desiredPosition, ease)
      lookTarget.current.lerp(desiredTarget, ease)
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
