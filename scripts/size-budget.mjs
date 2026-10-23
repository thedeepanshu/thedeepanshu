/**
 * Runs after `vite build` and fails the build if a bundle grows past its gzip
 * budget. Budgets sit ~10% above the current sizes: room for normal work, but a
 * new heavy dependency (or an accidental import of all of drei) gets caught.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const KB = 1024
const budgets = [
  // Raised from 130 KB when the Tempovolt and LUXYVILLA projects (content only, ~1.4 KB) arrived.
  { label: 'main (pages, React)', match: /^index-.*\.js$/, max: 140 * KB },
  { label: '3D world (three.js, scenes)', match: /^World-.*\.js$/, max: 310 * KB },
  // Raised from 20 KB when the Beyond deck (its own page styles, ~3 KB) arrived.
  { label: 'styles', match: /^index-.*\.css$/, max: 24 * KB },
]

const assets = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/assets')
const files = readdirSync(assets)
let failed = false

for (const { label, match, max } of budgets) {
  const file = files.find((name) => match.test(name))
  if (!file) throw new Error(`size-budget: no file for "${label}"`)
  const size = gzipSync(readFileSync(path.join(assets, file))).length
  const over = size > max
  failed ||= over
  console.log(`${over ? 'OVER' : 'ok  '} ${label}: ${(size / KB).toFixed(1)} KB / ${max / KB} KB gzip`)
}

const unbudgeted = files.filter((name) => name.endsWith('.js') && !budgets.some(({ match }) => match.test(name)))
if (unbudgeted.length) console.log(`note: unbudgeted chunks: ${unbudgeted.join(', ')}`)
if (failed) {
  console.error('size-budget: over budget. Trim the bundle or raise the budget on purpose.')
  process.exit(1)
}
