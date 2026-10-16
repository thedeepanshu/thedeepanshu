# Architecture

A single-page app (Vite + React 19 + React Router 7). Every route is also prerendered to static HTML at build time and served from Vercel's CDN. There is no
backend.

```
                        ┌─────────────────────────── browser ───────────────────────────┐
 dist/<route>/index.html│ #root   ← React app (createRoot)                              │
  ├─ <head>: meta, OG,  │   ├─ SiteHeader, BootSequence, HUD, Narrator, Console, Palette │
  │  canonical, JSON-LD │   ├─ <World/>  lazy chunk: R3F canvas, camera, set pieces     │
  └─ #prerender         │   └─ PageRoutes → page component (main content, DOM)          │
     static copy, shown │ #prerender ← removed in useLayoutEffect before first paint    │
     until JS takes over└────────────────────────────────────────────────────────────────┘
```

## Layers

| Layer    | Where                                    | Notes                                                                                                                                                         |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages    | `src/pages/`, `src/pages/PageRoutes.tsx` | Plain, accessible DOM. One `h1` each. All copy comes from `src/content/`. `PageRoutes` is shared by the app and the prerenderer.                              |
| Content  | `src/content/`                           | `portfolio.ts` (missions, skills, timeline, experiments), `beyond.ts`, `resumeData.ts`, `seo.json` (titles and descriptions per route).                       |
| Config   | `src/config/site.ts`                     | Site URL (from `VITE_SITE_URL`), contact email, résumé paths, `absoluteUrl()`. Nothing else hard-codes these.                                                 |
| State    | `src/world/store.ts`                     | One zustand store (`useVessel`): current deck, boot phase, quality tier, reduced motion, sound mode, overlay state, and what each page has in focus.          |
| 3D world | `src/world/`                             | Lazy-loaded chunk. `decks.ts` maps routes to camera positions; `CameraRig` flies between them; `setpieces/` holds one scene per deck; custom GLSL throughout. |
| Audio    | `src/audio/`                             | Procedural Web Audio: `soundEngine.ts` (effects and modes), `lounge.ts` (ambient music), `dsp.ts`.                                                            |
| SEO      | `src/content/seo.ts`, `src/seo/`         | Runtime `<title>`/meta updates on navigation; JSON-LD graph built from content.                                                                               |
| Overlays | `src/components/`                        | Boot sequence, command palette (Ctrl/⌘ K), ship console (`~`), sound menu, narrator, error boundaries.                                                        |

## How a page loads

1. Vercel serves `dist/<route>/index.html` (an explicit rewrite per route; unknown paths get `404.html` with a 404 status).
2. The HTML already contains the page's content and the first frame of the welcome screen, so it paints before any JavaScript. With JavaScript off,
   `noscript.css` hides the cover and the content is readable.
3. The main bundle mounts the app and removes the static copy in a layout effect, before the browser paints again, so nothing jumps.
4. The welcome sequence runs (skippable; shorter on return visits). The 3D world loads as a separate chunk and fades in when its first frame is drawn.
5. On navigation, `DeckSync` sets the deck, the camera flies to it, the page swaps, focus moves to the new content, and the title, meta tags and canonical
   URL update.

## 3D world

- One `<Canvas>` for the whole site; set pieces sit far apart in world space so each route change is a real flight.
- Quality tiers: `FrameRateGuard` in `World.tsx` drops to the low tier after three slow seconds: same look, fewer particles (e.g. 16,000 instead of 42,000 in the core) and
  no chromatic aberration during flights.
- `prefers-reduced-motion` stops the flights and animation; the scene renders still.
- Heavy assets load only where they're used (e.g. the pilot textures only on the Bridge).
- Wrapped in an error boundary: without WebGL the pages work as normal.

## Build

```
tsc -b                                      typecheck
vite build                                  client bundles → dist/
vite build --ssr src/entry-prerender.tsx    a Node build of the pages
node scripts/seo-build.mjs                  per route: render HTML, write head tags + JSON-LD → dist/<route>/index.html;
                                            plus 404.html, sitemap.xml, robots.txt, .well-known/security.txt
node scripts/size-budget.mjs                fail if a bundle passes its gzip budget
```

## Deployment

`vercel.json` holds the rewrites, the redirects from old résumé names, the security headers (CSP and others) and the cache rules. Hashed assets in
`/assets` are cached for a year; images for a week, with stale-while-revalidate.

## Tests

- **Unit (Vitest + Testing Library):** content and SEO data, prerender output per route, structured data, deploy config (rewrites and CSP), components.
- **End-to-end (Playwright + axe):** every route on desktop and phone: renders without console errors, 0 WCAG 2.2 AA violations, crawlable HTML. Also the
  404 deck, the command palette and the contact form.
- **CI:** `.github/workflows/ci.yml` runs all of it plus Lighthouse CI.
