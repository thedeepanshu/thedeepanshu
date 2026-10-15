import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { dossier, missions, skills, socialLinks } from '../content/portfolio'
import { decks } from '../world/decks'
import { preferredSoundMode, useVessel } from '../world/store'
import './ShipConsole.css'

type Line = { id: number; kind: 'input' | 'output' | 'error'; text: string }

const CHARTED = decks.filter((deck) => deck.id !== 'void')
/** Deck names you can type, mapped to routes. Page names work as aliases. */
const DESTINATIONS: Record<string, string> = {
  ...Object.fromEntries(CHARTED.map((deck) => [deck.id, deck.path])),
  home: '/', about: '/about', contact: '/signal', skills: '/arsenal', projects: '/missions', work: '/missions',
}

const COMMANDS = ['help', 'goto', 'decks', 'whoami', 'missions', 'skills', 'resume', 'hire', 'contact', 'sound', 'scan', 'warp', 'clear', 'exit', 'self-destruct']

const HELP = [
  'help                 this list',
  'goto <deck>          fly to a deck (try: goto missions)',
  'decks                list every deck on the ship',
  'whoami               pilot identification',
  'missions | skills    quick summaries',
  'resume               download the résumé',
  'hire | contact       open a channel to the pilot',
  'sound <preset>       ambient, minimal (effects only) or off',
  'scan                 ask the ship AI about this deck',
  'warp                 jump to a random deck',
  'clear | exit         tidy up / close the console',
]

let lineId = 0
const line = (kind: Line['kind'], text: string): Line => ({ id: ++lineId, kind, text })

/**
 * The ship console: a keyboard-first way to fly the site. Opens with ~ or from
 * the command palette, closes with Escape. A real modal dialog with trapped focus.
 */
export function ShipConsole() {
  const navigate = useNavigate()
  const open = useVessel((state) => state.consoleOpen)
  const setOpen = useVessel((state) => state.setConsoleOpen)
  const [lines, setLines] = useState<Line[]>(() => [
    line('output', 'VESSEL OS v3.0 // ship console'),
    line('output', 'Type "help" for commands. Escape to close.'),
  ])
  const [value, setValue] = useState('')
  const history = useRef<string[]>([])
  const historyIndex = useRef(-1)
  const input = useRef<HTMLInputElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  // ~ (or `) toggles the console anywhere except while typing in a field.
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== '`' && event.key !== '~') return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]') && !target.closest('.ship-console')) return
      if (useVessel.getState().bootPhase !== 'done') return
      event.preventDefault()
      const next = !useVessel.getState().consoleOpen
      if (next) opener.current = document.activeElement as HTMLElement | null
      setOpen(next)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setOpen])

  // Focus the prompt on open; give focus back to whatever opened it on close.
  useEffect(() => {
    if (open) {
      input.current?.focus()
    } else {
      opener.current?.focus?.()
      opener.current = null
    }
  }, [open])

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight })
  }, [lines])

  const print = (...entries: Line[]) => setLines((current) => [...current, ...entries].slice(-120))

  const run = (raw: string) => {
    const [command = '', ...args] = raw.trim().toLowerCase().split(/\s+/)
    const arg = args.join(' ')
    const out = (text: string) => line('output', text)
    // Navigating closes the console and lets focus land on the new page.
    const flyTo = (path: string) => {
      opener.current = null
      setOpen(false)
      navigate(path)
    }
    switch (command) {
      case '':
        return []
      case 'help':
        return HELP.map(out)
      case 'decks':
        return CHARTED.map((deck) => out(`${deck.number}  ${deck.id.padEnd(10)} ${deck.label}`))
      case 'goto':
      case 'cd': {
        const path = DESTINATIONS[arg]
        if (!path) return [line('error', arg ? `No deck called "${arg}". Try "decks".` : 'Usage: goto <deck>')]
        flyTo(path)
        return [out(`Plotting course to ${arg}… engaging warp.`)]
      }
      case 'warp': {
        const current = useVessel.getState().deck
        const options = CHARTED.filter((deck) => deck.id !== current)
        const pick = options[Math.floor(Math.random() * options.length)]
        flyTo(pick.path)
        return [out(`Random jump: ${pick.label}.`)]
      }
      case 'whoami':
        return [out(`${dossier.name} — ${dossier.role}`), out(dossier.specialty), out('Status: active. Open the dossier with "goto origin".')]
      case 'missions':
        return missions.map((mission) => out(`M/${mission.number}  ${mission.title} (${mission.status})`))
      case 'skills':
        return skills.map((skill) => out(`${skill.name}: ${skill.tags.slice(0, 4).join(', ')}${skill.tags.length > 4 ? '…' : ''}`))
      case 'resume': {
        const link = document.createElement('a')
        link.href = '/Deepanshu_Saini_V1.pdf'
        link.download = 'Deepanshu_Saini_V1.pdf'
        link.click()
        return [out('Downloading résumé (ATS-friendly PDF)…')]
      }
      case 'hire':
      case 'contact':
        flyTo('/signal')
        return [out('Opening a channel to the pilot. Comms array is on the Signal deck.'), ...socialLinks.slice(0, 2).map((link) => out(`${link.name}: ${link.handle}`))]
      case 'sudo':
        if (arg.startsWith('hire')) {
          flyTo('/signal')
          return [out('Permission granted. Routing you to comms.')]
        }
        return [line('error', 'Nice try. This incident will be reported.')]
      case 'sound': {
        // "on" is kept as an alias for the visitor's preferred preset.
        const mode = arg === 'on' ? preferredSoundMode() : arg
        if (mode !== 'ambient' && mode !== 'minimal' && mode !== 'off') return [line('error', 'Usage: sound ambient|minimal|off')]
        useVessel.getState().setSoundMode(mode)
        return [out(`Sound: ${mode}.`)]
      }
      case 'scan': {
        const { deck, narrate } = useVessel.getState()
        const label = decks.find((item) => item.id === deck)?.label ?? 'Unknown'
        narrate(`Scan complete: you are on ${label}.`)
        return [out(`Scanning… ${label}. Report sent to the ship AI.`)]
      }
      case 'self-destruct': {
        const root = document.documentElement
        root.classList.add('self-destruct')
        window.setTimeout(() => {
          root.classList.remove('self-destruct')
          useVessel.getState().narrate('Self-destruct aborted. Nice try, pilot.')
        }, 1600)
        return [line('error', 'SELF-DESTRUCT SEQUENCE INITIATED…'), out('…just kidding.')]
      }
      case 'clear':
        setLines([])
        return []
      case 'exit':
      case 'quit':
        setOpen(false)
        return []
      default:
        return [line('error', `Unknown command "${command}". Type "help".`)]
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const command = value
    if (command.trim()) history.current = [command, ...history.current].slice(0, 30)
    historyIndex.current = -1
    setValue('')
    const echo = line('input', command)
    const results = run(command)
    if (command.trim().toLowerCase() !== 'clear') print(echo, ...results)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = historyIndex.current + (event.key === 'ArrowUp' ? 1 : -1)
      historyIndex.current = Math.max(-1, Math.min(history.current.length - 1, next))
      setValue(historyIndex.current >= 0 ? history.current[historyIndex.current] : '')
    } else if (event.key === 'Tab') {
      // Complete the command word; Tab otherwise stays inside the dialog.
      event.preventDefault()
      const match = COMMANDS.find((command) => value && command.startsWith(value.trim().toLowerCase()))
      if (match) setValue(`${match} `)
    }
  }

  return (
    <>

      {open && (
        <div className="ship-console-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
          <div className="ship-console" role="dialog" aria-modal="true" aria-label="Ship console">
            <header className="ship-console-head">
              <span>VESSEL OS // console</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close console">Esc ×</button>
            </header>
            <div className="ship-console-log" ref={log} role="log" aria-live="polite">
              {lines.map((entry) => (
                <p key={entry.id} className={`ship-console-line is-${entry.kind}`}>
                  {entry.kind === 'input' && <span aria-hidden="true">pilot@vessel:~$ </span>}
                  {entry.text}
                </p>
              ))}
            </div>
            <form className="ship-console-prompt" onSubmit={submit}>
              <label htmlFor="ship-console-input" aria-hidden="true">pilot@vessel:~$</label>
              <input
                id="ship-console-input"
                ref={input}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Console command"
              />
            </form>
          </div>
        </div>
      )}
    </>
  )
}
