import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { mulberry32 } from './random'
import { SANS } from './setpieces/labels'

export type SwarmTargets = {
  noise: Float32Array
  name: Float32Array
  ship: Float32Array
  nameColor: Float32Array
  shipColor: Float32Array
  burst: Float32Array
  seed: Float32Array
}

const CYAN = new THREE.Color('#7ef4db')
const BLUE = new THREE.Color('#83b7ff')
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

/** Sleek starship built from primitives, nose along +X, about 8 units long. */
function shipParts() {
  const fuselageProfile = [
    [0, -3.7], [0.32, -3.3], [0.52, -2.2], [0.6, -0.6], [0.52, 1.0], [0.34, 2.5], [0.12, 3.6], [0, 4.0],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const fuselage = new THREE.LatheGeometry(fuselageProfile, 28).rotateZ(-Math.PI / 2)
  fuselage.scale(1, 0.75, 1)

  const wingShape = new THREE.Shape()
  wingShape.moveTo(1.4, 0)
  wingShape.lineTo(-2.3, 3.5)
  wingShape.lineTo(-3.0, 3.5)
  wingShape.lineTo(-2.3, 0)
  wingShape.lineTo(-3.0, -3.5)
  wingShape.lineTo(-2.3, -3.5)
  wingShape.closePath()
  const wings = new THREE.ExtrudeGeometry(wingShape, { depth: 0.08, bevelEnabled: false }).rotateX(-Math.PI / 2)
  wings.translate(0, -0.12, 0)

  const finShape = new THREE.Shape()
  finShape.moveTo(-1.2, 0)
  finShape.lineTo(-2.9, 1.3)
  finShape.lineTo(-3.3, 1.3)
  finShape.lineTo(-2.9, 0)
  finShape.closePath()
  const fin = new THREE.ExtrudeGeometry(finShape, { depth: 0.06, bevelEnabled: false })
  fin.translate(0, 0.25, -0.03)

  const engines = new THREE.CylinderGeometry(0.3, 0.36, 1.4, 20, 1, true).rotateZ(Math.PI / 2)
  const engineLeft = engines.clone().translate(-3.0, -0.05, 0.75)
  const engineRight = engines.clone().translate(-3.0, -0.05, -0.75)

  const exhaust = new THREE.CircleGeometry(0.3, 20).rotateY(-Math.PI / 2)
  const exhaustLeft = exhaust.clone().translate(-3.72, -0.05, 0.75)
  const exhaustRight = exhaust.clone().translate(-3.72, -0.05, -0.75)

  const halo = new THREE.TorusGeometry(1.75, 0.03, 6, 120).rotateY(Math.PI / 2)
  halo.translate(-0.6, 0, 0)

  return [
    { geometries: [fuselage], share: 0.34, colors: [CYAN, WHITE, BLUE] },
    { geometries: [wings], share: 0.26, colors: [CYAN, BLUE] },
    { geometries: [fin], share: 0.05, colors: [CYAN] },
    { geometries: [engineLeft, engineRight], share: 0.13, colors: [BLUE, PURPLE] },
    { geometries: [exhaustLeft, exhaustRight], share: 0.1, colors: [PURPLE, WHITE] },
    { geometries: [halo], share: 0.12, colors: [PURPLE, CYAN] },
  ]
}

// three ships setRandomGenerator, but @types/three doesn't declare it yet.
type SeededSampler = MeshSurfaceSampler & { setRandomGenerator(random: () => number): MeshSurfaceSampler }

function sampleShip(count: number, random: () => number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const point = new THREE.Vector3()
  const material = new THREE.MeshBasicMaterial()
  let index = 0

  const parts = shipParts()
  parts.forEach((part, partIndex) => {
    const partCount = partIndex === parts.length - 1 ? count - index : Math.floor(count * part.share)
    const samplers = part.geometries.map((geometry) => {
      const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry, material)) as SeededSampler
      return sampler.setRandomGenerator(random).build()
    })
    for (let i = 0; i < partCount; i++) {
      samplers[i % samplers.length].sample(point)
      positions.set([point.x, point.y, point.z], index * 3)
      const color = part.colors[Math.floor(random() * part.colors.length)]
      colors.set([color.r, color.g, color.b], index * 3)
      index++
    }
    part.geometries.forEach((geometry) => geometry.dispose())
  })
  material.dispose()
  return { positions, colors }
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
  const ship = sampleShip(count, random)

  return { noise, name, ship: ship.positions, nameColor, shipColor: ship.colors, burst, seed }
}
