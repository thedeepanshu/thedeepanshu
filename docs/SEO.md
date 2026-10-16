# SEO

## What's in place

| Item                    | Where                                                          | Notes                                                                                                        |
| ----------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Crawlable content       | `scripts/seo-build.mjs`, `src/entry-prerender.tsx`             | Every route's HTML contains its full text (171–802 words), not an empty `<div>`                              |
| Titles and descriptions | `src/content/seo.json`                                         | Unique per route; titles include "Frontend Developer"                                                        |
| Canonical URLs          | build + `applyPageMeta` at runtime                             | From `VITE_SITE_URL`; trailing slashes normalised                                                            |
| Open Graph and Twitter  | build + runtime                                                | One 1200×630 image (`public/og-image.jpg`) with alt text                                                     |
| Structured data         | `src/seo/structuredData.ts`                                    | Person (occupation, address, education, 5 `sameAs` profiles), WebSite, ProfilePage, BreadcrumbList, projects |
| Sitemap and robots      | generated at build                                             | `sitemap.xml` lists the 8 routes; `robots.txt` points to it                                                  |
| Real 404s               | `vercel.json` rewrites + `404.html`                            | Unknown URLs return status 404 with `noindex`                                                                |
| Résumé files            | `public/`                                                      | Descriptive names; old names redirect with 308                                                               |
| Verification            | `VITE_GOOGLE_SITE_VERIFICATION`, `VITE_BING_SITE_VERIFICATION` | Meta tags are added only when set                                                                            |

Validated on [validator.schema.org](https://validator.schema.org/): 0 errors, 0 warnings on all 8 pages.

## Checking it

- Rich results: <https://search.google.com/test/rich-results?url=https://thedeepanshu.vercel.app/>
- Schema: <https://validator.schema.org/#url=https%3A%2F%2Fthedeepanshu.vercel.app%2F>
- Link previews: <https://www.opengraph.xyz/url/https%3A%2F%2Fthedeepanshu.vercel.app> (and LinkedIn's [Post Inspector](https://www.linkedin.com/post-inspector/))
- After a deploy: `curl -sI https://thedeepanshu.vercel.app/nope` should show `404`.

Change the URLs above when the custom domain goes live.

## Copy proposals (not applied)

On-page copy is the owner's decision. These would help search and are listed for review only:

1. **Home `h1`:** it reads "Frontend in motion." and doesn't contain the name. Search engines weigh the `h1`. Option: keep the visual line and add the name
   before it, e.g. a small line "Deepanshu Saini" above it, or make the eyebrow the `h1` and the slogan a styled `p`.
2. **Home intro:** "I'm Deepanshu, a frontend developer…" could use the full name once ("I'm Deepanshu Saini, …") so the page states the name a searcher
   types.
3. **Location:** recruiters often search "frontend developer + city". The About page or footer could say "Based in Panipat, Haryana, India · open to remote".
   It's in the structured data already, but not in visible text.
4. **Missions:** each case study could name the main technology in its first sentence ("A React and TypeScript dashboard for…"), which matches how people
   search for work samples.
5. **Description lengths:** all are within 155 characters; nothing to change.

## When the domain changes

See [MANUAL_STEPS.md](MANUAL_STEPS.md#custom-domain).
