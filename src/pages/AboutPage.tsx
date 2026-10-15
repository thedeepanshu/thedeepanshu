import { Link } from 'react-router-dom'
import { dossier, journeyRoute } from '../content/portfolio'
import { resumeData } from '../content/resumeData'
import { PageFrame } from '../components/PageFrame'
import './AboutPage.css'

// Small labels over the two story paragraphs, in the order they're written.
const STORY_LABELS = ['/ how I work', '/ how I learn']

export function AboutPage() {
  const [lead, ...story] = dossier.story

  return (
    <PageFrame
      deck="origin" topic="about"
      title={<>Frontend, with <em>feeling.</em></>}
      intro="Frontend developer with ~5 years of production React. I build data-dense interfaces that stay fast, and I'm pushing what the web can feel like."
    >
      <div className="dossier">
        <section className="dossier-file" aria-label="Profile">
          <aside className="dossier-id">
            <div className="dossier-id-top">
              <span>ID / {dossier.callsign}</span>
              <i aria-hidden="true" />
            </div>
            <div className="dossier-id-avatar">
              <img src={dossier.portrait} alt="Portrait of Deepanshu Saini" width={1254} height={1254} decoding="async" />
            </div>
            <dl>
              <div><dt>Name</dt><dd>{dossier.name}</dd></div>
              <div><dt>Role</dt><dd>{dossier.role}</dd></div>
              <div><dt>Specialty</dt><dd>{dossier.specialty}</dd></div>
              <div><dt>Status</dt><dd className="dossier-active">Active</dd></div>
            </dl>
          </aside>

          <div className="dossier-story">
            <p className="lead-copy">{lead}</p>
            <div className="dossier-story-body">
              {story.map((paragraph, index) => (
                <div key={paragraph.slice(0, 24)}>
                  {STORY_LABELS[index] && <p className="dossier-story-label">{STORY_LABELS[index]}</p>}
                  <p>{paragraph}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dossier-route" aria-labelledby="dossier-route-title">
          <div className="dossier-route-head">
            <p className="section-kicker" id="dossier-route-title">/ flight path so far</p>
            <Link className="text-action" to="/journey">Fly the full route <span>→</span></Link>
          </div>
          <ol>
            {journeyRoute.map((stop) => (
              <li key={stop.id} className={`is-${stop.kind}${stop.ongoing ? ' is-ongoing' : ''}`}>
                <i aria-hidden="true" />
                <span>{stop.when}</span>
                <strong>{stop.title}</strong>
              </li>
            ))}
          </ol>
        </section>

        {/* Phones hide the 3D core's stat callouts, so the numbers live here instead. */}
        <section className="dossier-stats" aria-label="At a glance">
          {dossier.stats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="dossier-section">
          <p className="section-kicker">/ operating principles</p>
          <div className="dossier-grid">
            {resumeData.coreCompetencies.map((item, index) => (
              <article key={item.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dossier-section">
          <p className="section-kicker">/ how I work</p>
          <ol className="dossier-process">
            {dossier.process.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="dossier-section dossier-columns">
          <div>
            <p className="section-kicker">/ current focus</p>
            <ul className="dossier-list">
              {dossier.focus.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div>
            <p className="section-kicker">/ languages</p>
            <ul className="dossier-list">
              {resumeData.languages.map((item) => <li key={item.language}>{item.language} <small>{item.proficiency}</small></li>)}
            </ul>
          </div>
          <div>
            <p className="section-kicker">/ traits</p>
            <div className="dossier-traits">
              {resumeData.strengths.map((trait) => <span key={trait}>{trait}</span>)}
            </div>
          </div>
        </section>

        <div className="dossier-actions">
          <Link className="primary-action" to="/missions">See the missions <span>↗</span></Link>
          <Link className="text-action" to="/journey">Read the full journey <span>→</span></Link>
        </div>
      </div>
    </PageFrame>
  )
}
