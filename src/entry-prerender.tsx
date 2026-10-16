/**
 * Build-time prerender (not shipped to the browser). scripts/seo-build.mjs
 * calls render() for each route and writes the result into that route's HTML,
 * so crawlers that don't run JavaScript (link previews, Bing's first pass)
 * still get the real page text. In the browser the app replaces it before the
 * first paint (see RemovePrerender in App.tsx).
 *
 * Only the page content is rendered: no 3D world, welcome sequence or HUD.
 */
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'

import { SiteHeader } from '@/components/SiteHeader'
import { VesselFooter } from '@/components/VesselFooter'
import { PageRoutes } from '@/pages/PageRoutes'

export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <SiteHeader />
      <div id="content" className="deck-view">
        <PageRoutes />
        <VesselFooter />
      </div>
    </StaticRouter>,
  )
}
