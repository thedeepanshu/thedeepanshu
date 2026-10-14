import { useState } from 'react'
import { memories, type MemoryCategory } from '../content/portfolio'
import { PageFrame } from '../components/PageFrame'

export function BeyondPage() {
  const [activeCategory, setActiveCategory] = useState<MemoryCategory>('all')

  const categories: { id: MemoryCategory; label: string }[] = [
    { id: 'all', label: 'All Archives' },
    { id: 'anime-art', label: 'Anime & Art' },
    { id: 'life', label: 'Life & Frames' },
    { id: 'inspirations', label: 'Inspirations' },
  ]

  const filteredMemories = activeCategory === 'all'
    ? memories
    : memories.filter((m) => m.category === activeCategory)

  return (
    <PageFrame eyebrow="006 / life archive" title={<>Beyond the <em>code.</em></>} intro="Off-duty logs: the art, ideas and moments that shape how I build.">
      <div className="beyond-container">
        {memories.length === 0 ? (
          <div className="portfolio-empty-state">
            <span>PERSONAL ARCHIVE</span>
            <h2>Room for life beyond the screen.</h2>
            <p>No personal media has been added yet.</p>
          </div>
        ) : (
          <>
        {/* Archive Stats Bar */}
        <div className="beyond-stats-bar">
          <div className="stat-pill">
            <span>Personal archive</span>
            <strong>{memories.length} items</strong>
          </div>
          <div className="stat-pill">
            <span>Collection</span>
            <strong>Photos, video, and notes</strong>
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
                {/* Dev-only reminder; never rendered in production builds. */}
                {import.meta.env.DEV && mem.demo && <span className="memory-demo-badge">Demo · replace</span>}
              </div>

              {/* Title & Subtitle */}
              <div className="memory-body">
                {mem.subtitle && <p className="memory-subtitle">{mem.subtitle}</p>}
                <h3 className="memory-title">{mem.title}</h3>
                {mem.type === 'quote-card' ? (
                  <blockquote className="memory-quote">&ldquo;{mem.quoteOrCaption}&rdquo;</blockquote>
                ) : (
                  <p className="memory-quote memory-caption">{mem.quoteOrCaption}</p>
                )}
                {mem.details && <p className="memory-details">{mem.details}</p>}
              </div>

              {/* Tags */}
              <div className="memory-tags">
                {mem.tags.map((tag) => (
                  <span className="memory-tag" key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
          </>
        )}
      </div>
    </PageFrame>
  )
}
