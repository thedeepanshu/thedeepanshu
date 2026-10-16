import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import { experiments } from '@/content/portfolio'
import { mulberry32 } from '@/world/random'
import { deckInView, scrollDim, useVessel } from '@/world/store'

const LAB_FLOOR = 0.3
import { useDeckAnchor } from './useDeckAnchor'

const CORE_RADIUS = 1.5
const ORBIT_RADIUS = 4.1
const ORBIT_TILT = 0.38
/** Where the active cell parks on the orbit: front-right, clear of the core. */
const FRONT_ANGLE = 0.95

const noiseChunk = /* glsl */ `
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float gnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(dot(hash3(i), f), dot(hash3(i + vec3(1, 0, 0)), f - vec3(1, 0, 0)), u.x),
                   mix(dot(hash3(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)), dot(hash3(i + vec3(1, 1, 0)), f - vec3(1, 1, 0)), u.x), u.y),
               mix(mix(dot(hash3(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)), dot(hash3(i + vec3(1, 0, 1)), f - vec3(1, 0, 1)), u.x),
                   mix(dot(hash3(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)), dot(hash3(i + vec3(1, 1, 1)), f - vec3(1, 1, 1)), u.x), u.y), u.z);
  }
`

// The core's surface boils: vertices are pushed out along their normals by
// moving noise, and the fragment glows hotter where it's pushed further.
const coreVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSurge;
  varying vec3 vNormal;
  varying float vHeat;
  ${noiseChunk}
  void main() {
    float n = gnoise(normal * 2.2 + vec3(0.0, uTime * 0.6, 0.0)) + 0.5 * gnoise(normal * 5.0 - uTime * 0.4);
    vHeat = n;
    vec3 p = position + normal * n * (0.22 + uSurge * 0.15);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const coreFragment = /* glsl */ `
  uniform float uDim;
  varying vec3 vNormal;
  varying float vHeat;
  void main() {
    float facing = clamp(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    float rim = pow(1.0 - facing, 2.0);
    vec3 hot = vec3(0.92, 1.0, 0.98);
    vec3 cyan = vec3(0.49, 0.96, 0.86);
    vec3 violet = vec3(0.63, 0.49, 1.0);
    vec3 deep = vec3(0.05, 0.28, 0.3);
    // Dark troughs, bright crests: keeps the boiling surface readable under bloom.
    vec3 surface = mix(deep, cyan, smoothstep(-0.45, 0.25, vHeat));
    surface = mix(surface, hot, smoothstep(0.3, 0.75, vHeat) * 0.25);
    // Exposure kept low so the core never blows out to white under bloom.
    vec3 color = (surface * (0.45 + facing * 0.35) + violet * rim * 0.6) * 0.62;
    gl_FragColor = vec4(color, uDim);
  }
`

const sparkVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uDim;
  attribute float aSeed;
  attribute float aRadius;
  attribute float aSpeed;
  attribute float aTilt;
  varying float vAlpha;
  void main() {
    float angle = aSeed * 6.2831 + uTime * aSpeed;
    vec3 p = vec3(cos(angle) * aRadius, sin(angle * 2.0 + aSeed * 9.0) * 0.25, sin(angle) * aRadius);
    float c = cos(aTilt);
    float s = sin(aTilt);
    p = vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.0 + aSeed * 2.0) * uPixelRatio * (16.0 / -mv.z);
    vAlpha = (0.4 + 0.6 * fract(aSeed * 13.0 + uTime * 0.5)) * uDim;
  }
`

const sparkFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(vec3(0.6, 1.0, 0.92), smoothstep(0.5, 0.0, d) * vAlpha);
  }
`

const glowFragment = /* glsl */ `
  uniform float uDim;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float glow = pow(max(0.0, 1.0 - d), 2.4);
    gl_FragColor = vec4(vec3(0.49, 0.96, 0.86), glow * 0.2 * uDim);
  }
`

const passVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const cellColors = ['#7ef4db', '#a17eff', '#83b7ff', '#7ef4db', '#a17eff', '#83b7ff']
const beamPoints = [new THREE.Vector3(), new THREE.Vector3()]

/**
 * Reactor core (Lab deck): a boiling energy core in containment rings, with
 * one orbiting cell per experiment. The experiment in view swings to the front
 * and an energy link connects it to the core.
 */
export function ReactorCore({ sparks }: { sparks: number }) {
  const anchorRef = useDeckAnchor('lab')
  const rig = useRef<THREE.Group>(null)
  const coreMaterial = useRef<THREE.ShaderMaterial>(null)
  const sparkMaterial = useRef<THREE.ShaderMaterial>(null)
  const glowMaterial = useRef<THREE.ShaderMaterial>(null)
  const rings = useRef<(THREE.Mesh | null)[]>([])
  const cells = useRef<(THREE.Mesh | null)[]>([])
  const beam = useRef<THREE.Line>(null)
  const orbit = useRef(0)
  const surge = useRef(0)
  const lastActive = useRef<string | null>(null)

  const sparkGeometry = useMemo(() => {
    const random = mulberry32(77)
    const seed = new Float32Array(sparks)
    const radius = new Float32Array(sparks)
    const speed = new Float32Array(sparks)
    const tilt = new Float32Array(sparks)
    for (let i = 0; i < sparks; i++) {
      seed[i] = random()
      radius[i] = CORE_RADIUS * 1.3 + random() * 2.6
      speed[i] = (0.25 + random() * 0.8) * (random() > 0.5 ? 1 : -1)
      tilt[i] = (random() - 0.5) * 1.6
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(sparks * 3), 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    geometry.setAttribute('aRadius', new THREE.BufferAttribute(radius, 1))
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    geometry.setAttribute('aTilt', new THREE.BufferAttribute(tilt, 1))
    return geometry
  }, [sparks])

  const beamLine = useMemo(
    () =>
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(beamPoints),
        new THREE.LineBasicMaterial({ color: '#7ef4db', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
      ),
    [],
  )

  const coreUniforms = useMemo(() => ({ uTime: { value: 0 }, uSurge: { value: 0 }, uDim: { value: 1 } }), [])
  const sparkUniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 }, uDim: { value: 1 } }), [])
  const glowUniforms = useMemo(() => ({ uDim: { value: 1 } }), [])

  useFrame(({ clock, gl, size }, delta) => {
    if (!anchorRef.current) return
    anchorRef.current.visible = deckInView('lab')
    if (!anchorRef.current.visible) return
    const { activeExperiment, reducedMotion } = useVessel.getState()
    const time = clock.elapsedTime
    const narrow = size.width < size.height
    rig.current?.position.set(narrow ? 0 : 4.4, narrow ? -1.6 : 0.2, -2)
    rig.current?.scale.setScalar(narrow ? 0.5 : 1)
    // A fixed backdrop. The Lab's cards sit right over it, so it settles lower
    // than other decks (30%) to keep their text easy to read.
    const dim = scrollDim(LAB_FLOOR) * (narrow ? 0.65 : 1)
    // Nothing left to see: skip drawing it at all.
    anchorRef.current.visible = dim > 0.01

    // A new experiment in view gives the core a brief surge.
    if (activeExperiment !== lastActive.current) {
      lastActive.current = activeExperiment
      surge.current = 1
    }
    surge.current = THREE.MathUtils.damp(surge.current, 0, 2.5, delta)

    // Rotate the cell ring so the active cell sits at the front (+Z).
    const active = experiments.findIndex((experiment) => experiment.id === activeExperiment)
    const step = (Math.PI * 2) / experiments.length
    const goal = active >= 0 ? FRONT_ANGLE - active * step : orbit.current + delta * 0.15
    orbit.current = reducedMotion ? goal : THREE.MathUtils.damp(orbit.current, goal, 2.2, delta)

    cells.current.forEach((cell, index) => {
      if (!cell) return
      const angle = orbit.current + index * step
      const isActive = index === active
      const radius = ORBIT_RADIUS + (isActive ? 0.8 : 0)
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius
      cell.position.set(x, z * Math.sin(ORBIT_TILT) * -0.6 + (isActive ? 0.4 : 0), z * Math.cos(ORBIT_TILT))
      const scale = THREE.MathUtils.damp(cell.scale.x, isActive ? 1.55 : 1, 5, delta)
      cell.scale.setScalar(scale + Math.sin(time * 3 + index) * 0.04)
      const material = cell.material as THREE.MeshBasicMaterial
      // Additive and bloomed, so even the highlighted cell stays well short of full.
      material.opacity = (isActive ? 0.5 : 0.32) * dim
    })

    // Energy link from core to the active cell, flickering.
    const target = active >= 0 ? cells.current[active] : null
    const line = beam.current
    if (line) {
      const material = line.material as THREE.LineBasicMaterial
      if (target) {
        line.geometry.setFromPoints([beamPoints[0].set(0, 0, 0), beamPoints[1].copy(target.position)])
        material.opacity = (0.55 + Math.sin(time * 30) * 0.2) * dim
      } else {
        material.opacity = 0
      }
    }

    rings.current.forEach((ring, index) => {
      if (!ring) return
      ;(ring.material as THREE.MeshBasicMaterial).opacity = 0.6 * dim
      if (reducedMotion) return
      ring.rotation.x += delta * (0.2 + index * 0.13) * (index % 2 ? -1 : 1)
      ring.rotation.y += delta * (0.12 + index * 0.07)
    })

    if (coreMaterial.current) {
      coreMaterial.current.uniforms.uTime.value = reducedMotion ? 0 : time
      coreMaterial.current.uniforms.uSurge.value = surge.current
      coreMaterial.current.uniforms.uDim.value = dim
    }
    if (sparkMaterial.current) {
      sparkMaterial.current.uniforms.uTime.value = reducedMotion ? 0 : time
      sparkMaterial.current.uniforms.uPixelRatio.value = gl.getPixelRatio()
      sparkMaterial.current.uniforms.uDim.value = dim
    }
    if (glowMaterial.current) glowMaterial.current.uniforms.uDim.value = dim * (1 + surge.current * 0.6)
  })

  return (
    <group ref={anchorRef}>
      <group ref={rig}>
        <mesh position={[0, 0, -0.5]}>
          <planeGeometry args={[9, 9]} />
          <shaderMaterial
            ref={glowMaterial}
            vertexShader={passVertex}
            fragmentShader={glowFragment}
            uniforms={glowUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <mesh>
          <icosahedronGeometry args={[CORE_RADIUS, 24]} />
          <shaderMaterial ref={coreMaterial} vertexShader={coreVertex} fragmentShader={coreFragment} uniforms={coreUniforms} transparent />
        </mesh>

        {[2.3, 2.7, 3.1].map((radius, index) => (
          <mesh
            key={radius}
            ref={(mesh) => {
              rings.current[index] = mesh
            }}
            rotation={[index * 0.9, index * 0.5, 0]}
          >
            <torusGeometry args={[radius, 0.025, 8, 160]} />
            <meshBasicMaterial color={index === 1 ? '#a17eff' : '#7ef4db'} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}

        <points geometry={sparkGeometry} frustumCulled={false}>
          <shaderMaterial
            ref={sparkMaterial}
            vertexShader={sparkVertex}
            fragmentShader={sparkFragment}
            uniforms={sparkUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <primitive ref={beam} object={beamLine} />

        {experiments.map((experiment, index) => (
          <mesh
            key={experiment.id}
            ref={(mesh) => {
              cells.current[index] = mesh
            }}
          >
            <icosahedronGeometry args={[0.28, 2]} />
            <meshBasicMaterial color={cellColors[index % cellColors.length]} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
