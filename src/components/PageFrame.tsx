import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type PageFrameProps = {
  eyebrow: string
  title: ReactNode
  intro: string
  children: ReactNode
}

export function PageFrame({ eyebrow, title, intro, children }: PageFrameProps) {
  return (
    <main className="portfolio-shell inner-page">
      <section className="page-intro">
        <p className="section-kicker">/ {eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <section className="page-content">{children}</section>
      <footer className="site-footer">
        <p>thedeepanshu</p>
        <Link to="/signal">Let&apos;s build something alive <span>↗</span></Link>
      </footer>
    </main>
  )
}
