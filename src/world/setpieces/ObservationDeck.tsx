import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { memories } from '../../content/portfolio'
import { mulberry32 } from '../random'
import { deckInView, scrollDim, useVessel } from '../store'
import { planetFragment, planetVertex } from './planetShader'
import { useDeckAnchor } from './useDeckAnchor'

const PLANET_RADIUS = 13

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragment = /* glsl */ `
  uniform float uDim;
  varying vec3 vNormal;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 3.0);
    gl_FragColor = vec4(vec3(0.49, 0.85, 1.0), rim * 0.9 * uDim);
  }
`

// Glass shards: a faint tinted body with bright edges and a slow sheen.
const shardVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const shardFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGlow;
  uniform float uTime;
  uniform float uDim;
  varying vec2 vUv;
  void main() {
    float sheen = smoothstep(0.08, 0.0, abs(fract(vUv.x + vUv.y * 0.5 - uTime * 0.05) - 0.5));
    float body = 0.06 + 0.1 * vUv.y;
    gl_FragColor = vec4(uColor * (1.0 + uGlow), (body + sheen * 0.25) * (0.6 + uGlow * 1.4) * uDim);
  }
`

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uDim;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += mod(uTime * (0.05 + aSeed * 0.08) + aSeed * 20.0, 20.0) - 10.0;
    p.x += sin(uTime * 0.1 + aSeed * 40.0) * 0.4;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.0 + aSeed * 1.5) * uPixelRatio * (12.0 / -mv.z);
    vAlpha = (0.2 + aSeed * 0.5) * uDim;
  }
`

const dustFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(vec3(0.85, 0.95, 1.0), smoothstep(0.5, 0.0, d) * vAlpha);
  }
`

const SHARD_COLORS: Record<string, string> = { 'anime-art': '#a17eff', life: '#ffc48c', inspirations: '#7ef4db' }

/** An irregular, glassy polygon shard. */
function shardGeometry(random: () => number) {
  const shape = new THREE.Shape()
  const points = 5 + Math.floor(random() * 3)
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 + random() * 0.4
    const radius = 0.7 + random() * 0.5
    const x = Math.cos(angle) * radius * 0.75
    const y = Math.sin(angle) * radius
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  const geometry = new THREE.ShapeGeometry(shape)
  // Normalise UVs to 0–1 across the shard for the sheen.
  geometry.computeBoundingBox()
  const box = geometry.boundingBox as THREE.Box3
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) - box.min.x) / (box.max.x - box.min.x), (position.getY(i) - box.min.y) / (box.max.y - box.min.y))
  }
  return geometry
}

/**
 * Observation deck (Beyond): a slow, quiet view. A giant planet fills the
 * lower right, dust drifts, and each memory is a glass shard floating in the
 * window. The memory in view drifts forward and lights up.
 */
export function ObservationDeck() {
  const anchorRef = useDeckAnchor('beyond')
  const planet = useRef<THREE.Mesh>(null)
  const atmosphereMaterial = useRef<THREE.ShaderMaterial>(null)
  const dustMaterial = useRef<THREE.ShaderMaterial>(null)
  const shards = useRef<(THREE.Mesh | null)[]>([])

  const shardData = useMemo(() => {
    const random = mulberry32(808)
    return memories.map((memory, index) => {
      const column = index % 4
      const row = Math.floor(index / 4)
      return {
        id: memory.id,
        geometry: shardGeometry(random),
        home: new THREE.Vector3(5 + column * 1.9 + (random() - 0.5) * 0.7, 2.6 - row * 2.4 + (random() - 0.5) * 0.7, -1 - random() * 2.5),
        spin: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.3),
        phase: random() * Math.PI * 2,
        uniforms: {
          uColor: { value: new THREE.Color(SHARD_COLORS[memory.category] ?? '#7ef4db') },
          uGlow: { value: 0 },
          uTime: { value: 0 },
          uDim: { value: 1 },
        },
      }
    })
  }, [])

  const dustGeometry = useMemo(() => {
    const random = mulberry32(9)
    const count = 420
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions.set([(random() - 0.3) * 26, 0, -random() * 14], i * 3)
      seeds[i] = random()
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return geometry
  }, [])

  const planetUniforms = useMemo(() => ({
    uColorA: { value: new THREE.Color('#83b7ff') },
    uColorB: { value: new THREE.Color('#15203a') },
    uActive: { value: 0.25 },
    uTime: { value: 0 },
    uRadius: { value: PLANET_RADIUS },
  }), [])
  const atmosphereUniforms = useMemo(() => ({ uDim: { value: 1 } }), [])
  const dustUniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 }, uDim: { value: 1 } }), [])

  useFrame(({ clock, gl, size }, delta) => {
    if (!anchorRef.current) return
    anchorRef.current.visible = deckInView('beyond')
    if (!anchorRef.current.visible) return
    const { activeMemory, reducedMotion } = useVessel.getState()
    const time = reducedMotion ? 0 : clock.elapsedTime
    const narrow = size.width < size.height
    const dim = scrollDim(0.35) * (narrow ? 0.6 : 1)

    if (planet.current) {
      planet.current.position.set(narrow ? 6 : 15, narrow ? -24 : -15, narrow ? -46 : -34)
      planet.current.rotation.y = time * 0.01
      const material = planet.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = time
    }
    if (atmosphereMaterial.current) atmosphereMaterial.current.uniforms.uDim.value = dim

    shardData.forEach((shard, index) => {
      const mesh = shards.current[index]
      if (!mesh) return
      const isActive = shard.id === activeMemory
      const float = Math.sin(time * 0.4 + shard.phase) * 0.25
      const homeX = narrow ? (index % 3) * 1.6 - 1.6 : shard.home.x
      const homeY = narrow ? 3.4 - Math.floor(index / 3) * 2 : shard.home.y
      mesh.position.x = THREE.MathUtils.damp(mesh.position.x, homeX, 2, delta)
      mesh.position.y = THREE.MathUtils.damp(mesh.position.y, homeY + float, 2, delta)
      mesh.position.z = THREE.MathUtils.damp(mesh.position.z, isActive ? 2 : shard.home.z, 2, delta)
      if (!reducedMotion) {
        mesh.rotation.x += shard.spin.x * delta
        mesh.rotation.y += shard.spin.y * delta * (isActive ? 0.2 : 1)
      }
      const scale = THREE.MathUtils.damp(mesh.scale.x, (isActive ? 1.7 : 1.15) * (narrow ? 0.7 : 1), 3, delta)
      mesh.scale.setScalar(scale)
      shard.uniforms.uGlow.value = THREE.MathUtils.damp(shard.uniforms.uGlow.value, isActive ? 1 : 0, 3, delta)
      shard.uniforms.uTime.value = time + index
      shard.uniforms.uDim.value = dim
    })

    if (dustMaterial.current) {
      dustMaterial.current.uniforms.uTime.value = time
      dustMaterial.current.uniforms.uPixelRatio.value = gl.getPixelRatio()
      dustMaterial.current.uniforms.uDim.value = dim
    }
  })

  return (
    <group ref={anchorRef}>
      <mesh ref={planet}>
        <sphereGeometry args={[PLANET_RADIUS, 96, 64]} />
        <shaderMaterial vertexShader={planetVertex} fragmentShader={planetFragment} uniforms={planetUniforms} />
        <mesh scale={1.06}>
          <sphereGeometry args={[PLANET_RADIUS, 96, 64]} />
          <shaderMaterial ref={atmosphereMaterial} vertexShader={atmosphereVertex} fragmentShader={atmosphereFragment} uniforms={atmosphereUniforms} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[Math.PI / 2.15, 0.1, 0]}>
          <ringGeometry args={[PLANET_RADIUS * 1.35, PLANET_RADIUS * 1.75, 160]} />
          <meshBasicMaterial color="#83b7ff" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </mesh>

      <points geometry={dustGeometry} frustumCulled={false}>
        <shaderMaterial ref={dustMaterial} vertexShader={dustVertex} fragmentShader={dustFragment} uniforms={dustUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {shardData.map((shard, index) => (
        <mesh key={shard.id} ref={(mesh) => { shards.current[index] = mesh }} geometry={shard.geometry} position={shard.home}>
          <shaderMaterial vertexShader={shardVertex} fragmentShader={shardFragment} uniforms={shard.uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}
