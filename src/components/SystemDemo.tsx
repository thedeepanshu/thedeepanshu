import { useEffect, useRef } from 'react'
import { mulberry32 } from '../world/random'

export type DemoKind = 'warp-starfield' | 'particle-core' | 'procedural-ambience' | 'pilot-reveal'

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void

const CYAN = '126, 244, 219'
const PURPLE = '161, 126, 255'

/** Stars rushing past the camera; every few seconds they stretch into a warp. */
function warp(): Draw {
  const random = mulberry32(7)
  const stars = Array.from({ length: 480 }, () => ({ x: random() * 2 - 1, y: random() * 2 - 1, z: random(), hue: random() }))
  let last = 0
  return (ctx, w, h, t) => {
    const dt = Math.min(0.05, t - last || 0.016)
    last = t
    const cycle = (t % 6) / 6
    const boost = Math.pow(Math.sin(Math.min(1, cycle / 0.45) * Math.PI), 2) // warp peak each cycle
    const speed = 0.3 + boost * 1.6
    // Lower clear alpha leaves light trails; heavier while cruising keeps it crisp.
    ctx.fillStyle = `rgba(5, 9, 12, ${0.22 + (1 - boost) * 0.3})`
    ctx.fillRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2
    const scale = Math.max(w, h) * 0.6
    for (const s of stars) {
      const pz = s.z
      s.z -= speed * dt
      if (s.z <= 0.02) { s.z = 1; continue }
      const x = cx + (s.x / s.z) * scale
      const y = cy + (s.y / s.z) * scale
      const px = cx + (s.x / pz) * scale
      const py = cy + (s.y / pz) * scale
      const alpha = Math.min(1, 0.25 + (1 - s.z) * 1.4)
      ctx.strokeStyle = `rgba(${s.hue > 0.85 ? PURPLE : s.hue > 0.6 ? CYAN : '235, 250, 255'}, ${alpha})`
      ctx.lineWidth = 1 + (1 - s.z) * 1.6
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }
}

/** Static condenses into a "D." mark, holds, then bursts outward and repeats. */
function core(): Draw {
  const random = mulberry32(11)
  const count = 900
  // Sample the mark from text drawn to an offscreen canvas.
  const off = document.createElement('canvas')
  off.width = 240
  off.height = 140
  const octx = off.getContext('2d')
  const targets: [number, number][] = []
  if (octx) {
    octx.fillStyle = '#fff'
    octx.font = "700 120px 'Space Grotesk Variable', 'Segoe UI', sans-serif"
    octx.textAlign = 'center'
    octx.textBaseline = 'middle'
    octx.fillText('D.', 120, 74)
    const { data } = octx.getImageData(0, 0, 240, 140)
    for (let y = 0; y < 140; y += 2) for (let x = 0; x < 240; x += 2) if (data[(y * 240 + x) * 4 + 3] > 128) targets.push([x / 240 - 0.5, y / 140 - 0.5])
    // Centre on the drawn pixels, not the text box: glyph side bearings and the
    // font in use would otherwise push the mark off-centre.
    if (targets.length) {
      const xs = targets.map(([x]) => x)
      const ys = targets.map(([, y]) => y)
      const dx = (Math.min(...xs) + Math.max(...xs)) / 2
      const dy = (Math.min(...ys) + Math.max(...ys)) / 2
      for (const target of targets) {
        target[0] -= dx
        target[1] -= dy
      }
    }
  }
  const parts = Array.from({ length: count }, () => {
    const target = targets[Math.floor(random() * targets.length)] ?? [0, 0]
    const angle = random() * Math.PI * 2
    return { tx: target[0], ty: target[1], nx: random() * 2 - 1, ny: random() * 2 - 1, ax: Math.cos(angle), ay: Math.sin(angle), seed: random() }
  })
  return (ctx, w, h, t) => {
    ctx.fillStyle = 'rgba(5, 9, 12, 0.45)'
    ctx.fillRect(0, 0, w, h)
    const cycle = (t % 7) / 7
    const ease = (v: number) => v * v * (3 - 2 * v)
    const size = Math.min(w * 0.55, h * 1.3)
    for (const p of parts) {
      const start = p.seed * 0.15
      const form = ease(Math.min(1, Math.max(0, (cycle - start) / 0.3)))
      const burst = ease(Math.min(1, Math.max(0, (cycle - 0.72) / 0.22)))
      let x = p.nx * (1 - form) + p.tx * form
      let y = p.ny * (1 - form) + p.ty * form
      x += p.ax * burst * (1.2 + p.seed)
      y += p.ay * burst * (1.2 + p.seed)
      const jitter = (1 - form) * 0.02 * Math.sin(t * 6 + p.seed * 40)
      const sx = w / 2 + (x + jitter) * size
      const sy = h / 2 + (y + jitter) * size * 0.62
      const alpha = (0.35 + form * 0.65) * (1 - burst)
      ctx.fillStyle = `rgba(${p.seed > 0.82 ? PURPLE : CYAN}, ${alpha})`
      ctx.fillRect(sx, sy, 1.6, 1.6)
    }
  }
}

/** Layered sine waves drifting through a slow chord; bars show the levels. */
function ambience(): Draw {
  return (ctx, w, h, t) => {
    ctx.fillStyle = '#05090c'
    ctx.fillRect(0, 0, w, h)
    const mid = h * 0.45
    const layers = [
      { freq: 1.6, amp: 0.22, speed: 0.6, color: CYAN, width: 2 },
      { freq: 2.4, amp: 0.14, speed: -0.9, color: PURPLE, width: 1.5 },
      { freq: 4.1, amp: 0.07, speed: 1.4, color: '235, 250, 255', width: 1 },
    ]
    const breathe = 0.75 + 0.25 * Math.sin(t * 0.7)
    for (const layer of layers) {
      ctx.strokeStyle = `rgba(${layer.color}, 0.85)`
      ctx.lineWidth = layer.width
      ctx.shadowColor = `rgba(${layer.color}, 0.6)`
      ctx.shadowBlur = 8
      ctx.beginPath()
      for (let x = 0; x <= w; x += 3) {
        const u = x / w
        const envelope = Math.sin(u * Math.PI)
        const y = mid + Math.sin(u * Math.PI * 2 * layer.freq + t * layer.speed) * layer.amp * h * envelope * breathe
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.shadowBlur = 0
    // Level meter along the bottom.
    const bars = 32
    const barW = w / bars
    for (let i = 0; i < bars; i++) {
      const level = 0.25 + 0.75 * Math.abs(Math.sin(t * 1.3 + i * 0.55) * Math.sin(t * 0.4 + i * 0.21))
      const bh = level * h * 0.16
      ctx.fillStyle = `rgba(${i % 8 === 0 ? PURPLE : CYAN}, 0.5)`
      ctx.fillRect(i * barW + 1, h - bh - 6, barW - 3, bh)
    }
    // Occasional bell ping.
    const ping = (t % 3.2) / 3.2
    if (ping < 0.5) {
      ctx.strokeStyle = `rgba(${CYAN}, ${0.6 * (1 - ping * 2)})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(w * 0.78, mid - h * 0.12, 4 + ping * 60, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}

function loadImage(src: string) {
  const image = new Image()
  image.src = src
  return image
}

/**
 * The home hero's lens in miniature: the same two images, with a lens drifting
 * over the face and dissolving the helmet to show the photo underneath.
 */
function pilot(): Draw {
  // Both images share framing, exactly as on the Bridge.
  const suit = loadImage('/images/pilot.webp')
  const person = loadImage('/images/deepanshu-saini-cutout.webp')
  const random = mulberry32(5)
  const stars = Array.from({ length: 70 }, () => ({ x: random(), y: random(), r: 0.4 + random() * 0.9, phase: random() * 6 }))
  return (ctx, w, h, t) => {
    ctx.fillStyle = '#05090c'
    ctx.fillRect(0, 0, w, h)
    for (const star of stars) {
      ctx.fillStyle = `rgba(235, 250, 255, ${0.25 + 0.25 * Math.sin(t * 1.5 + star.phase)})`
      ctx.fillRect(star.x * w, star.y * h, star.r, star.r)
    }
    if (!suit.complete || !suit.naturalWidth || !person.complete || !person.naturalWidth) return

    // Fit the bust to the panel height, centred.
    const size = h * 1.08
    const x = (w - size) / 2
    const y = h - size * 0.97
    ctx.drawImage(suit, x, y, size, size)

    // The lens wanders over the head in a slow figure of eight.
    const lx = x + size * (0.5 + Math.sin(t * 0.7) * 0.12)
    const ly = y + size * (0.4 + Math.sin(t * 1.4) * 0.07)
    const radius = size * (0.14 + 0.012 * Math.sin(t * 2.1))
    ctx.save()
    ctx.beginPath()
    ctx.arc(lx, ly, radius, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = '#05090c'
    ctx.fillRect(lx - radius, ly - radius, radius * 2, radius * 2)
    ctx.drawImage(person, x, y, size, size)
    // Scan lines and a faint cyan cast inside the lens.
    ctx.fillStyle = `rgba(${CYAN}, 0.07)`
    ctx.fillRect(lx - radius, ly - radius, radius * 2, radius * 2)
    ctx.fillStyle = 'rgba(5, 9, 12, 0.18)'
    for (let line = ly - radius + ((t * 12) % 3); line < ly + radius; line += 3) ctx.fillRect(lx - radius, line, radius * 2, 1)
    ctx.restore()

    ctx.strokeStyle = `rgba(${CYAN}, 0.9)`
    ctx.lineWidth = 1.2
    ctx.shadowColor = `rgba(${CYAN}, 0.8)`
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(lx, ly, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
  }
}

/**
 * A small live Canvas 2D version of a world system, for its Lab card. Runs only
 * while visible; draws a single still frame for reduced motion.
 */
export function SystemDemo({ kind }: { kind: DemoKind }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * ratio)
      canvas.height = Math.round(h * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.fillStyle = '#05090c'
      ctx.fillRect(0, 0, w, h)
    }
    resize()
    const draw = { 'warp-starfield': warp, 'particle-core': core, 'procedural-ambience': ambience, 'pilot-reveal': pilot }[kind]()

    let frame = 0
    let visible = false
    const start = performance.now()
    const tick = () => {
      draw(ctx, w, h, (performance.now() - start) / 1000)
      frame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible && !reduced) frame = requestAnimationFrame(tick)
    })
    observer.observe(canvas)
    if (reduced) {
      // A representative still: mid-warp, the formed mark, a calm waveform.
      for (let i = 0; i < 40; i++) draw(ctx, w, h, kind === 'particle-core' ? 2.5 + i * 0.016 : 1.5 + i * 0.016)
      // The lens demo waits on its images, so its still is drawn once they load.
      if (kind === 'pilot-reveal') window.setTimeout(() => draw(ctx, w, h, 0), 600)
    }
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [kind])

  return <canvas ref={canvasRef} className="system-demo" aria-hidden="true" />
}
