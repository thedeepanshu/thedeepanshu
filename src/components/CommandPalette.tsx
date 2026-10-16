import './CommandPalette.css'

import { Check, Compass, Copy, CornerDownLeft, ExternalLink, FileDown, Mail, Rocket, Search, Terminal, Volume1, Volume2, VolumeX } from 'lucide-react'
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SOUND_PRESETS } from '@/audio/soundEngine'
import { resumes } from '@/config/site'
import { missions, socialLinks } from '@/content/portfolio'
import { type DeckId, decks } from '@/world/decks'
import { useVessel } from '@/world/store'

import { IS_MAC, PALETTE_SHORTCUT } from './shortcuts'

type Command = {
  id: string
  group: string
  title: string
  hint: string
  icon: ReactNode
  /** Extra words people might search for. */
  keywords?: string
  /** Return false to keep the palette open (e.g. after a sound change). */
  run: () => boolean | void
}

/** Plain-language names, so visitors who don't know the ship metaphor still find things. */
const DECK_COPY: Partial<Record<DeckId, [title: string, hint: string, keywords: string]>> = {
  bridge: ['Home', 'The bridge, where it starts', 'start landing index'],
  origin: ['Origin', 'About me, my story and how I work', 'about bio profile story'],
  missions: ['Missions', 'Selected work and case studies', 'projects work portfolio case studies'],
  arsenal: ['Arsenal', 'Skills and tools', 'skills stack tech tools'],
  journey: ['Journey', 'Experience, year by year', 'experience timeline career history'],
  lab: ['Lab', 'Experiments and how this site is built', 'experiments demos playground'],
  beyond: [
    'Beyond',
    'Off duty: watching, music, learning',
    'hobbies personal life movies series music songs learning stories family vlog youtube instagram doli',
  ],
  signal: ['Signal', 'Get in touch', 'contact hire email message'],
}

const SOUND_ICONS = { ambient: <Volume2 size={16} />, minimal: <Volume1 size={16} />, off: <VolumeX size={16} /> }

/** Whatever had focus before the palette opened; focus goes back there on close. */
let opener: HTMLElement | null = null

function openPalette(from: HTMLElement | null) {
  opener = from
  useVessel.getState().setPaletteOpen(true)
}

/** Close without restoring focus: used when the command moves focus elsewhere. */
function dismissPalette() {
  opener = null
  useVessel.getState().setPaletteOpen(false)
}

function download(path: string) {
  const link = document.createElement('a')
  link.href = path
  link.download = path.slice(1)
  link.click()
}

function matches(command: Command, query: string) {
  const haystack = `${command.title} ${command.hint} ${command.group} ${command.keywords ?? ''}`.toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

/**
 * Command palette (Ctrl/⌘ K): a friendly, searchable version of the ship
 * console for visitors who'd rather click than type commands. This part owns
 * the shortcut and focus return; the dialog mounts fresh on every opening.
 */
export function CommandPalette() {
  const open = useVessel((state) => state.paletteOpen)

  // Ctrl/⌘ K toggles the palette anywhere once aboard.
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return
      const { bootPhase, paletteOpen, setPaletteOpen } = useVessel.getState()
      if (bootPhase !== 'done') return
      event.preventDefault()
      if (paletteOpen) setPaletteOpen(false)
      else openPalette(document.activeElement as HTMLElement | null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) return
    opener?.focus?.()
    opener = null
  }, [open])

  return open ? <PaletteDialog /> : null
}

/** The HUD button for the palette, shown next to the sound control. */
export function PaletteToggle() {
  const open = useVessel((state) => state.paletteOpen)
  const booted = useVessel((state) => state.bootPhase === 'done')
  if (!booted) return null
  return (
    <button
      type="button"
      className="palette-toggle"
      aria-label="Open quick navigation"
      aria-keyshortcuts={IS_MAC ? 'Meta+K' : 'Control+K'}
      aria-expanded={open}
      onClick={(event) => {
        if (open) useVessel.getState().setPaletteOpen(false)
        else openPalette(event.currentTarget)
      }}
    >
      <Search size={13} aria-hidden="true" />
      <span className="palette-toggle-label">Jump to</span>
      <kbd>{PALETTE_SHORTCUT}</kbd>
    </button>
  )
}

/**
 * A modal dialog using the combobox pattern: focus stays in the search field,
 * arrows move the highlight, Enter runs it.
 */
function PaletteDialog() {
  const navigate = useNavigate()
  const soundMode = useVessel((state) => state.soundMode)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)

  const commands = useMemo<Command[]>(() => {
    const email = socialLinks.find((link) => link.url.startsWith('mailto:'))
    const external = socialLinks.filter((link) => link.url.startsWith('http'))
    return [
      ...decks.flatMap((deck) => {
        const copy = DECK_COPY[deck.id]
        if (!copy) return []
        const [title, hint, keywords] = copy
        return [
          {
            id: `deck-${deck.id}`,
            group: 'Go to',
            title,
            hint,
            icon: <Compass size={16} />,
            keywords: `${deck.label} deck ${deck.number} ${keywords}`,
            run: () => {
              navigate(deck.path)
            },
          },
        ]
      }),
      ...missions.map((mission) => ({
        id: `mission-${mission.id}`,
        group: 'Missions',
        title: mission.title,
        hint: `M/${mission.number} · ${mission.type}`,
        icon: <Rocket size={16} />,
        keywords: `project ${mission.technologies.join(' ')}`,
        run: () => {
          navigate(`/missions#${mission.id}`)
        },
      })),
      {
        id: 'resume-ats',
        group: 'Résumé',
        title: 'Download résumé',
        hint: 'Simple, ATS-friendly PDF',
        icon: <FileDown size={16} />,
        keywords: 'resume cv pdf',
        run: () => {
          download(resumes.ats)
        },
      },
      {
        id: 'resume-visual',
        group: 'Résumé',
        title: 'Download visual résumé',
        hint: 'Designed PDF',
        icon: <FileDown size={16} />,
        keywords: 'resume cv pdf fancy',
        run: () => {
          download(resumes.visual)
        },
      },
      ...(email
        ? [
            {
              id: 'email',
              group: 'Contact',
              title: 'Write an email',
              hint: email.handle,
              icon: <Mail size={16} />,
              keywords: 'contact hire mail',
              run: () => {
                window.location.href = email.url
              },
            },
            {
              id: 'copy-email',
              group: 'Contact',
              title: copied ? 'Email address copied' : 'Copy email address',
              hint: email.handle,
              icon: copied ? <Check size={16} /> : <Copy size={16} />,
              keywords: 'contact clipboard',
              run: () => {
                void navigator.clipboard?.writeText(email.handle).then(() => {
                  setCopied(true)
                  window.setTimeout(() => setCopied(false), 1800)
                })
                return false
              },
            },
          ]
        : []),
      ...external.map((link) => ({
        id: `link-${link.name.toLowerCase()}`,
        group: 'Contact',
        title: `Open ${link.name}`,
        hint: link.handle,
        icon: <ExternalLink size={16} />,
        keywords: `social ${link.platform}`,
        run: () => {
          window.open(link.url, '_blank', 'noopener,noreferrer')
        },
      })),
      ...SOUND_PRESETS.map((preset) => ({
        id: `sound-${preset.mode}`,
        group: 'Sound',
        title: `Sound: ${preset.label}`,
        hint: preset.mode === soundMode ? `${preset.description} (current)` : preset.description,
        icon: preset.mode === soundMode ? <Check size={16} /> : SOUND_ICONS[preset.mode],
        keywords: 'audio music mute volume',
        run: () => {
          useVessel.getState().setSoundMode(preset.mode)
          return false
        },
      })),
      {
        id: 'console',
        group: 'For developers',
        title: 'Open the ship console',
        hint: 'A terminal for the ship. Shortcut: ~',
        icon: <Terminal size={16} />,
        keywords: 'terminal command line cli',
        run: () => {
          // Opening the console closes the palette (they never stack).
          opener = null
          useVessel.getState().setConsoleOpen(true)
          return false
        },
      },
    ]
  }, [navigate, copied, soundMode])

  const results = useMemo(() => commands.filter((command) => matches(command, query)), [commands, query])
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0))

  useEffect(() => {
    input.current?.focus()
  }, [])

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const runCommand = (command: Command | undefined) => {
    if (!command) return
    // Navigating or leaving the page: focus belongs to the new deck, not the opener.
    if (command.run() !== false) dismissPalette()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const last = results.length - 1
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = activeIndex + (event.key === 'ArrowDown' ? 1 : -1)
      setActive(next > last ? 0 : next < 0 ? last : next)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runCommand(results[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      useVessel.getState().setPaletteOpen(false)
    } else if (event.key === 'Tab') {
      // The search field is the only stop in the dialog.
      event.preventDefault()
    }
  }

  // Options grouped in the order they first appear; `index` is the flat position.
  const groups: { name: string; items: { command: Command; index: number }[] }[] = []
  results.forEach((command, index) => {
    let group = groups.find((entry) => entry.name === command.group)
    if (!group) groups.push((group = { name: command.group, items: [] }))
    group.items.push({ command, index })
  })

  return (
    <div
      className="palette-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) useVessel.getState().setPaletteOpen(false)
      }}
    >
      <div className="palette" role="dialog" aria-modal="true" aria-label="Quick navigation">
        <div className="palette-search">
          <Search size={18} aria-hidden="true" />
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[activeIndex] ? `palette-${results[activeIndex].id}` : undefined}
            aria-autocomplete="list"
            aria-label="Search pages, missions and actions"
            placeholder="Where to? Try “skills”, “resume” or “contact”"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
          />
          <kbd aria-hidden="true">Esc</kbd>
        </div>

        <div className="palette-results" id="palette-results" role="listbox" aria-label="Results" ref={list}>
          {groups.map((group) => {
            const groupId = `palette-group-${group.name.toLowerCase().replace(/[^a-z]+/g, '-')}`
            return (
              <div role="group" aria-labelledby={groupId} className="palette-group" key={group.name}>
                <p className="palette-group-name" id={groupId}>
                  {group.name}
                </p>
                {group.items.map(({ command, index }) => (
                  // Combobox pattern: focus stays in the search field (aria-activedescendant),
                  // so options are never focused and keys are handled by the input.
                  // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events
                  <div
                    key={command.id}
                    id={`palette-${command.id}`}
                    role="option"
                    tabIndex={-1}
                    aria-selected={index === activeIndex}
                    className="palette-option"
                    onMouseMove={() => {
                      if (index !== activeIndex) setActive(index)
                    }}
                    onClick={() => runCommand(command)}
                  >
                    <span className="palette-option-icon" aria-hidden="true">
                      {command.icon}
                    </span>
                    <span className="palette-option-text">
                      <b>{command.title}</b>
                      <small>{command.hint}</small>
                    </span>
                    {index === activeIndex && <CornerDownLeft className="palette-option-enter" size={14} aria-hidden="true" />}
                  </div>
                ))}
              </div>
            )
          })}
          {results.length === 0 && <p className="palette-empty">Nothing matches “{query}”. Try “contact” or “missions”.</p>}
        </div>

        <footer className="palette-foot" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>Esc</kbd> close
          </span>
        </footer>
      </div>
    </div>
  )
}
