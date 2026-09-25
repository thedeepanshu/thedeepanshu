import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function Builder() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.12
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06
  })

  return (
    <group ref={group} position={[0, -0.9, 0]}>
      <mesh position={[0, 1.65, 0]} castShadow>
        <icosahedronGeometry args={[0.46, 2]} />
        <meshStandardMaterial color="#9ddbd4" emissive="#2b7774" emissiveIntensity={0.7} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <capsuleGeometry args={[0.6, 1.5, 8, 16]} />
        <meshStandardMaterial color="#203e49" emissive="#0d3036" emissiveIntensity={0.4} roughness={0.42} metalness={0.75} />
      </mesh>
      <mesh position={[-0.48, 0.62, 0]} rotation={[0, 0, -0.12]} castShadow>
        <capsuleGeometry args={[0.14, 1.1, 6, 10]} />
        <meshStandardMaterial color="#315c62" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.48, 0.62, 0]} rotation={[0, 0, 0.12]} castShadow>
        <capsuleGeometry args={[0.14, 1.1, 6, 10]} />
        <meshStandardMaterial color="#315c62" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.65, 0.39]}>
        <boxGeometry args={[0.3, 0.05, 0.025]} />
        <meshBasicMaterial color="#7ef4db" />
      </mesh>
    </group>
  )
}

function Vehicle() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return
    group.current.position.y = -1.55 + Math.sin(state.clock.elapsedTime * 1.2) * 0.05
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.06
  })

  return (
    <group ref={group} position={[1.55, -1.55, 0.3]} rotation={[0, -0.42, 0]} scale={0.65}>
      <mesh castShadow>
        <boxGeometry args={[2.9, 0.45, 1.15]} />
        <meshStandardMaterial color="#416d75" emissive="#163f43" emissiveIntensity={0.45} metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0.28, 0.38, 0]} castShadow>
        <capsuleGeometry args={[0.42, 1.15, 6, 12]} />
        <meshStandardMaterial color="#17303b" emissive="#1b5160" emissiveIntensity={0.5} metalness={0.85} roughness={0.18} />
      </mesh>
      {[-1, 1].map((x) => (
        <mesh key={x} position={[x * 0.95, -0.35, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.08, 10, 24]} />
          <meshStandardMaterial color="#8de2d3" emissive="#44c7b8" emissiveIntensity={0.8} metalness={0.8} />
        </mesh>
      ))}
      <mesh position={[1.48, 0.02, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.58]} />
        <meshBasicMaterial color="#7ef4db" />
      </mesh>
    </group>
  )
}

function SceneContents() {
  return (
    <>
      <color attach="background" args={['#0b151c']} />
      <PerspectiveCamera makeDefault position={[0, 0.2, 7.4]} fov={38} />
      <ambientLight intensity={0.75} color="#a7d2d5" />
      <directionalLight castShadow color="#8be6dc" intensity={3} position={[-3, 5, 4]} />
      <pointLight color="#967dff" intensity={16} distance={8} position={[3, 1, 1]} />
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.15}>
        <Builder />
      </Float>
      <Vehicle />
      <ContactShadows opacity={0.45} scale={8} blur={2.5} far={5} resolution={256} color="#58d1c3" />
    </>
  )
}

export function HeroScene() {
  return (
    <Canvas className="webgl-scene" dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <SceneContents />
    </Canvas>
  )
}