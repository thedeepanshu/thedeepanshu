import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { missions } from '../../content/portfolio'
import { deckById } from '../decks'
import { mulberry32 } from '../random'
import { deckInView, motion, useVessel } from '../store'
import { makeLabelTexture } from './labels'

const PANEL_WIDTH = 4.6
const PANEL_HEIGHT = 2.8
const DRUM_CENTER = new THREE.Vector3(5.2, 0.6, -4)
const DRUM_RADIUS = 4.6
const DRUM_STEP = 0.62
const FLOOR_Y = -4.2

const hologramVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Scanlines, a framed border with brighter corner brackets, a slow sweep band
// and the occasional glitch slice. Text comes from a canvas texture.
const hologramFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uAspect;
  uniform vec3 uColor;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    float slice = floor(uv.y * 24.0);
    float glitch = step(0.985, hash(slice + floor(uTime * 6.0)));
    uv.x += glitch * (hash(slice) - 0.5) * 0.04;

    vec4 tex = texture2D(uMap, uv);
    vec2 p = vec2(uv.x * uAspect, uv.y);
    float ex = min(p.x, uAspect - p.x);
    float ey = min(p.y, 1.0 - p.y);
    float edge = min(ex, ey);
    float border = 1.0 - smoothstep(0.0, 0.01, edge);
    float corner = step(ex, 0.22) * step(ey, 0.22) * (1.0 - smoothstep(0.012, 0.03, edge));

    float scan = 0.78 + 0.22 * sin(uv.y * 260.0 - uTime * 5.0);
    float sweep = smoothstep(0.08, 0.0, abs(fract(uv.y * 0.6 - uTime * 0.12) - 0.5));
    float flicker = 0.93 + 0.07 * sin(uTime * 41.0 + uv.y * 4.0);
    float fill = 0.07 + 0.05 * uv.y;

    vec3 color = uColor * (fill + border * 0.8 + corner * 1.6 + sweep * 0.25) + tex.rgb * tex.a * 1.35;
    float alpha = (fill + border * 0.8 + corner + sweep * 0.15 + tex.a) * scan * flicker * uOpacity;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`

const floorFragment = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * 60.0;
    vec2 cell = abs(fract(p + vec2(0.0, uTime * 0.35)) - 0.5);
    float line = 1.0 - smoothstep(0.0, 0.035, min(cell.x, cell.y));
    float fade = 1.0 - smoothstep(4.0, 24.0, length(p - vec2(5.0, 0.0)));
    gl_FragColor = vec4(vec3(0.49, 0.96, 0.86), line * fade * 0.28);
  }
`

const beamFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float rise = 1.0 - vUv.y * 0.55;
    float bands = 0.75 + 0.25 * sin(vUv.y * 40.0 - uTime * 4.0);
    gl_FragColor = vec4(vec3(0.49, 0.96, 0.86), 0.12 * rise * bands * uOpacity);
  }
`

/** Draws a small, seeded bar chart along the panel's bottom edge. */
function drawTelemetry(seed: number) {
  return (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const random = mulberry32(seed)
    const bars = 28
    const barWidth = (width - 48) / bars
    for (let i = 0; i < bars; i++) {
      const h = 10 + random() * 46
      ctx.fillStyle = i % 7 === 0 ? 'rgba(161, 126, 255, .8)' : 'rgba(126, 244, 219, .55)'
      ctx.fillRect(24 + i * barWidth, height - 30 - h, barWidth - 5, h)
    }
  }
}

/**
 * The Hangar (Missions deck): one hologram panel per mission on a turning drum
 * above a projector beam. The drum brings the mission being read to the front.
 */
export function Hangar() {
  const deck = deckById('missions')
  const group = useRef<THREE.Group>(null)
  const rig = useRef<THREE.Group>(null)
  const panels = useRef<(THREE.Mesh | null)[]>([])
  const beamMaterial = useRef<THREE.ShaderMaterial>(null)
  const floorMaterial = useRef<THREE.ShaderMaterial>(null)
  const drum = useRef(0)

  const panelData = useMemo(() => missions.map((mission, index) => {
    const texture = makeLabelTexture([
      { text: `M/${mission.number}  ·  ${mission.type.toUpperCase()}`, size: 26, color: '#7ef4db', mono: true, tracking: 3, gap: 26 },
      { text: mission.title, size: 70, color: '#eef8f9', weight: 500, wrap: true, gap: 20 },
      { text: mission.status.toUpperCase(), size: 26, color: '#a17eff', mono: true, tracking: 3, gap: 16 },
      { text: mission.role, size: 32, color: '#a8b7ba' },
    ], 1024, Math.round(1024 / (PANEL_WIDTH / PANEL_HEIGHT)), 36, drawTelemetry(index + 11))
    return {
      id: mission.id,
      uniforms: {
        uMap: { value: texture },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uAspect: { value: PANEL_WIDTH / PANEL_HEIGHT },
        uColor: { value: new THREE.Color('#7ef4db') },
      },
    }
  }), [])

  useEffect(() => () => panelData.forEach((panel) => panel.uniforms.uMap.value.dispose()), [panelData])

  const floorUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const beamUniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 1 } }), [])

  // Face the deck's camera so "right of screen" is +X in local space.
  useEffect(() => {
    group.current?.position.set(...deck.target)
    group.current?.lookAt(...deck.camera)
  }, [deck])

  useFrame(({ clock, size }, delta) => {
    if (!group.current) return
    group.current.visible = deckInView('missions')
    if (!group.current.visible) return
    const time = clock.elapsedTime
    // Portrait screens: a smaller drum centred in the gap below the intro copy.
    // The rig's scale also shrinks the drum's offset, so correct by the scaled amount.
    const narrow = size.width < size.height
    // Wide screens: smaller, pushed right and up beside the page title, clear of
    // the briefs. It fades out completely as they scroll in, so it never sits
    // behind text.
    const scale = narrow ? 0.55 : 0.78
    rig.current?.position.set(narrow ? -DRUM_CENTER.x * scale : 2.4, narrow ? -0.9 : 1.6, 0)
    rig.current?.scale.setScalar(scale)
    const dim = (1 - THREE.MathUtils.smoothstep(motion.scroll, 0.12, 0.5)) * (narrow ? 0.6 : 1)
    group.current.visible = dim > 0.01
    const { activeMission } = useVessel.getState()
    const target = Math.max(0, missions.findIndex((mission) => mission.id === activeMission))
    drum.current = THREE.MathUtils.damp(drum.current, target, 3.2, delta)

    panels.current.forEach((mesh, index) => {
      if (!mesh) return
      const offset = index - drum.current
      const angle = offset * DRUM_STEP
      mesh.position.set(DRUM_CENTER.x, DRUM_CENTER.y - Math.sin(angle) * DRUM_RADIUS, DRUM_CENTER.z + Math.cos(angle) * DRUM_RADIUS)
      mesh.rotation.set(angle, -0.32, 0)
      const material = mesh.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = time + index * 3.1
      material.uniforms.uOpacity.value = THREE.MathUtils.clamp(1 - Math.abs(offset) * 0.55, 0, 1) * dim
    })

    if (floorMaterial.current) floorMaterial.current.uniforms.uTime.value = time
    if (beamMaterial.current) {
      beamMaterial.current.uniforms.uTime.value = time
      // The beam dips while the drum is turning, as if re-targeting.
      beamMaterial.current.uniforms.uOpacity.value = (1 - Math.min(1, Math.abs(target - drum.current) * 1.6)) * dim
    }
  })

  const beamTop = DRUM_CENTER.y - PANEL_HEIGHT / 2 + 0.2
  const beamHeight = beamTop - FLOOR_Y

  return (
    <group ref={group}>
      <group ref={rig}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, -4]}>
        <planeGeometry args={[60, 60]} />
        <shaderMaterial ref={floorMaterial} vertexShader={hologramVertex} fragmentShader={floorFragment} uniforms={floorUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh position={[DRUM_CENTER.x, FLOOR_Y + beamHeight / 2, DRUM_CENTER.z + DRUM_RADIUS]}>
        <cylinderGeometry args={[PANEL_WIDTH * 0.42, 0.35, beamHeight, 32, 1, true]} />
        <shaderMaterial ref={beamMaterial} vertexShader={hologramVertex} fragmentShader={beamFragment} uniforms={beamUniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[DRUM_CENTER.x, FLOOR_Y + 0.02, DRUM_CENTER.z + DRUM_RADIUS]}>
        <ringGeometry args={[0.38, 0.62, 48]} />
        <meshBasicMaterial color="#7ef4db" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {panelData.map((panel, index) => (
        <mesh key={panel.id} ref={(mesh) => { panels.current[index] = mesh }}>
          <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
          <shaderMaterial vertexShader={hologramVertex} fragmentShader={hologramFragment} uniforms={panel.uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      </group>
    </group>
  )
}
