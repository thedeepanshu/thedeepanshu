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
    </PageFrame>
  )
}
