import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { motion } from './store'

const FIELD_SIZE = 220

// Stars live at fixed world positions, wrapped into a box that always surrounds
// the camera. Flying anywhere gives real parallax and the field never runs out.
const wrapChunk = /* glsl */ `
  uniform vec3 uOrigin;
  uniform float uSize;
  uniform float uTime;
  vec3 wrapStar(vec3 p) {
    p.z += uTime * 0.9; // slow forward cruise
    vec3 local = mod(p - uOrigin + uSize * 0.5, uSize) - uSize * 0.5;
    return uOrigin + local;
  }
  float edgeFade(vec3 worldPos) {
    float d = length(worldPos - uOrigin) / (uSize * 0.5);
    return 1.0 - smoothstep(0.6, 1.0, d);
  }
`

const pointsVertex = /* glsl */ `
  ${wrapChunk}
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec3 worldPos = wrapStar(position);
    vec4 mvPosition = viewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float size = mix(0.6, 2.4, pow(aSeed, 3.0));
    gl_PointSize = size * uPixelRatio * (120.0 / -mvPosition.z);
    float twinkle = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 2.4) + aSeed * 90.0);
    vAlpha = edgeFade(worldPos) * twinkle;
    vec3 white = vec3(0.92, 0.97, 1.0);
    vec3 cyan = vec3(0.49, 0.96, 0.86);
    vec3 purple = vec3(0.63, 0.49, 1.0);
    vColor = aSeed > 0.9 ? cyan : aSeed > 0.82 ? purple : white;
  }
`

const pointsFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * 1.6, core * core * vAlpha);
  }
`

const streaksVertex = /* glsl */ `
  ${wrapChunk}
  uniform vec3 uVelocity;
  uniform float uStretch;
  attribute float aTail;
  varying float vAlpha;
  void main() {
    vec3 worldPos = wrapStar(position);
    float speed = length(uVelocity);
    // The tail trails toward where the star appeared to come from.
    worldPos += uVelocity * uStretch * aTail;
    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
    vAlpha = edgeFade(worldPos) * clamp(speed * 0.04, 0.0, 1.0) * (1.0 - aTail * 0.85);
  }
`

const streaksFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(vec3(0.7, 0.98, 0.95) * 1.8, vAlpha);
  }
`

// Seeded PRNG so the star layout is stable across renders and visits.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type StarfieldProps = { count: number; streakCount: number }

export function Starfield({ count, streakCount }: StarfieldProps) {
  const pointsMaterial = useRef<THREE.ShaderMaterial>(null)
  const streaksMaterial = useRef<THREE.ShaderMaterial>(null)
  const lastCamera = useRef(new THREE.Vector3())
  const velocity = useRef(new THREE.Vector3())
  const frameVelocity = useRef(new THREE.Vector3())

  const { points, streaks } = useMemo(() => {
    const random = mulberry32(2207)
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * FIELD_SIZE
      positions[i * 3 + 1] = (random() - 0.5) * FIELD_SIZE
      positions[i * 3 + 2] = (random() - 0.5) * FIELD_SIZE
      seeds[i] = random()
    }
    const pointsGeometry = new THREE.BufferGeometry()
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pointsGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

    // Each streak is a head/tail pair sharing a star's position.
    const streakPositions = new Float32Array(streakCount * 6)
    const tails = new Float32Array(streakCount * 2)
    for (let i = 0; i < streakCount; i++) {
      for (let k = 0; k < 3; k++) {
        streakPositions[i * 6 + k] = positions[i * 3 + k]
        streakPositions[i * 6 + 3 + k] = positions[i * 3 + k]
      }
      tails[i * 2 + 1] = 1
    }
    const streaksGeometry = new THREE.BufferGeometry()
    streaksGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3))
    streaksGeometry.setAttribute('aTail', new THREE.BufferAttribute(tails, 1))

    return { points: pointsGeometry, streaks: streaksGeometry }
  }, [count, streakCount])

  const uniforms = useMemo(() => ({
    points: {
      uOrigin: { value: new THREE.Vector3() },
      uSize: { value: FIELD_SIZE },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
    },
    streaks: {
      uOrigin: { value: new THREE.Vector3() },
      uSize: { value: FIELD_SIZE },
      uTime: { value: 0 },
      uVelocity: { value: new THREE.Vector3() },
      uStretch: { value: 0.12 },
    },
  }), [])

  useFrame(({ camera, clock, gl }, delta) => {
    const time = clock.elapsedTime
    // Smoothed camera velocity (units / second) drives streak length + direction.
    frameVelocity.current.subVectors(camera.position, lastCamera.current).divideScalar(Math.max(delta, 1 / 240))
    velocity.current.lerp(frameVelocity.current, 1 - Math.exp(-delta * 10))
    lastCamera.current.copy(camera.position)

    const pointUniforms = pointsMaterial.current?.uniforms
    if (pointUniforms) {
      pointUniforms.uOrigin.value.copy(camera.position)
      pointUniforms.uTime.value = time
      pointUniforms.uPixelRatio.value = gl.getPixelRatio()
    }
    const streakUniforms = streaksMaterial.current?.uniforms
    if (streakUniforms) {
      streakUniforms.uOrigin.value.copy(camera.position)
      streakUniforms.uTime.value = time
      streakUniforms.uVelocity.value.copy(velocity.current)
      streakUniforms.uStretch.value = 0.04 + motion.warp * 0.22
    }
  })

  return (
    <>
      <points geometry={points} frustumCulled={false}>
        <shaderMaterial
          ref={pointsMaterial}
          vertexShader={pointsVertex}
          fragmentShader={pointsFragment}
          uniforms={uniforms.points}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments geometry={streaks} frustumCulled={false}>
        <shaderMaterial
          ref={streaksMaterial}
          vertexShader={streaksVertex}
          fragmentShader={streaksFragment}
          uniforms={uniforms.streaks}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  )
}
