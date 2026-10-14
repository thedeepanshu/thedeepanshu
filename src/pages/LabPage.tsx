import { useState } from 'react'
import { experiments, type ExperimentCategory } from '../content/portfolio'
import { LabCanvasWidget } from '../components/LabCanvasWidget'
import { PageFrame } from '../components/PageFrame'

export function LabPage() {
  const [activeCategory, setActiveCategory] = useState<ExperimentCategory>('all')

  const categories: { id: ExperimentCategory; label: string }[] = [
    { id: 'all', label: 'All Previews' },
    { id: 'canvas-generative', label: 'Canvas 2D' },
  ]

  const filteredExperiments = activeCategory === 'all'
    ? experiments
    : experiments.filter((e) => e.category === activeCategory)

  return (
    <PageFrame eyebrow="005 / experiments" title={<>The <em>lab.</em></>} intro="A few small Canvas 2D animations built for this portfolio. More experiments may be added over time.">
      <div className="lab-container">
        {/* Lab Stats Bar */}
        <div className="lab-stats-bar">
          <div className="stat-pill">
            <span>Canvas previews</span>
            <strong>{experiments.length} animations</strong>
          </div>
          <div className="stat-pill">
            <span>Graphics Engine</span>
            <strong>Canvas 2D</strong>
          </div>
          <div className="stat-pill">
            <span>Implementation</span>
            <strong>Rendered in the browser</strong>
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
            <article className="lab-card" key={exp.id}>
              {/* Header */}
              <div className="lab-card-header">
                <div>
                  <span className="lab-number">EXP / {exp.number}</span>
                  <h3 className="lab-title">{exp.title}</h3>
                </div>
                <span className="lab-status-badge">{exp.status}</span>
              </div>

              {/* Live Canvas Widget Preview */}
              <div className="lab-canvas-wrapper">
                <LabCanvasWidget preset={exp.preset} />
              </div>

              {/* Description */}
              <p className="lab-desc">{exp.description}</p>

              {/* Technologies */}
              <div className="lab-tags">
                {exp.technologies.map((tech) => (
                  <span className="lab-tag" key={tech}>{tech}</span>
                ))}
              </div>

              <div className="lab-card-footer">
                <span className="lab-status-badge">Canvas 2D preview</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageFrame>
  )
}
