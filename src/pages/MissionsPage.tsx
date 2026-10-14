import { Link } from 'react-router-dom'
import { missions } from '../content/portfolio'
import { PageFrame } from '../components/PageFrame'
import { useFocusTracker } from '../hooks/useFocusTracker'
import { useVessel } from '../world/store'
import './MissionsPage.css'

export function MissionsPage() {
  // The Hangar's hologram drum turns to the mission being read.
  useFocusTracker(useVessel((state) => state.setActiveMission))

  return (
    <PageFrame
      eyebrow="002 / mission log"
      title={<>Ideas in <em>motion.</em></>}
      intro="Selected work, from production dashboards to a live client site to the ship you're standing in."
    >
      <div className="mission-log">
        {missions.map((mission) => {
          const internal = mission.link?.url.startsWith('/')
          return (
            <article className="mission-brief" key={mission.id} aria-labelledby={`${mission.id}-title`} data-focus-id={mission.id}>
              <header className="mission-brief-head">
                <span className="mission-brief-number">M/{mission.number}</span>
                <span className="mission-brief-type">{mission.type}</span>
                <span className="mission-brief-status">{mission.status}</span>
              </header>

              <h2 id={`${mission.id}-title`}>{mission.title}</h2>

              <dl className="mission-brief-meta">
                <div><dt>Role</dt><dd>{mission.role}</dd></div>
                <div><dt>Period</dt><dd>{mission.period}</dd></div>
              </dl>

              <p className="mission-brief-summary">{mission.summary}</p>

              <div className="mission-brief-columns">
                <section>
                  <h3>Challenge</h3>
                  <p>{mission.challenge}</p>
                </section>
                <section>
                  <h3>Approach</h3>
                  <p>{mission.approach}</p>
                </section>
              </div>

              <section className="mission-brief-highlights">
                <h3>What shipped</h3>
                <ul>
                  {mission.highlights.map((item) => <li key={item}><span aria-hidden="true">▸</span>{item}</li>)}
                </ul>
              </section>

              <footer className="mission-brief-foot">
                <div className="mission-tags">
                  {mission.technologies.map((technology) => <span key={technology}>{technology}</span>)}
                </div>
                {mission.link && (internal ? (
                  <Link className="mission-brief-link" to={mission.link.url}>{mission.link.label} <span aria-hidden="true">↗</span></Link>
                ) : (
                  <a className="mission-brief-link" href={mission.link.url} target="_blank" rel="noopener noreferrer">
                    {mission.link.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
                {mission.note && <p className="mission-brief-note">{mission.note}</p>}
              </footer>
            </article>
          )
        })}
      </div>
    </PageFrame>
  )
}
