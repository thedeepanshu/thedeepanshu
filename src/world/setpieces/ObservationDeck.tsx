import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '../random'
import { deckInView, motion, scrollDim, useVessel } from '../store'
import { useDeckAnchor } from './useDeckAnchor'

// Out-of-focus city lights: each point is a soft disc with a slightly brighter
// rim (how real lens bokeh looks), drifting slowly and swaying with the pointer.
const bokehVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    // Slow upward drift that wraps, plus a lazy sideways sway.
    p.y = mod(p.y + uTime * (0.08 + aSeed * 0.12) + 12.0, 24.0) - 12.0;
    p.x += sin(uTime * 0.15 + aSeed * 30.0) * 0.6;
    // Nearer lights move more with the pointer: depth without a camera move.
    float depth = (p.z + 12.0) / 20.0;
    p.xy += uPointer * depth * 0.9;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (260.0 / -mv.z);
    vColor = aColor;
    // Twinkle gently, and fade out at the top and bottom of the drift.
    vAlpha = (0.55 + 0.45 * sin(uTime * (0.4 + aSeed) + aSeed * 50.0)) * smoothstep(12.0, 8.0, abs(p.y));
  }
`

const bokehFragment = /* glsl */ `
  uniform float uDim;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float disc = smoothstep(1.0, 0.82, d);
    float rim = smoothstep(0.62, 0.92, d) * disc;
    float alpha = (disc * 0.1 + rim * 0.08) * vAlpha * uDim;
    gl_FragColor = vec4(vColor, alpha);
  }
`

const PALETTE = ['#ffb86b', '#ff8f6b', '#ff7aa8', '#ffd9a0', '#c98bff', '#ffcf7a']

/**
 * Beyond (crew quarters): warm, out-of-focus lights drifting past the window.
 * No planets or hardware here; the page itself is the attraction.
 */
export function ObservationDeck() {
  const anchorRef = useDeckAnchor('beyond')
  const material = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const random = mulberry32(2207)
    const count = 120
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const near = random() < 0.15
      positions.set([(random() - 0.5) * 40, (random() - 0.5) * 24, near ? 2 + random() * 6 : -12 + random() * 12], i * 3)
      // A few big, close discs and many smaller distant ones.
      sizes[i] = near ? 8 + random() * 10 : 2.5 + random() * 6
      seeds[i] = random()
      color.set(PALETTE[Math.floor(random() * PALETTE.length)])
      colors.set([color.r, color.g, color.b], i * 3)
    }
    const shape = new THREE.BufferGeometry()
    shape.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    shape.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    shape.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    shape.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    return shape
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
    uDim: { value: 1 },
  }), [])

  useFrame(({ clock, gl }, delta) => {
    if (!anchorRef.current) return
    anchorRef.current.visible = deckInView('beyond')
    if (!anchorRef.current.visible || !material.current) return
    const { reducedMotion } = useVessel.getState()
    const values = material.current.uniforms
    values.uTime.value = reducedMotion ? 0 : clock.elapsedTime
    values.uPixelRatio.value = gl.getPixelRatio()
    // Lights soften (never vanish) as the visitor scrolls into the content.
    values.uDim.value = 0.55 + scrollDim(0.45) * 0.45
    const pointer = values.uPointer.value as THREE.Vector2
    const target = motion.pointerActive && !reducedMotion ? motion.pointer : { x: 0, y: 0 }
    pointer.x = THREE.MathUtils.damp(pointer.x, target.x, 2, delta)
    pointer.y = THREE.MathUtils.damp(pointer.y, target.y, 2, delta)
  })

  return (
    <group ref={anchorRef}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial ref={material} vertexShader={bokehVertex} fragmentShader={bokehFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}
