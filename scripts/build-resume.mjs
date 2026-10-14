/**
 * Prints the HTML resumes in resume-source/ to PDFs in public/ using headless Chrome.
 *
 *   npm run resume          -> both
 *   npm run resume:simple   -> resume-source/simple-resume.html -> public/Deepanshu_Saini_V1.pdf
 *   npm run resume:fancy    -> resume-source/fancy-resume.html  -> public/Deepanshu_Saini_V2.pdf
 *
 * Set CHROME_PATH if Chrome/Edge lives somewhere unusual.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const RESUMES = {
  simple: { source: 'resume-source/simple-resume.html', output: 'public/Deepanshu_Saini_V1.pdf' },
  fancy: { source: 'resume-source/fancy-resume.html', output: 'public/Deepanshu_Saini_V2.pdf' },
}

const BROWSERS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]

const browser = BROWSERS.find((p) => p && existsSync(p))
if (!browser) {
  console.error('Chrome/Edge not found. Set CHROME_PATH to the browser executable.')
  process.exit(1)
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(RESUMES)

for (const name of names) {
  const resume = RESUMES[name]
  if (!resume) {
    console.error(`Unknown resume "${name}". Use: ${Object.keys(RESUMES).join(', ')}`)
    process.exit(1)
  }

  const output = path.join(root, resume.output)
  execFileSync(
    browser,
    [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      '--virtual-time-budget=15000',
      '--run-all-compositor-stages-before-draw',
      `--print-to-pdf=${output}`,
      pathToFileURL(path.join(root, resume.source)).href,
    ],
    { stdio: 'ignore' },
  )
  console.log(`✓ ${name}: ${resume.source} -> ${resume.output}`)
}
