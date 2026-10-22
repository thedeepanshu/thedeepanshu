/**
 * Structured data (schema.org JSON-LD) for each route, built from the same
 * content the pages render, so it can never drift from what visitors see.
 * Written into each route's HTML at build time by scripts/seo-build.mjs.
 *
 * The Person's `sameAs` links the site to every profile (GitHub, LinkedIn,
 * YouTube, Instagram): the signal search engines use to treat them as one
 * person.
 */
import { absoluteUrl, siteUrl } from '@/config/site'
import { familyChannel } from '@/content/beyond'
import { dossier, missions, skills, socialLinks } from '@/content/portfolio'
import { resumeData } from '@/content/resumeData'
import seo from '@/content/seo.json'

const PERSON_ID = `${siteUrl}/#person`
const WEBSITE_ID = `${siteUrl}/#website`
const pages = seo.pages as Record<string, { title: string; description: string }>

/** Profiles that are this person (personal and the family vlog). */
export function profileUrls() {
  const fromSocials = socialLinks.map((link) => link.url).filter((url) => /github\.com|linkedin\.com|instagram\.com/.test(url))
  return [...new Set([...fromSocials, familyChannel.youtube.url, familyChannel.instagram.url])]
}

/** What the person works with: the main toolkit domains, minus tools and AI assistants. */
function knowsAbout() {
  const domains = skills.filter((skill) => !/AI Coding|Tools & Analytics|Technical Exposure/.test(skill.name))
  return [...new Set([...domains.flatMap((skill) => skill.tags), 'Three.js', 'WebGL', 'Web Performance', 'Accessibility'])]
}

function person() {
  const { personalInfo, education, experience } = resumeData
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: personalInfo.name,
    alternateName: dossier.callsign,
    jobTitle: personalInfo.title,
    description: pages['/'].description,
    url: siteUrl,
    image: absoluteUrl(dossier.portrait),
    email: `mailto:${personalInfo.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Panipat', addressRegion: 'Haryana', addressCountry: 'IN' },
    knowsAbout: knowsAbout(),
    knowsLanguage: ['en', 'hi'],
    hasOccupation: {
      '@type': 'Occupation',
      name: personalInfo.title,
      occupationalCategory: '15-1254.00 Web Developers',
      skills: knowsAbout().join(', '),
    },
    alumniOf: [
      ...education.map((item) => ({ '@type': 'EducationalOrganization', name: item.institution.split(',')[0] })),
      ...experience.map((item) => ({ '@type': 'Organization', name: item.company })),
    ],
    sameAs: profileUrls(),
  }
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: siteUrl,
    name: `${resumeData.personalInfo.name} · ${resumeData.personalInfo.title}`,
    alternateName: [dossier.callsign, seo.siteName],
    inLanguage: 'en',
    publisher: { '@id': PERSON_ID },
  }
}

/** Page name for breadcrumbs, e.g. "Missions" from "Missions · Deepanshu Saini…". */
const pageName = (route: string) => pages[route]?.title.split(' · ')[0] ?? route

function breadcrumbs(route: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: pageName(route), item: absoluteUrl(route) },
    ],
  }
}

function projects() {
  return {
    '@type': 'ItemList',
    name: 'Selected work',
    itemListElement: missions.map((mission, index) => {
      const url = mission.link ? (mission.link.url.startsWith('/') ? absoluteUrl(mission.link.url) : mission.link.url) : undefined
      // Projects with public code are software; the rest are described as work.
      const language = mission.technologies.find((tech) => tech === 'TypeScript' || tech === 'JavaScript')
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': mission.source ? 'SoftwareSourceCode' : 'CreativeWork',
          name: mission.title,
          description: mission.summary,
          ...(url ? { url } : {}),
          image: absoluteUrl(mission.visual.src),
          keywords: mission.technologies.join(', '),
          author: { '@id': PERSON_ID },
          ...(mission.source
            ? { codeRepository: mission.source.url, ...(language ? { programmingLanguage: language } : {}), runtimePlatform: 'Web browser' }
            : {}),
        },
      }
    }),
  }
}

/** The JSON-LD graph for a route. Home and About are the profile pages. */
export function structuredData(route: string) {
  const isProfile = route === '/' || route === '/about'
  const page = pages[route]
  const webPage = {
    '@type': isProfile ? 'ProfilePage' : 'WebPage',
    '@id': `${absoluteUrl(route)}#page`,
    url: absoluteUrl(route),
    name: page?.title,
    description: page?.description,
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: 'en',
    ...(isProfile ? { mainEntity: { '@id': PERSON_ID } } : { about: { '@id': PERSON_ID } }),
    ...(route !== '/' ? { breadcrumb: breadcrumbs(route) } : {}),
  }
  const graph: object[] = [website(), person(), webPage]
  if (route === '/missions') graph.push(projects())
  return { '@context': 'https://schema.org', '@graph': graph }
}

/** Serialised for a <script type="application/ld+json"> tag (safe against "</script>"). */
export function structuredDataScript(route: string) {
  return JSON.stringify(structuredData(route)).replace(/</g, '\\u003c')
}
