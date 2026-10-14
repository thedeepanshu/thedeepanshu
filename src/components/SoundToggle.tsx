import { useEffect } from 'react'
import { playUi, playWarp, setSoundEnabled } from '../audio/soundEngine'
import { useVessel } from '../world/store'

const INTERACTIVE = 'a, button, [role="button"], select, summary, input[type="checkbox"], input[type="radio"]'

/** HUD sound switch. Also plays the warp whoosh on deck changes and UI blips. */
export function SoundToggle() {
  const soundOn = useVessel((state) => state.soundOn)
  const setSoundOn = useVessel((state) => state.setSoundOn)

  useEffect(() => useVessel.subscribe((state, previous) => {
    if (state.deck !== previous.deck) playWarp()
  }), [])

  // A soft tick when the pointer enters something clickable, a confirm on press.
  // The engine is silent unless sound is on, so these are cheap to leave bound.
  useEffect(() => {
    let current: Element | null = null
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const target = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null
      if (target && target !== current) playUi('hover')
      current = target
    }
    const onDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest(INTERACTIVE)) playUi('click')
    }
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [])

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
