import { useState } from 'react'

import { PageFrame } from '@/components/PageFrame'
import { type MilestoneCategory, milestones } from '@/content/portfolio'
import { useFocusTracker } from '@/hooks/useFocusTracker'
import { useVessel } from '@/world/store'

export function JourneyPage() {
  const [activeCategory, setActiveCategory] = useState<MilestoneCategory>('professional-experience')

  // The camera flies along the route to the milestone being read.
  useFocusTracker(
    useVessel((state) => state.setActiveMilestone),
    activeCategory,
  )

  const projectCount = (category: MilestoneCategory) => milestones.filter((milestone) => milestone.category === category).length

  const projectCountLabel = (category: MilestoneCategory) => {
    const count = projectCount(category)
    return `${count} ${count === 1 ? 'project' : 'projects'}`
  }

  const educationCountLabel = () => {
    const count = projectCount('education')
    return `${count} ${count === 1 ? 'entry' : 'entries'}`
  }

  const categories: { id: MilestoneCategory; label: string; count: string }[] = [
    { id: 'education', label: 'Education', count: educationCountLabel() },
    { id: 'professional-experience', label: 'Experience', count: '~5 years' },
    { id: 'client-projects', label: 'Client Projects', count: projectCountLabel('client-projects') },
    { id: 'personal-projects', label: 'Personal Projects', count: projectCountLabel('personal-projects') },
  ]

  const filteredMilestones = milestones.filter((milestone) => milestone.category === activeCategory)

  return (
    <PageFrame
      deck="journey"
      topic="experience & education"
      title={
        <>
          The <em>journey.</em>
        </>
      }
      intro="Education, frontend experience, and projects — built over time."
    >
      <div className="journey-container">
        {/* Filter Navigation Bar & Resume Download CTA */}
        <div className="journey-action-bar">
          <div className="journey-filter-bar" role="group" aria-label="Journey category">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={activeCategory === cat.id}
                className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="journey-filter-label">{cat.label}</span>
                <span className="journey-filter-count">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Timeline Structure */}
        <div className="timeline-wrapper" aria-live="polite">
          <div className="timeline-spine" />

          <div className="timeline-list">
            {filteredMilestones.map((ms) => (
              <div className="timeline-item" key={ms.id} data-focus-id={ms.id}>
                {/* Node indicator */}
                <div className="timeline-node">
                  <div className="node-dot" />
                  <div className="timeline-date-block">
                    <span className="node-year">{ms.period}</span>
                    {ms.periodNote && <span className="node-quarter">{ms.periodNote}</span>}
                  </div>
                </div>

                {/* Milestone card */}
                <article className={`milestone-card ${ms.status === 'current milestone' ? 'milestone-current' : ''}`}>
                  <div className="milestone-header">
                    <span className="milestone-category">{ms.categoryLabel}</span>
                    <span className="milestone-status">{ms.status}</span>
                  </div>

                  <h3 className="milestone-title">{ms.title}</h3>
                  <p className="milestone-summary">{ms.summary}</p>
                  <p className="milestone-narrative">{ms.narrative}</p>
                  {ms.platformEvolution && (
                    <section className="platform-evolution" aria-label="Platform evolution">
                      <div className="platform-evolution-heading">
                        <span>Platform evolution</span>
                        <span>Parallel delivery</span>
                      </div>
                      <div className="platform-evolution-grid">
                        <article>
                          <span className="platform-phase">01 / live product</span>
                          <h4>Legacy platform</h4>
                          <p>{ms.platformEvolution.legacy}</p>
                        </article>
                        <article>
                          <span className="platform-phase">02 / rebuild</span>
                          <h4>Modernization</h4>
                          <p>{ms.platformEvolution.modernization}</p>
                        </article>
                      </div>
                    </section>
                  )}
                  {ms.websiteUrl && (
                    <a className="milestone-website-link" href={ms.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Visit website <span aria-hidden="true">↗</span>
                    </a>
                  )}

                  {/* Achievements */}
                  {ms.achievements.length > 0 && (
                    <div className="milestone-block">
                      <span className="block-label">Responsibilities &amp; contributions:</span>
                      <ul className="milestone-list">
                        {ms.achievements.map((ach, idx) => (
                          <li key={idx}>
                            <span>↗</span> {ach}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills Unlocked */}
                  {ms.skillsUnlocked.length > 0 && (
                    <div className="milestone-skills">
                      <span className="skills-label">Tools &amp; platforms:</span>
                      <div className="skills-pills">
                        {ms.skillsUnlocked.map((skill) => (
                          <span className="skill-pill" key={skill}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageFrame>
  )
}
