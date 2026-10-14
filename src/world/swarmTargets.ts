import * as THREE from 'three'
import { mulberry32 } from './random'
import { SANS } from './setpieces/labels'

export type SwarmTargets = {
  noise: Float32Array
  name: Float32Array
  nameColor: Float32Array
  burst: Float32Array
  seed: Float32Array
}

const CYAN = new THREE.Color('#7ef4db')
const PURPLE = new THREE.Color('#a17eff')
const WHITE = new THREE.Color('#eafffb')


/** Samples filled pixels of the rendered word into a centred point cloud `width` units wide. */
function sampleText(text: string, width: number, count: number, random: () => number) {
  const canvas = document.createElement('canvas')
  canvas.width = 1400
  canvas.height = 260
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const out = new Float32Array(count * 3)
  if (!ctx) return out

  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 200px ${SANS}`
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '18px'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const filled: number[] = []
  let minX = canvas.width
  let maxX = 0
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      if (data[(y * canvas.width + x) * 4 + 3] > 128) {
        filled.push(x, y)
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
      }
    }
  }
  if (filled.length === 0) return out

  const scale = width / Math.max(1, maxX - minX)
  const centreX = (minX + maxX) / 2
  const pixels = filled.length / 2
  for (let i = 0; i < count; i++) {
    const p = Math.floor(random() * pixels) * 2
    out[i * 3] = (filled[p] - centreX + (random() - 0.5) * 2) * scale
    out[i * 3 + 1] = -(filled[p + 1] - canvas.height / 2 + (random() - 0.5) * 2) * scale
    out[i * 3 + 2] = (random() - 0.5) * 0.25
  }
  return out
}

export function buildSwarmTargets(count: number, nameWidth: number): SwarmTargets {
  const random = mulberry32(1993)
  const noise = new Float32Array(count * 3)
  const burst = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const nameColor = new Float32Array(count * 3)
  const direction = new THREE.Vector3()

  for (let i = 0; i < count; i++) {
    // Static: a wide, flat slab of noise in front of the camera.
    noise[i * 3] = (random() - 0.5) * 22
    noise[i * 3 + 1] = (random() - 0.5) * 13
    noise[i * 3 + 2] = (random() - 0.5) * 6
    direction.set(random() - 0.5, random() - 0.5, random() - 0.5).normalize()
    burst.set([direction.x, direction.y, direction.z], i * 3)
    seed[i] = random()
    const color = random() > 0.82 ? PURPLE : random() > 0.35 ? CYAN : WHITE
    nameColor.set([color.r, color.g, color.b], i * 3)
  }

  const name = sampleText('DEEPANSHU', nameWidth, count, random)

  return { noise, name, nameColor, burst, seed }
}
