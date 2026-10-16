import { useEffect, useState } from 'react'

import { NewTabHint } from '@/components/NewTabHint'
import { learning } from '@/content/beyond'

const SNIPPET = `const today = {
  learning: '${learning.title}',
  by: '${learning.by}',
  mode: 'build along',
  status: 'in progress',
}

while (curious) keepBuilding()`

/** A little editor that types the snippet out, loops, and rests on the full text. */
function TypedSnippet() {
  const [length, setLength] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? SNIPPET.length : 0,
  )

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let index = 0
    let timer = 0
    const tick = () => {
      index = index >= SNIPPET.length + 90 ? 0 : index + 1
      setLength(Math.min(index, SNIPPET.length))
      timer = window.setTimeout(tick, index === 0 ? 400 : 38)
    }
    timer = window.setTimeout(tick, 600)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <pre className="desk-code" aria-hidden="true">
      <code className="desk-code-ghost">{SNIPPET}▌</code>
      <code>
        {SNIPPET.slice(0, length)}
        <span className="desk-caret">▌</span>
      </code>
    </pre>
  )
}

/** Learning: what I'm studying right now, with a live editor for flavour. */
export function LearningDesk() {
  return (
    <div className="learning-desk">
      <div className="desk-card">
        <img className="desk-avatar" src={learning.avatar} alt="" width={240} height={240} loading="lazy" />
        <div>
          <p className="desk-kicker">Learning with</p>
          <h3>{learning.title}</h3>
          <p className="desk-by">
            {learning.where} · by {learning.by}
          </p>
        </div>
        <p className="desk-summary">{learning.summary}</p>
        {learning.notes.length > 0 && (
          <ul className="desk-notes" aria-label="Today I learned">
            {learning.notes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <a className="desk-link" href={learning.url} target="_blank" rel="noopener noreferrer">
          Learn along on {learning.where} <span aria-hidden="true">↗</span>
          <NewTabHint />
        </a>
      </div>
      <div className="desk-editor">
        <div className="desk-editor-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>learning.js</span>
        </div>
        <TypedSnippet />
      </div>
    </div>
  )
}
