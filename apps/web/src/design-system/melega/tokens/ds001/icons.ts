/**
 * DS001.1 — Global Design System · Icon foundations.
 * Library: Lucide only. Stroke 1.75. Never mix icon libraries.
 */
export const ds001Icons = {
  library: 'lucide' as const,
  strokeWidth: 1.75,
  sizeDefault: 20,
  sizeLarge: 24,
  sizeHero: 32,
  /** Search control icon (DS001.1 §7). */
  sizeSearch: 18,
} as const

export type Ds001Icons = typeof ds001Icons
