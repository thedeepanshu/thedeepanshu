import { useEffect } from 'react'
import { playWarp, setSoundEnabled } from '../audio/soundEngine'
import { useVessel } from '../world/store'

/** HUD sound switch. Also plays the warp whoosh whenever the deck changes. */
export function SoundToggle() {
  const soundOn = useVessel((state) => state.soundOn)
  const setSoundOn = useVessel((state) => state.setSoundOn)

  useEffect(() => useVessel.subscribe((state, previous) => {
    if (state.deck !== previous.deck) playWarp()
  }), [])

  const toggle = () => {
    setSoundEnabled(!soundOn)
    setSoundOn(!soundOn)
  }

  return (
    <button
      type="button"
      className={`sound-toggle${soundOn ? ' is-on' : ''}`}
      aria-pressed={soundOn}
      aria-label={soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on'}
      onClick={toggle}
    >
      <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="sound-label">Sound {soundOn ? 'on' : 'off'}</span>
    </button>
  )
}
