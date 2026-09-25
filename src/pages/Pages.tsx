import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { missions, skills, type SkillCategory } from '../content/portfolio'

type PageFrameProps = {
  eyebrow: string
  title: ReactNode
  intro: string
  children: ReactNode
}

const navigation = [
  ['Origin', '/about'],
  ['Missions', '/missions'],
  ['Arsenal', '/arsenal'],
  ['Journey', '/journey'],
  ['Lab', '/lab'],
  ['Beyond', '/beyond'],
  ['Signal', '/signal'],
]

function PageFrame({ eyebrow, title, intro, children }: PageFrameProps) {
  return (
    <main className="portfolio-shell inner-page">
      <header className="site-header">
        <Link className="wordmark" to="/">thedeepanshu<span className="wordmark-dot">.</span></Link>
        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.slice(0, 3).map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}
        </nav>
        <span className="system-status"><i /> system online</span>
      </header>
      <section className="page-intro">
        <p className="section-kicker">/ {eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <section className="page-content">{children}</section>
      <footer className="site-footer">
        <p>thedeepanshu / signal open</p>
        <Link to="/signal">Let&apos;s build something alive <span>↗</span></Link>
      </footer>
    </main>
  )
}

function ChapterList({ items }: { items: string[] }) {
  return <div className="chapter-list">{items.map((item, index) => <div className="chapter-row" key={item}><span>0{index + 1}</span><strong>{item}</strong><b>↗</b></div>)}</div>
}

export function AboutPage() {
  return <PageFrame eyebrow="001 / origin" title={<>Built from <em>curiosity.</em></>} intro="A builder's story in progress: part engineer, part designer, always looking for the next system worth bringing to life."><div className="split-copy"><p className="lead-copy">I care about the feeling a product leaves behind. The quiet detail, the useful surprise, the moment an interface starts to feel less like a tool and more like a place.</p><div className="stat-grid"><span><b>01</b>Curious by default</span><span><b>02</b>Human-first systems</span><span><b>03</b>Always experimenting</span></div></div></PageFrame>
}

export function MissionsPage() {
  return (
    <PageFrame eyebrow="002 / selected work" title={<>Ideas in <em>motion.</em></>} intro="A growing archive of interfaces, products, and experiments built to make technology feel more considered.">
      <div className="mission-archive">
        {missions.map((mission) => (
          <Link className="mission-entry-link" to={`/missions/${mission.slug}`} key={mission.number}>
            <article className="mission-entry">
              <div className="mission-entry-top">
                <span>{mission.number} / {mission.type}</span>
                <small>{mission.status}</small>
              </div>
              <h2>{mission.title} <span className="entry-arrow">↗</span></h2>
              <p>{mission.summary}</p>
              <div className="mission-tags">
                {mission.technologies.map((technology) => <span key={technology}>{technology}</span>)}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </PageFrame>
  )
}

export function MissionDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const mission = missions.find((m) => m.slug === slug)

  if (!mission) {
    return (
      <PageFrame eyebrow="404 / mission missing" title={<>Signal <em>lost.</em></>} intro="The requested mission could not be located in the current archive segment.">
        <div className="not-found-box">
          <p>The mission log you are seeking does not exist or has been re-indexed.</p>
          <Link className="primary-action" to="/missions">Return to Missions <span>↗</span></Link>
        </div>
      </PageFrame>
    )
  }

  const currentIndex = missions.findIndex((m) => m.slug === slug)
  const nextMission = missions[(currentIndex + 1) % missions.length]
  const prevMission = missions[(currentIndex - 1 + missions.length) % missions.length]

  return (
    <PageFrame eyebrow={`002 / mission ${mission.number}`} title={<>{mission.title} <em>case study.</em></>} intro={mission.tagline}>
      <div className="mission-detail-container">
        {/* Meta Bar */}
        <div className="mission-meta-grid">
          <div className="meta-cell">
            <span>Role</span>
            <strong>{mission.role}</strong>
          </div>
          <div className="meta-cell">
            <span>Context</span>
            <strong>{mission.clientOrContext}</strong>
          </div>
          <div className="meta-cell">
            <span>Year</span>
            <strong>{mission.year}</strong>
          </div>
          <div className="meta-cell">
            <span>Status</span>
            <strong className="status-badge">{mission.status}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="mission-detail-actions">
          {mission.liveUrl && (
            <a className="primary-action" href={mission.liveUrl} target="_blank" rel="noopener noreferrer">
              Launch live demo <span>↗</span>
            </a>
          )}
          {mission.sourceUrl && (
            <a className="text-action-box" href={mission.sourceUrl} target="_blank" rel="noopener noreferrer">
              View repository <span>↗</span>
            </a>
          )}
          <Link className="text-action-box secondary" to="/missions">
            Back to all missions <span>←</span>
          </Link>
        </div>

        {/* Story Section: Overview */}
        <section className="detail-section">
          <p className="section-kicker">/ 01 — Mission Overview</p>
          <p className="detail-lead">{mission.overview}</p>
        </section>

        {/* Story Section: Challenge, Solution, Outcome Grid */}
        <section className="detail-section">
          <p className="section-kicker">/ 02 — Problem & Strategy</p>
          <div className="story-grid">
            <div className="story-card">
              <h3>The Challenge</h3>
              <p>{mission.challenge}</p>
            </div>
            <div className="story-card story-card-highlight">
              <h3>The Solution</h3>
              <p>{mission.solution}</p>
            </div>
            <div className="story-card">
              <h3>The Outcome</h3>
              <p>{mission.outcome}</p>
            </div>
          </div>
        </section>

        {/* Story Section: Architecture */}
        <section className="detail-section">
          <p className="section-kicker">/ 03 — Technical Architecture</p>
          <div className="architecture-grid">
            {mission.architecture.map((item) => (
              <div className="architecture-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.detail}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section: Key System Highlights */}
        <section className="detail-section">
          <p className="section-kicker">/ 04 — System Highlights</p>
          <ul className="highlights-list">
            {mission.highlights.map((highlight, idx) => (
              <li key={idx}>
                <span className="highlight-bullet">0{idx + 1}</span>
                <p>{highlight}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Mission Footer Navigation */}
        <div className="mission-nav-footer">
          <Link className="mission-nav-link" to={`/missions/${prevMission.slug}`}>
            <span>Previous Mission</span>
            <strong>{prevMission.number} / {prevMission.title}</strong>
          </Link>
          <Link className="mission-nav-link text-right" to={`/missions/${nextMission.slug}`}>
            <span>Next Mission</span>
            <strong>{nextMission.number} / {nextMission.title}</strong>
          </Link>
        </div>
      </div>
    </PageFrame>
  )
}

export function ArsenalPage() {
  const [activeCategory, setActiveCategory] = useState<SkillCategory>('all')

  const categories: { id: SkillCategory; label: string }[] = [
    { id: 'all', label: 'All Systems' },
    { id: 'frontend', label: 'Core Frontend' },
    { id: 'spatial-3d', label: '3D & Spatial' },
    { id: 'ai-systems', label: 'AI & Intelligence' },
    { id: 'motion-ux', label: 'Motion & UX' },
    { id: 'tooling', label: 'Build & Tooling' },
  ]

  const filteredSkills = activeCategory === 'all'
    ? skills
    : skills.filter((s) => s.category === activeCategory)

  return (
    <PageFrame eyebrow="003 / capabilities" title={<>The <em>arsenal.</em></>} intro="The technical systems, graphics engines, and design methodologies powering my work.">
      <div className="arsenal-container">
        {/* System Stats Bar */}
        <div className="arsenal-stats-bar">
          <div className="stat-pill">
            <span>Total Capabilities</span>
            <strong>{skills.length} Systems Active</strong>
          </div>
          <div className="stat-pill">
            <span>Primary Engine</span>
            <strong>React 19 + TypeScript + R3F</strong>
          </div>
          <div className="stat-pill">
            <span>Current R&D Focus</span>
            <strong>GLSL Shaders & AI Workflows</strong>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="arsenal-filter-bar">
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

        {/* Enhanced Skill Grid */}
        <div className="arsenal-grid">
          {filteredSkills.map((skill, index) => (
            <div className="skill-card-enhanced" key={skill.id}>
              <div className="skill-card-header">
                <span className="skill-index">0{index + 1}</span>
                <span className="skill-category-tag">{skill.categoryLabel}</span>
                <span className="skill-status-tag">{skill.status}</span>
              </div>
              <h3 className="skill-card-title">{skill.name}</h3>
              <p className="skill-card-desc">{skill.description}</p>
              <div className="skill-card-meta">
                <span>Level: <strong>{skill.level}</strong></span>
                <span>Focus: <strong>{skill.experience}</strong></span>
              </div>
              <div className="skill-card-tags">
                {skill.tags.map((tag) => (
                  <span className="skill-tag" key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageFrame>
  )
}

export function JourneyPage() {
  return <PageFrame eyebrow="004 / timeline" title={<>The <em>journey.</em></>} intro="Milestones are useful. The direction between them matters more."><ChapterList items={['The first line of code', 'Learning to build in public', 'The next chapter is loading']} /></PageFrame>
}

export function LabPage() {
  return <PageFrame eyebrow="005 / experiments" title={<>Welcome to the <em>lab.</em></>} intro="Unfinished ideas, strange prototypes, and technical experiments that may become something more."><ChapterList items={['Generative interfaces', 'Character systems', 'Spatial web experiments']} /></PageFrame>
}

export function BeyondPage() {
  return <PageFrame eyebrow="006 / life archive" title={<>Beyond the <em>code.</em></>} intro="Photos, videos, places, music, and the small influences that quietly shape the work."><div className="memory-grid"><div className="memory-card memory-card-large"><span>memory / 001</span><strong>Life in frames</strong></div><div className="memory-card"><span>memory / 002</span><strong>Things that inspire me</strong></div><div className="memory-card memory-card-accent"><span>memory / 003</span><strong>More soon</strong></div></div></PageFrame>
}

export function JournalPage() {
  return <PageFrame eyebrow="007 / field notes" title={<>Thoughts from the <em>signal.</em></>} intro="Notes on building, designing, learning, and staying curious in a fast-moving medium."><ChapterList items={['Why interfaces should have atmosphere', 'Learning to think in systems', 'Building for the feeling']} /></PageFrame>
}

export function SignalPage() {
  return <PageFrame eyebrow="008 / contact" title={<>Send a <em>signal.</em></>} intro="Have a project, an experiment, or a strange idea worth exploring? I would like to hear about it."><div className="signal-panel"><span>available for selected collaborations</span><a href="mailto:hello@thedeepanshu.dev">hello@thedeepanshu.dev <b>↗</b></a></div></PageFrame>
}

