/**
 * Runs after `vite build`. Link-preview crawlers (LinkedIn, WhatsApp, X, Slack)
 * don't run JavaScript, so each route gets its own dist/<route>/index.html with
 * that page's title, description, canonical URL and Open Graph tags baked in.
 * Also writes sitemap.xml and robots.txt. Source of truth: src/content/seo.json.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const seo = JSON.parse(readFileSync(path.join(root, 'src/content/seo.json'), 'utf8'))
const template = readFileSync(path.join(dist, 'index.html'), 'utf8')

const escape = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Replace a tag's content by matching its name/property attribute. */
function setTag(html, attribute, key, value) {
  const pattern = new RegExp(`(<meta ${attribute}="${key.replace(/[.:]/g, '\\$&')}" content=")[^"]*(")`)
  if (!pattern.test(html)) throw new Error(`index.html is missing <meta ${attribute}="${key}">`)
  return html.replace(pattern, `$1${escape(value)}$2`)
}

function pageHtml(route, { title, description }) {
  const url = seo.siteUrl + route
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
  html = setTag(html, 'name', 'description', description)
  html = setTag(html, 'property', 'og:title', title)
  html = setTag(html, 'property', 'og:description', description)
  html = setTag(html, 'property', 'og:url', url)
  html = setTag(html, 'name', 'twitter:title', title)
  html = setTag(html, 'name', 'twitter:description', description)
  return html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
}

const routes = Object.entries(seo.pages)
for (const [route, meta] of routes) {
  const file = route === '/' ? path.join(dist, 'index.html') : path.join(dist, route.slice(1), 'index.html')
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, pageHtml(route, meta))
}

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(([route]) => `  <url><loc>${seo.siteUrl}${route}</loc><lastmod>${today}</lastmod><priority>${route === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`
writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)
writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${seo.siteUrl}/sitemap.xml\n`)

console.log(`seo: ${routes.length} pages, sitemap.xml and robots.txt written`)
