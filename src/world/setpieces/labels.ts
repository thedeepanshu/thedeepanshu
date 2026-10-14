import * as THREE from 'three'

export type LabelLine = {
  text: string
  size: number
  color: string
  mono?: boolean
  weight?: number
  /** Extra letter spacing in px (canvas `letterSpacing`). */
  tracking?: number
  gap?: number
  /** Wrap onto extra lines instead of squashing to fit. */
  wrap?: boolean
}

const SANS = "'Space Grotesk', 'Segoe UI', sans-serif"
const MONO = "'Courier New', monospace"

/**
 * Renders stacked lines of text into a transparent canvas texture, left-aligned,
 * for holograms and sprite labels. `width`/`height` are in canvas pixels.
 */
export function makeLabelTexture(
  lines: LabelLine[],
  width = 1024,
  height = 256,
  padding = 24,
  decorate?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    const maxWidth = width - padding * 2
    let y = padding
    for (const line of lines) {
      ctx.font = `${line.weight ?? 400} ${line.size}px ${line.mono ? MONO : SANS}`
      ctx.fillStyle = line.color
      if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${line.tracking ?? 0}px`
      const rows: string[] = []
      if (line.wrap) {
        let row = ''
        for (const word of line.text.split(' ')) {
          const next = row ? `${row} ${word}` : word
          if (row && ctx.measureText(next).width > maxWidth) {
            rows.push(row)
            row = word
          } else {
            row = next
          }
        }
        rows.push(row)
      } else {
        rows.push(line.text)
      }
      for (const row of rows) {
        ctx.fillText(row, padding, y, maxWidth)
        y += line.size * 1.08
      }
      y += line.gap ?? 10
    }
    decorate?.(ctx, width, height)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
