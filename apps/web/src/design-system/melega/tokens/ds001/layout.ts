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

  /** DS001.2 — shared global header geometry. */
  headerHeight: '72px',
  headerZIndex: 1000,
  headerBackground: 'rgba(8, 8, 8, 0.94)',
  headerBorder: '#1A1A1A',
  headerBackdropBlur: '20px',
  headerPaddingX: '16px',
  headerPaddingXWide: '24px',
  headerLogoSize: '36px',
  headerLogoTitleGap: '10px',
  headerLogoBlockWidth: '180px',
  headerNavItemHeight: '40px',
  headerNavItemPaddingX: '12px',
  headerNavItemGap: '2px',
  headerNavItemRadius: '10px',
  headerSearchWidth: '300px',
  headerSearchHeight: '40px',
  headerDropdownRadius: '14px',
  headerDropdownShadow: '0 16px 48px rgba(0, 0, 0, 0.42)',
  headerDropdownZIndex: 1100,
  headerDesktopBreakpoint: '1024px',

  cardPadding: '24px',
  cardTransition: '180ms',
  buttonHeight: '48px',
} as const

export type Ds001Layout = typeof ds001Layout
