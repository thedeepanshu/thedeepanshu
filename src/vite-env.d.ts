/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute origin of the live site, no trailing slash (see .env.example). */
  readonly VITE_SITE_URL: string
  readonly VITE_GOOGLE_SITE_VERIFICATION?: string
  readonly VITE_BING_SITE_VERIFICATION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
