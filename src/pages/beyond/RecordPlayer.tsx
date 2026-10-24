import { Pause, Play, X } from 'lucide-react'
import { useState } from 'react'

import { ExternalLink } from '@/components/ExternalLink'
import { type Artist, listening, type Track } from '@/content/beyond'
import { useMusicDuck } from '@/hooks/useMusicDuck'

function playerSrc(track: Track) {
  if (track.spotify) return `https://open.spotify.com/embed/track/${track.spotify}?utm_source=generator&theme=0`
  return `https://www.youtube-nocookie.com/embed/${track.youtube}?autoplay=1&rel=0`
}

/** The song that's playing, in a compact player right under the tracklist. */
function TrackPlayer({ artist, track, onClose }: { artist: Artist; track: Track; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const source = track.spotify ? 'Spotify' : 'YouTube'

  return (
    <div className={`track-player track-player--${track.spotify ? 'spotify' : 'youtube'}${loaded ? ' is-loaded' : ''}`}>
      <div className="track-player-frame">
        {!loaded && (
          <p className="track-player-loading" role="status">
            Loading {track.title} from {source}…
          </p>
        )}
        <iframe
          src={playerSrc(track)}
          title={`${track.title} by ${artist.name} on ${source}`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="track-player-bar">
        <span>{track.spotify ? 'Press play in the Spotify player' : 'Playing from the official YouTube upload'}</span>
        <button type="button" className="track-player-close" onClick={onClose}>
          <X size={14} aria-hidden="true" /> Close
        </button>
      </div>
    </div>
  )
}

/**
 * On repeat: a crate of records and a turntable. Pick a sleeve and its record
 * drops onto the platter; tap a track and it plays in a compact player right
 * there (loaded only on request), while the site's own music fades out.
 */
export function RecordPlayer() {
  const [currentId, setCurrentId] = useState(listening[0]?.id)
  const [playing, setPlaying] = useState<number | null>(null)
  const artist = listening.find((item) => item.id === currentId) ?? listening[0]
  useMusicDuck(playing !== null)

  if (!artist) return null
  const track = playing === null ? null : artist.tracks[playing]

  const pickArtist = (id: string) => {
    if (id === currentId) return
    setCurrentId(id)
    setPlaying(null)
  }

  return (
    <div className={`record-player${track ? ' is-playing' : ''}`}>
      {/* Warm up the connections so a track's player opens quickly. */}
      <link rel="preconnect" href="https://open.spotify.com" />
      <link rel="preconnect" href="https://www.youtube-nocookie.com" />

      <div className="record-crate" role="group" aria-label="Artists on repeat">
        {listening.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={`record-sleeve${item.id === artist.id ? ' is-current' : ''}`}
            aria-pressed={item.id === artist.id}
            onClick={() => pickArtist(item.id)}
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

        <div className="turntable-head">
          <p className="turntable-kicker">
            <span className="eq" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            {track ? 'Now playing' : 'Now spinning'}
          </p>
          <h3>{artist.name}</h3>
          <p className="turntable-scene">
            {artist.scene} · <span>{artist.artCaption}</span>
          </p>
          {artist.note && <p className="turntable-note">“{artist.note}”</p>}
        </div>

        <div className="turntable-body">
          <p className="turntable-label" id="turntable-tracks-label">
            Tracks · tap to play
          </p>
          <ol className="turntable-tracks" aria-labelledby="turntable-tracks-label">
            {artist.tracks.map((item, index) => {
              const active = index === playing
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    className={`track-row${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => setPlaying(active ? null : index)}
                  >
                    <span className="track-row-num" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="track-row-title">{item.title}</span>
                    <span className="track-row-source">{item.spotify ? 'Spotify' : 'YouTube'}</span>
                    <span className="track-row-icon" aria-hidden="true">
                      {active ? <Pause size={14} /> : <Play size={14} />}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          {track && <TrackPlayer key={`${artist.id}-${playing}`} artist={artist} track={track} onClose={() => setPlaying(null)} />}

          <ExternalLink className="turntable-spotify" href={`https://open.spotify.com/artist/${artist.spotifyId}`}>
            More {artist.name} on Spotify <span aria-hidden="true">↗</span>
          </ExternalLink>
        </div>
      </div>
    </div>
  )
}
