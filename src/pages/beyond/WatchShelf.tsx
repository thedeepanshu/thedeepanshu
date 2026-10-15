import { useState, type PointerEvent } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { watching, type WatchItem, type WatchStatus } from '../../content/beyond'
import { VideoDialog } from './VideoDialog'

const STATUS: Record<WatchStatus, string> = {
  started: 'Just started',
  following: 'Following',
  finished: 'Just finished',
  watched: 'Watched',
}

/** Poster tilts toward the pointer, with a glare that follows it. */
function tilt(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const card = event.currentTarget
  const box = card.getBoundingClientRect()
  const x = (event.clientX - box.left) / box.width
  const y = (event.clientY - box.top) / box.height
  card.style.setProperty('--tilt-x', `${(0.5 - y) * 12}deg`)
  card.style.setProperty('--tilt-y', `${(x - 0.5) * 14}deg`)
  card.style.setProperty('--glare-x', `${x * 100}%`)
  card.style.setProperty('--glare-y', `${y * 100}%`)
}

function untilt(event: PointerEvent<HTMLElement>) {
  const card = event.currentTarget
  card.style.setProperty('--tilt-x', '0deg')
  card.style.setProperty('--tilt-y', '0deg')
}

/** Now watching: posters that tilt, flip for details, and play the trailer. */
export function WatchShelf() {
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set())
  const [trailer, setTrailer] = useState<WatchItem | null>(null)

  const flip = (id: string) => setFlipped((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  return (
    <>
      <div className="watch-shelf">
        {watching.map((item) => {
          const isFlipped = flipped.has(item.id)
          return (
            <article className={`watch-card watch-card--${item.status}${isFlipped ? ' is-flipped' : ''}`} key={item.id}>
              <div className="watch-tilt" onPointerMove={tilt} onPointerLeave={untilt}>
                <button type="button" className="watch-flip" aria-pressed={isFlipped} aria-label={`${isFlipped ? 'Hide' : 'Show'} details for ${item.title}`} onClick={() => flip(item.id)}>
                  <span className="watch-inner">
                    <span className="watch-face watch-front">
                      <img src={item.poster} alt="" loading="lazy" width={420} height={630} />
                      <span className="watch-status"><i aria-hidden="true" />{STATUS[item.status]}</span>
                      <span className="watch-glare" aria-hidden="true" />
                    </span>
                    <span className="watch-face watch-back" aria-hidden={!isFlipped}>
                      <span className="watch-back-kicker">{item.genre}</span>
                      <span className="watch-back-logline">{item.logline}</span>
                      <span className="watch-back-label">Starring</span>
                      <span className="watch-back-cast">{item.starring.join(', ')}</span>
                      {item.note && <span className="watch-back-note">“{item.note}”</span>}
                      <span className="watch-back-hint"><RotateCcw size={13} aria-hidden="true" /> Tap to flip back</span>
                    </span>
                  </span>
                </button>
              </div>
              <div className="watch-caption">
                <h3>{item.title}{item.season && <small> {item.season}</small>}</h3>
                <p>{item.kind} · {item.year} · {item.platform}</p>
                <button type="button" className="watch-trailer" onClick={() => setTrailer(item)}>
                  <Play size={14} aria-hidden="true" /> Watch trailer
                </button>
              </div>
            </article>
          )
        })}
      </div>
      {trailer && (
        <VideoDialog
          videoId={trailer.trailer}
          title={`${trailer.title}: official trailer`}
          caption={`${trailer.title}${trailer.season ? ` · ${trailer.season}` : ''} · trailer by ${trailer.trailerSource}`}
          onClose={() => setTrailer(null)}
        />
      )}
    </>
  )
}
