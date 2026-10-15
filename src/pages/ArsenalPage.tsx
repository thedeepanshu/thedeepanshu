import { useEffect, useState } from 'react'
import { skills, type SkillCategory } from '../content/portfolio'
import { PageFrame } from '../components/PageFrame'
import { useVessel } from '../world/store'

export function ArsenalPage() {
  const [activeCategory, setActiveCategory] = useState<SkillCategory>('core-frontend')
  const setActiveSkill = useVessel((state) => state.setActiveSkill)

  // The star map turns to the selected domain's constellation.
  useEffect(() => setActiveSkill(activeCategory), [activeCategory, setActiveSkill])

  const categories: { id: SkillCategory; label: string }[] = [
    { id: 'all', label: 'All systems' },
    { id: 'core-frontend', label: 'Core frontend' },
    { id: 'state-data', label: 'State & data' },
    { id: 'ui-styling', label: 'UI & styling' },
    { id: 'testing-forms', label: 'Testing, forms & validation' },
    { id: 'performance-accessibility', label: 'Performance & accessibility' },
    { id: 'tools-analytics', label: 'Tools & analytics' },
    { id: 'ai-coding', label: 'AI-assisted development' },
    { id: 'technical-exposure', label: 'Tech exposure' },
  ]

  const filteredSkills = activeCategory === 'all'
    ? skills
    : skills.filter((skill) => skill.category === activeCategory)

  return (
    <PageFrame deck="arsenal" topic="skills" title={<>The <em>arsenal.</em></>} intro="My frontend toolkit, alongside the tools and technologies I've used in related areas.">
      <div className="arsenal-atlas">
        <div className="arsenal-atlas-heading">
          <div>
            <p className="section-kicker">Frontend toolkit / {skills.length} focus areas</p>
            <h2>Tools behind my <em>frontend work.</em></h2>
          </div>
          <p>Explore each area to see the tools in its stack. This map describes my toolkit, not a proficiency ranking.</p>
        </div>

        <nav className="arsenal-atlas-nav" aria-label="Skill domains">
          {categories.map((category, index) => {
            const count = category.id === 'all'
              ? skills.reduce((total, skill) => total + skill.tags.length, 0)
              : skills.find((skill) => skill.category === category.id)?.tags.length ?? 0

            return (
              <button
                type="button"
                key={category.id}
                className={`arsenal-atlas-tab ${activeCategory === category.id ? 'active' : ''}`}
                aria-pressed={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="atlas-tab-index">{String(index).padStart(2, '0')}</span>
                <span className="atlas-tab-label">{category.label}</span>
                <span className="atlas-tab-count">{String(count).padStart(2, '0')}</span>
              </button>
            )
          })}
        </nav>

        <div className="arsenal-atlas-results" aria-live="polite">
          {filteredSkills.map((skill) => {
            const index = skills.findIndex((item) => item.id === skill.id) + 1
            return (
              <article className="arsenal-domain" key={skill.id}>
                <div className="arsenal-domain-marker">
                  <span>DOMAIN / {String(index).padStart(2, '0')}</span>
                  <strong>{String(skill.tags.length).padStart(2, '0')}</strong>
                  <small>tools</small>
                </div>
                <div className="arsenal-domain-detail">
                  <p className="arsenal-domain-category">{skill.categoryLabel}</p>
                  <h3>{skill.name}</h3>
                  <p className="arsenal-domain-description">{skill.description}</p>
                  <div className="arsenal-domain-tools" aria-label={`${skill.name} technologies`}>
                    {skill.tags.map((tag, tagIndex) => (
                      <span key={tag}>
                        <small>{String(tagIndex + 1).padStart(2, '0')}</small>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

      </div>
    </PageFrame>
  )
}
