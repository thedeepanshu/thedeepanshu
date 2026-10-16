import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import { playWarp } from '@/audio/soundEngine'
import { BACKDROP_FLOOR, deckInView, scrollDim, useVessel } from '@/world/store'

import { useDeckAnchor } from './useDeckAnchor'

const DISH_RADIUS = 3.2
const DISH_DEPTH = 1.1
const BEAM_LENGTH = 90
const FIRE_SECONDS = 3.2

const passVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Wireframe-style dish: a lit grid on the bowl that glows brighter as the
// array charges, plus a fresnel edge.
const dishFragment = /* glsl */ `
  uniform float uCharge;
  uniform float uTime;
  uniform float uDim;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vec2 grid = abs(fract(vec2(vUv.x * 36.0, vUv.y * 10.0)) - 0.5);
    float line = 1.0 - smoothstep(0.0, 0.06, min(grid.x, grid.y));
    float rim = pow(max(0.0, 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)))), 2.0);
    float pulse = 0.5 + 0.5 * sin(uTime * 3.0 - vUv.y * 12.0);
    vec3 color = mix(vec3(0.51, 0.72, 1.0), vec3(0.49, 0.96, 0.86), uCharge);
    float alpha = (0.05 + line * (0.25 + uCharge * 0.45 * pulse) + rim * 0.25) * uDim;
    gl_FragColor = vec4(color, alpha);
  }
`

// The rim's charge meter: an arc that fills clockwise with form progress.
const chargeFragment = /* glsl */ `
  uniform float uCharge;
  uniform float uTime;
  uniform float uDim;
  varying vec2 vUv;
  void main() {
    float filled = step(vUv.x, uCharge);
    float tick = step(0.5, fract(vUv.x * 48.0));
    vec3 color = mix(vec3(0.3, 0.38, 0.42), vec3(0.49, 0.96, 0.86), filled);
    float alpha = mix(0.25, 0.95 + 0.05 * sin(uTime * 8.0), filled) * mix(0.6, 1.0, tick) * uDim;
    gl_FragColor = vec4(color, alpha);
  }
`

// Transmission beam: a pulse that races out along the beam and fades.
const beamFragment = /* glsl */ `
  uniform float uFire;
  uniform float uDim;
  varying vec2 vUv;
  void main() {
    float head = uFire * 1.4;
    float along = vUv.y;
    float trail = smoothstep(head - 0.5, head, along) * (1.0 - smoothstep(head, head + 0.02, along));
    // The stretch nearest the dish keeps glowing while the shot is out.
    float muzzle = (1.0 - smoothstep(0.0, 0.14, along)) * (1.0 - smoothstep(0.35, 0.9, uFire)) * step(uFire, 0.999);
    float core = pow(max(0.0, 1.0 - abs(vUv.x - 0.5) * 2.0), 1.5);
    float fade = 1.0 - smoothstep(0.6, 1.0, uFire);
    gl_FragColor = vec4(vec3(0.7, 1.0, 0.95), (trail * fade + muzzle * 0.8) * core * uDim);
  }
`

/**
 * Comms array (Signal deck): a dish that charges as the contact form fills in
 * and fires a transmission beam into deep space when a message is sent.
 */
export function CommsArray() {
  const anchorRef = useDeckAnchor('signal')
  const rig = useRef<THREE.Group>(null)
  const dishMaterial = useRef<THREE.ShaderMaterial>(null)
  const chargeMaterial = useRef<THREE.ShaderMaterial>(null)
  const beamMaterial = useRef<THREE.ShaderMaterial>(null)
  const shockwave = useRef<THREE.Mesh>(null)
  const feedTip = useRef<THREE.Mesh>(null)
  const charge = useRef(0)
  const fire = useRef(1)
  const shots = useRef(useVessel.getState().signalShots)

  // Parabolic bowl, opening along +Y before the dish is aimed.
  const dishGeometry = useMemo(() => {
    const profile: THREE.Vector2[] = []
    for (let i = 0; i <= 24; i++) {
      const r = (i / 24) * DISH_RADIUS
      profile.push(new THREE.Vector2(r, ((r * r) / (DISH_RADIUS * DISH_RADIUS)) * DISH_DEPTH))
    }
    return new THREE.LatheGeometry(profile, 72)
  }, [])

  const dishUniforms = useMemo(() => ({ uCharge: { value: 0 }, uTime: { value: 0 }, uDim: { value: 1 } }), [])
  const chargeUniforms = useMemo(() => ({ uCharge: { value: 0 }, uTime: { value: 0 }, uDim: { value: 1 } }), [])
  const beamUniforms = useMemo(() => ({ uFire: { value: 1 }, uDim: { value: 1 } }), [])

  useFrame(({ clock, size }, delta) => {
    if (!anchorRef.current) return
    anchorRef.current.visible = deckInView('signal')
    if (!anchorRef.current.visible) return
    const { signalCharge, signalShots, reducedMotion } = useVessel.getState()
    const time = clock.elapsedTime
    const narrow = size.width < size.height
    rig.current?.position.set(narrow ? 0 : 5, narrow ? 2.6 : -0.6, -1)
    rig.current?.scale.setScalar(narrow ? 0.55 : 1)
    const dim = scrollDim(BACKDROP_FLOOR) * (narrow ? 0.7 : 1)

    if (signalShots !== shots.current) {
      shots.current = signalShots
      fire.current = 0
      playWarp(1.4)
    }
    fire.current = Math.min(1, fire.current + delta / (reducedMotion ? 0.6 : FIRE_SECONDS))
    // Charge drains as the transmission leaves, then follows the form again.
    const target = fire.current < 1 ? 0 : signalCharge
    charge.current = THREE.MathUtils.damp(charge.current, target, fire.current < 1 ? 1.2 : 3, delta)

    for (const material of [dishMaterial.current, chargeMaterial.current]) {
      if (!material) continue
      material.uniforms.uCharge.value = charge.current
      material.uniforms.uTime.value = time
      material.uniforms.uDim.value = dim
    }
    if (beamMaterial.current) {
      beamMaterial.current.uniforms.uFire.value = fire.current
      beamMaterial.current.uniforms.uDim.value = dim
    }
    if (shockwave.current) {
      const wave = Math.min(1, fire.current * 2.5)
      shockwave.current.scale.setScalar(1 + wave * 5)
      const material = shockwave.current.material as THREE.MeshBasicMaterial
      material.opacity = (1 - wave) * 0.8 * dim * (fire.current < 1 ? 1 : 0)
    }
    if (feedTip.current) {
      const material = feedTip.current.material as THREE.MeshBasicMaterial
      material.opacity = (0.4 + charge.current * 0.6 + (fire.current < 0.3 ? 0.6 : 0)) * dim
      feedTip.current.scale.setScalar(1 + charge.current * 0.6 + Math.sin(time * 6) * 0.05 * charge.current)
    }
  })

  return (
    <group ref={anchorRef}>
      <group ref={rig}>
        {/* The dish, aimed up and away into the sky. */}
        <group rotation={[0.3, 0.35, -0.55]} position={[0, -0.6, 0]}>
          <mesh geometry={dishGeometry}>
            <shaderMaterial
              ref={dishMaterial}
              vertexShader={passVertex}
              fragmentShader={dishFragment}
              uniforms={dishUniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh position={[0, DISH_DEPTH, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[DISH_RADIUS + 0.12, 0.05, 8, 160]} />
            <shaderMaterial
              ref={chargeMaterial}
              vertexShader={passVertex}
              fragmentShader={chargeFragment}
              uniforms={chargeUniforms}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Feed struts and horn at the focal point */}
          {[0, 1, 2].map((index) => {
            const angle = (index / 3) * Math.PI * 2
            const foot = new THREE.Vector3(Math.cos(angle) * DISH_RADIUS * 0.85, DISH_DEPTH * 0.72, Math.sin(angle) * DISH_RADIUS * 0.85)
            const tip = new THREE.Vector3(0, DISH_DEPTH + 1.6, 0)
            const mid = foot.clone().add(tip).multiplyScalar(0.5)
            const length = foot.distanceTo(tip)
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tip.clone().sub(foot).normalize())
            return (
              <mesh key={index} position={mid} quaternion={quaternion}>
                <cylinderGeometry args={[0.025, 0.025, length, 6]} />
                <meshBasicMaterial color="#83b7ff" transparent opacity={0.5} />
              </mesh>
            )
          })}
          <mesh ref={feedTip} position={[0, DISH_DEPTH + 1.6, 0]}>
            <sphereGeometry args={[0.16, 16, 12]} />
            <meshBasicMaterial color="#7ef4db" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <mesh ref={shockwave} position={[0, DISH_DEPTH + 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.42, 64]} />
            <meshBasicMaterial color="#a5faff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          {/* Transmission beam, along the dish axis out of the focal point. */}
          <mesh position={[0, DISH_DEPTH + 1.6 + BEAM_LENGTH / 2, 0]}>
            <planeGeometry args={[0.8, BEAM_LENGTH]} />
            <shaderMaterial
              ref={beamMaterial}
              vertexShader={passVertex}
              fragmentShader={beamFragment}
              uniforms={beamUniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh position={[0, DISH_DEPTH + 1.6 + BEAM_LENGTH / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.8, BEAM_LENGTH]} />
            <shaderMaterial
              vertexShader={passVertex}
              fragmentShader={beamFragment}
              uniforms={beamUniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}
