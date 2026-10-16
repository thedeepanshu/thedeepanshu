import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import { mulberry32 } from '@/world/random'
import { deckInView, useVessel } from '@/world/store'

import { useDeckAnchor } from './useDeckAnchor'

const DEBRIS_COUNT = 46

const hullVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

// Dark hull metal lit by a distant cold light, with a cyan edge glint.
const hullFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 n = normalize(vNormal);
    float light = clamp(dot(n, normalize(vec3(-0.4, 0.7, 0.5))), 0.0, 1.0);
    float rim = pow(1.0 - clamp(dot(n, vView), 0.0, 1.0), 3.0);
    vec3 color = vec3(0.07, 0.1, 0.12) + vec3(0.18, 0.26, 0.3) * light + vec3(0.49, 0.96, 0.86) * rim * 0.7;
    gl_FragColor = vec4(color, 1.0);
  }
`

type Debris = {
  geometry: THREE.BufferGeometry
  position: THREE.Vector3
  drift: THREE.Vector3
  spin: THREE.Vector3
  scale: number
}

/**
 * Deep space (404): the ship's wreckage drifting in the dark — tumbling hull
 * plates and shards around a cracked ring section with a failing beacon.
 */
export function Wreckage() {
  const anchorRef = useDeckAnchor('void')
  const pieces = useRef<(THREE.Mesh | null)[]>([])
  const hull = useRef<THREE.Group>(null)
  const beacon = useRef<THREE.Mesh>(null)

  const hullMaterial = useMemo(() => new THREE.ShaderMaterial({ vertexShader: hullVertex, fragmentShader: hullFragment }), [])

  const debris = useMemo<Debris[]>(() => {
    const random = mulberry32(404)
    const shapes = [
      () => new THREE.TetrahedronGeometry(0.5, 0),
      () => new THREE.BoxGeometry(1.2, 0.08, 0.7),
      () => new THREE.OctahedronGeometry(0.4, 0),
      () => new THREE.CylinderGeometry(0.12, 0.12, 1.4, 6, 1, true),
    ]
    return Array.from({ length: DEBRIS_COUNT }, () => ({
      geometry: shapes[Math.floor(random() * shapes.length)](),
      // Keep the centre clear for the page copy: debris drifts on either side.
      position: new THREE.Vector3(random() < 0.5 ? -7 - random() * 8 : 7 + random() * 9, (random() - 0.5) * 12, -3 - random() * 12),
      drift: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.12),
      spin: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(1.2),
      scale: 0.45 + random() * 1.3,
    }))
  }, [])

  useFrame(({ clock }, delta) => {
    if (!anchorRef.current) return
    anchorRef.current.visible = deckInView('void')
    if (!anchorRef.current.visible) return
    const { reducedMotion } = useVessel.getState()
    const time = clock.elapsedTime
    const step = reducedMotion ? 0 : delta

    pieces.current.forEach((mesh, index) => {
      if (!mesh) return
      const piece = debris[index]
      mesh.rotation.x += piece.spin.x * step
      mesh.rotation.y += piece.spin.y * step
      mesh.rotation.z += piece.spin.z * step
      // Drift slowly and wrap around so the field never empties.
      mesh.position.addScaledVector(piece.drift, step)
      // Bounce off the clear centre band and the outer edges, always pushing outward/inward by side.
      const x = mesh.position.x
      const speed = Math.abs(piece.drift.x)
      if (x > 0) piece.drift.x = x < 6 ? speed : x > 17 ? -speed : piece.drift.x
      else piece.drift.x = x > -6 ? -speed : x < -17 ? speed : piece.drift.x
      if (Math.abs(mesh.position.y) > 7) mesh.position.y *= -0.95
    })

    if (hull.current && !reducedMotion) {
      hull.current.rotation.z += delta * 0.03
      hull.current.rotation.x = 0.9 + Math.sin(time * 0.15) * 0.08
    }
    if (beacon.current) {
      // Irregular blink: a dying distress light.
      const blink = Math.sin(time * 2.1) > 0.6 && Math.sin(time * 7.3) > -0.4 ? 1 : 0.08
      ;(beacon.current.material as THREE.MeshBasicMaterial).opacity = blink
    }
  })

  return (
    <group ref={anchorRef}>
      {/* Broken ring section of the ship's halo. */}
      <group ref={hull} position={[9.5, -1, -6]}>
        <mesh material={hullMaterial}>
          <torusGeometry args={[3.2, 0.32, 10, 64, Math.PI * 1.25]} />
        </mesh>
        <mesh material={hullMaterial} position={[3.1, 0.6, 0]} rotation={[0.3, 0.2, 1.2]}>
          <boxGeometry args={[1.6, 0.12, 1.1]} />
        </mesh>
        <mesh ref={beacon} position={[-3.2, 0.35, 0]}>
          <sphereGeometry args={[0.14, 12, 10]} />
          <meshBasicMaterial color="#a17eff" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      {debris.map((piece, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            pieces.current[index] = mesh
          }}
          geometry={piece.geometry}
          material={hullMaterial}
          position={piece.position}
          scale={piece.scale}
        />
      ))}
    </group>
  )
}
