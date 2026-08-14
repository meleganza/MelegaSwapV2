/**
 * Canonical Melega stacking layers.
 * Modals must portal to document.body and use overlay+ — never nest under header/ticker.
 */
export const melegaZIndex = {
  content: 0,
  stickyLocal: 50,
  chromeTicker: 900,
  chromeHeader: 1000,
  chromeDropdown: 1100,
  chromeNav: 1200,
  overlay: 10040,
  overlayStacked: 10050,
  toast: 10100,
} as const

export type MelegaZIndex = typeof melegaZIndex
