/**
 * DS001.1 — Global Design System · Border radius foundations.
 * Never mix different radii inside the same component.
 */
export const ds001Radius = {
  card: '20px',
  input: '16px',
  button: '14px',
  badge: '999px',
  modal: '24px',
  /** Search control (DS001.1 §7) — pill. */
  search: '20px',
  /** Header nav item (DS001.1 §6) — reserved for DS001.2. */
  navItem: '10px',
} as const

export type Ds001Radius = typeof ds001Radius
export type Ds001RadiusToken = keyof typeof ds001Radius
