import type { ReactNode } from 'react'

type Props = {
  /** Small label above the heading, e.g. "/ now watching". */
  kicker: string
  /** Id of the heading, so its section can be aria-labelledby it. */
  titleId: string
  /** The heading itself; wrap the accent words in a <span>. */
  children: ReactNode
  intro?: string
}

/** A Beyond section's header: kicker, heading and an optional one-line intro. */
export function SectionHead({ kicker, titleId, children, intro }: Props) {
  return (
    <header className="beyond-head">
      <p className="section-kicker">{kicker}</p>
      <h2 id={titleId}>{children}</h2>
      {intro && <p>{intro}</p>}
    </header>
  )
}
