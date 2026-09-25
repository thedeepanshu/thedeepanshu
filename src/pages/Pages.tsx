import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { missions } from '../content/portfolio'

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
  return <PageFrame eyebrow="002 / selected work" title={<>Ideas in <em>motion.</em></>} intro="A growing archive of interfaces, products, and experiments built to make technology feel more considered."><div className="mission-archive">{missions.map((mission) => <article className="mission-entry" key={mission.number}><div className="mission-entry-top"><span>{mission.number} / {mission.type}</span><small>{mission.status}</small></div><h2>{mission.title}</h2><p>{mission.summary}</p><div className="mission-tags">{mission.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div></article>)}</div></PageFrame>
}

export function ArsenalPage() {
  return <PageFrame eyebrow="003 / capabilities" title={<>The <em>arsenal.</em></>} intro="The tools, systems, and instincts behind the work."><div className="skill-grid">{['React + TypeScript', 'Three.js + WebGL', 'AI systems', 'Motion design', 'Product thinking', 'Creative coding', 'Design systems', 'Performance'].map((skill, index) => <div className="skill-tile" key={skill}><span>0{index + 1}</span><strong>{skill}</strong><small>active system</small></div>)}</div></PageFrame>
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
