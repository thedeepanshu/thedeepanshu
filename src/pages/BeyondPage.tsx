import { Clapperboard, GraduationCap, Headphones, Heart } from 'lucide-react'
import { familyChannel, learning, listening, nowUpdated, watching } from '../content/beyond'
import { PageFrame } from '../components/PageFrame'
import { FamilyChannel } from './beyond/FamilyChannel'
import { LearningDesk } from './beyond/LearningDesk'
import { LocalClock } from './beyond/LocalClock'
import { RecommendBack } from './beyond/RecommendBack'
import { RecordPlayer } from './beyond/RecordPlayer'
import { StoryBoard } from './beyond/StoryBoard'
import { WatchShelf } from './beyond/WatchShelf'
import './BeyondPage.css'

const updated = new Date(`${nowUpdated}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Beyond (crew quarters): off duty. What I'm watching, listening to and
 * learning right now, life stories (developing), and a corner for visitors to
 * recommend something back. The deck has its own warm light and music.
 */
export function BeyondPage() {
  const nowWatching = watching.find((item) => item.status !== 'finished') ?? watching[0]

  return (
    <PageFrame
      deck="beyond" topic="off duty"
      title={<>Beyond the <em>code.</em></>}
      intro="Off duty. What I’m watching, listening to and learning right now, and life with my family."
    >
      <div className="beyond">
        <div className="beyond-now">
          <LocalClock />
          <nav className="beyond-ticker" aria-label="On this deck">
            {nowWatching && <a href="#watching"><Clapperboard size={15} aria-hidden="true" /><span>Watching</span><b>{nowWatching.title}</b></a>}
            {listening[0] && <a href="#listening"><Headphones size={15} aria-hidden="true" /><span>On repeat</span><b>{listening[0].name}</b></a>}
            <a href="#learning"><GraduationCap size={15} aria-hidden="true" /><span>Learning</span><b>{learning.title}</b></a>
            <a href="#family"><Heart size={15} aria-hidden="true" /><span>Family vlog</span><b>{familyChannel.name}</b></a>
          </nav>
          <p className="beyond-updated">Updated {updated}</p>
        </div>

        <section className="beyond-section" id="watching" aria-labelledby="watching-title">
          <header className="beyond-head">
            <p className="section-kicker">/ now watching</p>
            <h2 id="watching-title">On my <span>screen.</span></h2>
            <p>Tap a poster for the details, or play the trailer.</p>
          </header>
          <WatchShelf />
        </section>

        <section className="beyond-section" id="listening" aria-labelledby="listening-title">
          <header className="beyond-head">
            <p className="section-kicker">/ on repeat</p>
            <h2 id="listening-title">In my <span>ears.</span></h2>
            <p>Punjabi and Haryanvi, mostly. Pull a record from the crate.</p>
          </header>
          <RecordPlayer />
        </section>

        <section className="beyond-section" id="learning" aria-labelledby="learning-title">
          <header className="beyond-head">
            <p className="section-kicker">/ learning</p>
            <h2 id="learning-title">Still a <span>student.</span></h2>
            <p>Five years in, still learning. Here’s what’s on my desk.</p>
          </header>
          <LearningDesk />
        </section>

        <section className="beyond-section" id="family" aria-labelledby="family-title">
          <header className="beyond-head">
            <p className="section-kicker">/ life log</p>
            <h2 id="family-title">Life with <span>Doli &amp; family.</span></h2>
            <p>My wife Doli and I vlog the everyday: celebrations, trips home and, this year, becoming parents.</p>
          </header>
          <FamilyChannel />
          <div className="beyond-subsection" id="stories">
            <StoryBoard />
          </div>
        </section>

        <section className="beyond-section beyond-section--your-turn" aria-labelledby="your-turn-title">
          <header className="beyond-head">
            <p className="section-kicker">/ your turn</p>
            <h2 id="your-turn-title">Put me onto <span>something.</span></h2>
            <p>A show, a song, a channel, or an idea for our vlog. We’re always looking for the next one.</p>
          </header>
          <RecommendBack />
        </section>
      </div>
    </PageFrame>
  )
}
