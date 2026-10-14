import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dossier } from '../../content/portfolio'
import { mulberry32 } from '../random'
import { deckInView, motion, scrollDim, useVessel } from '../store'
import { useDeckAnchor } from './useDeckAnchor'

const SAMPLE_SIZE = 200
const PORTRAIT_WIDTH = 6.2
const BASE_Y = -3.2

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uScan;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  uniform float uAspect;
  uniform float uPointerForce;
  uniform float uDim;
  attribute vec3 aColor;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // Rise in from the platform: each particle appears once the reveal line passes it.
    float height = (p.y - ${BASE_Y.toFixed(1)}) / 6.5;
    float shown = smoothstep(height - 0.08, height, uReveal * 1.1);
    p.y = mix(${BASE_Y.toFixed(1)} + aSeed * 0.3, p.y, shown);

    // The scan line brightens and slightly displaces what it passes over.
    float scanBand = smoothstep(0.35, 0.0, abs(p.y - uScan));
    p.x += scanBand * (aSeed - 0.5) * 0.18;
    p.z += sin(uTime * 1.3 + aSeed * 30.0) * 0.015;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
    float push = uPointerForce * smoothstep(0.22, 0.0, length(d));
    mv.xy += normalize(d + 1e-5) * push * 0.05 * -mv.z;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.6 + aSeed * 1.4) * uPixelRatio * (14.0 / -mv.z);
    float flicker = 0.88 + 0.12 * sin(uTime * 20.0 + aSeed * 200.0);
    vColor = aColor + vec3(0.35, 0.9, 0.8) * scanBand * 0.8;
    vAlpha = shown * flicker * uDim * (0.85 + scanBand * 0.6);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, core * vAlpha);
  }
`

const ringFragment = /* glsl */ `
  uniform float uTime;
  uniform float uDim;
  varying vec2 vUv;
  void main() {
    float pulse = 0.6 + 0.4 * sin(uTime * 2.0 - vUv.x * 30.0);
    gl_FragColor = vec4(vec3(0.49, 0.96, 0.86), 0.55 * pulse * uDim);
  }
`

const passVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Builds the hologram's point cloud from the portrait photo. The studio
 * backdrop is a flat grey, so it's keyed out by low saturation at mid
 * brightness; what's left becomes points, given depth so it reads as a bust.
 */
function samplePortrait(image: HTMLImageElement, maxPoints: number) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SAMPLE_SIZE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

  const candidates: { x: number; y: number; r: number; g: number; b: number; lum: number }[] = []
  for (let y = 0; y < SAMPLE_SIZE; y++) {
    for (let x = 0; x < SAMPLE_SIZE; x++) {
      const i = (y * SAMPLE_SIZE + x) * 4
      const r = data[i] / 255
      const g = data[i + 1] / 255
      const b = data[i + 2] / 255
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      const chroma = Math.max(r, g, b) - Math.min(r, g, b)
      const backdrop = chroma < 0.06 && lum > 0.3 && lum < 0.72
      if (!backdrop) candidates.push({ x, y, r, g, b, lum })
    }
  }

  const random = mulberry32(31)
  const keep = Math.min(1, maxPoints / Math.max(1, candidates.length))
  const positions: number[] = []
  const colors: number[] = []
  const seeds: number[] = []
  const cyan = new THREE.Color('#7ef4db')
  for (const c of candidates) {
    if (random() > keep) continue
    const u = c.x / SAMPLE_SIZE - 0.5
    const v = 0.5 - c.y / SAMPLE_SIZE
    const px = u * PORTRAIT_WIDTH + (random() - 0.5) * 0.02
    const py = v * PORTRAIT_WIDTH + BASE_Y + PORTRAIT_WIDTH / 2
    // Rounded body: deeper at the centre line, plus a little relief from brightness.
    const bulge = Math.sqrt(Math.max(0, 1 - (u / 0.42) ** 2)) * 0.9
    positions.push(px, py, bulge + c.lum * 0.35)
    // Mostly true colour so the face stays recognisable, washed toward cyan.
    const tint = 0.35
    colors.push(
      (c.r * (1 - tint) + cyan.r * c.lum * tint) * 1.25,
      (c.g * (1 - tint) + cyan.g * c.lum * tint) * 1.25,
      (c.b * (1 - tint) + cyan.b * c.lum * tint) * 1.25,
    )
    seeds.push(random())
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1))
  return geometry
}

/**
 * Pilot dossier (Origin deck): the portrait as a particle hologram standing on a
 * scanner platform. It rises in on arrival and a scan line sweeps over it.
 */
export function PortraitHologram({ maxPoints }: { maxPoints: number }) {
  const anchorRef = useDeckAnchor('origin')
  const rig = useRef<THREE.Group>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const ringMaterial = useRef<THREE.ShaderMaterial>(null)
  const scanRing = useRef<THREE.Mesh>(null)
  const reveal = useRef(0)
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)

  useEffect(() => {
    let cancelled = false
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      if (!cancelled) setGeometry(samplePortrait(image, maxPoints))
    }
    image.src = dossier.portrait
    return () => { cancelled = true }
  }, [maxPoints])

  useEffect(() => () => geometry?.dispose(), [geometry])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uReveal: { value: 0 },
    uScan: { value: 0 },
    uPixelRatio: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
    uAspect: { value: 1 },
    uPointerForce: { value: 0 },
    uDim: { value: 1 },
  }), [])
  const ringUniforms = useMemo(() => ({ uTime: { value: 0 }, uDim: { value: 1 } }), [])

  useFrame(({ clock, gl, size }, delta) => {
    if (!anchorRef.current) return
    const visible = deckInView('origin')
    anchorRef.current.visible = visible
    if (!visible) {
      reveal.current = 0
      return
    }
    const { reducedMotion, deck } = useVessel.getState()
    const time = clock.elapsedTime
    const narrow = size.width < size.height
    rig.current?.position.set(narrow ? 0 : 4.6, narrow ? 1.2 : 0, 0)
    rig.current?.scale.setScalar(narrow ? 0.62 : 1)
    const dim = scrollDim(0.35) * (narrow ? 0.55 : 1)

    // Only start materialising once we've actually arrived.
    if (deck === 'origin' && motion.flightProgress >= 0.85) {
      reveal.current = reducedMotion ? 1 : Math.min(1, reveal.current + delta / 2.2)
    }
    const scanY = BASE_Y + (reducedMotion ? 3 : (Math.sin(time * 0.7) * 0.5 + 0.5) * 6.4)

    const u = material.current?.uniforms
    if (u) {
      u.uTime.value = time
      u.uReveal.value = reveal.current
      u.uScan.value = scanY
      u.uPixelRatio.value = gl.getPixelRatio()
      u.uPointer.value.set(motion.pointer.x, motion.pointer.y)
      u.uAspect.value = size.width / Math.max(1, size.height)
      u.uPointerForce.value = THREE.MathUtils.damp(u.uPointerForce.value, motion.pointerActive && !reducedMotion ? 1 : 0, 4, delta)
      u.uDim.value = dim
    }
    if (ringMaterial.current) {
      ringMaterial.current.uniforms.uTime.value = time
      ringMaterial.current.uniforms.uDim.value = dim
    }
    if (scanRing.current) {
      scanRing.current.position.y = scanY
      const ringMaterialBasic = scanRing.current.material as THREE.MeshBasicMaterial
      ringMaterialBasic.opacity = 0.35 * dim * reveal.current
    }
  })

  return (
    <group ref={anchorRef}>
      <group ref={rig}>
        {geometry && (
          <points geometry={geometry} frustumCulled={false}>
            <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        )}

        {/* Scanner platform: two pulsing rings and a soft disc of light. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_Y - 0.05, 0.4]}>
          <ringGeometry args={[2.2, 2.32, 96]} />
          <shaderMaterial ref={ringMaterial} vertexShader={passVertex} fragmentShader={ringFragment} uniforms={ringUniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_Y - 0.06, 0.4]}>
          <ringGeometry args={[1.5, 1.56, 96]} />
          <meshBasicMaterial color="#a17eff" transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_Y - 0.07, 0.4]}>
          <circleGeometry args={[2.2, 64]} />
          <meshBasicMaterial color="#7ef4db" transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* The scan line's ring travels up and down with the sweep. */}
        <mesh ref={scanRing} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.4]}>
          <ringGeometry args={[1.9, 1.98, 96]} />
          <meshBasicMaterial color="#7ef4db" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  )
}
