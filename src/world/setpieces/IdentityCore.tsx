import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '../random'
import { BACKDROP_FLOOR, deckInView, motion, scrollDim, useVessel } from '../store'
import { useDeckAnchor } from './useDeckAnchor'

const SPHERE_RADIUS = 1.9
/** Fingertip size in world units (before the rig's scale). */
const PRINT_WIDTH = 3.3
const PRINT_HEIGHT = 4.3
/** Scanner frame (corner brackets) around the print. */
const FRAME = { x: 2.25, y: 2.75, arm: 0.55 }

// Identity scan: points start as a breathing sphere, then flow into the ridges
// of a fingerprint. Light drifts along the ridges, a scan beam lights the rows
// it passes, and now and then the hologram glitches sideways by rows.
const printVertex = /* glsl */ `
  uniform float uTime;
  uniform float uAppear;
  uniform float uMorph;
  uniform float uScan;
  uniform float uGlitch;
  uniform float uPixelRatio;
  uniform float uDim;
  attribute vec3 aTarget;
  attribute float aShade;
  attribute float aPhase;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  void main() {
    vec3 dir = normalize(position);
    float breathe = 1.0 + 0.04 * sin(uTime * 1.3 + dir.y * 5.0 + aSeed * 6.0);
    vec3 sphere = position * breathe * uAppear;
    // Each point leaves a little late or early, so the print resolves in a wave.
    float t = clamp(uMorph * 1.35 - aSeed * 0.35, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(sphere, aTarget, t);
    float row = floor(aTarget.y * 14.0);
    p.x += uGlitch * (hash(row + floor(uTime * 24.0)) - 0.5) * 0.3 * t;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.1 + aShade * 1.3 + aSeed * 0.5) * uPixelRatio * (14.0 / max(-mv.z, 0.5));

    // Light travelling along each ridge, plus the scan band.
    float flow = 0.5 + 0.5 * sin(uTime * 1.4 - aPhase * 14.0);
    float scan = smoothstep(0.32, 0.0, abs(p.y - uScan));
    vec3 violet = vec3(0.63, 0.49, 1.0);
    vec3 cyan = vec3(0.49, 0.96, 0.86);
    vec3 base = mix(violet, cyan, mix(0.6, aShade, t));
    vColor = base * (0.7 + scan * 1.0 + flow * 0.25 * t);
    float shown = mix(0.6, 0.35 + aShade * 0.45 + flow * 0.25, t);
    vAlpha = (shown + scan * 0.45) * uDim * smoothstep(0.0, 0.3, uAppear);
  }
`

const printFragment = /* glsl */ `
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

// A soft oval glow behind the print, like the lit glass of a reader.
const glowFragment = /* glsl */ `
  uniform float uDim;
  varying vec2 vUv;
  void main() {
    vec2 q = (vUv - 0.5) * vec2(2.0 * 0.8, 2.0);
    float d = length(q);
    gl_FragColor = vec4(vec3(0.49, 0.96, 0.86), pow(max(0.0, 1.0 - d), 2.2) * 0.16 * uDim);
  }
`

/**
 * A procedural fingerprint: a whorl of distorted, slightly off-centre loops
 * clipped to a fingertip oval, with short breaks where ridges end or fork.
 * Each point gets a phase along its ridge (for the travelling light) and a
 * gentle dome so it reads as a lit pad, not a flat drawing.
 */
function buildFingerprint(count: number) {
  const random = mulberry32(2604)
  const ridges = 34
  const targets = new Float32Array(count * 3)
  const shades = new Float32Array(count)
  const phases = new Float32Array(count)
  // Ridge breaks: a few random gaps on each ridge.
  const breaks = Array.from({ length: ridges }, () => Array.from({ length: 3 }, () => [random() * Math.PI * 2, 0.04 + random() * 0.09] as const))

  let i = 0
  let guard = 0
  while (i < count && guard < count * 20) {
    guard += 1
    // Outer ridges are longer, so they get proportionally more points.
    const ridge = Math.floor(Math.sqrt(random()) * ridges) + 1
    const a = ridge / ridges
    const theta = random() * Math.PI * 2
    if (breaks[ridge - 1].some(([at, width]) => Math.abs(((theta - at + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < width)) continue

    // Whorl: loops drift down and left as they grow, and wobble a little.
    const wobble = 1 + 0.07 * Math.sin(3 * theta + ridge * 0.45) + 0.04 * Math.sin(5 * theta - ridge * 0.3)
    const r = a * 1.25 * wobble
    const x = Math.cos(theta) * r * 0.82 - 0.08 * a
    const y = Math.sin(theta) * r - 0.18 * a + 0.12
    // Fingertip outline: an oval, slightly narrower at the top.
    const ox = x / (0.86 - 0.06 * Math.max(0, y))
    const oy = y / 1.08
    if (ox * ox + oy * oy > 1) continue

    const px = x * (PRINT_WIDTH / 1.72)
    const py = y * (PRINT_HEIGHT / 2.16)
    const dome = 0.45 * Math.max(0, 1 - (ox * ox + oy * oy))
    targets.set([px + (random() - 0.5) * 0.02, py + (random() - 0.5) * 0.02, dome], i * 3)
    // Brighter towards the core, with a little grain.
    shades[i] = Math.min(1, 0.45 + (1 - a) * 0.4 + random() * 0.25)
    phases[i] = theta / (Math.PI * 2) + ridge * 0.11
    i += 1
  }
  return { targets, shades, phases, filled: i }
}

/** Sphere start positions (Fibonacci lattice) plus the fingerprint as targets. */
function buildGeometry(count: number) {
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
  const print = buildFingerprint(count)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(print.targets, 3))
  geometry.setAttribute('aShade', new THREE.BufferAttribute(print.shades, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(print.phases, 1))
  geometry.setDrawRange(0, print.filled)
  return geometry
}

/** The scanner's four corner brackets. */
function buildFrame() {
  const { x, y, arm } = FRAME
  const corners: [number, number, number, number][] = [[-x, y, 1, -1], [x, y, -1, -1], [x, -y, -1, 1], [-x, -y, 1, 1]]
  const points: number[] = []
  for (const [cx, cy, sx, sy] of corners) {
    points.push(cx, cy, 0, cx + sx * arm, cy, 0, cx, cy, 0, cx, cy + sy * arm, 0)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

/**
 * Identity core (Origin deck): a particle sphere that resolves into a
 * holographic fingerprint on arrival ("identity verified"): the pilot's
 * identity, and the touch the dossier talks about. Light drifts along the
 * ridges, a scan beam sweeps it, and a match pulse ripples out now and then.
 * It faces forward and holds still.
 */
export function IdentityCore({ points }: { points: number }) {
  const anchorRef = useDeckAnchor('origin')
  const rig = useRef<THREE.Group>(null)
  const printMaterial = useRef<THREE.ShaderMaterial>(null)
  const glowMaterial = useRef<THREE.ShaderMaterial>(null)
  const frameMaterial = useRef<THREE.LineBasicMaterial>(null)
  const pulse = useRef<THREE.Mesh>(null)
  const pulseMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const assemble = useRef(0)
  const glitch = useRef({ until: 0, next: 4 })

  const geometry = useMemo(() => buildGeometry(points), [points])
  const frameGeometry = useMemo(() => buildFrame(), [])
  const printUniforms = useMemo(() => ({
    uTime: { value: 0 }, uAppear: { value: 0 }, uMorph: { value: 0 }, uScan: { value: 0 },
    uGlitch: { value: 0 }, uPixelRatio: { value: 1 }, uDim: { value: 1 },
  }), [])
  const glowUniforms = useMemo(() => ({ uDim: { value: 1 } }), [])

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
    // Wide screens: large and to the right, beside the title.
    // It stays parallel to the screen (the anchor already faces the camera),
    // so the print and its frame never skew, and it never follows the mouse.
    rig.current?.position.set(narrow ? 0 : 6.2, narrow ? 2.6 : 0.2, -2)
    rig.current?.scale.setScalar(narrow ? 0.55 : 1.05)
    // A fixed backdrop: settles to half brightness as the dossier scrolls over it.
    const dim = scrollDim(BACKDROP_FLOOR) * (narrow ? 0.45 : 1)

    // Arrival: the sphere appears, then flows into the fingerprint.
    if (deck === 'origin' && motion.flightProgress >= 0.85) {
      assemble.current = reducedMotion ? 1 : Math.min(1, assemble.current + delta / 3.2)
    }
    const appear = THREE.MathUtils.smoothstep(assemble.current, 0, 0.3)
    const morph = THREE.MathUtils.smoothstep(assemble.current, 0.35, 1)

    // Now and then the hologram flickers sideways for a split second.
    if (!reducedMotion && clock.elapsedTime > glitch.current.next) {
      glitch.current = { until: clock.elapsedTime + 0.14, next: clock.elapsedTime + 6 + Math.random() * 6 }
    }
    const glitching = !reducedMotion && clock.elapsedTime < glitch.current.until

    const u = printMaterial.current?.uniforms
    if (u) {
      u.uTime.value = time
      u.uAppear.value = appear
      u.uMorph.value = morph
      u.uScan.value = Math.sin(time * 0.5) * (PRINT_HEIGHT * 0.52)
      u.uGlitch.value = glitching ? 1 : 0
      u.uPixelRatio.value = gl.getPixelRatio()
      u.uDim.value = dim
    }
    if (glowMaterial.current) glowMaterial.current.uniforms.uDim.value = dim * morph
    if (frameMaterial.current) frameMaterial.current.opacity = 0.6 * dim * morph

    // Match pulse: a ring that ripples out from the core every few seconds.
    const cycle = reducedMotion ? 1 : (time % 4.5) / 4.5
    if (pulse.current) pulse.current.scale.setScalar(0.2 + cycle * 2.4)
    if (pulseMaterial.current) pulseMaterial.current.opacity = (1 - cycle) * 0.45 * dim * morph * (reducedMotion ? 0 : 1)
  })

  return (
    <group ref={anchorRef}>
      <group ref={rig}>
        <mesh position={[0, 0, -0.4]}>
          <planeGeometry args={[5.6, 6]} />
          <shaderMaterial ref={glowMaterial} vertexShader={glowVertex} fragmentShader={glowFragment} uniforms={glowUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <points geometry={geometry} frustumCulled={false}>
          <shaderMaterial ref={printMaterial} vertexShader={printVertex} fragmentShader={printFragment} uniforms={printUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        <mesh ref={pulse} position={[-0.12, 0.3, 0.2]}>
          <torusGeometry args={[1, 0.01, 6, 160]} />
          <meshBasicMaterial ref={pulseMaterial} color="#7ef4db" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <lineSegments geometry={frameGeometry}>
          <lineBasicMaterial ref={frameMaterial} color="#7ef4db" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
      </group>
    </group>
  )
}
