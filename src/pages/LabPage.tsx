import { useState } from 'react'
import { Link } from 'react-router-dom'
import { experiments, type ExperimentCategory } from '../content/portfolio'
import { LabCanvasWidget } from '../components/LabCanvasWidget'
import { PageFrame } from '../components/PageFrame'
import { useFocusTracker } from '../hooks/useFocusTracker'
import { useVessel } from '../world/store'

export function LabPage() {
  const [activeCategory, setActiveCategory] = useState<ExperimentCategory>('all')

  // The reactor pulls the experiment being read to the front of its orbit.
  useFocusTracker(useVessel((state) => state.setActiveExperiment), activeCategory)

  const categories: { id: ExperimentCategory; label: string }[] = [
    { id: 'all', label: 'All experiments' },
    { id: 'webgl-world', label: 'World systems' },
    { id: 'canvas-generative', label: 'Canvas 2D' },
  ]

  const filteredExperiments = activeCategory === 'all'
    ? experiments
    : experiments.filter((e) => e.category === activeCategory)

  return (
    <PageFrame deck="lab" topic="experiments" title={<>The <em>lab.</em></>} intro="Where the ship's systems were prototyped: the shaders, particles and sound running this site, plus earlier Canvas 2D studies.">
      <div className="lab-container">
        {/* Lab Stats Bar */}
        <div className="lab-stats-bar">
          <div className="stat-pill">
            <span>Experiments</span>
            <strong>{experiments.length} on file</strong>
          </div>
          <div className="stat-pill">
            <span>Running live</span>
            <strong>{experiments.filter((e) => e.liveOn).length} world systems</strong>
          </div>
          <div className="stat-pill">
            <span>Engines</span>
            <strong>WebGL, Web Audio, Canvas 2D</strong>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="lab-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>/</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Experiments Grid */}
        <div className="lab-grid">
          {filteredExperiments.map((exp) => (
            <article className="lab-card" key={exp.id} data-focus-id={exp.id}>
              {/* Header */}
              <div className="lab-card-header">
                <div>
                  <span className="lab-number">EXP / {exp.number}</span>
                  <h3 className="lab-title">{exp.title}</h3>
                </div>
                <span className="lab-status-badge">{exp.status}</span>
              </div>

              {/* Canvas studies preview in the card; world systems run in the site itself */}
              {exp.preset ? (
                <div className="lab-canvas-wrapper">
                  <LabCanvasWidget preset={exp.preset} />
                </div>
              ) : exp.liveOn && (
                <Link className="lab-live-panel" to={exp.liveOn.path}>
                  <span className="lab-live-signal" aria-hidden="true"><i /><i /><i /></span>
                  <span className="lab-live-kicker">Running in the world</span>
                  <strong>{exp.liveOn.label} <span aria-hidden="true">↗</span></strong>
                </Link>
              )}

              {/* Description */}
              <p className="lab-desc">{exp.description}</p>

              {/* Technologies */}
              <div className="lab-tags">
                {exp.technologies.map((tech) => (
                  <span className="lab-tag" key={tech}>{tech}</span>
                ))}
              </div>

              <div className="lab-card-footer">
                <span className="lab-status-badge">{exp.categoryLabel}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <section className="build-section build-section--lab" aria-labelledby="inside-the-build">
        <div className="build-intro">
          <p className="section-kicker">/ inside the build</p>
          <div>
            <h2 id="inside-the-build">A portfolio, built as a <span>world.</span></h2>
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
            <p>The welcome screen forms a name from static, then bursts it into the stars as you board. It all runs in a vertex shader, and the cursor pushes the particles around.</p>
          </article>
          <article>
            <span>03 / sound &amp; care</span>
            <h3>Built for every visitor</h3>
            <p>Opt-in ambient sound synthesised with Web Audio, quality tiers for weaker devices, and a calm version for reduced motion.</p>
          </article>
        </div>
      </section>
    </PageFrame>
  )
}
