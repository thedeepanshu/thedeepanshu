import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { missions } from '../content/portfolio'
import { BrowserFrame } from '../components/BrowserFrame'
import { PageFrame } from '../components/PageFrame'
import { useFocusTracker } from '../hooks/useFocusTracker'
import { motion, useVessel } from '../world/store'
import './MissionsPage.css'

export function MissionsPage() {
  // The Hangar's hologram drum turns to the mission being read.
  useFocusTracker(useVessel((state) => state.setActiveMission))
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const toggle = (id: string) => setExpanded((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  // Deep links (/missions#alec-ev-hybrid, used by the command palette) open that
  // brief and bring it into view once the warp has landed, so the scroll never
  // competes with the flight.
  const { hash } = useLocation()
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (!missions.some((mission) => mission.id === id)) return
    const started = performance.now()
    let timer = 0
    const check = () => {
      if (motion.flightProgress < 1 && performance.now() - started < 4000) {
        timer = window.setTimeout(check, 100)
        return
      }
      setExpanded((current) => new Set(current).add(id))
      const reducedMotion = useVessel.getState().reducedMotion
      document.querySelector(`[data-focus-id="${id}"]`)?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' })
    }
    timer = window.setTimeout(check, 300)
    return () => window.clearTimeout(timer)
  }, [hash])

  return (
    <PageFrame
      deck="missions" topic="selected work"
      title={<>Ideas in <em>motion.</em></>}
      intro="Selected work, from production dashboards to a live client site to the ship you're standing in."
    >
      <div className="mission-log">
        {missions.map((mission) => {
          const internal = mission.link?.url.startsWith('/')
          const open = expanded.has(mission.id)
          return (
            <article className={`mission-brief${open ? ' is-open' : ''}`} key={mission.id} aria-labelledby={`${mission.id}-title`} data-focus-id={mission.id}>
              <header className="mission-brief-head">
                <span className="mission-brief-number">M/{mission.number}</span>
                <span className="mission-brief-type">{mission.type}</span>
                <span className="mission-brief-status">{mission.status}</span>
              </header>

              <div className="mission-brief-body">
                <div className="mission-brief-intro">
                  <h2 id={`${mission.id}-title`}>{mission.title}</h2>
                  <dl className="mission-brief-meta">
                    <div><dt>Role</dt><dd>{mission.role}</dd></div>
                    <div><dt>Period</dt><dd>{mission.period}</dd></div>
                  </dl>
                  <p className="mission-brief-summary">{mission.summary}</p>
                </div>

                <BrowserFrame src={mission.visual.src} alt={mission.visual.alt} label={mission.visual.frameLabel} />
              </div>

              <div className="mission-brief-tags mission-tags">
                {mission.technologies.map((technology) => <span key={technology}>{technology}</span>)}
              </div>

              <div className="mission-brief-details" id={`${mission.id}-details`} inert={!open}>
                <div>
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
                </div>
              </div>

              <footer className="mission-brief-foot">
                <button
                  type="button"
                  className="mission-brief-toggle"
                  aria-expanded={open}
                  aria-controls={`${mission.id}-details`}
                  onClick={() => toggle(mission.id)}
                >
                  {open ? 'Collapse brief' : 'Expand brief'} <span aria-hidden="true">{open ? '−' : '+'}</span>
                </button>
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
