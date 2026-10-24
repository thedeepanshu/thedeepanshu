import './BeyondPage.css'

import { Clapperboard, GraduationCap, Headphones, Heart } from 'lucide-react'

import { PageFrame } from '@/components/PageFrame'
import { familyChannel, learning, listening, nowUpdated, watching } from '@/content/beyond'

import { FamilyChannel } from './beyond/FamilyChannel'
import { LearningDesk } from './beyond/LearningDesk'
import { LocalClock } from './beyond/LocalClock'
import { RecommendBack } from './beyond/RecommendBack'
import { RecordPlayer } from './beyond/RecordPlayer'
import { SectionHead } from './beyond/SectionHead'
import { StoryBoard } from './beyond/StoryBoard'
import { WatchShelf } from './beyond/WatchShelf'

const updated = new Date(`${nowUpdated}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Beyond (crew quarters): off duty. What I'm watching, listening to and
 * learning right now, life stories (developing), and a corner for visitors to
 * recommend something back. The deck has its own warm light and music.
 */
export function BeyondPage() {
  // `watching` is sorted with what I'm in the middle of first.
  const nowWatching = watching[0]

  return (
    <PageFrame
      deck="beyond"
      topic="off duty"
      title={
        <>
          Beyond the <em>code.</em>
        </>
      }
      intro="Off duty. What I’m watching, listening to and learning right now, and life with my family."
    >
      <div className="beyond">
        <div className="beyond-now">
          <LocalClock />
          <nav className="beyond-ticker" aria-label="On this deck">
            {nowWatching && (
              <a href="#watching">
                <Clapperboard size={15} aria-hidden="true" />
                <span>Watching</span>
                <b>{nowWatching.title}</b>
              </a>
            )}
            {listening[0] && (
              <a href="#listening">
                <Headphones size={15} aria-hidden="true" />
                <span>On repeat</span>
                <b>{listening[0].name}</b>
              </a>
            )}
            <a href="#learning">
              <GraduationCap size={15} aria-hidden="true" />
              <span>Learning</span>
              <b>{learning.title}</b>
            </a>
            <a href="#family">
              <Heart size={15} aria-hidden="true" />
              <span>Family vlog</span>
              <b>{familyChannel.name}</b>
            </a>
          </nav>
          <p className="beyond-updated">Updated {updated}</p>
        </div>

        <section className="beyond-section" id="watching" aria-labelledby="watching-title">
          <SectionHead kicker="/ now watching" titleId="watching-title" intro="Tap a poster for the details, or play the trailer.">
            On my <span>screen.</span>
          </SectionHead>
          <WatchShelf />
        </section>

        <section className="beyond-section" id="listening" aria-labelledby="listening-title">
          <SectionHead kicker="/ on repeat" titleId="listening-title" intro="Punjabi and Haryanvi, mostly. Pull a record from the crate.">
            In my <span>ears.</span>
          </SectionHead>
          <RecordPlayer />
        </section>

        <section className="beyond-section" id="learning" aria-labelledby="learning-title">
          <SectionHead kicker="/ learning" titleId="learning-title" intro="Five years in, still learning. Here’s what’s on my desk.">
            Still a <span>student.</span>
          </SectionHead>
          <LearningDesk />
        </section>

        <section className="beyond-section" id="family" aria-labelledby="family-title">
          <SectionHead
            kicker="/ life log"
            titleId="family-title"
            intro="My wife Doli and I vlog the everyday: celebrations, trips home and, this year, becoming parents."
          >
            Life with <span>Doli &amp; family.</span>
          </SectionHead>
          <FamilyChannel />
          <div className="beyond-subsection" id="stories">
            <StoryBoard />
          </div>
        </section>

        <section className="beyond-section beyond-section--your-turn" aria-labelledby="your-turn-title">
          <SectionHead
            kicker="/ your turn"
            titleId="your-turn-title"
            intro="A show, a song, a channel, or an idea for our vlog. We’re always looking for the next one."
          >
            Put me onto <span>something.</span>
          </SectionHead>
          <RecommendBack />
        </section>
      </div>
    </PageFrame>
  )
}
