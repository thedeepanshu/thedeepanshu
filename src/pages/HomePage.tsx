import { Link } from 'react-router-dom'
import { missions } from '../content/portfolio'
import { DeckKicker } from '../components/DeckKicker'

export function HomePage() {
  return (
    <main className="portfolio-shell">
      <section className="hero-section" id="top">
        <div className="hero-copy">
          <DeckKicker deck="bridge" topic="home" className="eyebrow" />
          <h1>Frontend<br /><em>in motion.</em></h1>
          <p className="hero-description">
            I’m Deepanshu, a frontend developer with ~5 years of production React: data-dense dashboards, live maps and real-time interfaces. This ship is where I push the web further.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/missions">View missions <span>↗</span></Link>
            <Link className="text-action" to="/about">Read the dossier <span>→</span></Link>
          </div>
          <div className="hero-meta">
            <span>React · TypeScript</span>
            <span>Three.js · GLSL</span>
            <span>~5 yrs in production</span>
          </div>
        </div>
      </section>

      <section className="intro-strip" id="origin">
        <p className="section-kicker">/ philosophy</p>
        <div>
          <h2>Ideas should feel <span>alive.</span></h2>
          <p>I care about the part of a product people touch: interfaces that make complex data readable and interactions that feel immediate. Years of business dashboards taught me to keep things fast. This ship is where I make them feel alive.</p>
        </div>
      </section>

      <section className="build-section">
        <div className="build-intro">
          <p className="section-kicker">/ inside the build</p>
          <div>
            <h2>A portfolio, built as a <span>world.</span></h2>
            <p>What you’re flying through right now is the work too. Here’s what’s running under the hull.</p>
          </div>
        </div>
        <div className="build-pillars">
          <article>
            <span>01 / world</span>
            <h3>One persistent WebGL world</h3>
            <p>A single React Three Fiber canvas sits behind every page. Navigating flies the camera between decks with a light-speed warp.</p>
          </article>
          <article>
            <span>02 / particle core</span>
            <h3>42,000 particles, one shader</h3>
            <p>Your welcome screen formed from static into a name, then burst into the stars as you boarded. It all runs in a vertex shader, and your cursor pushes the particles around.</p>
          </article>
          <article>
            <span>03 / sound &amp; care</span>
            <h3>Built for every visitor</h3>
            <p>Opt-in ambient sound synthesised with Web Audio, quality tiers for weaker devices, and a calm version for reduced motion.</p>
          </article>
        </div>
      </section>

      <section className="missions-preview" id="missions">
        <div className="section-heading"><p className="section-kicker">/ mission log</p><span>{missions.length} missions</span></div>
        <div className="chapter-list mission-chapters">
          {missions.map((mission) => (
            <Link className="chapter-row" to="/missions" key={mission.id}>
              <span>M/{mission.number}</span>
              <strong>{mission.title}<small>{mission.type}</small></strong>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
