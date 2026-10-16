/**
 * Runs after `vite build`. Link-preview crawlers (LinkedIn, WhatsApp, X, Slack)
 * don't run JavaScript, so each route gets its own dist/<route>/index.html with
 * that page's title, description, canonical URL and Open Graph tags baked in.
 * Also writes sitemap.xml and robots.txt. Source of truth: src/content/seo.json.
 *
 * The body gets the page's real content too, prerendered by the SSR build of
 * src/entry-prerender.tsx (dist-prerender/), under a black cover the app
 * removes before its first paint. dist/404.html is the not-found page, which
 * Vercel serves with a real 404 status.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { loadEnv } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const seo = JSON.parse(readFileSync(path.join(root, 'src/content/seo.json'), 'utf8'))
// Same source as the app: .env (+ .env.local, or the Vercel environment).
const siteUrl = (process.env.VITE_SITE_URL || loadEnv('production', root, 'VITE_').VITE_SITE_URL || '').replace(/\/+$/, '')
if (!siteUrl) throw new Error('seo-build: VITE_SITE_URL is not set (see .env.example)')
const template = readFileSync(path.join(dist, 'index.html'), 'utf8')
const prerenderDir = path.join(root, 'dist-prerender')
const { render } = await import(pathToFileURL(path.join(prerenderDir, 'entry-prerender.js')).href)

const escape = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Replace a tag's content by matching its name/property attribute. */
function setTag(html, attribute, key, value) {
  const pattern = new RegExp(`(<meta ${attribute}="${key.replace(/[.:]/g, '\\$&')}" content=")[^"]*(")`)
  if (!pattern.test(html)) throw new Error(`index.html is missing <meta ${attribute}="${key}">`)
  return html.replace(pattern, `$1${escape(value)}$2`)
}

function pageHtml(route, { title, description }) {
  const url = siteUrl + route
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
  html = setTag(html, 'name', 'description', description)
  html = setTag(html, 'property', 'og:title', title)
  html = setTag(html, 'property', 'og:description', description)
  html = setTag(html, 'property', 'og:url', url)
  html = setTag(html, 'name', 'twitter:title', title)
  html = setTag(html, 'name', 'twitter:description', description)
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
  return withBody(html, route)
}

// The cover is the welcome screen's first frame in static HTML: black, with the
// boot counter at 000%. It paints as soon as the HTML and CSS arrive (the
// page's LCP), instead of waiting for the JavaScript to draw it.
const COVER = `<div class="prerender-cover boot boot--boot" aria-hidden="true"><div class="boot-progress"><span>Systems</span><strong><span>000</span>%</strong><span class="boot-progress-track"><span></span></span></div></div>`

// Preload the latin display font so the cover's counter paints in the final
// font (a later, wider repaint in the real font would count as a new LCP).
const latinFont = readdirSync(path.join(dist, 'assets')).find((name) => /^space-grotesk-latin-wght-normal-.*\.woff2$/.test(name))
if (!latinFont) throw new Error('seo-build: latin Space Grotesk woff2 not found in dist/assets')
const HEAD_EXTRAS = [
  `<link rel="preload" href="/assets/${latinFont}" as="font" type="font/woff2" crossorigin />`,
  '<noscript><link rel="stylesheet" href="/noscript.css" /></noscript>',
].join('\n    ')

/** Images in the prerendered copy stay crawlable but never compete with the app's own loading. */
const quietImages = (markup) => markup.replace(/<img /g, '<img fetchpriority="low" ').replace(/<img (?![^>]*\bloading=)/g, '<img loading="lazy" ')

/** Put the prerendered page after the app root, under the cover. */
function withBody(html, route) {
  const root = '<div id="root"></div>'
  if (!html.includes(root)) throw new Error('index.html is missing <div id="root"></div>')
  const body = `${root}
    <div id="prerender">${COVER}${quietImages(render(route))}</div>`
  return html.replace(root, body).replace('</head>', `    ${HEAD_EXTRAS}\n  </head>`)
}

const routes = Object.entries(seo.pages)
for (const [route, meta] of routes) {
  const file = route === '/' ? path.join(dist, 'index.html') : path.join(dist, route.slice(1), 'index.html')
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, pageHtml(route, meta))
}

// Not-found page: the 404 copy, kept out of search results.
let notFound = template.replace(/<title>[^<]*<\/title>/, '<title>Lost in deep space · Deepanshu Saini</title>')
notFound = setTag(notFound, 'name', 'description', 'This sector is not on any chart. Head back to the ship.')
notFound = setTag(notFound, 'name', 'robots', 'noindex, follow')
writeFileSync(path.join(dist, '404.html'), withBody(notFound, '/404'))
rmSync(prerenderDir, { recursive: true, force: true })

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(([route]) => `  <url><loc>${siteUrl}${route}</loc><lastmod>${today}</lastmod><priority>${route === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`
writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)
writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)

// security.txt (RFC 9116): who to contact about a vulnerability. Expires a year
// after each build, so it never goes stale while the site is maintained.
const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
mkdirSync(path.join(dist, '.well-known'), { recursive: true })
writeFileSync(
  path.join(dist, '.well-known', 'security.txt'),
  [
    'Contact: mailto:deepanshusaini971@gmail.com',
    `Expires: ${expires}`,
    'Preferred-Languages: en',
    `Canonical: ${siteUrl}/.well-known/security.txt`,
    'Policy: https://github.com/thedeepanshu/thedeepanshu/blob/main/SECURITY.md',
    '',
  ].join('\n'),
)

console.log(`seo: ${routes.length} pages prerendered + 404.html, sitemap.xml, robots.txt and security.txt written`)
