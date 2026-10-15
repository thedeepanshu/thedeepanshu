import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { deckById } from '../decks'
import { deckInView, motion, useVessel } from '../store'

const PILOT_URL = '/images/pilot.webp'
const PILOT_UNDER_URL = '/images/deepanshu-saini-cutout.webp'
/** Lens radius in plane UV units while it's over the pilot. */
const LENS_RADIUS = 0.13
/** Where the lens may open: roughly the pilot's silhouette, in UV. */
const ACTIVE_AREA = { minX: 0.12, maxX: 0.88, minY: 0.04, maxY: 0.93 }

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Pilot on top, the real person underneath. A soft circular lens follows the
// pointer and dissolves the pilot inside it (with a slightly noisy edge and a
// thin glowing ring), revealing who's behind the helmet.
const fragmentShader = /* glsl */ `
  uniform sampler2D uPilot;
  uniform sampler2D uUnder;
  uniform vec2 uLens;
  uniform float uRadius;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uIntro;
  uniform vec2 uUnderScale;
  uniform vec2 uUnderOffset;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }

  void main() {
    vec4 pilot = texture2D(uPilot, vUv);
    vec2 underUv = (vUv - 0.5) / uUnderScale + 0.5 + uUnderOffset;
    vec4 under = texture2D(uUnder, underUv);
    under.a *= step(0.0, underUv.x) * step(underUv.x, 1.0) * step(0.0, underUv.y) * step(underUv.y, 1.0);

    // Lens: soft, with a gently animated organic edge.
    float d = distance(vUv, uLens);
    float wobble = (noise(vUv * 22.0 + uTime * 0.8) - 0.5) * 0.018;
    float lens = 1.0 - smoothstep(uRadius - 0.022, uRadius + 0.004, d + wobble);
    lens *= step(0.001, uRadius);

    // Inside the lens the person is "scanned": a faint cyan cast and fine lines.
    float scan = 0.94 + 0.06 * sin(vUv.y * 900.0 - uTime * 4.0);
    vec3 underColor = under.rgb * scan * vec3(0.94, 1.02, 1.03);

    vec3 color = mix(pilot.rgb, underColor, lens);
    float alpha = mix(pilot.a, under.a, lens);

    // The lens ring, plus a faint glow just inside it.
    float ring = smoothstep(0.006, 0.0, abs(d + wobble * 0.4 - uRadius)) * step(0.02, uRadius);
    float inner = smoothstep(uRadius, uRadius - 0.05, d) * lens * 0.035;
    vec3 cyan = vec3(0.49, 0.96, 0.86);
    color += cyan * (ring * 1.4 + inner);
    alpha = max(alpha, ring * 0.9);

    // Dissolve into space toward the bottom of the bust.
    alpha *= smoothstep(0.0, 0.16, vUv.y);

    // Arrival: materialise bottom-up behind a bright scan line.
    float front = uIntro * 1.1;
    float shown = smoothstep(front, front - 0.03, vUv.y);
    float band = smoothstep(0.03, 0.0, abs(vUv.y - front)) * step(uIntro, 0.999) * step(0.001, uIntro);
    color += cyan * band * 1.2;

    gl_FragColor = vec4(color, clamp(alpha * shown + band * pilot.a * 0.6, 0.0, 1.0) * uOpacity);
  }
`

// Module scope: there is one Bridge hero, and R3F copies a `uniforms` prop, so
// the material is built here and owns the uniforms the frame loop updates.
const uniforms = {
  uPilot: { value: null as THREE.Texture | null },
  uUnder: { value: null as THREE.Texture | null },
  uLens: { value: new THREE.Vector2(0.5, 0.55) },
  uRadius: { value: 0 },
  uTime: { value: 0 },
  uOpacity: { value: 0 },
  uIntro: { value: 0 },
  // Fine alignment of the photo under the helmet (both images share framing).
  uUnderScale: { value: new THREE.Vector2(1, 1) },
  uUnderOffset: { value: new THREE.Vector2(0, 0) },
}
const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false })

// Lets the cursor switch into "lens" mode while it's over the pilot.
let lensClass = false
function setLensClass(on: boolean) {
  if (lensClass === on) return
  lensClass = on
  document.body.classList.toggle('custom-cursor-lens', on)
}

const raycaster = new THREE.Raycaster()
const ndc = new THREE.Vector2()
const lensTarget = new THREE.Vector2()
const autoLens = new THREE.Vector2()

function loadTexture(url: string) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    new THREE.TextureLoader().load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 8
      resolve(texture)
    }, undefined, reject)
  })
}

/**
 * The Bridge (home) hero: a futuristic pilot. Hover over them and a lens opens
 * through the suit to show the real person underneath. Touch screens can drag
 * to reveal, and an occasional automatic scan hints at the effect.
 */
export function PilotReveal() {
  const deck = deckById('bridge')
  const root = useRef<THREE.Group>(null)
  const plane = useRef<THREE.Mesh>(null)
  const [ready, setReady] = useState(false)
  const intro = useRef(0)
  const radius = useRef(0)
  const lastPointer = useRef({ x: 0, y: 0, at: -100 })

  useEffect(() => {
    let cancelled = false
    Promise.all([loadTexture(PILOT_URL), loadTexture(PILOT_UNDER_URL)]).then(([pilot, under]) => {
      if (cancelled) {
        pilot.dispose()
        under.dispose()
        return
      }
      uniforms.uPilot.value = pilot
      uniforms.uUnder.value = under
      setReady(true)
    }).catch(() => {})
    return () => {
      cancelled = true
      setLensClass(false)
    }
  }, [])

  useFrame(({ clock, camera, size }, delta) => {
    if (!root.current) return
    const { deck: current, reducedMotion, bootPhase } = useVessel.getState()
    const inView = ready && bootPhase === 'done' && deckInView('bridge')
    root.current.visible = inView
    if (!inView) {
      intro.current = 0
      setLensClass(false)
      return
    }
    const time = clock.elapsedTime
    const narrow = size.width < size.height

    // Placement: right of the hero copy on wide screens, top of the screen on phones.
    const height = narrow ? 4.7 : 8.2
    const bob = reducedMotion ? 0 : Math.sin(time * 0.7) * 0.06
    root.current.position.set(
      deck.target[0] + (narrow ? 0 : 4.5),
      deck.target[1] + (narrow ? 2.95 : -0.35) + bob + motion.scroll * 3,
      deck.target[2] - 1,
    )
    root.current.scale.setScalar(height)
    // A slight tilt toward the pointer gives the flat images real perspective.
    const tilt = reducedMotion ? 0 : 1
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, (narrow ? 0 : -0.12) + motion.pointer.x * 0.1 * tilt, 3, delta)
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -motion.pointer.y * 0.06 * tilt, 3, delta)

    if (current === 'bridge' && motion.flightProgress >= 0.9) {
      intro.current = reducedMotion ? 1 : Math.min(1, intro.current + delta / 1.6)
    }

    // Where is the pointer on the pilot? Ray-cast it onto the plane for UV.
    // Fully gone once the featured mission scrolls in: no ghost behind content,
    // and no lens reacting to a pilot you can't see.
    const fade = 1 - THREE.MathUtils.smoothstep(motion.scroll, 0.1, 0.65)
    root.current.visible = fade > 0.01
    let over = false
    if (plane.current && motion.pointerActive && fade > 0.5) {
      ndc.set(motion.pointer.x, motion.pointer.y)
      raycaster.setFromCamera(ndc, camera)
      const hit = raycaster.intersectObject(plane.current, false)[0]
      if (hit?.uv) {
        over = hit.uv.x > ACTIVE_AREA.minX && hit.uv.x < ACTIVE_AREA.maxX && hit.uv.y > ACTIVE_AREA.minY && hit.uv.y < ACTIVE_AREA.maxY
        if (over) {
          lensTarget.copy(hit.uv)
          if (Math.abs(motion.pointer.x - lastPointer.current.x) + Math.abs(motion.pointer.y - lastPointer.current.y) > 0.001) {
            lastPointer.current = { x: motion.pointer.x, y: motion.pointer.y, at: time }
          }
        }
      }
    }

    // No pointer on the pilot for a while: every few seconds an automatic scan
    // sweeps the lens across the visor to hint at what's underneath.
    const idle = time - lastPointer.current.at > 4
    let auto = false
    if (!over && idle && !reducedMotion && intro.current >= 1) {
      const cycle = (time % 9) / 9
      if (cycle < 0.32) {
        const t = cycle / 0.32
        autoLens.set(0.3 + t * 0.4, 0.62 + Math.sin(t * Math.PI * 2) * 0.05)
        lensTarget.copy(autoLens)
        auto = true
      }
    }

    const targetRadius = over ? LENS_RADIUS : auto ? LENS_RADIUS * 0.85 : 0
    radius.current = reducedMotion ? targetRadius : THREE.MathUtils.damp(radius.current, targetRadius, over ? 9 : 5, delta)
    uniforms.uLens.value.lerp(lensTarget, reducedMotion ? 1 : 1 - Math.exp(-delta * (over ? 18 : 6)))
    uniforms.uRadius.value = radius.current
    uniforms.uTime.value = reducedMotion ? 0 : time
    uniforms.uIntro.value = intro.current
    uniforms.uOpacity.value = fade
    setLensClass(over)
  })

  return (
    <group ref={root} visible={false}>
      <mesh ref={plane} material={material} renderOrder={4}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  )
}
