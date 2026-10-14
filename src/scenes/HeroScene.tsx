import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  return reducedMotion
}

const vehicleBodyShape = new THREE.Shape()
vehicleBodyShape.moveTo(-1.8, -0.12)
vehicleBodyShape.lineTo(-1.62, 0.18)
vehicleBodyShape.lineTo(-0.78, 0.34)
vehicleBodyShape.lineTo(-0.32, 0.78)
vehicleBodyShape.lineTo(0.42, 0.78)
vehicleBodyShape.lineTo(0.92, 0.35)
vehicleBodyShape.lineTo(1.62, 0.22)
vehicleBodyShape.lineTo(1.82, 0.04)
vehicleBodyShape.lineTo(1.6, -0.14)
vehicleBodyShape.lineTo(-1.48, -0.14)
vehicleBodyShape.closePath()

const vehicleCanopyShape = new THREE.Shape()
vehicleCanopyShape.moveTo(-0.62, 0.39)
vehicleCanopyShape.lineTo(-0.28, 0.69)
vehicleCanopyShape.lineTo(0.34, 0.69)
vehicleCanopyShape.lineTo(0.73, 0.39)
vehicleCanopyShape.closePath()

function Builder({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const elapsedTime = useRef(0)

  useFrame((_, delta) => {
    if (!group.current) return
    elapsedTime.current += delta
    const elapsed = elapsedTime.current
    const reveal = reducedMotion ? 1 : THREE.MathUtils.smoothstep(elapsed, 0.15, 1.45)
    group.current.scale.setScalar(0.86 * reveal)
    group.current.rotation.y = reducedMotion ? 0 : Math.sin(elapsed * 0.35) * 0.12
    group.current.position.y = THREE.MathUtils.lerp(-1.75, -0.55, reveal) + (reducedMotion ? 0 : Math.sin(elapsed * 0.8) * 0.035)
    if (head.current) head.current.rotation.x = reducedMotion ? 0 : Math.sin(elapsed * 0.5) * 0.035
    if (leftArm.current) leftArm.current.rotation.z = reducedMotion ? -0.16 : -0.16 + Math.sin(elapsed * 0.65) * 0.025
  })

  return (
    <group ref={group} position={[0, -1.75, 0]} scale={0}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.34, 0.72, 8]} />
        <meshStandardMaterial color="#111b24" metalness={0.58} roughness={0.48} />
      </mesh>
      <mesh position={[-0.19, -0.48, 0.04]} castShadow>
        <capsuleGeometry args={[0.14, 0.72, 5, 10]} />
        <meshStandardMaterial color="#182630" metalness={0.42} roughness={0.56} />
      </mesh>
      <mesh position={[0.19, -0.48, 0.04]} castShadow>
        <capsuleGeometry args={[0.14, 0.72, 5, 10]} />
        <meshStandardMaterial color="#182630" metalness={0.42} roughness={0.56} />
      </mesh>
      <mesh position={[-0.2, -0.94, 0.09]} castShadow>
        <boxGeometry args={[0.34, 0.16, 0.48]} />
        <meshStandardMaterial color="#263b45" metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0.2, -0.94, 0.09]} castShadow>
        <boxGeometry args={[0.34, 0.16, 0.48]} />
        <meshStandardMaterial color="#263b45" metalness={0.55} roughness={0.38} />
      </mesh>

      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.25, 0.66, 8]} />
        <meshStandardMaterial color="#24434a" metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.28, 0.22]}>
        <boxGeometry args={[0.12, 0.52, 0.025]} />
        <meshBasicMaterial color="#7ef4db" />
      </mesh>
      <mesh position={[-0.31, 0.48, 0]} rotation={[0, 0, -0.48]} castShadow>
        <coneGeometry args={[0.2, 0.3, 4]} />
        <meshStandardMaterial color="#385c61" metalness={0.42} roughness={0.48} />
      </mesh>
      <mesh position={[0.31, 0.48, 0]} rotation={[0, 0, 0.48]} castShadow>
        <coneGeometry args={[0.2, 0.3, 4]} />
        <meshStandardMaterial color="#385c61" metalness={0.42} roughness={0.48} />
      </mesh>

      <group position={[0, 0.8, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.19, 8]} />
          <meshStandardMaterial color="#d59878" roughness={0.82} />
        </mesh>
      </group>
      <group ref={head} position={[0, 1.22, 0]}>
        <mesh castShadow scale={[0.34, 0.43, 0.3]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color="#efbd9e" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.25, -0.03]} castShadow scale={[0.37, 0.25, 0.34]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#18232b" roughness={0.7} />
        </mesh>
        {[-0.14, 0, 0.14].map((x, index) => (
          <mesh key={x} position={[x, 0.14 + Math.abs(x) * 0.18, 0.258]} rotation={[0, 0, index === 0 ? 0.18 : index === 2 ? -0.18 : 0]}>
            <coneGeometry args={[0.115, 0.28, 5]} />
            <meshStandardMaterial color="#18232b" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[-0.27, 0.11, 0.02]} rotation={[0, 0, 0.55]} castShadow>
          <coneGeometry args={[0.16, 0.42, 5]} />
          <meshStandardMaterial color="#18232b" roughness={0.7} />
        </mesh>
        <mesh position={[0.27, 0.11, 0.02]} rotation={[0, 0, -0.55]} castShadow>
          <coneGeometry args={[0.16, 0.42, 5]} />
          <meshStandardMaterial color="#18232b" roughness={0.7} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.13, -0.02, 0.273]}>
            <mesh scale={[0.095, 0.052, 0.035]}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshBasicMaterial color="#f4f5ed" />
            </mesh>
            <mesh position={[side * 0.012, 0, 0.031]} scale={[0.031, 0.04, 0.02]}>
              <sphereGeometry args={[1, 12, 10]} />
              <meshBasicMaterial color="#4ccdc4" />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.17, 0.291]} scale={[0.025, 0.04, 0.018]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#bd806e" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.26, 0.22]}>
          <boxGeometry args={[0.12, 0.018, 0.015]} />
          <meshBasicMaterial color="#a84c5a" />
        </mesh>
      </group>

      <group ref={leftArm} position={[-0.39, 0.48, 0.02]} rotation={[0, 0, -0.16]}>
        <mesh position={[0, -0.23, 0]} rotation={[0, 0, 0.14]} castShadow>
          <capsuleGeometry args={[0.12, 0.38, 5, 10]} />
          <meshStandardMaterial color="#24434a" metalness={0.5} roughness={0.45} />
        </mesh>
        <mesh position={[-0.025, -0.57, 0.02]} rotation={[0, 0, 0.12]} castShadow>
          <capsuleGeometry args={[0.09, 0.38, 5, 10]} />
          <meshStandardMaterial color="#1d333b" metalness={0.5} roughness={0.45} />
        </mesh>
        <mesh position={[-0.05, -0.84, 0.05]}>
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshStandardMaterial color="#efbd9e" roughness={0.85} />
        </mesh>
      </group>
      <group position={[0.39, 0.48, 0.02]} rotation={[0, 0, 0.16]}>
        <mesh position={[0, -0.23, 0]} rotation={[0, 0, -0.14]} castShadow>
          <capsuleGeometry args={[0.12, 0.38, 5, 10]} />
          <meshStandardMaterial color="#24434a" metalness={0.5} roughness={0.45} />
        </mesh>
        <mesh position={[0.025, -0.57, 0.02]} rotation={[0, 0, -0.12]} castShadow>
          <capsuleGeometry args={[0.09, 0.38, 5, 10]} />
          <meshStandardMaterial color="#1d333b" metalness={0.5} roughness={0.45} />
        </mesh>
        <mesh position={[0.05, -0.84, 0.05]}>
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshStandardMaterial color="#efbd9e" roughness={0.85} />
        </mesh>
      </group>
    </group>
  )
}

function Vehicle({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const thruster = useRef<THREE.Mesh>(null)
  const headlightLenses = useRef<THREE.Mesh[]>([])
  const headlightBeams = useRef<THREE.Mesh[]>([])
  const headlightLights = useRef<THREE.PointLight[]>([])
  const elapsedTime = useRef(0)

  useFrame((_, delta) => {
    if (!group.current) return
    elapsedTime.current += delta
    const elapsed = elapsedTime.current
    const travel = reducedMotion ? 1 : THREE.MathUtils.smoothstep(elapsed, 0.65, 4.55)
    const orbitAngle = travel * Math.PI
    const orbitRadius = 1.35
    group.current.position.x = Math.cos(orbitAngle) * orbitRadius
    group.current.position.y = -1.38
    group.current.position.z = 0.12 - Math.sin(orbitAngle) * orbitRadius
    group.current.rotation.y = Math.PI / 2 - orbitAngle - THREE.MathUtils.smoothstep(travel, 0.78, 1) * 0.18

    const headlightsOn = reducedMotion ? 1 : THREE.MathUtils.smoothstep(travel, 0.82, 1)
    headlightLenses.current.forEach((lens) => {
      const material = lens.material as THREE.MeshBasicMaterial
      material.opacity = 0.25 + headlightsOn * 0.75
    })
    headlightBeams.current.forEach((beam) => {
      const material = beam.material as THREE.MeshBasicMaterial
      material.opacity = headlightsOn * 0.12
    })
    headlightLights.current.forEach((light) => {
      light.intensity = headlightsOn * 8
    })

    if (thruster.current) {
      const material = thruster.current.material as THREE.MeshBasicMaterial
      material.opacity = reducedMotion ? 0.7 : 0.55 + (Math.sin(elapsed * 4) + 1) * 0.2
    }
  })

  return (
    <group ref={group} position={[1.35, -1.38, 0.12]} rotation={[0, Math.PI / 2, 0]} scale={0.58}>
      <mesh position={[0, 0, -0.4]} castShadow>
        <extrudeGeometry args={[vehicleBodyShape, { depth: 0.8, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.045, bevelThickness: 0.045 }]} />
        <meshStandardMaterial color="#57868c" emissive="#20545a" emissiveIntensity={0.7} metalness={0.72} roughness={0.27} />
      </mesh>
      <mesh position={[0, 0, 0.415]}>
        <shapeGeometry args={[vehicleCanopyShape]} />
        <meshPhysicalMaterial color="#77d4d1" emissive="#24616b" emissiveIntensity={0.45} metalness={0.25} roughness={0.14} clearcoat={1} transparent opacity={0.82} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.04, 0.372]}>
        <boxGeometry args={[2.35, 0.045, 0.018]} />
        <meshBasicMaterial color="#7ef4db" />
      </mesh>
      <mesh position={[0, 0.04, -0.372]}>
        <boxGeometry args={[2.35, 0.045, 0.018]} />
        <meshBasicMaterial color="#a17eff" />
      </mesh>
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
        <mesh key={`wheel-${x}-${z}`} position={[x * 1.08, -0.1, z * 0.36]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.16, 20]} />
          <meshStandardMaterial color="#111b22" metalness={0.82} roughness={0.28} />
        </mesh>
      )))}
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
        <mesh key={`rim-${x}-${z}`} position={[x * 1.08, -0.1, z * 0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.13, 0.025, 8, 16]} />
          <meshStandardMaterial color="#8de2d3" emissive="#44c7b8" emissiveIntensity={0.55} metalness={0.75} />
        </mesh>
      )))}
      <mesh ref={thruster} position={[-1.74, 0.03, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.16, 24]} />
        <meshBasicMaterial color="#a17eff" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map((side, index) => (
        <group key={side}>
          <mesh ref={(mesh) => { if (mesh) headlightLenses.current[index] = mesh }} position={[1.77, 0.13, side * 0.22]}>
            <boxGeometry args={[0.045, 0.09, 0.15]} />
            <meshBasicMaterial color="#eaffff" transparent opacity={0.25} />
          </mesh>
          <mesh ref={(mesh) => { if (mesh) headlightBeams.current[index] = mesh }} position={[2.85, 0.13, side * 0.22]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.34, 0.045, 2.16, 16, 1, true]} />
            <meshBasicMaterial color="#a5faff" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <pointLight ref={(light) => { if (light) headlightLights.current[index] = light }} position={[1.8, 0.13, side * 0.22]} color="#b6fbff" intensity={0} distance={4} decay={2} />
        </group>
      ))}
    </group>
  )
}

function SceneContents() {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <>
      <color attach="background" args={['#0b151c']} />
      <PerspectiveCamera makeDefault position={[0, 0.2, 7.4]} fov={38} />
      <ambientLight intensity={0.75} color="#a7d2d5" />
      <directionalLight castShadow color="#8be6dc" intensity={3} position={[-3, 5, 4]} />
      <directionalLight color="#ffe2c4" intensity={1.15} position={[0, 1.5, 5]} />
      <pointLight color="#967dff" intensity={16} distance={8} position={[3, 1, 1]} />
        <Builder reducedMotion={reducedMotion} />
      <Vehicle reducedMotion={reducedMotion} />
      <ContactShadows opacity={0.45} scale={8} blur={2.5} far={5} resolution={256} color="#58d1c3" />
    </>
  )
}

export function HeroScene() {
  return (
    <Canvas
      className="webgl-scene"
      dpr={[1, 1.5]}
      fallback={<div className="scene-fallback scene-unavailable">3D preview unavailable</div>}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <SceneContents />
    </Canvas>
  )
}