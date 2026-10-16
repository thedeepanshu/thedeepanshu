export const IS_MAC = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent)

/** How the command palette shortcut is written on this platform. */
export const PALETTE_SHORTCUT = IS_MAC ? '⌘K' : 'Ctrl K'
