import { Link } from 'react-router-dom'

import { BrowserFrame } from '@/components/BrowserFrame'
import { DeckKicker } from '@/components/DeckKicker'
import { NewTabHint } from '@/components/NewTabHint'
import { missions, skills } from '@/content/portfolio'

// The live client site is the strongest proof on the page: real, public, solo.
const featured = missions.find((mission) => mission.id === 'alec-ev-hybrid') ?? missions[0]
const toolCount = skills.reduce((total, skill) => total + skill.tags.length, 0)

const proof = [
  { value: '~5 yrs', label: 'shipping production React', to: '/journey' },
  { value: '0→1', label: 'live client site, built and run solo', to: '/missions' },
  { value: String(toolCount), label: `tools across ${skills.length} domains`, to: '/arsenal' },
]

export function HomePage() {
  return (
    <main className="portfolio-shell">
      <section className="hero-section" id="top">
        <div className="hero-copy">
          <DeckKicker deck="bridge" topic="home" className="eyebrow" />
          <h1>
            Frontend
            <br />
            <em>in motion.</em>
          </h1>
          <p className="hero-description">
            I’m Deepanshu, a frontend developer with ~5 years of production React: data-dense dashboards, live maps and real-time interfaces. This ship is where
            I push the web further.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/missions">
              View missions <span>↗</span>
            </Link>
            <Link className="text-action" to="/about">
              Read the dossier <span>→</span>
            </Link>
          </div>
          <div className="hero-meta">
            <span>React · TypeScript</span>
            <span>Three.js · GLSL</span>
            <span>~5 yrs in production</span>
          </div>
        </div>
      </section>

      <section className="home-block home-featured" aria-labelledby="featured-title">
        <div className="home-featured-copy">
          <p className="section-kicker">/ featured mission</p>
          <p className="home-featured-type">
            {featured.type} <span>· {featured.status}</span>
          </p>
          <h2 id="featured-title">{featured.title}</h2>
          <p className="home-featured-summary">{featured.summary}</p>
          <ul className="home-featured-points">
            {featured.highlights.slice(0, 3).map((point) => (
              <li key={point}>
                <span aria-hidden="true">▸</span>
                {point}
              </li>
            ))}
          </ul>
          <div className="hero-actions">
            <Link className="primary-action" to="/missions">
              Read the brief <span>↗</span>
            </Link>
            {featured.link && (
              <a className="text-action" href={featured.link.url} target="_blank" rel="noopener noreferrer">
                Visit {featured.link.label} <span>↗</span>
                <NewTabHint />
              </a>
            )}
          </div>
        </div>
        <BrowserFrame src={featured.visual.src} alt={featured.visual.alt} label={featured.visual.frameLabel} className="home-featured-visual" />
      </section>

      <section className="home-block home-proof" aria-label="At a glance">
        {proof.map((item) => (
          <Link className="home-proof-item" to={item.to} key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            <b aria-hidden="true">↗</b>
          </Link>
        ))}
      </section>

      <section className="missions-preview" id="missions">
        <div className="section-heading">
          <p className="section-kicker">/ mission log</p>
          <span>{missions.length} missions</span>
        </div>
        <div className="chapter-list mission-chapters">
          {missions.map((mission) => (
            <Link className="chapter-row" to="/missions" key={mission.id}>
              <span>M/{mission.number}</span>
              <strong>
                {mission.title}
                <small>{mission.type}</small>
              </strong>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
