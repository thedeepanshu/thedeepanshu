import { Camera, SquarePlay } from 'lucide-react'
import { type CSSProperties, useEffect, useRef, useState } from 'react'

import { familyChannel } from '@/content/beyond'

/** Counts from 0 to `value` once it scrolls into view (instantly for reduced motion). */
function CountUp({ value, suffix, decimals = 0 }: { value: number; suffix: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const start = performance.now()
        const tick = (now: number) => {
          const t = reduced ? 1 : Math.min(1, (now - start) / 1400)
          setShown(value * (1 - Math.pow(1 - t, 3)))
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <span ref={ref} aria-hidden="true">
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/**
 * Our family vlog, as one full-width banner: who we are, the channel's numbers,
 * where to find us, and our story so far. No photos or videos, on purpose.
 */
export function FamilyChannel() {
  const channel = familyChannel

  return (
    <div className="family-banner">
      <span className="family-watermark" aria-hidden="true">
        {channel.tagline}
      </span>

      <div className="family-top">
        <img className="family-avatar" src={channel.avatar} alt="" width={200} height={200} loading="lazy" />
        <div className="family-id">
          <p className="family-kicker">Our family vlog</p>
          <h3>{channel.name}</h3>
          <p className="family-handle">
            {channel.handle} · <em>{channel.tagline}</em>
          </p>
        </div>
        <p className="family-about">{channel.about}</p>
        {channel.pause && (
          <p className="family-pause">
            <span aria-hidden="true" />
            {channel.pause}
          </p>
        )}
      </div>

      <dl className="family-stats">
        {channel.stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>
              <CountUp value={stat.value} suffix={stat.suffix} decimals={'decimals' in stat ? stat.decimals : 0} />
              <span className="visually-hidden">
                {stat.value}
                {stat.suffix}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="family-platforms">
        <a href={channel.youtube.url} target="_blank" rel="noreferrer" className="family-platform family-platform--youtube">
          <SquarePlay size={26} aria-hidden="true" />
          <span>
            <small>Watch on YouTube</small>
            <b>{channel.youtube.handle}</b>
          </span>
          <i aria-hidden="true">↗</i>
        </a>
        <a href={channel.instagram.url} target="_blank" rel="noreferrer" className="family-platform family-platform--instagram">
          <Camera size={26} aria-hidden="true" />
          <span>
            <small>Follow on Instagram</small>
            <b>{channel.instagram.handle}</b>
          </span>
          <i aria-hidden="true">↗</i>
        </a>
      </div>

      <div className="family-story">
        <p className="family-story-title">Our story so far</p>
        <ol>
          {channel.story.map((moment, index) => (
            <li key={moment.what} style={{ '--i': index } as CSSProperties} className={index === channel.story.length - 1 ? 'is-now' : undefined}>
              <span className="family-story-dot" aria-hidden="true" />
              <time>{moment.when}</time>
              <b>{moment.what}</b>
              <span>{moment.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
