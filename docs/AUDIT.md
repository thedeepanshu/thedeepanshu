# Production Hardening Audit — thedeepanshu portfolio

_Audit date: 16 Oct 2026 · Branch: `feat/vessel` · Status: **awaiting approval, no code changed yet**_

## Progress

- [x] Audit and plan approved (decisions recorded in §4)
- [x] 1. Dependencies and dead code: removed `framer-motion`, `gsap`, `lenis`; declared `postprocessing`; deleted template assets and ~80 dead CSS selectors; `strict` TypeScript; `npm audit` fix
- [x] 2. Tooling: ESLint a11y (`jsx-a11y-x`, ESLint-10-ready fork) + import sorting, Prettier (TS/JS/JSON/MD, width 160), `@/` alias, Vitest (10 tests), Husky + lint-staged, `.gitattributes` (LF)
- [x] 3. Build-time prerender + static first frame: every route ships 171–802 words of real HTML (was 0); real `404.html`; mobile LCP ~4.0 s → ~2.0 s with applied throttling (Lighthouse's simulated mode still models ~4 s, see REPORT)
- [ ] 4. Security headers, CSP, `security.txt`, real 404 status, `VITE_SITE_URL`
- [ ] 5. SEO: JSON-LD, titles, manifest, sitemap, résumé renames, LinkedIn URL, verification tags
- [ ] 6. Performance: deferred world on phones, drop drei, images, critical CSS, analytics
- [ ] 7. Accessibility fixes + `docs/ACCESSIBILITY.md`
- [ ] 8. Refactor: shared components, `src/config/site.ts`, error boundaries
- [ ] 9. Reliability: CI, Playwright + axe, Dependabot, `.nvmrc`
- [ ] 10. Documentation
- [ ] 11. Final verification → `docs/REPORT.md`

This is the "before" picture. Every finding has a severity, where it lives, and the proposed fix. Severity means: **Critical** = hurts search visibility, security or most visitors now; **High** = clear, measurable gain; **Medium** = worth doing in this pass; **Low** = polish.

---

## 0. Stack (detected)

| Area              | What's there                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework         | **Vite 8.3 + React 19.2** single-page app, **React Router 7** (`BrowserRouter`), _not_ Next.js                                                               |
| Language          | TypeScript 6.0 (`noUnusedLocals/Parameters` on, **`strict` off**)                                                                                            |
| 3D / audio        | three 0.186, @react-three/fiber 9, drei 10 (one import), @react-three/postprocessing 3, custom GLSL, Web Audio (no files)                                    |
| State             | zustand 5                                                                                                                                                    |
| Styling           | Plain CSS files (`App.css`, `vessel.css`, per-component CSS), self-hosted Space Grotesk via `@fontsource-variable`                                           |
| Icons             | lucide-react (per-icon imports ✓)                                                                                                                            |
| Lint              | ESLint 10 flat config: `@eslint/js`, `typescript-eslint`, `react-hooks` (React Compiler rules), `react-refresh`. No a11y or import-order rules. No Prettier. |
| Tests             | **None**                                                                                                                                                     |
| Build             | `tsc -b && vite build && seo-build.mjs && size-budget.mjs`                                                                                                   |
| SEO build         | `scripts/seo-build.mjs` writes `dist/<route>/index.html` (meta only), `sitemap.xml`, `robots.txt` from `src/content/seo.json`                                |
| Hosting           | Vercel (`vercel.json`: SPA catch-all rewrite, immutable `/assets` cache)                                                                                     |
| Package manager   | npm 10.9 (lockfile ✓). Local Node 23.6 (odd/non-LTS). No `.nvmrc` / `engines`.                                                                               |
| CI / repo hygiene | No `.github/`, no `docs/`, no Husky, no Dependabot, README is the Vite template                                                                              |

### Next.js items in the brief → Vite equivalents (no framework swap)

Rule 4 forbids swapping a major library without asking, and a Next.js migration would be a rewrite of routing, the persistent 3D canvas and the build. I'll implement the **intent** of each Next-specific item with Vite-native tools:

| Brief asks for                | Vite equivalent I propose                                                                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`        | `VITE_SITE_URL` (one env var; read by the app, `index.html` via `%VITE_SITE_URL%`, and the build scripts)                                                |
| Metadata API, title template  | Keep `seo.json` as the single source; generate titles as `%s · Deepanshu Saini` from one template                                                        |
| Server components / SSG       | **Build-time prerender**: render each route's page content to real HTML (React's own `react-dom/server`, no new dependency), then hydrate in the browser |
| `next/image`                  | Explicit `width`/`height`, `loading`/`decoding`, `fetchpriority` on the one LCP image, WebP/AVIF sources                                                 |
| `next/font`                   | Already self-hosted (fontsource). Add `font-display: swap` check + preload of the one latin woff2                                                        |
| `opengraph-image.tsx`         | Per-route OG images rendered **at build** (or keep the single branded card — your call, see Q7)                                                          |
| `error.tsx` / `not-found.tsx` | React error boundary + a real **404 status** page on Vercel                                                                                              |
| `@next/bundle-analyzer`       | `rollup-plugin-visualizer` one-off via `npx` (not a dependency), plus the existing size budget                                                           |

---

## 1. Baseline metrics

**Lighthouse 12** (production build, `vite preview`; mobile = simulated mid-range phone on slow 4G):

| Route            | Perf   | A11y | Best Pr. | SEO | LCP   | TBT    | CLS | FCP   |
| ---------------- | ------ | ---- | -------- | --- | ----- | ------ | --- | ----- |
| `/` mobile       | **77** | 100  | 100      | 100 | 4.0 s | 300 ms | 0   | 2.6 s |
| `/` desktop      | 99     | 100  | 100      | 100 | 0.8 s | 60 ms  | 0   | 0.5 s |
| `/about` mobile  | **60** | 100  | 100      | 100 | 4.4 s | 890 ms | 0   | 2.6 s |
| `/about` desktop | 92     | 100  | 100      | 100 | 1.0 s | 210 ms | 0   | 0.5 s |

- **Mobile LCP element:** the welcome screen's progress counter. LCP phases: TTFB 450 ms, **render delay 3.6–4.0 s**. Nothing can paint until the main JS bundle downloads and runs, because the HTML body is empty.
- **Main-thread JS (mobile):** `index` 620–820 ms, `World` (three.js) 0.9–1.8 s.
- **Lighthouse opportunities:** render-blocking CSS (~450 ms), ~179 KiB unused JS, ~18 KiB unused CSS.

**Bundles (gzip, from `size-budget`):** main 125.5 KB · 3D world 274.5 KB · CSS 22.3 KB. Biggest parts of the 3D bundle: three ~570 KB min, R3F (+ bundled reconciler) ~340 KB min, postprocessing ~59 KB min; our own set pieces ~35 KB min.

**axe-core 4.10** (WCAG 2.0/2.1/2.2 A+AA + best-practice), 9 routes × desktop & mobile: **0 critical, 0 serious**, 2 moderate rules (§4).

**Other:** `npm audit` (prod) **0 vulnerabilities** · `tsc --strict` **0 errors** · knip: 3 unused deps, 3 unused exports, 15 unused exported types · 0 `any`, 0 `@ts-ignore`, 0 `console.*`.

> **Honest expectation on "100 Performance on mobile":** the site deliberately runs a full WebGL world (~275 KB gzip of three.js) on every page. That evaluation cost is real CPU time on a throttled mid-range phone. With the fixes below I expect **mobile 90–95+ and desktop 100** on most routes. Hitting 100 on mobile would mean not loading the 3D world until after interaction, which changes the welcome experience. I'll measure and show you the trade-off rather than make it silently.

---

## 2. Findings by area

### Phase 1 — Code quality, reusability & best practices

| Sev    | Finding                                                                                                                                                | Where                                                          | Proposed fix                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| High   | `strict` not enabled (but it compiles with **0 errors** under strict)                                                                                  | `tsconfig.app.json`                                            | Turn on `strict: true` (+ `noUncheckedIndexedAccess` only if cheap)                                                                |
| High   | 3 unused runtime dependencies: `framer-motion`, `gsap`, `lenis` (0 imports)                                                                            | `package.json:20-22`                                           | Remove. Shrinks install, lockfile and audit surface                                                                                |
| High   | `postprocessing` is imported directly but not declared (works only as a transitive dep)                                                                | `src/world/Effects.tsx:4`                                      | Add it to `dependencies` at the version R3F/postprocessing already pulls in (no new code downloaded)                               |
| Medium | Dead files: Vite template leftovers                                                                                                                    | `src/assets/{hero.png,react.svg,vite.svg}`, `public/icons.svg` | Delete                                                                                                                             |
| Medium | ~26 dead CSS classes from earlier versions (memory cards, mission archive, skill grid, lab links, etc.)                                                | `src/App.css` (+1 in `vessel.css`)                             | Delete the dead rules. (Ties into your deferred "CSS split" note; I won't do the full split now)                                   |
| Medium | Unused exports (`World` default is used via lazy import, so that one's a false alarm; `seo.ts` `site`, `metaForPath`) and 15 exported-but-unused types | knip report                                                    | Un-export what's internal; keep public content types exported                                                                      |
| Medium | ESLint lacks a11y and import-order rules; no Prettier; no `lint:fix`/`format`/`typecheck` scripts                                                      | `eslint.config.js`, `package.json`                             | Add `eslint-plugin-jsx-a11y` + import ordering; scripts. **Prettier: see Q10** (it would reformat almost every file)               |
| Medium | No error boundary. A WebGL/context-loss or render error blanks the page                                                                                | `src/App.tsx`                                                  | Error boundary around pages + around the World (falls back to no-3D, site still works)                                             |
| Medium | Repeated button styles (`primary-action`, `recommend-send`, `spotify-toggle`, `watch-trailer`) and section-head markup                                 | several pages                                                  | Extract `Button`, `SectionHead` and similar with typed props, pixel-identical                                                      |
| Low    | Content is split across `portfolio.ts`, `beyond.ts`, `resumeData.ts`, `seo.json`; site identity (URL, socials) repeated                                | `src/content/*`                                                | Add `src/config/site.ts` as the single identity source (name, handle, URL from env, socials, email). Content files keep their data |
| Low    | No path alias                                                                                                                                          | imports                                                        | Add `@/` alias (codemod, no behaviour change)                                                                                      |
| Low    | No tests                                                                                                                                               | —                                                              | Vitest + Testing Library for key logic and components (**Q9**)                                                                     |
| Low    | No pre-commit hook                                                                                                                                     | —                                                              | Husky + lint-staged (**Q9**)                                                                                                       |

### Phase 2 — Performance & Core Web Vitals

| Sev          | Finding                                                                                                        | Where                                      | Proposed fix                                                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | Empty HTML body: nothing paints until JS runs → mobile LCP 4.0–4.4 s, FCP 2.6 s                                | `index.html`, all `dist/*/index.html`      | **Prerender** each route's page at build (also fixes SEO §7a) and ship the welcome screen's first frame as static HTML/CSS so LCP happens at HTML parse                          |
| High         | Render-blocking CSS (~450 ms on mobile)                                                                        | single CSS bundle                          | Inline the critical CSS for the first frame (welcome screen + header), load the rest without blocking                                                                            |
| High         | 3D bundle evaluation blocks the main thread 0.9–1.8 s on mobile (TBT 300–890 ms)                               | `World` chunk                              | Start loading/initialising the world only after first paint and when the main thread is idle (`requestIdleCallback`); compile shaders progressively; keep the low tier on phones |
| Medium       | `@react-three/drei` used for **one** helper (`PerformanceMonitor`)                                             | `World.tsx:3`                              | Replace with a ~30-line FPS monitor and drop drei entirely (dependency removal)                                                                                                  |
| Medium       | Images: `pilot.webp` 193 KB (LCP-adjacent on home), `deepanshu-saini.jpeg` 74 KB (JPEG), `icon-512.png` 160 KB | `public/images`, `public`                  | Re-encode (WebP/AVIF at the size actually rendered), compress icons                                                                                                              |
| Medium       | Two `<img>` without intrinsic size                                                                             | `RecordPlayer.tsx:44`, `StoryBoard.tsx:33` | Add `width`/`height` (no CLS today because containers are fixed, but harden)                                                                                                     |
| Low          | ~18 KiB unused CSS                                                                                             | `App.css`                                  | Covered by dead-CSS removal                                                                                                                                                      |
| Low          | No real-user Web Vitals reporting                                                                              | —                                          | `@vercel/speed-insights` / `@vercel/analytics` (**Q8**)                                                                                                                          |

### Phase 3 — Smoothness & animation

| Sev    | Finding                                                                                                    | Where                   | Proposed fix                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| Medium | One `scroll` listener feeds the 3D scroll value (it's passive ✓ and only stores numbers ✓)                 | `CameraRig.tsx:100-109` | Keep (it's the right tool for a continuous value). Verify no layout reads inside                  |
| Medium | A few CSS transitions animate non-composited properties (`border-color`, `background`, `filter` on hover)  | various CSS             | Fine (paint-only, small elements); `filter: brightness` on buttons → replace with opacity overlay |
| Low    | Reduced motion already respected across boot, HUD, reveals, cursor, Beyond, 3D (verify each route)         | many                    | Audit pass + a global `prefers-reduced-motion` safety net                                         |
| Low    | Anchor links: `scroll-padding-top` set globally ✓, `scroll-behavior: smooth` disabled for reduced motion ✓ | `index.css:22`          | No change needed                                                                                  |

### Phase 4 — Accessibility (WCAG 2.2 AA)

| Sev    | Finding                                                                                                                         | Where                            | Proposed fix                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------- |
| Medium | `heading-order`: card `h3`s follow the page `h1` with no `h2` (section labels are `<p class="section-kicker">`)                 | `/about`, `/journey`, `/lab`     | Make those section labels real `h2`s with the same styling (no visual change) |
| Medium | `landmark-complementary-is-top-level`: `<aside>` nested in `<main>`                                                             | About ID card, Signal side panel | Use `<section aria-label>` / `<div>` instead                                  |
| Medium | 3D canvas and some decorative HUD are `aria-hidden` ✓; need to verify every icon-only control has a name                        | header, dock, palette, Beyond    | Manual keyboard + screen-reader pass; fix any gaps                            |
| Medium | External links: some don't announce "opens in new tab"                                                                          | socials, Beyond, Lab             | Visually-hidden "(opens in a new tab)"                                        |
| Low    | Contrast: axe found **no** contrast failures, but it can't measure text over WebGL/gradients                                    | hero/kickers over 3D             | Manual spot-check of muted text over bright 3D areas                          |
| Low    | Target size ≥ 24×24                                                                                                             | chips, footer links              | Measure, fix any under 24 px                                                  |
| Info   | Skip link ✓, `lang="en"` ✓, unique titles per route ✓, modals (palette, console, sound menu, trailer `<dialog>`) manage focus ✓ | —                                | Keep; covered by regression checks                                            |

### Phase 5 — Responsiveness & cross-browser

| Sev    | Finding                                                                                       | Where            | Proposed fix                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| Medium | No `browserslist` / CSS target; vendor prefixes are hand-written                              | `vite.config.ts` | Define targets (last 2 versions + iOS ≥ 15 + Samsung Internet), let Lightning CSS prefix                          |
| Medium | Site is **dark-only**: there's no light theme to "respect"                                    | —                | Declare `color-scheme: dark` (correct form controls/scrollbars, no flash). A light theme is a new feature, **Q5** |
| Low    | Verified recently at 320–1440; need 768, 1920+, iOS safe-area (bottom dock vs home indicator) | dock, footer     | Add `env(safe-area-inset-*)` padding; full width sweep                                                            |
| Low    | Print stylesheet                                                                              | —                | Nice-to-have: a clean print of About + Journey                                                                    |

### Phase 6 — Security

| Sev          | Finding                                                                                                              | Where         | Proposed fix                                                                                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | **No security headers at all** (no CSP, HSTS, nosniff, referrer, permissions, frame protection, COOP)                | `vercel.json` | Add them. CSP allow-list is small: self, YouTube-nocookie and Spotify frames, `mailto:`; hash for JSON-LD; `style-src-attr 'unsafe-inline'` only (React inline styles), no inline scripts |
| Low          | All `target="_blank"` links have `rel="noreferrer"` ✓ (implies noopener); `window.open` uses `noopener,noreferrer` ✓ | —             | Standardise on `rel="noopener noreferrer"`                                                                                                                                                |
| Info         | `npm audit` 0 vulns; no secrets in code; contact uses `mailto:` (no backend, no attack surface)                      | —             | Keep. Server form is **Q6**                                                                                                                                                               |
| Low          | No `security.txt`, no Dependabot                                                                                     | —             | Add both                                                                                                                                                                                  |

### Phase 7 — SEO

| Sev          | Finding                                                                                                                                  | Where                                     | Proposed fix                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | Route HTML has correct meta but **no body content** (empty `#root`). Non-JS crawlers (LinkedIn, WhatsApp, Bing's first pass) see no text | `dist/*/index.html`                       | Build-time prerender (see Phase 2)                                                                                                              |
| **Critical** | **No structured data**                                                                                                                   | —                                         | `JsonLd` helper: `Person` (+ `sameAs`), `WebSite`, `ProfilePage`, `BreadcrumbList`, `CreativeWork`/`SoftwareSourceCode` per mission, `ItemList` |
| High         | **Soft 404s**: the catch-all rewrite returns **200** for every unknown URL (noindex is set by JS only)                                   | `vercel.json` rewrites                    | Drop the catch-all (every real route already has its own HTML), add `404.html` so Vercel returns a real **404**                                 |
| High         | Site URL hard-coded in 3 places                                                                                                          | `index.html`, `seo.json`, `resumeData.ts` | `VITE_SITE_URL` env var everywhere; default to the vercel.app URL                                                                               |
| Medium       | Titles: `Origin · Deepanshu Saini`. No role keyword on inner pages                                                                       | `seo.json`                                | Template `%s · Deepanshu Saini, Frontend Developer` or similar (**copy, Q3**)                                                                   |
| Medium       | Manifest lacks `id`, `start_url`, `scope`, `description`, maskable icon                                                                  | `public/site.webmanifest`                 | Complete it                                                                                                                                     |
| Medium       | Sitemap has no `/` → page images; `lastmod` = build date for all                                                                         | `seo-build.mjs`                           | Per-route `lastmod` from git; keep priorities                                                                                                   |
| Medium       | Résumé filenames not descriptive (`Deepanshu_Saini_V1.pdf`, `_V2`)                                                                       | `public/`                                 | Rename to `Deepanshu-Saini-Frontend-Developer-Resume.pdf` / `…-Resume-Visual.pdf` + 301s from old names (**Q2**)                                |
| Medium       | Experience dates not machine-readable                                                                                                    | Journey cards                             | `<time datetime>` + structured `OrganizationRole` data                                                                                          |
| Low          | One OG image for all routes                                                                                                              | `og-image.jpg`                            | Per-route OG images (**Q7**)                                                                                                                    |
| Low          | Search Console / Bing verification                                                                                                       | —                                         | Meta tags via `VITE_GOOGLE_SITE_VERIFICATION` / `VITE_BING_SITE_VERIFICATION`                                                                   |

### Phase 8 — Reliability

| Sev    | Finding                                                                                          | Where  | Proposed fix                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------ |
| Medium | No CI                                                                                            | —      | GitHub Actions: install → lint → typecheck → test → build (+ size budget), optional Lighthouse CI ≥ 95 |
| Medium | Node not pinned; local is 23 (non-LTS)                                                           | —      | `.nvmrc` = 22 (LTS) + `engines`                                                                        |
| Info   | YouTube and Spotify already load only on click (facade) ✓; no external data fetches at runtime ✓ | Beyond | Keep                                                                                                   |
| Medium | 404 page exists (deck "Lost in deep space") but returns 200                                      | —      | Fixed by the §7 soft-404 change                                                                        |

### Phase 9 — Documentation

| Sev    | Finding                                                                                                   | Proposed fix                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| High   | README is the **Vite template**, the first thing a recruiter sees on GitHub                               | Professional README (screenshot, live link, stack, features, scores, structure, scripts, env, deploy)    |
| Medium | No CONTRIBUTING / CHANGELOG / LICENSE / SECURITY / CODE_OF_CONDUCT / `.env.example` / `.github` templates | Add (LICENSE: **Q11**)                                                                                   |
| Medium | No architecture or SEO docs                                                                               | `docs/ARCHITECTURE.md`, `docs/SEO.md`, `docs/ACCESSIBILITY.md`, `docs/MANUAL_STEPS.md`, `docs/REPORT.md` |

---

## 3. What I already have from you (will use as given)

- Name **Deepanshu Saini**, handle **thedeepanshu**, email **deepanshusaini971@gmail.com**, live URL **https://thedeepanshu.vercel.app** (custom domain later → one env var).
- Location **Panipat, Haryana, India** (your prompt). Note: it's commented out in `resumeData.ts`. I'll use it only in structured data unless you want it shown.
- Experience: **ANRX Solutions, Frontend Developer, Oct 2021 – Aug 2026** (ended, so "past role", not `worksFor`).
- Education: B.Tech CSE (ongoing), PKG Group of Institutions, Panipat · Diploma CSE 2019, Government Polytechnic, Sonepat · CBSE 10th 2016, I.B.(L) Public School, Panipat.
- Skills for `knowsAbout`: from the Arsenal page (React, Next.js, TypeScript, JavaScript, Redux, Tailwind CSS, Three.js/WebGL, accessibility, performance, testing…).
- Projects for `CreativeWork`: the 4 missions (Alec EV site has a public URL; the others are internal or this site).
- GitHub `https://github.com/thedeepanshu`, YouTube `https://www.youtube.com/@DoliwithDeep`.

## 4. Questions / missing details

1. **Job title:** the whole site and résumés say **"Frontend Developer"**; your brief says **"Frontend Engineer"**. For structured data and titles, which one? (Mixing them weakens the entity signal.)
2. **Résumé path:** the brief has a placeholder. There are two PDFs (`V1` ATS, `V2` visual). OK to rename to `Deepanshu-Saini-Frontend-Developer-Resume.pdf` (ATS) and `…-Resume-Visual.pdf`, with redirects from the old names?
3. **Titles/copy:** OK to change page titles to include your role (e.g. `Missions · Deepanshu Saini, Frontend Developer`)? Visible on-page copy I'll only **propose** in `docs/SEO.md`.
4. **LinkedIn URL conflict:** the site uses `/in/deepanshu-saini-a97229206/`; `resumeData.ts` uses `/in/thedeepanshu-a97229206`. Which is the live one? (You told me earlier to keep LinkedIn URLs as they are, so I won't change them without your answer.)
5. **Light theme:** the site is dark-only by design. Keep dark-only (I'll declare `color-scheme: dark`), or do you want a light theme? (That's a new feature.)
6. **Contact form:** it opens a `mailto:` draft (no server, nothing to attack). The brief's server-side form (zod, rate-limit, honeypot) needs a Vercel function + an email service key (e.g. Resend). Keep `mailto` (recommended) or build a real send endpoint?
7. **OG images:** keep the one branded card, or generate one per page (name + page title) at build time?
8. **Analytics:** add `@vercel/analytics` + `@vercel/speed-insights` (2 tiny deps, cookie-free)? Needs enabling on Vercel.
9. **Tooling deps** (all dev-only): Vitest + Testing Library, Husky + lint-staged, `eslint-plugin-jsx-a11y`, an import-order plugin. Playwright smoke + axe test (`@playwright/test`, `@axe-core/playwright`)? Yes/no each, or "yes to all".
10. **Prettier:** the code uses a deliberate compact style (one-line CSS rules, aligned props). Prettier would reformat ~every file in one huge diff. Options: (a) skip Prettier, ESLint only; (b) Prettier for TS/TSX only; (c) Prettier everywhere.
11. **LICENSE:** MIT (open, anyone can reuse the code), or "All rights reserved" (code visible but not reusable, common for personal portfolios with personal photos/content)?
12. **`sameAs` profiles:**
    - **Instagram:** the site links your personal `@deep22.01`; the brief lists the family vlog `@doliwithdeep`. Include both, or only one?
    - **X/Twitter:** do you have an account? (The brief mentions X but gives no URL.)
    - **YouTube:** `@DoliwithDeep` is a joint couple channel. Fine to list it as "you" (it's acceptable for `sameAs`), just confirming.
13. **Mobile performance trade-off:** OK for me to defer starting the 3D world until after first paint / idle on phones (same experience, starts a moment later), as long as I show you before/after?

## 5. Proposed order (small phases, each: lint → typecheck → build → test → commit)

1. `chore:` deps & dead code (remove 3 deps, declare `postprocessing`, delete template assets + dead CSS, strict TS)
2. `seo:`/`perf:` **build-time prerender** + static first frame (biggest single win: SEO + LCP)
3. `chore(security):` headers + CSP, `security.txt`, real 404 status, `VITE_SITE_URL`
4. `seo:` JSON-LD (Person/WebSite/ProfilePage/Breadcrumb/CreativeWork), manifest, titles, sitemap, verification tags
5. `perf:` critical CSS, deferred world init, drop drei, image re-encoding
6. `a11y:` heading order, landmarks, new-tab announcements, target sizes, `docs/ACCESSIBILITY.md`
7. `refactor:` shared components, `site.ts` config, `@/` alias, error boundaries
8. `chore:` ESLint a11y/import rules, tests, Husky, CI, Dependabot, `.nvmrc`
9. `docs:` README + all docs + `MANUAL_STEPS.md`
10. Final verification → `docs/REPORT.md` (Lighthouse every route, axe, bundle before/after)
