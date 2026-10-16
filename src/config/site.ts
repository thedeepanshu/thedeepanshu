/**
 * Site identity: the one place for who this site belongs to and where it lives.
 * The URL comes from VITE_SITE_URL (.env, overridable on Vercel), so moving to a
 * custom domain is a single setting.
 */
const rawUrl = import.meta.env.VITE_SITE_URL
if (!rawUrl) throw new Error('VITE_SITE_URL is not set (see .env.example)')

/** Absolute origin, no trailing slash, e.g. https://thedeepanshu.vercel.app */
export const siteUrl = rawUrl.replace(/\/+$/, '')
/** Host only, for display, e.g. thedeepanshu.vercel.app */
export const siteHost = new URL(siteUrl).host

/** Absolute URL for a site path. */
export const absoluteUrl = (path: string) => siteUrl + (path.startsWith('/') ? path : `/${path}`)
