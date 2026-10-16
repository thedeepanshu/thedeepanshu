# Contributing

This is a personal portfolio, so outside pull requests are rare, but bug reports and fixes are welcome. The same rules apply to the owner.

## Setup

```bash
nvm use            # Node 22, from .nvmrc
npm ci             # also installs the pre-commit hook
npm run dev
```

`.env` holds the public site URL. To try a different one locally, put `VITE_SITE_URL=...` in `.env.local`.

## Before you open a PR

```bash
npm run check      # typecheck, lint (0 warnings), format check, unit tests
npm run build      # prerender, SEO files and the bundle size budget
npm run test:e2e   # Playwright + axe on every route, desktop and phone
```

The pre-commit hook runs ESLint and Prettier on staged files, then the typechecker. CI runs everything above plus Lighthouse.

For end-to-end tests, Playwright needs a Chromium: run `npx playwright install chromium` once, or set `CHROME_PATH` to an installed Chrome. The 3D world
renders in software during tests, so a full run takes a few minutes.

## Conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `perf:`, `a11y:`, `docs:`, `ci:`, `chore:`, `refactor:`).
- **Code:** strict TypeScript, no `any`. Import with the `@/` alias. Prettier formats TS, JS, JSON and Markdown; CSS keeps its compact hand-written style.
- **Content:** all copy lives in `src/content/`. Visible wording is the owner's; don't change it in a PR without asking. Nothing on the site is invented:
  no made-up stats, quotes or opinions.
- **Accessibility:** every interactive element works with a keyboard, has a name that matches its visible text, and is at least 24×24 px. New motion must
  respect `prefers-reduced-motion`. Decorative layers are `aria-hidden`.
- **Performance:** the build fails when a bundle passes its budget in `scripts/size-budget.mjs`. If a raise is justified, change the budget in the same PR and
  say why.
- **Dependencies:** justify any new one in the PR. Prefer a few lines of our own code over a large package.
- **Security:** no inline scripts or third-party script hosts. The CSP in `vercel.json` will block them. New embed origins go in `frame-src`, and
  `src/config/deploy.test.ts` checks the policy.

## Adding a page (deck)

1. Add the deck to `src/world/decks.ts` (camera position and target).
2. Add the page component and its route in `src/pages/PageRoutes.tsx`.
3. Add the title and description to `src/content/seo.json`. The build prerenders and lists in the sitemap every route found there.
4. Add the rewrite to `vercel.json`, and the route to `ROUTES` in `tests/e2e/site.spec.ts`.

The unit tests fail if a route in `seo.json` has no prerendered heading or no rewrite.
