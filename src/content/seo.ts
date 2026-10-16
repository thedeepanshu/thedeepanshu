import seo from './seo.json'

type PageMeta = { title: string; description: string }

const site = seo
const pages = seo.pages as Record<string, PageMeta>

const NOT_FOUND: PageMeta = {
  title: 'Lost in deep space · Deepanshu Saini',
  description: 'This sector is not on any chart. Head back to the ship.',
}

/** Title and description for a route; unknown routes get the 404 copy. */
export function metaForPath(pathname: string): PageMeta & { known: boolean } {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const page = pages[path]
  return page ? { ...page, known: true } : { ...NOT_FOUND, known: false }
}

function setMeta(attribute: 'name' | 'property', key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = value
}

/**
 * Keeps the head in step with the route for crawlers that run JavaScript.
 * Link previews (LinkedIn, WhatsApp…) read the per-page HTML written at build
 * time by scripts/seo-build.mjs from the same seo.json.
 */
export function applyPageMeta(pathname: string) {
  const meta = metaForPath(pathname)
  const url = site.siteUrl + (meta.known ? (pathname === '/' ? '/' : pathname.replace(/\/+$/, '')) : '/')
  document.title = meta.title
  setMeta('name', 'description', meta.description)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
  setMeta('property', 'og:url', url)
  setMeta('name', 'twitter:title', meta.title)
  setMeta('name', 'twitter:description', meta.description)
  setMeta('name', 'robots', meta.known ? 'index, follow' : 'noindex')
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = url
}
