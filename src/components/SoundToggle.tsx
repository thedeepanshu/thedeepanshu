import { useEffect, useRef, useState } from 'react'
import { playUi, playWarp, SOUND_PRESETS } from '../audio/soundEngine'
import { useVessel } from '../world/store'

const INTERACTIVE = 'a, button, [role="button"], select, summary, input[type="checkbox"], input[type="radio"]'

/**
 * HUD sound control: a button that opens three presets. Also plays the warp
 * whoosh on deck changes and UI blips (the engine stays silent when off).
 */
export function SoundToggle() {
  const soundMode = useVessel((state) => state.soundMode)
  const setSoundMode = useVessel((state) => state.setSoundMode)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const current = SOUND_PRESETS.find((preset) => preset.mode === soundMode) ?? SOUND_PRESETS[2]

  useEffect(() => useVessel.subscribe((state, previous) => {
    if (state.deck !== previous.deck) playWarp()
  }), [])

  // A soft tick when the pointer enters something clickable, a confirm on press.
  // The engine is silent unless sound is on, so these are cheap to leave bound.
  useEffect(() => {
    let hovered: Element | null = null
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const target = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null
      if (target && target !== hovered) playUi('hover')
      hovered = target
    }
    const onDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest(INTERACTIVE)) playUi('click')
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerover', onOver)
    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [])

  // While open: focus the chosen preset; close on Escape or a click elsewhere.
  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLInputElement>('input:checked')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div className="sound-control" ref={root}>
      {open && (
        <fieldset className="sound-menu">
          <legend>Sound</legend>
          {SOUND_PRESETS.map((preset) => (
            <label key={preset.mode} className={`sound-option${preset.mode === soundMode ? ' is-selected' : ''}`}>
              <input type="radio" name="sound-mode" value={preset.mode} checked={preset.mode === soundMode} onChange={() => setSoundMode(preset.mode)} />
              <span className="sound-option-text">
                <b>{preset.label}</b>
                <small>{preset.description}</small>
              </span>
            </label>
          ))}
        </fieldset>
      )}
      <button
        ref={button}
        type="button"
        className={`sound-toggle is-${soundMode}${soundMode !== 'off' ? ' is-on' : ''}`}
        aria-expanded={open}
        aria-label={`Sound: ${current.label}. Change sound`}
        onClick={() => setOpen(!open)}
      >
        <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="sound-label">Sound · {current.label}</span>
      </button>
    </div>
  )
}
