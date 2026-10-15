import { Link } from 'react-router-dom'
import { experiments } from '../content/portfolio'
import { SystemDemo, type DemoKind } from '../components/SystemDemo'
import { PageFrame } from '../components/PageFrame'
import { useFocusTracker } from '../hooks/useFocusTracker'
import { useVessel } from '../world/store'

export function LabPage() {
  // The reactor pulls the experiment being read to the front of its orbit.
  useFocusTracker(useVessel((state) => state.setActiveExperiment))

  return (
    <PageFrame deck="lab" topic="experiments" title={<>The <em>lab.</em></>} intro="The systems running this ship, taken apart: the shaders, particles, lens and sound behind what you’ve seen so far.">
      <div className="lab-container">
        <div className="lab-stats-bar">
          <div className="stat-pill">
            <span>Running live</span>
            <strong>{experiments.length} world systems</strong>
          </div>
          <div className="stat-pill">
            <span>Engines</span>
            <strong>WebGL, GLSL, Web Audio</strong>
          </div>
          <div className="stat-pill">
            <span>Where</span>
            <strong>Inside this site</strong>
          </div>
        </div>

        <div className="lab-grid">
          {experiments.map((exp) => (
            <article className="lab-card" key={exp.id} data-focus-id={exp.id}>
              <div className="lab-card-header">
                <div>
                  <span className="lab-number">EXP / {exp.number}</span>
                  <h3 className="lab-title">{exp.title}</h3>
                </div>
                <span className="lab-status-badge">{exp.status}</span>
              </div>

              {/* A small live version of the system, linking to where it runs in the world. */}
              <Link className="lab-live-panel" to={exp.liveOn.path}>
                <SystemDemo kind={exp.id as DemoKind} />
                <span className="lab-live-signal" aria-hidden="true"><i /><i /><i /></span>
                <span className="lab-live-kicker">Running in the world</span>
                <strong>{exp.liveOn.label} <span aria-hidden="true">↗</span></strong>
              </Link>

              <p className="lab-desc">{exp.description}</p>

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
