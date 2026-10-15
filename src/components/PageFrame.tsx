import type { ReactNode } from 'react'
import type { DeckId } from '../world/decks'
import { DeckKicker } from './DeckKicker'

type PageFrameProps = {
  deck: DeckId
  /** What the page is about, after the deck name. */
  topic: string
  title: ReactNode
  intro: string
  children: ReactNode
}

export function PageFrame({ deck, topic, title, intro, children }: PageFrameProps) {
  return (
    <main className="portfolio-shell inner-page">
      <section className="page-intro">
        <DeckKicker deck={deck} topic={topic} />
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <section className="page-content">{children}</section>
    </main>
  )
}
