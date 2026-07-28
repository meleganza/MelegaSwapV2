/** UX rebuild — canonical mobile section order markers for Home `/`. */
export const HOME_MOBILE_SECTION_ORDER = [
  'hero',
  'swap',
  'featured-projects',
  'kpi',
  'discovery',
  'ecosystem',
  'footer',
] as const

export type HomeMobileSectionId = (typeof HOME_MOBILE_SECTION_ORDER)[number]
