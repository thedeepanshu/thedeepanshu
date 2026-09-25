import { useState, type ReactNode } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { missions, skills, experiments, memories, milestones, articles, socialLinks, type SkillCategory, type ExperimentCategory, type MemoryCategory, type MilestoneCategory, type JournalCategory } from '../content/portfolio'
import { LabCanvasWidget } from '../components/LabCanvasWidget'

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
          {navigation.map(([label, path]) => <NavLink key={path} to={path}>{label}</NavLink>)}
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
  const [activeCategory, setActiveCategory] = useState<MilestoneCategory>('all')

  const categories: { id: MilestoneCategory; label: string }[] = [
    { id: 'all', label: 'All Milestones' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'spatial-3d', label: '3D & Spatial' },
    { id: 'ai-systems', label: 'AI & Systems' },
    { id: 'creative-growth', label: 'Creative Growth' },
  ]

  const filteredMilestones = activeCategory === 'all'
    ? milestones
    : milestones.filter((m) => m.category === activeCategory)

  return (
    <PageFrame eyebrow="004 / timeline" title={<>The <em>journey.</em></>} intro="Milestones mark progress, but the direction between them defines the craft. A chronological log of growth.">
      <div className="journey-container">
        {/* Journey Stats Bar */}
        <div className="journey-stats-bar">
          <div className="stat-pill">
            <span>Timeline Arc</span>
            <strong>2023 — 2026+ Horizon</strong>
          </div>
          <div className="stat-pill">
            <span>Core Disciplines</span>
            <strong>React + WebGL + Spatial AI</strong>
          </div>
          <div className="stat-pill">
            <span>Current Milestone</span>
            <strong>thedeepanshu v3 Active</strong>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="journey-filter-bar">
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

        {/* Vertical Timeline Structure */}
        <div className="timeline-wrapper">
          <div className="timeline-spine" />

          <div className="timeline-list">
            {filteredMilestones.map((ms) => (
              <div className="timeline-item" key={ms.id}>
                {/* Node indicator */}
                <div className="timeline-node">
                  <div className="node-dot" />
                  <span className="node-year">{ms.year}</span>
                  {ms.quarter && <span className="node-quarter">{ms.quarter}</span>}
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

                  {/* Achievements */}
                  {ms.achievements.length > 0 && (
                    <div className="milestone-block">
                      <span className="block-label">Key Achievements:</span>
                      <ul className="milestone-list">
                        {ms.achievements.map((ach, idx) => (
                          <li key={idx}><span>↗</span> {ach}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills Unlocked */}
                  {ms.skillsUnlocked.length > 0 && (
                    <div className="milestone-skills">
                      <span className="skills-label">Skills Unlocked:</span>
                      <div className="skills-pills">
                        {ms.skillsUnlocked.map((skill) => (
                          <span className="skill-pill" key={skill}>{skill}</span>
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

export function LabPage() {
  const [activeCategory, setActiveCategory] = useState<ExperimentCategory>('all')
  const [openSnippetId, setOpenSnippetId] = useState<string | null>(null)

  const categories: { id: ExperimentCategory; label: string }[] = [
    { id: 'all', label: 'All Experiments' },
    { id: 'shaders', label: 'Shader Art' },
    { id: 'canvas-generative', label: 'Generative Canvas' },
    { id: 'spatial-ui', label: 'Spatial UI' },
    { id: 'ai-prototypes', label: 'AI Prototypes' },
  ]

  const filteredExperiments = activeCategory === 'all'
    ? experiments
    : experiments.filter((e) => e.category === activeCategory)

  return (
    <PageFrame eyebrow="005 / experiments" title={<>Welcome to the <em>lab.</em></>} intro="Unfinished ideas, live canvas widgets, shader tests, and spatial web prototypes built for exploration.">
      <div className="lab-container">
        {/* Lab Stats Bar */}
        <div className="lab-stats-bar">
          <div className="stat-pill">
            <span>Live Sandbox</span>
            <strong>{experiments.length} Active Experiments</strong>
          </div>
          <div className="stat-pill">
            <span>Graphics Engine</span>
            <strong>HTML5 Canvas + WebGL 2.0</strong>
          </div>
          <div className="stat-pill">
            <span>Status</span>
            <strong>R&D Pipeline Open</strong>
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

              {/* Actions & Code Toggle */}
              <div className="lab-card-footer">
                <div className="lab-links">
                  {exp.demoUrl && (
                    <a className="lab-link-btn" href={exp.demoUrl} target="_blank" rel="noopener noreferrer">
                      Launch demo <span>↗</span>
                    </a>
                  )}
                  {exp.sourceUrl && (
                    <a className="lab-link-btn secondary" href={exp.sourceUrl} target="_blank" rel="noopener noreferrer">
                      Code <span>↗</span>
                    </a>
                  )}
                </div>

                {exp.codeSnippet && (
                  <button
                    className="code-toggle-btn"
                    onClick={() => setOpenSnippetId(openSnippetId === exp.id ? null : exp.id)}
                  >
                    {openSnippetId === exp.id ? 'Hide snippet [-]' : 'View snippet [+]'}
                  </button>
                )}
              </div>

              {/* Code Snippet Drawer */}
              {openSnippetId === exp.id && exp.codeSnippet && (
                <div className="lab-snippet-drawer">
                  <pre><code>{exp.codeSnippet}</code></pre>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </PageFrame>
  )
}

export function BeyondPage() {
  const [activeCategory, setActiveCategory] = useState<MemoryCategory>('all')

  const categories: { id: MemoryCategory; label: string }[] = [
    { id: 'all', label: 'All Archives' },
    { id: 'anime-art', label: 'Anime & Art' },
    { id: 'life', label: 'Life & Frames' },
    { id: 'music', label: 'Music & Sound' },
    { id: 'inspirations', label: 'Inspirations' },
  ]

  const filteredMemories = activeCategory === 'all'
    ? memories
    : memories.filter((m) => m.category === activeCategory)

  return (
    <PageFrame eyebrow="006 / life archive" title={<>Beyond the <em>code.</em></>} intro="Photos, music, aesthetic references, design philosophies, and the personal world behind the systems.">
      <div className="beyond-container">
        {/* Archive Stats Bar */}
        <div className="beyond-stats-bar">
          <div className="stat-pill">
            <span>Personal World</span>
            <strong>{memories.length} Archived Moments</strong>
          </div>
          <div className="stat-pill">
            <span>Aesthetic Domain</span>
            <strong>Anime Sci-Fi & Cyberpunk</strong>
          </div>
          <div className="stat-pill">
            <span>Soundscape</span>
            <strong>Synthwave + Ambient Lofi</strong>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="beyond-filter-bar">
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

        {/* Memory Archive Grid */}
        <div className="beyond-grid">
          {filteredMemories.map((mem) => (
            <article
              className="memory-card-enhanced"
              key={mem.id}
              style={{ background: mem.gradientStyle || 'linear-gradient(140deg, #122a31, #0d151c)' }}
            >
              {/* Header */}
              <div className="memory-header">
                <span className="memory-num">FRAME / {mem.number}</span>
                <span className="memory-cat">{mem.categoryLabel}</span>
              </div>

              {/* Title & Subtitle */}
              <div className="memory-body">
                {mem.subtitle && <p className="memory-subtitle">{mem.subtitle}</p>}
                <h3 className="memory-title">{mem.title}</h3>
                <blockquote className="memory-quote">&ldquo;{mem.quoteOrCaption}&rdquo;</blockquote>
                {mem.details && <p className="memory-details">{mem.details}</p>}
              </div>

              {/* Music Player Bar (if music type) */}
              {mem.type === 'music-player' && (
                <div className="music-player-widget">
                  <div className="music-wave-bars">
                    <span className="bar" />
                    <span className="bar" />
                    <span className="bar" />
                    <span className="bar" />
                  </div>
                  <span className="music-status">Now Playing Atmosphere</span>
                </div>
              )}

              {/* Tags */}
              <div className="memory-tags">
                {mem.tags.map((tag) => (
                  <span className="memory-tag" key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageFrame>
  )
}

export function JournalPage() {
  const [activeCategory, setActiveCategory] = useState<JournalCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  const categories: { id: JournalCategory; label: string }[] = [
    { id: 'all', label: 'All Notes' },
    { id: 'ui-atmosphere', label: 'UI Atmosphere' },
    { id: 'systems-thinking', label: 'Systems Thinking' },
    { id: 'ai-design', label: 'AI & Design' },
  ]

  const featuredArticle = articles.find((a) => a.featured) || articles[0]

  const filteredArticles = articles.filter((art) => {
    const matchesCat = activeCategory === 'all' || art.category === activeCategory
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <PageFrame eyebrow="007 / field notes" title={<>Thoughts from the <em>signal.</em></>} intro="Reflections on systems design, spatial interfaces, software craftsmanship, and building products with personality.">
      <div className="journal-container">
        {/* Journal Stats Bar */}
        <div className="journal-stats-bar">
          <div className="stat-pill">
            <span>Archive Size</span>
            <strong>{articles.length} Published Field Notes</strong>
          </div>
          <div className="stat-pill">
            <span>Primary Focus</span>
            <strong>Software Craft & Atmosphere</strong>
          </div>
          <div className="stat-pill">
            <span>Reading Time</span>
            <strong>~15 Min Total Archive</strong>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="journal-toolbar">
          <div className="journal-search-box">
            <span>SEARCH /</span>
            <input
              type="text"
              placeholder="Search field notes by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="journal-filter-bar">
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
        </div>

        {/* Featured Note Spotlight (if no search filter active) */}
        {!searchQuery && activeCategory === 'all' && (
          <section className="featured-article-card">
            <div className="featured-meta">
              <span className="spotlight-tag">FEATURED SPOTLIGHT</span>
              <span className="featured-date">{featuredArticle.date} • {featuredArticle.readTime}</span>
            </div>
            <h2 className="featured-title">{featuredArticle.title}</h2>
            <p className="featured-excerpt">{featuredArticle.excerpt}</p>
            <div className="featured-takeaways">
              <strong>Key Insight:</strong>
              <p>&ldquo;{featuredArticle.takeaways[0]}&rdquo;</p>
            </div>
            <button
              className="primary-action inline-action"
              onClick={() => setOpenSlug(openSlug === featuredArticle.slug ? null : featuredArticle.slug)}
            >
              {openSlug === featuredArticle.slug ? 'Close reading mode [-]' : 'Read full field note ↗'}
            </button>

            {openSlug === featuredArticle.slug && (
              <div className="article-reader-drawer">
                {featuredArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Articles List */}
        <div className="articles-list">
          {filteredArticles.map((art) => (
            <article className="article-card" key={art.slug}>
              <div className="article-card-header">
                <div>
                  <span className="article-category">{art.categoryLabel}</span>
                  <h3 className="article-title">{art.title}</h3>
                </div>
                <span className="article-date">{art.date} • {art.readTime}</span>
              </div>

              <p className="article-excerpt">{art.excerpt}</p>

              {/* Takeaways list */}
              <div className="article-takeaways-block">
                <span>Key Takeaways:</span>
                <ul>
                  {art.takeaways.map((t, idx) => (
                    <li key={idx}><span>✦</span> {t}</li>
                  ))}
                </ul>
              </div>

              {/* Reader Toggle Button */}
              <div className="article-card-footer">
                <button
                  className="read-toggle-btn"
                  onClick={() => setOpenSlug(openSlug === art.slug ? null : art.slug)}
                >
                  {openSlug === art.slug ? 'Hide note content [-]' : 'Read full note [+]'}
                </button>
              </div>

              {/* Full Article Drawer */}
              {openSlug === art.slug && (
                <div className="article-reader-drawer">
                  {art.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </PageFrame>
  )
}

export function SignalPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Full System Architecture',
    message: '',
  })
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'transmitting' | 'sent'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return

    setDispatchStatus('transmitting')
    setTimeout(() => {
      setDispatchStatus('sent')
    }, 1200)
  }

  return (
    <PageFrame eyebrow="008 / contact" title={<>Send a <em>signal.</em></>} intro="Have a project, a 3D WebGL experiment, an AI interface, or a creative vision worth exploring? Let's build something alive.">
      <div className="signal-container">
        {/* Availability Bar */}
        <div className="signal-stats-bar">
          <div className="stat-pill">
            <span>Availability Status</span>
            <strong className="status-highlight">● Open for Selected Collaborations</strong>
          </div>
          <div className="stat-pill">
            <span>Response Metric</span>
            <strong>&lt; 24 Hours Response Time</strong>
          </div>
          <div className="stat-pill">
            <span>Current Location</span>
            <strong>UTC +05:30 • Digital Studio</strong>
          </div>
        </div>

        {/* 2-Column Terminal Layout */}
        <div className="signal-layout">
          {/* Left Column: Form */}
          <div className="signal-terminal-panel">
            <div className="terminal-header">
              <span className="terminal-title">TERMINAL DISPATCH // INBOUND SIGNAL</span>
              <span className="terminal-dot" />
            </div>

            {dispatchStatus === 'sent' ? (
              <div className="dispatch-success-box">
                <span className="success-tag">&gt; SIGNAL ACKNOWLEDGED</span>
                <h3>Transmission Received</h3>
                <p>Thank you, {formData.name}. Your signal has been routed to my primary terminal queue. I will respond within 24 hours.</p>
                <button className="primary-action inline-action" onClick={() => {
                  setFormData({ name: '', email: '', projectType: 'Full System Architecture', message: '' })
                  setDispatchStatus('idle')
                }}>
                  Send another signal <span>↗</span>
                </button>
              </div>
            ) : (
              <form className="signal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name / Identity</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="e.g. Alex Mercer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Return Signal Coordinate (Email)</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="e.g. alex@studio.dev"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectType">Project Scope / Category</label>
                  <select
                    id="projectType"
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  >
                    <option value="Full System Architecture">Full System Architecture</option>
                    <option value="3D WebGL Interface">3D WebGL / Spatial Interface</option>
                    <option value="Spatial AI Experience">Spatial AI / Agentic UI</option>
                    <option value="Design & Strategy">Design Systems & Product Strategy</option>
                    <option value="General Inquiry">General Inquiry / Open Chat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Signal Brief / Project Vision</label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    placeholder="Tell me about your goals, timeline, and vision..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="primary-action submit-btn"
                  disabled={dispatchStatus === 'transmitting'}
                >
                  {dispatchStatus === 'transmitting' ? 'Transmitting Signal...' : 'Transmit Signal ↗'}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Channels & Telemetry */}
          <div className="signal-sidebar">
            <div className="coordinates-panel">
              <p className="sidebar-label">/ DIRECT CHANNELS &amp; COORDINATES</p>

              <div className="social-grid">
                {socialLinks.map((link) => (
                  <a
                    className="social-tile"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={link.name}
                  >
                    <div>
                      <span className="tile-platform">{link.platform}</span>
                      <strong className="tile-name">{link.name}</strong>
                      <small className="tile-handle">{link.handle}</small>
                    </div>
                    <span className="tile-arrow">↗</span>
                  </a>
                ))}
              </div>
            </div>

            {/* System Telemetry Box */}
            <div className="telemetry-box">
              <span className="telemetry-title">&gt; SYSTEM TELEMETRY LOG</span>
              <pre className="telemetry-log">
{`> CORE STATUS: OPERATIONAL
> ENCRYPTION: TLS 1.3 ACTIVE
> PORT: 443 OPEN
> BUFFER: 0% DROPPED
> ROUTING: DIRECT TO INBOX`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  )
}

