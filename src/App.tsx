import { lazy, Suspense } from 'react'
import './App.css'

const HeroScene = lazy(() => import('./scenes/HeroScene').then(({ HeroScene }) => ({ default: HeroScene })))

function App() {
  return (
    <main className="portfolio-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="thedeepanshu home">
          thedeepanshu<span className="wordmark-dot">.</span>
        </a>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#origin">Origin</a>
          <a href="#missions">Missions</a>
          <a href="#signal">Signal</a>
        </nav>
        <span className="system-status"><i /> system online</span>
      </header>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>01</span> digital workshop / future systems</p>
          <h1>I build <em>digital</em> futures.</h1>
          <p className="hero-description">
            Futuristic builder creating immersive experiences where code, motion,
            design, and AI come alive.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#missions">Enter my world <span>↗</span></a>
            <a className="text-action" href="#origin">Explore story <span>↓</span></a>
          </div>
          <div className="hero-meta">
            <span>Creative technologist</span>
            <span>AI explorer</span>
            <span>Experience builder</span>
          </div>
        </div>

        <div className="scene-stage" aria-label="A stylized futuristic workshop scene">
          <Suspense fallback={<div className="scene-fallback" aria-hidden="true" />}>
            <HeroScene />
          </Suspense>
          <div className="scene-sky" />
          <div className="moon" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="workshop-grid" />
          <div className="hud-card hud-card-top"><span>AI CORE</span><strong>Awake</strong><i /></div>
          <div className="hud-card hud-card-bottom"><span>BUILD 001</span><strong>worlds / in progress</strong><b>↗</b></div>
          <div className="scene-label">the future is a material</div>
        </div>
      </section>

      <section className="intro-strip" id="origin">
        <p className="section-kicker">/ 001 — origin</p>
        <div>
          <h2>Ideas should feel <span>alive.</span></h2>
          <p>Designing interfaces with a pulse, products with a point of view, and digital spaces that stay with you.</p>
        </div>
      </section>

      <section className="missions-preview" id="missions">
        <div className="section-heading"><p className="section-kicker">/ 002 — selected missions</p><span>scroll to discover</span></div>
        <div className="mission-card">
          <span className="mission-number">01</span>
          <div><p className="mission-type">immersive interface / 2026</p><h2>Coming soon<span>.</span></h2></div>
          <span className="mission-arrow">↗</span>
        </div>
      </section>

      <footer className="site-footer" id="signal">
        <p>thedeepanshu / signal open</p>
        <a href="mailto:hello@thedeepanshu.dev">Let&apos;s build something alive <span>↗</span></a>
      </footer>
    </main>
  )
}

export default App
