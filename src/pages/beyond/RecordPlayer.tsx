import { Music2, X } from 'lucide-react'
import { useState } from 'react'

import { listening } from '@/content/beyond'
import { useMusicDuck } from '@/hooks/useMusicDuck'

/**
 * On repeat: a crate of records and a turntable. Pick a sleeve and its record
 * drops onto the platter; "Play on Spotify" opens the artist's player (loaded
 * only on request) and the site's own music fades out while it's open.
 */
export function RecordPlayer() {
  const [currentId, setCurrentId] = useState(listening[0]?.id)
  const [spotifyOpen, setSpotifyOpen] = useState(false)
  const artist = listening.find((item) => item.id === currentId) ?? listening[0]
  useMusicDuck(spotifyOpen)

  if (!artist) return null

  return (
    <div className={`record-player${spotifyOpen ? ' is-playing' : ''}`}>
      <div className="record-crate" role="group" aria-label="Artists on repeat">
        {listening.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={`record-sleeve${item.id === artist.id ? ' is-current' : ''}`}
            aria-pressed={item.id === artist.id}
            onClick={() => setCurrentId(item.id)}
          >
            <img src={item.art} alt="" loading="lazy" width={480} height={480} />
            <span className="record-sleeve-text">
              <small>
                {String(index + 1).padStart(2, '0')} · {item.scene}
              </small>
              <b>{item.name}</b>
            </span>
          </button>
        ))}
      </div>

      <div className="turntable">
        <div className="turntable-deck" aria-hidden="true">
          <div className="turntable-platter">
            {/* Keyed so each new record drops in fresh. */}
            <div className="vinyl" key={artist.id}>
              <img className="vinyl-label" src={artist.art} alt="" />
              <span className="vinyl-spindle" />
            </div>
          </div>
          <span className="tonearm">
            <i />
          </span>
          <span className="turntable-light" />
        </div>

        <div className="turntable-info">
          <p className="turntable-kicker">
            <span className="eq" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            Now spinning
          </p>
          <h3>{artist.name}</h3>
          <p className="turntable-scene">
            {artist.scene} · <span>{artist.artCaption}</span>
          </p>
          {artist.note && <p className="turntable-note">“{artist.note}”</p>}
          <p className="turntable-label">Popular tracks</p>
          <ol className="turntable-tracks">
            {artist.tracks.map((track) => (
              <li key={track}>{track}</li>
            ))}
          </ol>
          <button type="button" className="spotify-toggle" aria-expanded={spotifyOpen} onClick={() => setSpotifyOpen(!spotifyOpen)}>
            {spotifyOpen ? (
              <>
                <X size={15} aria-hidden="true" /> Close player
              </>
            ) : (
              <>
                <Music2 size={15} aria-hidden="true" /> Play on Spotify
              </>
            )}
          </button>
        </div>
      </div>

      {spotifyOpen && (
        <div className="spotify-frame">
          <iframe
            key={artist.spotifyId}
            src={`https://open.spotify.com/embed/artist/${artist.spotifyId}?utm_source=generator&theme=0`}
            title={`${artist.name} on Spotify`}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}
    </div>
  )
}
