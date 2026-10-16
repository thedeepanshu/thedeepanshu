# Accessibility

Target: **WCAG 2.2 AA**. Last full check: 16 Oct 2026 (production build, Vercel headers simulated locally).

## Results

**axe-core 4.10** (rule sets `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) on every route at desktop (1440×900) and mobile (375×812):

| Route       | Desktop | Mobile |
| ----------- | ------- | ------ |
| `/`         | 0       | 0      |
| `/about`    | 0       | 0      |
| `/missions` | 0       | 0      |
| `/arsenal`  | 0       | 0      |
| `/journey`  | 0       | 0      |
| `/lab`      | 0       | 0      |
| `/beyond`   | 0       | 0      |
| `/signal`   | 0       | 0      |
| 404 page    | 0       | 0      |

**0 violations across 18 page scans.** (One run flagged the bottom dock's label for contrast while it was still fading in; re-scanned once settled: 0. Its real contrast is about 10:1.)

Lighthouse Accessibility: **100** on every route measured.

**Target size (2.5.8):** every interactive element measures at least 24×24 px on desktop and mobile.

## What was fixed in the hardening pass

| Issue                                                                    | Fix                                                                                                                                |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `heading-order`: card `h3`s followed the page `h1` (About, Journey, Lab) | About's section labels are now real `h2`s (same kicker look); Journey and Lab get a screen-reader `h2` ("Timeline", "Experiments") |
| `<aside>` nested inside `<main>` (About ID card, Signal sidebar)         | `<section aria-label>`                                                                                                             |
| External links didn't say they open a new tab                            | `NewTabHint`: "(opens in a new tab)" for screen readers on all seven                                                               |
| Text links 17–23 px tall                                                 | Tap area raised to ≥ 24 px with padding and equal negative margins (no layout change)                                              |
| Experience dates weren't machine-readable                                | `<time dateTime>` per Journey milestone, read out by screen readers                                                                |
| Mouse-only "click outside to close" handlers on overlays                 | `role="presentation"` backdrops; the trailer `<dialog>` handles backdrop clicks in code; Escape closes everything                  |
| No lint coverage for a11y                                                | `eslint-plugin-jsx-a11y-x` (recommended) on all TSX, zero warnings                                                                 |

## Built-in behaviour (verified)

- **Landmarks and structure:** one `h1` per page, skip link to `#content`, `header` / `nav` / `main` / `footer`, `lang="en"`, unique title per route.
- **Keyboard:** everything is reachable and operable. The command palette (Ctrl/⌘ K), ship console (`~`), sound menu and mobile drawer manage focus and return it on close; the palette uses the ARIA combobox pattern (focus stays in the search field, arrows move the highlight).
- **Route changes:** focus moves to the new page's content after each warp, so keyboard and screen-reader users start where sighted users do.
- **Reduced motion:** `prefers-reduced-motion` turns off the warp, reveals, typing, count-ups, glitch and 3D motion (the scene renders still).
- **Decorative layers** (3D canvas, HUD, narrator) are `aria-hidden`; their information also exists as page text.
- **Forms:** labelled inputs, a radio group for topics, native validation, and a live status message after sending.
- **No JavaScript:** the prerendered page is shown in full.

## Known limitations

- Text over the 3D scene can't be measured automatically for contrast; spot-checked manually (content panels are solid since the hardening pass).
- The welcome sequence is a timed animation; it can be skipped at once (button or Escape) and is shortened on return visits.

## Re-running the checks

```bash
npm run build
npm run test:e2e   # Playwright + axe over every route (see tests/e2e)
```
