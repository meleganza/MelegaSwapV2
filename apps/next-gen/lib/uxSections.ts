import { sectionById, type SectionCopy, type SectionId } from './sections'

export type UxSectionId = SectionId | 'explore'

export interface UxSectionCopy extends Omit<SectionCopy, 'id'> {
  id: UxSectionId
}

const EXPLORE_SECTION: UxSectionCopy = {
  id: 'explore',
  title: 'Explore',
  navLabel: 'Explore',
  href: '/explore',
  primary: true,
  statements: [
    'Projects, tokens, and opportunities appear only when verified discovery data is available.',
    'Paid Boost visibility remains clearly identified and never changes canonical project identity.',
  ],
}

export function uxSectionById(id: UxSectionId): UxSectionCopy {
  if (id === 'explore') return EXPLORE_SECTION
  const section = sectionById(id)
  if (id === 'tools') return { ...section, title: 'Advanced Console', navLabel: 'Advanced' }
  return section
}
