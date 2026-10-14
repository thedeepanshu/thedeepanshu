import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { milestones } from '../../content/portfolio'
import { deckById } from '../decks'
import { deckInView, motion, useVessel } from '../store'
import { makeLabelTexture } from './labels'

type Stop = {
  id: string
  when: string
  title: string
  radius: number
  colors: [string, string]
  ring?: boolean
  moons?: string[]
  inProgress?: boolean
}

/** Career stops in chronological order. Ids match `milestones` in content. */
const STOPS: Stop[] = [
  { id: 'secondary-school-ibl', when: '2016', title: 'Secondary school', radius: 0.8, colors: ['#83b7ff', '#16233d'] },
  { id: 'diploma-cse-gp-sonepat', when: '2019', title: 'Diploma, CSE', radius: 1.05, colors: ['#7ef4db', '#0f2a2c'] },
  { id: 'anrx-solutions-frontend-developer', when: '2021 – 2026', title: 'ANRX Solutions', radius: 2.3, colors: ['#7ef4db', '#123a40'], ring: true, moons: ['#7ef4db', '#a17eff'] },
  { id: 'canadian-business-website', when: '2026', title: 'Alec EV & Hybrid', radius: 1.35, colors: ['#a17eff', '#21183f'] },
  { id: 'portfolio-in-progress', when: '2026', title: 'The Vessel', radius: 1.2, colors: ['#83b7ff', '#2a1d4a'] },
  { id: 'btech-cse-pkg', when: 'Ongoing', title: 'B.Tech, CSE', radius: 1.1, colors: ['#7ef4db', '#16233d'], inProgress: true },
]

const ROUTE = STOPS.filter((stop) => milestones.some((milestone) => milestone.id === stop.id))

const DEFAULT_STOP = Math.max(0, ROUTE.findIndex((stop) => stop.id === 'anrx-solutions-frontend-developer'))
const UP = new THREE.Vector3(0, 1, 0)

const planetVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vObject;
  void main() {
    vObject = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Banded gas-giant surface lit from the upper left, with a fresnel rim in the
// planet's accent colour that brightens when the stop is active.
const planetFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uActive;
  uniform float uTime;
  uniform float uRadius;
  varying vec3 vNormal;
  varying vec3 vObject;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vec3 p = vObject / uRadius;
    float warp = noise(p * 3.0 + vec3(uTime * 0.05, 0.0, 0.0));
    float bands = 0.5 + 0.5 * sin(p.y * 9.0 + warp * 4.0);
    vec3 surface = mix(uColorB, uColorA * 0.55, bands * 0.6 + noise(p * 6.0) * 0.25);
    float light = clamp(dot(normalize(vNormal), normalize(vec3(-0.5, 0.6, 0.6))), 0.0, 1.0) * 0.75 + 0.25;
    float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 2.6);
    vec3 color = surface * light * mix(0.55, 1.0, uActive) + uColorA * fresnel * (0.6 + uActive * 1.4);
    gl_FragColor = vec4(color, 1.0);
  }
`

const routeVertex = /* glsl */ `
  attribute float aU;
  varying float vU;
  void main() {
    vU = aU;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Animated dashes; the stretch already flown is brighter than what's ahead.
const routeFragment = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  varying float vU;
  void main() {
    float dash = step(0.45, fract(vU * 90.0 - uTime * 0.8));
    float flown = step(vU, uProgress);
    gl_FragColor = vec4(mix(vec3(0.51, 0.72, 1.0), vec3(0.49, 0.96, 0.86), flown), dash * mix(0.22, 0.75, flown));
  }
`

/**
 * A ring of dots for an "in progress" orbit. Positions only: with a uv
 * attribute, points sample one texel and lose their round sprite.
 */
function orbitDots(radius: number, count = 48) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = Math.sin(angle) * radius
  }
  return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3))
}

const point = new THREE.Vector3()
const tangent = new THREE.Vector3()
const side = new THREE.Vector3()

/**
 * The Flight path (Journey deck): one planet per milestone along a route. The
 * camera follows the route to whichever milestone the page is showing.
 */
export function FlightPath() {
  const deck = deckById('journey')
  const travel = useRef(DEFAULT_STOP)
  const planets = useRef<(THREE.Mesh | null)[]>([])
  const moons = useRef<(THREE.Mesh | null)[]>([])
  const root = useRef<THREE.Group>(null)
  const routeLine = useRef<THREE.Line<THREE.BufferGeometry, THREE.ShaderMaterial>>(null)

  // Lay the stops out along the deck's viewing direction, weaving gently.
  const { curve, positions } = useMemo(() => {
    const target = new THREE.Vector3(...deck.target)
    const forward = target.clone().sub(new THREE.Vector3(...deck.camera)).normalize()
    const right = forward.clone().cross(UP).normalize()
    const points = ROUTE.map((_, index) => target.clone()
      .addScaledVector(forward, (index - DEFAULT_STOP) * 18)
      .addScaledVector(right, Math.sin(index * 1.7) * 6)
      .addScaledVector(UP, Math.cos(index * 1.1) * 3.5))
    return { curve: new THREE.CatmullRomCurve3(points, false, 'centripetal'), positions: points }
  }, [deck])

  const route = useMemo(() => {
    const samples = 400
    const points = curve.getPoints(samples)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.setAttribute('aU', new THREE.Float32BufferAttribute(points.map((_, i) => i / samples), 1))
    const material = new THREE.ShaderMaterial({
      vertexShader: routeVertex,
      fragmentShader: routeFragment,
      uniforms: { uTime: { value: 0 }, uProgress: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return new THREE.Line(geometry, material)
  }, [curve])

  const planetUniforms = useMemo(() => ROUTE.map((stop) => ({
    uColorA: { value: new THREE.Color(stop.colors[0]) },
    uColorB: { value: new THREE.Color(stop.colors[1]) },
    uActive: { value: 0 },
    uTime: { value: 0 },
    uRadius: { value: stop.radius },
  })), [])

  const orbitGeometries = useMemo(() => ROUTE.map((stop) => (stop.inProgress ? orbitDots(stop.radius * 1.9) : null)), [])
  const dotTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(16, 16, 14, 0, Math.PI * 2)
      ctx.fill()
    }
    return new THREE.CanvasTexture(canvas)
  }, [])
  const labelTextures = useMemo(() => ROUTE.map((stop) => makeLabelTexture([
    { text: stop.when.toUpperCase(), size: 24, color: '#7ef4db', mono: true, tracking: 3, gap: 6 },
    { text: stop.title, size: 46, color: '#eef8f9', weight: 500 },
  ], 640, 128, 12)), [])
  useEffect(() => () => labelTextures.forEach((texture) => texture.dispose()), [labelTextures])

  // Claim the camera while this set piece exists.
  useEffect(() => {
    motion.director.deck = 'journey'
    return () => { motion.director.deck = null }
  }, [])

  useFrame(({ clock, size }, delta) => {
    if (root.current) root.current.visible = deckInView('journey')
    const time = clock.elapsedTime
    const { activeMilestone, reducedMotion } = useVessel.getState()
    const found = ROUTE.findIndex((stop) => stop.id === activeMilestone)
    const goal = found >= 0 ? found : DEFAULT_STOP
    travel.current = reducedMotion ? goal : THREE.MathUtils.damp(travel.current, goal, 1.4, delta)

    // Camera sits behind and left of the current point on the route, looking
    // slightly left of it so the planet lands on the right of the screen.
    const u = ROUTE.length > 1 ? travel.current / (ROUTE.length - 1) : 0
    curve.getPoint(u, point)
    curve.getTangent(u, tangent)
    side.copy(tangent).cross(UP).normalize()
    const radius = ROUTE[Math.round(travel.current)]?.radius ?? 1.5
    // Portrait screens are narrow, so frame the planet from above rather than
    // from far behind (which would back the camera into the previous stop).
    const narrow = size.width < size.height
    const distance = narrow ? 8 + radius * 1.5 : 9 + radius * 2.2
    const lift = narrow ? 9 + radius * 4 : 2.2
    const shift = narrow ? 0 : 3 + radius
    const offset = narrow ? 0 : 4
    motion.director.position.x = point.x - tangent.x * distance - side.x * offset
    motion.director.position.y = point.y - tangent.y * distance + lift
    motion.director.position.z = point.z - tangent.z * distance - side.z * offset
    motion.director.target.x = point.x - side.x * shift
    motion.director.target.y = point.y
    motion.director.target.z = point.z - side.z * shift

    planets.current.forEach((mesh, index) => {
      if (!mesh) return
      const material = mesh.material as THREE.ShaderMaterial
      const activeness = 1 - Math.min(1, Math.abs(travel.current - index))
      material.uniforms.uActive.value = activeness
      material.uniforms.uTime.value = time
      mesh.rotation.y = time * 0.08 + index
    })

    moons.current.forEach((mesh, index) => {
      if (!mesh) return
      const anrx = positions[DEFAULT_STOP]
      const angle = time * (0.35 + index * 0.18) + index * Math.PI
      const orbit = ROUTE[DEFAULT_STOP].radius + 1.4 + index * 0.9
      mesh.position.set(anrx.x + Math.cos(angle) * orbit, anrx.y + Math.sin(angle) * orbit * 0.25, anrx.z + Math.sin(angle) * orbit)
    })

    const routeUniforms = routeLine.current?.material.uniforms
    if (routeUniforms) {
      routeUniforms.uTime.value = time
      routeUniforms.uProgress.value = u
    }
  })

  return (
    <group ref={root}>
      <primitive ref={routeLine} object={route} />

      {ROUTE.map((stop, index) => (
        <group key={stop.id} position={positions[index]}>
          <mesh ref={(mesh) => { planets.current[index] = mesh }}>
            <sphereGeometry args={[stop.radius, 48, 32]} />
            <shaderMaterial vertexShader={planetVertex} fragmentShader={planetFragment} uniforms={planetUniforms[index]} />
          </mesh>
          {stop.ring && (
            <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
              <ringGeometry args={[stop.radius * 1.45, stop.radius * 1.9, 96]} />
              <meshBasicMaterial color={stop.colors[0]} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          )}
          {stop.inProgress && (
            <points rotation={[Math.PI / 2.2, 0, 0]} geometry={orbitGeometries[index] ?? undefined}>
              <pointsMaterial color="#a17eff" size={0.16} map={dotTexture} alphaTest={0.4} transparent depthWrite={false} />
            </points>
          )}
          <sprite position={[0, stop.radius + 1.1, 0]} scale={[4.2, 0.84, 1]}>
            <spriteMaterial map={labelTextures[index]} transparent depthWrite={false} />
          </sprite>
        </group>
      ))}

      {(ROUTE[DEFAULT_STOP]?.moons ?? []).map((color, index) => (
        <mesh key={color} ref={(mesh) => { moons.current[index] = mesh }}>
          <sphereGeometry args={[0.32 - index * 0.06, 24, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}
