import { useState, type FormEvent } from 'react'
import { familyChannel } from '../../content/beyond'
import { socialLinks } from '../../content/portfolio'

type Kind = {
  id: string
  label: string
  group: 'recommend' | 'vlog'
  prompt: string
  placeholder: string
  /** Longer answers get a text area. */
  long?: boolean
  subject: (text: string) => string
  intro: string
}

const KINDS: Kind[] = [
  { id: 'watch', label: 'Movie or series', group: 'recommend', prompt: 'What should I watch?', placeholder: 'A movie or a show', subject: (text) => `Watch this: ${text}`, intro: 'You should watch:' },
  { id: 'music', label: 'Music', group: 'recommend', prompt: 'What should I listen to?', placeholder: 'A song, an album or an artist', subject: (text) => `Listen to this: ${text}`, intro: 'You should listen to:' },
  { id: 'learn', label: 'Something to learn', group: 'recommend', prompt: 'What should I learn?', placeholder: 'A course, a channel or a topic', subject: (text) => `Learn this: ${text}`, intro: 'You should learn:' },
  { id: 'vlog-idea', label: 'A vlog idea', group: 'vlog', prompt: 'What should we film next?', placeholder: 'A challenge, a trip, a question you want answered…', long: true, subject: () => `Vlog idea for ${familyChannel.name}`, intro: `An idea for ${familyChannel.name}:` },
  { id: 'vlog-opinion', label: 'Your take on our vlog', group: 'vlog', prompt: 'What do you think of our vlogs?', placeholder: 'What you enjoy, what we could do better, what you miss…', long: true, subject: () => `Thoughts on ${familyChannel.name}`, intro: `My thoughts on ${familyChannel.name}:` },
]

/**
 * Your turn: recommend me something, or tell us about our family vlog.
 * Opens a ready-to-send draft in the visitor's email app.
 */
export function RecommendBack() {
  const [kindId, setKindId] = useState(KINDS[0].id)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [sent, setSent] = useState(false)
  const kind = KINDS.find((item) => item.id === kindId) ?? KINDS[0]
  const email = socialLinks.find((link) => link.url.startsWith('mailto:'))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = text.trim()
    if (!email || !value) return
    const greeting = kind.group === 'vlog' ? 'Hi Doli & Deepanshu,' : 'Hi Deepanshu,'
    const sign = name.trim() ? `\n\n— ${name.trim()}` : ''
    const subject = encodeURIComponent(kind.subject(value))
    const body = encodeURIComponent(`${greeting}\n\n${kind.intro} ${value}${sign}`)
    window.location.href = `${email.url}?subject=${subject}&body=${body}`
    // The words now live in the email draft; clear the form for the next one.
    setText('')
    setName('')
    setSent(true)
  }

  const chip = (item: Kind) => (
    <label key={item.id} className={`recommend-chip${item.group === 'vlog' ? ' recommend-chip--vlog' : ''}${kindId === item.id ? ' is-selected' : ''}`}>
      <input type="radio" name="recommend-kind" value={item.id} checked={kindId === item.id} onChange={() => setKindId(item.id)} />
      <span>{item.label}</span>
    </label>
  )

  return (
    <form className="recommend" onSubmit={submit}>
      <fieldset className="recommend-kinds">
        <legend>What’s it about?</legend>
        <div className="recommend-chip-row">
          <span className="recommend-group-label" aria-hidden="true">For me</span>
          {KINDS.filter((item) => item.group === 'recommend').map(chip)}
        </div>
        <div className="recommend-chip-row">
          <span className="recommend-group-label" aria-hidden="true">For our vlog</span>
          {KINDS.filter((item) => item.group === 'vlog').map(chip)}
        </div>
      </fieldset>
      <div className="recommend-fields">
        <label className="recommend-field">
          <span>{kind.prompt}</span>
          {kind.long
            ? <textarea required maxLength={600} rows={3} placeholder={kind.placeholder} value={text} onChange={(event) => { setText(event.target.value); setSent(false) }} />
            : <input type="text" required maxLength={120} placeholder={kind.placeholder} value={text} onChange={(event) => { setText(event.target.value); setSent(false) }} />}
        </label>
        <label className="recommend-field">
          <span>Your name <small>(optional)</small></span>
          <input type="text" maxLength={60} autoComplete="name" placeholder="So we can thank you" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
      </div>
      <button type="submit" className="recommend-send">{kind.group === 'vlog' ? 'Send it to us' : 'Send it my way'} <span aria-hidden="true">↗</span></button>
      <p className="recommend-note" role="status">
        {sent ? 'Draft opened in your email app. Thank you! Send another anytime.' : 'Opens a ready-to-send draft in your email app.'}
      </p>
    </form>
  )
}
