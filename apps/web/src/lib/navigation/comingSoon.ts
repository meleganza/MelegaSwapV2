/** R757 — explicit label for navigation actions not yet live. */
export const NAV_COMING_SOON_LABEL = 'Coming Soon'

export function scrollToElement(id: string): void {
  if (typeof document === 'undefined') return
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
