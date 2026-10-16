import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { skills } from '../../content/portfolio'
import { deckById } from '../decks'
import { mulberry32 } from '../random'
import { BACKDROP_FLOOR, deckInView, scrollDim, useVessel } from '../store'
import { makeLabelTexture } from './labels'

const GLOBE_CENTER = new THREE.Vector3(4.2, 0.3, -3)
const GLOBE_RADIUS = 6.5
const CATEGORY_COUNT = skills.length
const FACING = new THREE.Vector3(-0.18, 0.08, 1).normalize()

const starsVertex = /* glsl */ `
  uniform float uActive;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uDim;
  attribute float aCategory;
  attribute float aSeed;
  varying float vAlpha;
  varying float vActive;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float isActive = uActive < 0.0 ? 0.6 : 1.0 - step(0.5, abs(aCategory - uActive));
    vActive = isActive;
    float twinkle = 0.75 + 0.25 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 50.0);
    gl_PointSize = mix(4.0, 9.0, isActive) * (0.8 + aSeed * 0.5) * uPixelRatio * (18.0 / -mv.z);
    vAlpha = mix(0.35, 1.0, isActive) * twinkle * uDim;
  }
`

const starsFragment = /* glsl */ `
  varying float vAlpha;
  varying float vActive;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float halo = smoothstep(0.5, 0.15, d) * 0.4;
    vec3 color = mix(vec3(0.75, 0.85, 1.0), vec3(0.6, 1.0, 0.92), vActive);
    gl_FragColor = vec4(color * 1.6, (core * core + halo) * vAlpha);
  }
`

// Lines draw in along each constellation: a fragment is shown only once the
// category's draw progress has passed its position along the figure.
const linesVertex = /* glsl */ `
  attribute float aCategory;
  attribute float aOrder;
  varying float vCategory;
  varying float vOrder;
  void main() {
    vCategory = aCategory;
    vOrder = aOrder;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const linesFragment = /* glsl */ `
  uniform float uDraw[${CATEGORY_COUNT}];
  uniform float uDim;
  varying float vCategory;
  varying float vOrder;
  void main() {
    float draw = 0.0;
    for (int i = 0; i < ${CATEGORY_COUNT}; i++) {
      if (abs(float(i) - vCategory) < 0.5) draw = uDraw[i];
    }
    if (vOrder > draw) discard;
    gl_FragColor = vec4(vec3(0.49, 0.96, 0.86), (0.25 + 0.55 * draw) * uDim);
  }
`

/** Evenly spread directions on a sphere (Fibonacci lattice). */
function fibonacciDirection(index: number, count: number) {
  const y = 1 - ((index + 0.5) / count) * 2
  const radius = Math.sqrt(1 - y * y)
  const theta = index * Math.PI * (3 - Math.sqrt(5))
  return new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius)
}

function buildConstellations() {
  const random = mulberry32(4242)
  const positions: number[] = []
  const categories: number[] = []
  const seeds: number[] = []
  const linePositions: number[] = []
  const lineCategories: number[] = []
  const lineOrders: number[] = []
  const centres: THREE.Vector3[] = []

  skills.forEach((skill, category) => {
    const direction = fibonacciDirection(category, CATEGORY_COUNT)
    centres.push(direction.clone())
    const tangent = new THREE.Vector3(0, 1, 0).cross(direction).normalize()
    if (tangent.lengthSq() < 0.01) tangent.set(1, 0, 0)
    const bitangent = direction.clone().cross(tangent).normalize()

    // Scatter one star per tool around the direction, then order them by angle
    // so the connecting line reads as a figure rather than a scribble.
    const stars = skill.tags.map(() => {
      const angle = random() * Math.PI * 2
      const spread = 0.12 + random() * 0.3
      return {
        angle,
        point: direction.clone()
          .addScaledVector(tangent, Math.cos(angle) * spread)
          .addScaledVector(bitangent, Math.sin(angle) * spread)
          .normalize()
          .multiplyScalar(GLOBE_RADIUS),
      }
    }).sort((a, b) => a.angle - b.angle)

    stars.forEach(({ point }) => {
      positions.push(point.x, point.y, point.z)
      categories.push(category)
      seeds.push(random())
    })
    for (let i = 0; i < stars.length - 1; i++) {
      const a = stars[i].point
      const b = stars[i + 1].point
      linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z)
      lineCategories.push(category, category)
      lineOrders.push(i / (stars.length - 1), (i + 1) / (stars.length - 1))
    }
  })

  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  starGeometry.setAttribute('aCategory', new THREE.Float32BufferAttribute(categories, 1))
  starGeometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1))

  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
  lineGeometry.setAttribute('aCategory', new THREE.Float32BufferAttribute(lineCategories, 1))
  lineGeometry.setAttribute('aOrder', new THREE.Float32BufferAttribute(lineOrders, 1))

  return { starGeometry, lineGeometry, centres }
}

/** Latitude/longitude wireframe for the celestial globe. */
function buildGrid() {
  const points: number[] = []
  const segments = 64
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = Math.sin(THREE.MathUtils.degToRad(lat)) * GLOBE_RADIUS * 1.02
    const r = Math.cos(THREE.MathUtils.degToRad(lat)) * GLOBE_RADIUS * 1.02
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2
      const b = ((i + 1) / segments) * Math.PI * 2
      points.push(Math.cos(a) * r, y, Math.sin(a) * r, Math.cos(b) * r, y, Math.sin(b) * r)
    }
  }
  for (let lon = 0; lon < 180; lon += 30) {
    const phi = THREE.MathUtils.degToRad(lon)
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2
      const b = ((i + 1) / segments) * Math.PI * 2
      const r = GLOBE_RADIUS * 1.02
      points.push(
        Math.cos(a) * Math.cos(phi) * r, Math.sin(a) * r, Math.cos(a) * Math.sin(phi) * r,
        Math.cos(b) * Math.cos(phi) * r, Math.sin(b) * r, Math.cos(b) * Math.sin(phi) * r,
      )
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

const targetRotation = new THREE.Quaternion()
const idleSpin = new THREE.Quaternion()
const yAxis = new THREE.Vector3(0, 1, 0)

/**
 * The Star map (Arsenal deck): each skill domain is a constellation with one
 * star per tool. The selected domain turns to face the viewer and draws in.
 */
export function StarMap() {
  const deck = deckById('arsenal')
  const anchor = useRef<THREE.Group>(null)
  const globe = useRef<THREE.Group>(null)
  const starsMaterial = useRef<THREE.ShaderMaterial>(null)
  const linesMaterial = useRef<THREE.ShaderMaterial>(null)
  const labels = useRef<(THREE.Sprite | null)[]>([])
  const draw = useRef(new Array(CATEGORY_COUNT).fill(0) as number[])
  const spin = useRef(0)

  const { starGeometry, lineGeometry, centres } = useMemo(() => buildConstellations(), [])
  const gridGeometry = useMemo(() => buildGrid(), [])
  const labelTextures = useMemo(() => skills.map((skill, index) => makeLabelTexture([
    { text: `DOMAIN / ${String(index + 1).padStart(2, '0')}`, size: 22, color: '#7ef4db', mono: true, tracking: 3, gap: 8 },
    { text: skill.name, size: 44, color: '#eef8f9', weight: 500 },
  ], 640, 128, 12)), [])

  useEffect(() => () => labelTextures.forEach((texture) => texture.dispose()), [labelTextures])

  const starsUniforms = useMemo(() => ({ uActive: { value: 0 }, uTime: { value: 0 }, uPixelRatio: { value: 1 }, uDim: { value: 1 } }), [])
  const linesUniforms = useMemo(() => ({ uDraw: { value: new Array(CATEGORY_COUNT).fill(0) }, uDim: { value: 1 } }), [])
  const gridMaterial = useRef<THREE.LineBasicMaterial>(null)

  useEffect(() => {
    anchor.current?.position.set(...deck.target)
    anchor.current?.lookAt(...deck.camera)
  }, [deck])

  useFrame(({ clock, gl, size }, delta) => {
    if (!anchor.current) return
    anchor.current.visible = deckInView('arsenal')
    if (!anchor.current.visible) return
    // Portrait screens: centre the globe, smaller.
    const narrow = size.width < size.height
    if (globe.current) {
      // Wide screens: smaller and further right. A fixed backdrop: it stays in
      // place while the atlas scrolls over it.
      globe.current.position.set(narrow ? 0 : 6.4, narrow ? 2 : 0.9, narrow ? -6 : GLOBE_CENTER.z)
      globe.current.scale.setScalar(narrow ? 0.72 : 0.74)
    }
    const dim = scrollDim(BACKDROP_FLOOR) * (narrow ? 0.75 : 1)
    const { activeSkill, reducedMotion } = useVessel.getState()
    const active = skills.findIndex((skill) => skill.category === activeSkill)

    // Turn the globe so the active constellation faces the viewer; with "all"
    // selected it idles in a slow spin instead.
    if (globe.current) {
      if (active >= 0) {
        targetRotation.setFromUnitVectors(centres[active], FACING)
        // A gentle sway around the viewing axis keeps a parked globe alive.
        if (!reducedMotion) targetRotation.premultiply(idleSpin.setFromAxisAngle(FACING, Math.sin(clock.elapsedTime * 0.25) * 0.08))
      } else {
        if (!reducedMotion) spin.current += delta * 0.08
        targetRotation.setFromAxisAngle(yAxis, spin.current)
      }
      globe.current.quaternion.slerp(targetRotation, reducedMotion ? 1 : 1 - Math.exp(-delta * 2.4))
    }

    for (let i = 0; i < CATEGORY_COUNT; i++) {
      const goal = active < 0 ? 1 : i === active ? 1 : 0
      const speed = goal > draw.current[i] ? 0.9 : 3
      draw.current[i] = reducedMotion ? goal : THREE.MathUtils.clamp(draw.current[i] + Math.sign(goal - draw.current[i]) * delta * speed, 0, 1)
      const label = labels.current[i]
      if (label) {
        const material = label.material as THREE.SpriteMaterial
        // Only the selected domain is labelled, so names never pile onto the page copy.
        material.opacity = (active < 0 ? 0.35 : i === active ? 1 : 0) * dim
      }
    }
    if (linesMaterial.current) {
      linesMaterial.current.uniforms.uDraw.value = draw.current
      linesMaterial.current.uniforms.uDim.value = dim
    }
    if (gridMaterial.current) gridMaterial.current.opacity = 0.07 * dim
    if (starsMaterial.current) {
      starsMaterial.current.uniforms.uActive.value = active
      starsMaterial.current.uniforms.uTime.value = clock.elapsedTime
      starsMaterial.current.uniforms.uPixelRatio.value = gl.getPixelRatio()
      starsMaterial.current.uniforms.uDim.value = dim
    }
  })

  return (
    <group ref={anchor}>
      <group ref={globe} position={GLOBE_CENTER}>
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial ref={gridMaterial} color="#83b7ff" transparent opacity={0.07} depthWrite={false} />
        </lineSegments>
        <lineSegments geometry={lineGeometry}>
          <shaderMaterial ref={linesMaterial} vertexShader={linesVertex} fragmentShader={linesFragment} uniforms={linesUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
        <points geometry={starGeometry}>
          <shaderMaterial ref={starsMaterial} vertexShader={starsVertex} fragmentShader={starsFragment} uniforms={starsUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        {labelTextures.map((texture, index) => {
          const position = centres[index].clone().multiplyScalar(GLOBE_RADIUS * 1.18)
          return (
            <sprite key={skills[index].id} ref={(sprite) => { labels.current[index] = sprite }} position={position} scale={[3.2, 0.64, 1]}>
              <spriteMaterial map={texture} transparent depthWrite={false} opacity={0.5} />
            </sprite>
          )
        })}
      </group>
    </group>
  )
}
