/** UX002 — canonical mobile section order markers for Home `/`. */
export const HOME_MOBILE_SECTION_ORDER = [
  'hero',
  'swap',
  'trending',
  'market',
  'quick-actions',
  'cinematic',
  'list-cta',
  'grow',
  'earn',
  'activity',
] as const

export type HomeMobileSectionId = (typeof HOME_MOBILE_SECTION_ORDER)[number]
