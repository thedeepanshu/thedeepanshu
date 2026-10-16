# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]: production hardening

### Added

- Build-time prerendering: every route ships its full content as HTML, with a static first frame, so pages paint before JavaScript and read fine without it.
- Real 404 pages with a 404 status; per-route rewrites instead of a catch-all.
- JSON-LD structured data on every page: Person (with 5 linked profiles), WebSite, ProfilePage, breadcrumbs and projects.
- Security headers: strict Content Security Policy, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy, frame protection and COOP; `security.txt`.
- One `VITE_SITE_URL` setting drives every absolute URL (canonical, Open Graph, sitemap, structured data, résumé links).
- Optional Google and Bing verification tags from environment variables.
- Vercel Analytics and Speed Insights (real-user metrics).
- Error boundaries: if WebGL fails the pages keep working, and a failing page shows a recovery screen.
- Machine-readable dates on the Journey timeline.
- Tooling: ESLint with accessibility and import-order rules, Prettier, Vitest (36 tests), Playwright + axe end-to-end tests, Husky + lint-staged, `.nvmrc`.
- CI on GitHub Actions (checks, build, end-to-end, Lighthouse) and Dependabot.
- Documentation: README, contributing guide, security policy, code of conduct, architecture, accessibility and SEO notes, manual steps, MIT licence for
  the code.

### Changed

- Page titles include the role ("Missions · Deepanshu Saini, Frontend Developer").
- Résumé files renamed to `Deepanshu-Saini-Frontend-Developer-Resume.pdf` and `…-Resume-Visual.pdf`; the old links redirect.
- One LinkedIn URL everywhere, including both résumés.
- About-page section labels are real headings; the ID card and Signal sidebar are labelled sections.
- External links tell screen readers they open a new tab; small text links have 24 px tap areas.
- The site declares its dark colour scheme to the browser.
- TypeScript strict mode across the codebase.

### Performance

- Mobile LCP down from about 4.0 s to about 2.0 s (Lighthouse, applied throttling).
- Removed `@react-three/drei`: a small frame-rate guard replaces it.
- Pilot images load only on the Bridge deck (about 200 KB saved on every other page).
- Icons 217 → 62 KB, portrait 74 → 14 KB (WebP), pilot artwork 193 → 146 KB.
- Bundle size budget enforced at build.

### Removed

- Unused dependencies: `framer-motion`, `gsap`, `lenis`.
- Vite template assets and about 80 unused CSS rules.

### Fixed

- Accessibility: heading order, nested landmarks, mouse-only backdrop handlers, and accessible names that didn't match visible text. axe now reports 0
  violations on every route.

## [0.1.0]: 2026-09-25 to 2026-10

The Vessel: the 3D sci-fi redesign. Eight decks connected by camera flights, a welcome sequence, procedural sound, a command palette, a ship console, the
Lab and Beyond decks, and two résumé formats.
