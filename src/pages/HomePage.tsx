import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'

const HeroScene = lazy(() => import('../scenes/HeroScene').then(({ HeroScene }) => ({ default: HeroScene })))

export function HomePage() {
  return (
    <main className="portfolio-shell">
      <SiteHeader />

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>01</span> digital workshop / future systems</p>
          <h1>Frontend<br /><em>in motion.</em></h1>
          <p className="hero-description">
            Frontend developer building this portfolio as an anime-inspired 3D experience.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#missions">See the project <span>↗</span></a>
            <a className="text-action" href="#origin">About me <span>↓</span></a>
          </div>
        </div>

        <div className="scene-stage" role="img" aria-label="An anime-inspired 3D frontend creator and futuristic car in a neon workshop">
          <Suspense fallback={<div className="scene-fallback" role="status">Loading 3D scene</div>}>
            <HeroScene />
          </Suspense>
          <div className="scene-sky" />
          <div className="moon" />
          <div className="workshop-grid" />
          <div className="hud-card hud-card-top"><span>AI / VISUAL THEME</span><strong>Interface concept</strong><i /></div>
          <div className="scene-label">the future is a material</div>
        </div>
      </section>

      <section className="intro-strip" id="origin">
        <p className="section-kicker">/ 001 — origin</p>
        <div>
          <h2>Ideas should feel <span>alive.</span></h2>
          <p>I’m a frontend developer. This portfolio is where I’m bringing that work into an anime-inspired world of motion and 3D.</p>
        </div>
      </section>

      <section className="build-section">
        <div className="build-intro">
          <p className="section-kicker">/ 002 — inside the build</p>
          <div>
            <h2>A frontend portfolio, built as a <span>world.</span></h2>
            <p>Every visual layer is part of the same project: interface, scene, and motion working together.</p>
          </div>
        </div>
        <div className="build-pillars">
          <article>
            <span>01 / interface</span>
            <h3>React + TypeScript</h3>
            <p>Reusable page layouts and route-based navigation form the portfolio’s structure.</p>
          </article>
          <article>
            <span>02 / scene</span>
            <h3>Three.js in React</h3>
            <p>The hero brings together an original stylized character, a futuristic car, lighting, and a workshop floor.</p>
          </article>
          <article>
            <span>03 / motion</span>
            <h3>Movement with a purpose</h3>
            <p>The opening reveal introduces the scene and interface in sequence, with a reduced-motion option.</p>
          </article>
        </div>
      </section>

      <section className="missions-preview" id="missions">
        <div className="section-heading"><p className="section-kicker">/ 003 — current project</p><span>in progress</span></div>
        <article className="mission-card">
          <div><p className="mission-type">personal project / in progress</p><h2>thedeepanshu portfolio<span>.</span></h2></div>
        </article>
      </section>

      <footer className="site-footer" id="signal">
        <p>thedeepanshu</p>
        <Link to="/signal">Let&apos;s connect <span>↗</span></Link>
      </footer>
    </main>
  )
}
