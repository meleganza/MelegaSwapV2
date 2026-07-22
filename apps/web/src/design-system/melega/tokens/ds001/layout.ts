/**
 * DS001.1 — Global Design System · Canvas / grid / chrome geometry.
 * Header dimensions are tokens only — do not apply header redesign in DS001.1.
 */
export const ds001Layout = {
  desktopReferenceWidth: 1440,
  viewportWidth: 1440,
  viewportHeight: 1024,

  contentMaxWidth: '1380px',
  /** Spec grid total 1376px; content max rounded to 1380px. */
  gridTotalWidth: '1376px',
  gridColumns: 12,
  gridColumnWidth: '88px',
  gridGutter: '24px',
  outerMargin: '32px',

  pagePaddingX: '32px',
  pagePaddingTopBelowHeader: '32px',
  pagePaddingBottom: '48px',

  /** Reserved for DS001.2 — do not wire into AppHeader in this mission. */
  headerHeight: '72px',
  headerLogoSize: '24px',
  headerLogoTitleGap: '12px',
  headerLogoBlockWidth: '220px',
  headerNavItemHeight: '40px',
  headerNavItemPaddingX: '16px',
  headerNavItemGap: '8px',
  headerSearchWidth: '320px',
  headerSearchHeight: '40px',
  headerBackdropBlur: '20px',

  cardPadding: '24px',
  cardTransition: '180ms',
  buttonHeight: '48px',
} as const

export type Ds001Layout = typeof ds001Layout
