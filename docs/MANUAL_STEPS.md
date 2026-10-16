# Manual steps

Things the code can't do for you. Tick them off as you go.

## Vercel (do these after merging to `main`)

- [ ] **Analytics:** Vercel dashboard → project → _Analytics_ → Enable. The code is already in place (`@vercel/analytics`).
- [ ] **Speed Insights:** Vercel dashboard → project → _Speed Insights_ → Enable. Real-user Core Web Vitals appear after a few days of traffic.
- [ ] **Environment variable:** Settings → Environment Variables → check `VITE_SITE_URL` = `https://thedeepanshu.vercel.app` (Production and Preview). It
      is also in `.env`, so builds work without it; the dashboard value wins when set.
- [ ] After the first deploy, open `https://thedeepanshu.vercel.app/nope` and check it shows the not-found page, and that DevTools → Network shows status 404.

## Search engines

- [ ] **Google Search Console:** add the site as a _URL prefix_ property → choose _HTML tag_ → copy only the `content` value → set it as
      `VITE_GOOGLE_SITE_VERIFICATION` in Vercel → redeploy → click _Verify_.
- [ ] Submit `https://thedeepanshu.vercel.app/sitemap.xml` under _Sitemaps_.
- [ ] _URL Inspection_ → enter the home URL → _Request indexing_. Repeat for `/about` and `/missions`.
- [ ] **Bing Webmaster Tools:** _Import from Google Search Console_ (fastest), or use the meta tag via `VITE_BING_SITE_VERIFICATION`.
- [ ] Check the [Rich Results Test](https://search.google.com/test/rich-results?url=https://thedeepanshu.vercel.app/) shows the profile data.

## Profiles (links back to the site help search engines connect them)

- [ ] **GitHub:** profile → _Website_ = the site URL. Add it to the profile README too.
- [ ] **LinkedIn:** _Contact info_ → _Website_ (type: Portfolio) and the _Featured_ section. Use `/in/deepanshu-saini-a97229206/` everywhere.
- [ ] **Instagram** (@deep22.01 and @doliwithdeep): add the link in the bio.
- [ ] **YouTube** (family channel): _Customise channel_ → _Links_.
- [ ] Use the same name ("Deepanshu Saini"), title ("Frontend Developer") and photo on all profiles.
- [ ] Check the link preview with LinkedIn's [Post Inspector](https://www.linkedin.com/post-inspector/) and share the site once.

## GitHub repository

- [ ] Settings → _Code security_: turn on Dependabot alerts and security updates (the config file is already there).
- [ ] Settings → Branches: protect `main` and require the **CI** checks to pass before merging.
- [ ] Optional: set the repository's About → Website to the site URL, and add topics (`portfolio`, `react`, `threejs`, `webgl`).

## Custom domain

When you buy the domain:

1. Vercel → Settings → Domains → add it and follow the DNS instructions. Make the new domain the primary one, so `thedeepanshu.vercel.app` redirects to it
   with a 308.
2. Set `VITE_SITE_URL` to the new origin (no trailing slash) in Vercel **and** in `.env`, then redeploy. That updates canonical URLs, Open Graph, the
   sitemap, robots.txt, `security.txt` and the structured data.
3. Regenerate the résumés so their portfolio link changes: `npm run resume`, then commit both PDFs.
4. Update the links in `docs/SEO.md`, `SECURITY.md` and the README.
5. Search Console: add the new domain as a property, submit its sitemap, and use _Change of Address_ from the old property.
6. Update the website link on GitHub, LinkedIn, Instagram and YouTube.
7. If the HSTS header should cover the new domain's subdomains, keep `includeSubDomains`; only add `preload` once you're sure every subdomain serves HTTPS.

## From time to time

- [ ] Review and merge Dependabot PRs (CI tells you whether they're safe).
- [ ] Keep the résumés and `src/content/` in step: after editing one, update the other and run `npm run resume`.
- [ ] `security.txt` expires a year after each build; any deploy renews it.
