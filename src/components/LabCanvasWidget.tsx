import { useEffect, useRef } from 'react'

type LabCanvasWidgetProps = {
  preset: 'particle-field' | 'cyber-grid' | 'aurora-pulse'
}

export function LabCanvasWidget({ preset }: LabCanvasWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400)
    let height = (canvas.height = 180)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = 180
    }

    window.addEventListener('resize', handleResize)

    // Particle setup
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1,
    }))

    let time = 0

    const render = () => {
      time += 0.02
      ctx.clearRect(0, 0, width, height)

      if (preset === 'particle-field') {
        ctx.fillStyle = '#0a1217'
        ctx.fillRect(0, 0, width, height)

        particles.forEach((p, i) => {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > width) p.vx *= -1
          if (p.y < 0 || p.y > height) p.vy *= -1

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = '#28d7ff'
          ctx.fill()

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j]
            const dx = p.x - p2.x
            const dy = p.y - p2.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 85) {
              ctx.strokeStyle = `rgba(40, 215, 255, ${0.35 * (1 - dist / 85)})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.stroke()
            }
          }
        })
      } else if (preset === 'cyber-grid') {
        ctx.fillStyle = '#070b0e'
        ctx.fillRect(0, 0, width, height)

        const horizon = height * 0.35
        ctx.strokeStyle = 'rgba(139, 92, 255, 0.25)'
        ctx.lineWidth = 1

        // Horizon glow
        const grad = ctx.createLinearGradient(0, horizon, 0, height)
        grad.addColorStop(0, 'rgba(40, 215, 255, 0.2)')
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(0, horizon, width, height - horizon)

        // Vertical perspective lines
        const numCols = 16
        for (let i = -numCols; i <= numCols; i++) {
          const startX = width / 2 + i * (width / (numCols * 0.4))
          ctx.beginPath()
          ctx.moveTo(width / 2, horizon)
          ctx.lineTo(startX, height)
          ctx.stroke()
        }

        // Horizontal moving lines
        const speed = (time * 25) % 20
        for (let y = horizon; y < height; y += 18) {
          const actualY = y + speed
          if (actualY <= height) {
            ctx.beginPath()
            ctx.moveTo(0, actualY)
            ctx.lineTo(width, actualY)
            ctx.stroke()
          }
        }
      } else if (preset === 'aurora-pulse') {
        ctx.fillStyle = '#070b0e'
        ctx.fillRect(0, 0, width, height)

        const cx1 = width * 0.3 + Math.sin(time) * 40
        const cy1 = height * 0.5 + Math.cos(time * 0.7) * 20
        const cx2 = width * 0.7 + Math.cos(time * 0.8) * 40
        const cy2 = height * 0.5 + Math.sin(time * 0.6) * 20

        const g1 = ctx.createRadialGradient(cx1, cy1, 10, cx1, cy1, 120)
        g1.addColorStop(0, 'rgba(40, 215, 255, 0.45)')
        g1.addColorStop(1, 'transparent')
        ctx.fillStyle = g1
        ctx.fillRect(0, 0, width, height)

        const g2 = ctx.createRadialGradient(cx2, cy2, 10, cx2, cy2, 110)
        g2.addColorStop(0, 'rgba(139, 92, 255, 0.4)')
        g2.addColorStop(1, 'transparent')
        ctx.fillStyle = g2
        ctx.fillRect(0, 0, width, height)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [preset])

  return (
    <div className="canvas-widget-container">
      <canvas ref={canvasRef} className="lab-canvas" />
      <span className="canvas-badge">live 60fps {preset}</span>
    </div>
  )
}
