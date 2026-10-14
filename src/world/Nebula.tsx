import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Dim, slow-moving gas clouds in the site palette. Kept dark on purpose so
// page text stays readable on top of it.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform int uOctaves;
  varying vec3 vDir;

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

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      if (i >= uOctaves) break;
      value += amplitude * noise(p);
      p *= 2.03;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 dir = normalize(vDir);
    float t = uTime * 0.012;
    float cloudA = fbm(dir * 2.2 + vec3(t, 0.0, -t));
    float cloudB = fbm(dir * 3.4 + vec3(-t, t * 0.6, 4.0));

    vec3 base = vec3(0.016, 0.027, 0.035);
    vec3 cyan = vec3(0.07, 0.30, 0.28);
    vec3 purple = vec3(0.20, 0.13, 0.36);
    vec3 blue = vec3(0.08, 0.15, 0.30);

    vec3 color = base;
    color += cyan * smoothstep(0.45, 0.85, cloudA) * 0.38;
    color += purple * smoothstep(0.5, 0.9, cloudB) * 0.42;
    color += blue * smoothstep(0.35, 0.75, cloudA * cloudB * 1.6) * 0.25;

    gl_FragColor = vec4(color, 1.0);
  }
`

type NebulaProps = { octaves: number }

export function Nebula({ octaves }: NebulaProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOctaves: { value: octaves } }), [octaves])

  // The sky sphere rides along with the camera so it always reads as infinitely far.
  useFrame(({ camera, clock }) => {
    if (mesh.current) mesh.current.position.copy(camera.position)
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <mesh ref={mesh} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[400, 48, 32]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}
