import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dossier } from '../../content/portfolio'
import { mulberry32 } from '../random'
import { deckInView, motion, scrollDim, useVessel } from '../store'
import { makeLabelTexture } from './labels'
import { useDeckAnchor } from './useDeckAnchor'

const SPHERE_RADIUS = 1.9
const RINGS = [
  { radius: 2.5, tilt: [1.25, 0, 0.35], speed: 0.22, color: '#7ef4db' },
  { radius: 2.8, tilt: [0.4, 0, -0.9], speed: -0.16, color: '#a17eff' },
  { radius: 3.1, tilt: [-0.55, 0.3, 0.15], speed: 0.11, color: '#83b7ff' },
] as const
/** Stat callouts sit in a fixed column to the right of the core. */
const CALLOUT_X = 3.5
const CALLOUT_ROWS = [1.95, 0.65, -0.65, -1.95]

// Biometric sphere: points breathe on slow noise, and a horizontal scan plane
// lights them as it sweeps up and down.
const sphereVertex = /* glsl */ `
  uniform float uTime;
  uniform float uAssemble;
  uniform float uScan;
  uniform float uPixelRatio;
  uniform float uDim;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 dir = normalize(position);
    float breathe = 1.0 + 0.04 * sin(uTime * 1.3 + dir.y * 5.0 + aSeed * 6.0);
    vec3 p = position * breathe * uAssemble;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.2 + aSeed * 1.4) * uPixelRatio * (14.0 / max(-mv.z, 0.5));
    float scan = smoothstep(0.35, 0.0, abs(position.y - uScan));
    vec3 base = mix(vec3(0.49, 0.96, 0.86), vec3(0.63, 0.49, 1.0), smoothstep(0.4, 1.0, abs(dir.y)));
    vColor = base * (0.7 + scan * 1.2);
    vAlpha = (0.45 + 0.4 * aSeed + scan * 0.6) * uDim * smoothstep(0.0, 0.3, uAssemble);
  }
`

const sphereFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.05, d) * vAlpha);
  }
`

const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const glowFragment = /* glsl */ `
  uniform float uDim;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    gl_FragColor = vec4(vec3(0.6, 1.0, 0.95), pow(max(0.0, 1.0 - d), 3.0) * 0.6 * uDim);
  }
`

/** Evenly spread points on a sphere (Fibonacci lattice) with a little jitter. */
function buildSphere(count: number) {
  const random = mulberry32(1701)
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.5) / count) * 2
    const radius = Math.sqrt(1 - y * y)
    const theta = i * Math.PI * (3 - Math.sqrt(5))
    const r = SPHERE_RADIUS * (0.97 + random() * 0.06)
    positions.set([Math.cos(theta) * radius * r, y * r, Math.sin(theta) * radius * r], i * 3)
    seeds[i] = random()
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  return geometry
}

/** Short tick marks around a ring, like a gimbal's graduations. */
function buildTicks(radius: number) {
  const points: number[] = []
  for (let i = 0; i < 72; i++) {
    const angle = (i / 72) * Math.PI * 2
    const inner = radius - (i % 6 === 0 ? 0.16 : 0.07)
    points.push(Math.cos(angle) * inner, Math.sin(angle) * inner, 0, Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

/**
 * Identity core (Origin deck): a breathing biometric sphere of particles,
 * wrapped in three gimbal rings that carry the dossier's key stats.
 */
export function IdentityCore({ points }: { points: number }) {
  const anchorRef = useDeckAnchor('origin')
  const rig = useRef<THREE.Group>(null)
  const sphereMaterial = useRef<THREE.ShaderMaterial>(null)
  const glowMaterial = useRef<THREE.ShaderMaterial>(null)
  const spinners = useRef<(THREE.Group | null)[]>([])
  const ringMaterials = useRef<(THREE.Material | null)[]>([])
  const labels = useRef<(THREE.Sprite | null)[]>([])
  const assemble = useRef(0)

  const sphereGeometry = useMemo(() => buildSphere(points), [points])
  const tickGeometries = useMemo(() => RINGS.map((ring) => buildTicks(ring.radius)), [])
  const sphereUniforms = useMemo(() => ({ uTime: { value: 0 }, uAssemble: { value: 0 }, uScan: { value: 0 }, uPixelRatio: { value: 1 }, uDim: { value: 1 } }), [])
  const glowUniforms = useMemo(() => ({ uDim: { value: 1 } }), [])

  const stats = useMemo(() => dossier.stats.slice(0, 4).map((stat, index) => ({
    texture: makeLabelTexture([
      { text: stat.value, size: 78, color: index % 2 ? '#a17eff' : '#7ef4db', weight: 500, gap: 4 },
      { text: stat.label.toUpperCase(), size: 40, color: '#cdd8db', mono: true, tracking: 1 },
    ], 768, 192, 10),
  })), [])

  useEffect(() => () => stats.forEach((stat) => stat.texture.dispose()), [stats])

  useFrame(({ clock, gl, size }, delta) => {
    if (!anchorRef.current) return
    const visible = deckInView('origin')
    anchorRef.current.visible = visible
    if (!visible) {
      assemble.current = 0
      return
    }
    const { deck, reducedMotion } = useVessel.getState()
    const time = reducedMotion ? 0 : clock.elapsedTime
    const narrow = size.width < size.height
    rig.current?.position.set(narrow ? 0 : 4.3, narrow ? 2.6 : 0.3, -2)
    rig.current?.scale.setScalar(narrow ? 0.55 : 1)
    const dim = scrollDim(0.35) * (narrow ? 0.45 : 1)

    // Assemble outward once we've arrived on the deck.
    if (deck === 'origin' && motion.flightProgress >= 0.85) {
      assemble.current = reducedMotion ? 1 : Math.min(1, assemble.current + delta / 1.6)
    }
    const eased = 1 - Math.pow(1 - assemble.current, 3)

    const u = sphereMaterial.current?.uniforms
    if (u) {
      u.uTime.value = time
      u.uAssemble.value = eased
      u.uScan.value = Math.sin(time * 0.6) * SPHERE_RADIUS
      u.uPixelRatio.value = gl.getPixelRatio()
      u.uDim.value = dim
    }
    if (glowMaterial.current) glowMaterial.current.uniforms.uDim.value = dim * eased

    spinners.current.forEach((spinner, index) => {
      if (!spinner) return
      spinner.rotation.z = time * RINGS[index].speed
      spinner.scale.setScalar(0.6 + 0.4 * eased)
    })
    // Phones are too narrow for the stat callouts: the core stays as a backdrop.
    const callouts = narrow ? 0 : 1
    ringMaterials.current.forEach((material, index) => {
      if (material) material.opacity = 0.55 * dim * eased * (index >= RINGS.length * 2 ? callouts : 1)
    })
    labels.current.forEach((label) => {
      if (label) (label.material as THREE.SpriteMaterial).opacity = dim * callouts * THREE.MathUtils.smoothstep(assemble.current, 0.5, 1)
    })
  })

  return (
    <group ref={anchorRef}>
      <group ref={rig}>
        <mesh position={[0, 0, -0.2]}>
          <planeGeometry args={[6, 6]} />
          <shaderMaterial ref={glowMaterial} vertexShader={glowVertex} fragmentShader={glowFragment} uniforms={glowUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <points geometry={sphereGeometry} frustumCulled={false}>
          <shaderMaterial ref={sphereMaterial} vertexShader={sphereVertex} fragmentShader={sphereFragment} uniforms={sphereUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>

        {RINGS.map((ring, index) => (
          <group key={ring.radius} rotation={[ring.tilt[0], ring.tilt[1], ring.tilt[2]]}>
            <group ref={(group) => { spinners.current[index] = group }}>
              <mesh>
                <torusGeometry args={[ring.radius, 0.012, 6, 220]} />
                <meshBasicMaterial ref={(material) => { ringMaterials.current[index * 2] = material }} color={ring.color} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
              </mesh>
              <lineSegments geometry={tickGeometries[index]}>
                <lineBasicMaterial ref={(material) => { ringMaterials.current[index * 2 + 1] = material }} color={ring.color} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
              </lineSegments>
            </group>
          </group>
        ))}

        {stats.map((stat, index) => (
          <group key={index} position={[CALLOUT_X, CALLOUT_ROWS[index], 0]}>
            <sprite ref={(sprite) => { labels.current[index] = sprite }} position={[1.45, 0, 0]} scale={[3.3, 0.825, 1]}>
              <spriteMaterial map={stat.texture} transparent depthWrite={false} opacity={0} />
            </sprite>
            <mesh position={[-0.35, 0, 0]}>
              <planeGeometry args={[0.5, 0.012]} />
              <meshBasicMaterial ref={(material) => { ringMaterials.current[RINGS.length * 2 + index] = material }} color="#7ef4db" transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
