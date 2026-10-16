import { type CSSProperties, type PointerEvent, useRef, useState } from 'react'

import { lifeStories } from '@/content/beyond'

type Spot = { x: number; y: number; r: number }

// Where the undeveloped Polaroids start, in % of the board, with a tilt.
const START: Spot[] = [
  { x: 6, y: 12, r: -7 },
  { x: 27, y: 30, r: 5 },
  { x: 47, y: 8, r: -3 },
  { x: 66, y: 28, r: 8 },
  { x: 82, y: 6, r: -5 },
]
const CAPTIONS = ['developing…', 'a trip', 'family', 'a misadventure', 'soon']

/**
 * Life log. Until the stories are in, it's a board of Polaroids still
 * developing. Visitors can drag them around while they wait (pointer only;
 * the message carries the content for everyone else).
 */
export function StoryBoard() {
  const board = useRef<HTMLDivElement>(null)
  const drag = useRef<{ index: number; dx: number; dy: number } | null>(null)
  const [spots, setSpots] = useState(START)
  const [order, setOrder] = useState(() => START.map((_, index) => index))
  const [held, setHeld] = useState<number | null>(null)

  if (lifeStories.length > 0) {
    return (
      <div className="story-grid">
        {lifeStories.map((story) => (
          <article className="story-card" key={story.id}>
            {story.photos[0] && <img src={story.photos[0]} alt="" loading="lazy" />}
            <p className="story-date">
              {story.date}
              {story.place ? ` · ${story.place}` : ''}
            </p>
            <h3>{story.title}</h3>
            <p>{story.story}</p>
          </article>
        ))}
      </div>
    )
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>, index: number) => {
    const box = board.current?.getBoundingClientRect()
    if (!box) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const spot = spots[index]
    setHeld(index)
    drag.current = { index, dx: event.clientX - (box.left + (spot.x / 100) * box.width), dy: event.clientY - (box.top + (spot.y / 100) * box.height) }
    // Bring the picked-up photo to the top of the pile.
    setOrder((current) => [...current.filter((item) => item !== index), index])
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = board.current?.getBoundingClientRect()
    const active = drag.current
    if (!box || !active) return
    const x = ((event.clientX - active.dx - box.left) / box.width) * 100
    const y = ((event.clientY - active.dy - box.top) / box.height) * 100
    setSpots((current) =>
      current.map((spot, index) => (index === active.index ? { ...spot, x: Math.min(86, Math.max(-4, x)), y: Math.min(62, Math.max(-6, y)) } : spot)),
    )
  }

  const onPointerUp = () => {
    drag.current = null
    setHeld(null)
  }

  return (
    <div className="story-board-wrap">
      <div className="story-board" ref={board} aria-hidden="true">
        {spots.map((spot, index) => (
          <div
            key={index}
            className={`polaroid${held === index ? ' is-held' : ''}`}
            style={
              { left: `${spot.x}%`, top: `${spot.y}%`, zIndex: order.indexOf(index) + 1, '--r': `${spot.r}deg`, '--delay': `${index * -1.3}s` } as CSSProperties
            }
            onPointerDown={(event) => onPointerDown(event, index)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span className="polaroid-photo" />
            <span className="polaroid-caption">{CAPTIONS[index]}</span>
          </div>
        ))}
      </div>
      <div className="story-message">
        <p className="story-message-kicker">
          <span aria-hidden="true">●</span> In the darkroom
        </p>
        <p className="story-message-title">More stories are developing.</p>
        <p>Photo stories from our life: trips, milestones and the odd misadventure. They’ll be pinned up here soon.</p>
        <p className="story-message-hint" aria-hidden="true">
          Drag the photos around while you wait.
        </p>
      </div>
    </div>
  )
}
