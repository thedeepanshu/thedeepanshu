# Production hardening: final report

_16 Oct 2026 · branch `feat/vessel` · baseline `094b5dd` (before any hardening) → final build of this branch_

All phases in [AUDIT.md](AUDIT.md) are done. Everything below was measured on fresh production builds.

## Summary

| Area                                      | Before                                    | After                                                            |
| ----------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| axe (WCAG 2.2 AA + best practice)         | 2 moderate rules                          | **0 violations**, every route, desktop and phone, checked in CI  |
| Lighthouse Accessibility / BP / SEO       | 100 / 100 / 100 (BP 96 on Signal mobile)  | **100 / 100 / 100** on all 16 route × device runs                |
| Lighthouse Performance (mobile, median)   | see below                                 | **3–5 points lower** in the lab; explained below                 |
| HTML content for crawlers and no-JS users | 0 words (empty `<div id="root">`)         | **171–802 words** per route, plus JSON-LD                        |
| Structured data                           | none                                      | Person, WebSite, ProfilePage, BreadcrumbList, projects: 0 errors |
| Unknown URLs                              | 200 with the app shell (soft 404)         | **404** status, `noindex`                                        |
| Security headers                          | Vercel defaults                           | strict CSP (0 violations), HSTS and 5 more                       |
| `npm audit`                               | 0 prod vulnerabilities; 3 unused packages | **0 vulnerabilities** (prod and dev); unused packages removed    |
| Tests                                     | none                                      | **36 unit**, **53 end-to-end** (incl. axe per route), CI         |
| TypeScript / lint                         | not strict / no a11y rules                | `strict`, 0 errors / jsx-a11y, 0 warnings                        |
| Docs                                      | Vite template README                      | README, licence, contributing, security, changelog, 5 guides     |

## Lighthouse, before and after

Lighthouse 12, mobile (simulated mid-range phone, slow 4G) and desktop presets. Both builds were served the same way (Vercel's rules and gzip, simulated
locally) and measured back-to-back, so machine load is shared. Scores are Performance / Accessibility / Best Practices / SEO, one run each:

| Route       | Mobile before  | Mobile after   | Desktop before | Desktop after  |
| ----------- | -------------- | -------------- | -------------- | -------------- |
| `/`         | 64/100/100/100 | 63/100/100/100 | 91/100/100/100 | 90/100/100/100 |
| `/about`    | 61/100/100/100 | 58/100/100/100 | 89/100/100/100 | 84/100/100/100 |
| `/missions` | 61/100/100/100 | 54/100/100/100 | 89/100/100/100 | 87/100/100/100 |
| `/arsenal`  | 57/100/100/100 | 55/100/100/100 | 82/100/100/100 | 81/100/100/100 |
| `/journey`  | 56/100/100/100 | 52/100/100/100 | 81/100/100/100 | 81/100/100/100 |
| `/lab`      | 61/100/100/100 | 56/100/100/100 | 57/100/100/100 | 65/100/100/100 |
| `/beyond`   | 60/100/100/100 | 54/100/100/100 | 86/100/100/100 | 83/100/100/100 |
| `/signal`   | 60/100/96/100  | 57/100/100/100 | 87/100/100/100 | 82/100/100/100 |

CLS is 0 everywhere. A single run swings by up to ±10 points on this machine, so I repeated two pages three times after the last fix (median):

| Page (mobile) | Perf before → after | Blocking time | LCP         | FCP         |
| ------------- | ------------------- | ------------- | ----------- | ----------- |
| `/about`      | 60 → 59             | 914 → 1125 ms | 4.4 → 4.5 s | 2.6 → 2.3 s |
| `/beyond`     | 59 → 54             | 866 → 1111 ms | 4.8 → 5.2 s | 2.6 → 2.5 s |

### What these numbers mean

- **First paint got faster; the lab score didn't.** Pages now arrive as real HTML with a static first frame, so something appears sooner (FCP −0.1 to −0.3 s,
  up to −0.9 s on Lab). But Lighthouse's LCP is the welcome screen's live counter, which only exists once JavaScript runs, so it doesn't move.
- **Blocking time is about 200 ms higher.** The long tasks are the 3D world starting up (shader compiles). This machine has no usable GPU headless, so
  WebGL runs in software and those tasks swing 500–1000 ms between identical runs. I found and removed one real cost: the browser was laying out the
  hidden prerendered page and React then restyled it (fixed with `content-visibility: hidden`, which cut the main bundle's extra work from ~420 ms to
  ~0–170 ms). Analytics measured as not a factor. The rest I couldn't separate from software-WebGL noise.
- **Why these scores are lower than the audit's** (77 mobile / 99 desktop on `/`): different machine load on a different day. Only columns measured side by
  side are comparable.
- **The real measure is field data.** Speed Insights is now installed. Turn it on (see [MANUAL_STEPS.md](MANUAL_STEPS.md)) and read real visitors' Core
  Web Vitals after a week. Real phones compile shaders on the GPU, which is where most of this lab time goes.

### Options to raise the mobile score (need your call: they change the intro)

1. **Hydrate the welcome screen** instead of replacing the prerendered frame, so the first counter visitors see is the one Lighthouse measures. Expected:
   simulated mobile LCP down 1–2 s. Moderate refactor of `BootSequence`; the intro looks the same.
2. **Start the 3D world after the welcome screen** (or on first interaction) on phones. That takes the shader work out of the load window; expected mobile
   score in the 80s–90s. The intro's background would be plain until the world fades in.

## Bundles (gzip)

| Bundle                | Before   | After    | Budget |
| --------------------- | -------- | -------- | ------ |
| Main (pages, React)   | 125.5 KB | 127.7 KB | 130 KB |
| 3D world              | 274.5 KB | 274.6 KB | 310 KB |
| CSS                   | 22.3 KB  | 21.5 KB  | 24 KB  |
| `dist/` total on disk | 3.84 MB  | 3.71 MB  | —      |

Main grew 2.2 KB for Vercel Analytics, Speed Insights and the error boundaries; removing drei and dead code paid for the rest. Images: icons 217 → 62 KB,
portrait 74 → 14 KB (WebP), pilot artwork 193 → 146 KB, and the pilot images (~200 KB) now load only on the Bridge.

## Accessibility

axe-core (WCAG 2.0/2.1/2.2 A and AA, plus best practice): **0 violations** on every route at 1440×900 and on a Pixel 7, run in CI on every push. Details and
the list of fixes: [ACCESSIBILITY.md](ACCESSIBILITY.md).

Found during this final pass and fixed:

- Poster flip buttons on Beyond and the "Jump to" button had accessible names that didn't start with their visible text (label in name, WCAG 2.5.3).
- Signal's small monospace labels (the "Opens your email app…" note, profile tiles, terminal title) were 11.2 px, and Lighthouse flagged the page for
  legibility on phones. They're now 12 px; the layout is unchanged.

## SEO

- Every route ships its full text, title, description, canonical, Open Graph and Twitter tags in the HTML.
- JSON-LD validated on validator.schema.org: 0 errors, 0 warnings on all 8 pages.
- `sitemap.xml`, `robots.txt`, real 404s, descriptive résumé file names (old names return 308).
- Copy proposals that would help further, not applied: [SEO.md](SEO.md#copy-proposals-not-applied).

## Security

- CSP with no inline scripts and no third-party script hosts; only YouTube (no-cookie) and Spotify may be framed. 0 violations across all routes, embeds and
  analytics.
- HSTS (2 years), `nosniff`, Referrer-Policy, Permissions-Policy, `X-Frame-Options: DENY`, COOP.
- `/.well-known/security.txt` and [SECURITY.md](../SECURITY.md).
- `npm audit`: 0 vulnerabilities. Dependabot is configured.

## Final checks

| Check                                                  | Result                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| `npm run check` (typecheck, lint, format, unit)        | pass: 36 tests                                             |
| `npm run build` (prerender, SEO files, budget)         | pass                                                       |
| `npm run test:e2e` (Playwright + axe)                  | pass: 53 tests (1 skipped: keyboard shortcut on phone)     |
| JavaScript off                                         | full page visible and readable                             |
| Console errors                                         | none on any route (apart from the R3F warning below)       |
| Links in built pages                                   | 39 checked, all resolve (LinkedIn answers bots with `999`) |
| Résumés, redirects, sitemap, robots, security.txt, 404 | all return the expected status                             |

**Known, upstream:** React Three Fiber creates a `THREE.Clock` internally, which three 0.186 marks as deprecated in a console warning. It goes away when R3F
updates; Dependabot will offer that.

## What needs you

See [MANUAL_STEPS.md](MANUAL_STEPS.md): enable Analytics and Speed Insights on Vercel, verify the site in Search Console and Bing and submit the sitemap,
add the site link to your profiles, protect `main` with the CI checks, and the steps for when the custom domain arrives.
