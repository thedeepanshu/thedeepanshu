import { missions } from '../content/portfolio'
import { PageFrame } from '../components/PageFrame'

export function MissionsPage() {
  return (
    <PageFrame eyebrow="002 / selected work" title={<>Ideas in <em>motion.</em></>} intro="The current portfolio project, with more work to be added when it is ready to share.">
      <div className="mission-archive">
        {missions.map((mission) => (
          <article className="mission-entry" key={mission.number}>
            <div className="mission-entry-top">
              <span>{mission.number} / {mission.type}</span>
              <small>{mission.status}</small>
            </div>
            <h2>{mission.title}</h2>
            <p>{mission.summary}</p>
            <div className="mission-tags">
              {mission.technologies.map((technology) => <span key={technology}>{technology}</span>)}
            </div>
          </article>
        ))}
      </div>
    </PageFrame>
  )
}
