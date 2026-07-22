/** UX rebuild — canonical mobile section order markers for Home `/`. */
export const HOME_MOBILE_SECTION_ORDER = [
  'hero',
  'swap',
  'kpi',
  'quick-actions',
  'discovery',
  'builder',
  'passport',
  'trust',
] as const

export type HomeMobileSectionId = (typeof HOME_MOBILE_SECTION_ORDER)[number]
