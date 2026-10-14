import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { deckById } from './decks'
import { deckInView, motion, useVessel, type BootPhase } from './store'
import { buildSwarmTargets } from './swarmTargets'

const vertexShader = /* glsl */ `
  uniform mat4 uNameMatrix;
  uniform mat4 uShipMatrix;
  uniform float uAssemble;
  uniform float uLaunch;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  uniform float uAspect;
  uniform float uPointerForce;
  uniform float uOpacity;
  uniform float uNameDim;
  uniform float uShipFade;

  attribute vec3 aName;
  attribute vec3 aShip;
  attribute vec3 aNameColor;
  attribute vec3 aShipColor;
  attribute vec3 aBurst;
  attribute float aSeed;

  varying vec3 vColor;
  varying float vAlpha;

  // Each particle starts its move at a different moment so shapes pour in.
  float stagger(float t, float seed, float spread) {
    float start = seed * spread;
    return smoothstep(start, start + 1.0 - spread, t);
  }

  void main() {
    float a = stagger(uAssemble, aSeed, 0.45);
    float b = stagger(uLaunch, fract(aSeed * 7.13), 0.5);

    vec3 noiseW = (uNameMatrix * vec4(position, 1.0)).xyz;
    noiseW += aBurst * sin(uTime * 2.3 + aSeed * 40.0) * 0.18;
    vec3 nameW = (uNameMatrix * vec4(aName, 1.0)).xyz;
    vec3 shipW = (uShipMatrix * vec4(aShip, 1.0)).xyz;

    vec3 p = mix(noiseW, nameW, a);
    p += aBurst * sin(3.14159 * a) * (1.2 + aSeed * 2.2) * (1.0 - b);
    p += aBurst * 0.025 * sin(uTime * 1.6 + aSeed * 20.0) * a;

    vec3 q = mix(p, shipW, b);
    q += aBurst * sin(3.14159 * b) * (3.0 + aSeed * 9.0);
    q += aBurst * 0.015 * sin(uTime * 3.0 + aSeed * 50.0) * b;

    vec4 mv = viewMatrix * vec4(q, 1.0);

    // Cursor pushes particles away in screen space, scaled by depth so the
    // effect feels the same size at any distance.
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
    float dist = length(d);
    float push = uPointerForce * smoothstep(0.32, 0.0, dist) * step(0.0, clip.w);
    mv.xy += normalize(d + 1e-5) * push * 0.09 * -mv.z;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = mix(0.9, 2.0, aSeed) * uPixelRatio * (22.0 / max(-mv.z, 0.5));

    vColor = mix(aNameColor, aShipColor, b);
    float flicker = 0.55 + 0.45 * sin(uTime * 9.0 + aSeed * 300.0);
    vAlpha = uOpacity * mix(0.35 * flicker, 1.0, a) * (0.7 + push * 0.6);
    // Narrow names pack particles tightly, so dim them to avoid blowing out;
    // the parked ship dims as the page scrolls over it.
    vAlpha *= mix(1.0, uNameDim, a * (1.0 - b)) * mix(1.0, uShipFade, b);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * 1.25, core * core * vAlpha);
  }
`

// Scratch objects reused every frame (there is only ever one swarm).
const shipPosition = new THREE.Vector3()
const shipRotation = new THREE.Quaternion()
const shipEuler = new THREE.Euler()
const shipScale = new THREE.Vector3()
const nameOffset = new THREE.Matrix4().makeTranslation(0, 0, -10)
const assembledPhases: BootPhase[] = ['transmission', 'choice', 'boarding', 'done']
const launchedPhases: BootPhase[] = ['boarding', 'done']

/**
 * The particle core: static noise → the name → the ship parked at the Bridge.
 * All morphing happens in the vertex shader; JS only moves a few uniforms.
 */
export function Swarm({ count }: { count: number }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const nameFrameSet = useRef(false)
  const frames = useRef(0)
  const viewport = useThree((state) => state.size)

  // Fit the name to the viewport width at the 10-unit viewing distance (fov 50).
  // Frozen at first render: rebuilding on resize would restart the morph.
  const [nameWidth] = useState(() => {
    const aspect = viewport.width / Math.max(1, viewport.height)
    const visibleWidth = 2 * 10 * Math.tan(THREE.MathUtils.degToRad(25)) * aspect
    return Math.min(11, visibleWidth * 0.78)
  })

  const geometry = useMemo(() => {
    const targets = buildSwarmTargets(count, nameWidth)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(targets.noise, 3))
    g.setAttribute('aName', new THREE.BufferAttribute(targets.name, 3))
    g.setAttribute('aShip', new THREE.BufferAttribute(targets.ship, 3))
    g.setAttribute('aNameColor', new THREE.BufferAttribute(targets.nameColor, 3))
    g.setAttribute('aShipColor', new THREE.BufferAttribute(targets.shipColor, 3))
    g.setAttribute('aBurst', new THREE.BufferAttribute(targets.burst, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(targets.seed, 1))
    return g
  }, [count, nameWidth])

  const uniforms = useMemo(() => ({
    uNameMatrix: { value: new THREE.Matrix4() },
    uShipMatrix: { value: new THREE.Matrix4() },
    uAssemble: { value: 0 },
    uLaunch: { value: 0 },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
    uAspect: { value: 1 },
    uPointerForce: { value: 0 },
    uOpacity: { value: 0 },
    uNameDim: { value: Math.min(1, Math.max(0.4, (nameWidth / 11) ** 1.5)) },
    uShipFade: { value: 1 },
  }), [nameWidth])

  useFrame(({ camera, clock, gl, size }, delta) => {
    const u = material.current?.uniforms
    if (!u) return
    const { bootPhase, reducedMotion } = useVessel.getState()
    // 42k points are the heaviest thing in the scene: only draw them while the
    // welcome sequence uses them, while the ship is still forming, or on the Bridge.
    if (pointsRef.current) pointsRef.current.visible = bootPhase !== 'done' || u.uLaunch.value < 1 || deckInView('bridge')
    const time = clock.elapsedTime
    frames.current++

    // Lock the name a fixed distance in front of wherever the camera parked for boot.
    if (!nameFrameSet.current && frames.current > 2) {
      u.uNameMatrix.value.copy(camera.matrixWorld).multiply(nameOffset)
      nameFrameSet.current = true
    }

    // The ship parks to the right of the hero copy, or below it on narrow screens.
    const bridge = deckById('bridge')
    const aspectNow = size.width / Math.max(1, size.height)
    const narrow = aspectNow < 1
    // Scrolling the Bridge page lifts the ship away and fades it behind the copy.
    const scrolled = THREE.MathUtils.smoothstep(motion.scroll, 0.08, 0.75)
    shipPosition.set(
      bridge.target[0] + (narrow ? 1.9 : 3.8),
      bridge.target[1] + (narrow ? 2.7 : -0.2) + Math.sin(time * 0.8) * 0.12 + scrolled * 4,
      bridge.target[2],
    )
    shipEuler.set(0.18 + Math.sin(time * 0.5) * 0.04, -0.75 + Math.sin(time * 0.2) * 0.18, Math.sin(time * 0.6) * 0.05)
    shipRotation.setFromEuler(shipEuler)
    shipScale.setScalar(narrow ? 0.4 : 0.72)
    u.uShipFade.value = (narrow ? 0.5 : 1) * (1 - scrolled * 0.88)
    u.uShipMatrix.value.compose(shipPosition, shipRotation, shipScale)

    const assembleTarget = assembledPhases.includes(bootPhase) ? 1 : 0
    const launchTarget = launchedPhases.includes(bootPhase) ? 1 : 0
    if (reducedMotion) {
      u.uAssemble.value = assembleTarget
      u.uLaunch.value = launchTarget
      u.uOpacity.value = 1
    } else {
      u.uAssemble.value = THREE.MathUtils.clamp(u.uAssemble.value + Math.sign(assembleTarget - u.uAssemble.value) * delta / 2.2, 0, 1)
      u.uLaunch.value = THREE.MathUtils.clamp(u.uLaunch.value + Math.sign(launchTarget - u.uLaunch.value) * delta / 2.4, 0, 1)
      u.uOpacity.value = Math.min(1, u.uOpacity.value + delta / 1.5)
    }

    u.uTime.value = time
    u.uPixelRatio.value = gl.getPixelRatio()
    u.uAspect.value = aspectNow
    u.uPointer.value.set(motion.pointer.x, motion.pointer.y)
    const force = motion.pointerActive && !reducedMotion ? 1 : 0
    u.uPointerForce.value = THREE.MathUtils.damp(u.uPointerForce.value, force, 4, delta)
  })

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
