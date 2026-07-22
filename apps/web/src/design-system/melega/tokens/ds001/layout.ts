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

  /**
   * UX003 / DS001.2 — shared global header geometry.
   * Height/padding follow the approved Project Website mockup (64px).
   */
  headerHeight: '64px',
  headerZIndex: 1000,
  headerBackground: 'rgba(5, 5, 5, 0.96)',
  headerBorder: 'rgba(255, 255, 255, 0.07)',
  headerBackdropBlur: '16px',
  headerPaddingX: '18px',
  headerPaddingXWide: '28px',
  headerLogoSize: '38px',
  headerLogoTitleGap: '10px',
  headerLogoBlockWidth: '158px',
  headerNavItemHeight: '38px',
  headerNavItemPaddingX: '11px',
  headerNavItemGap: '2px',
  headerNavItemRadius: '9px',
  headerSearchWidth: '320px',
  headerSearchHeight: '38px',
  headerDropdownRadius: '14px',
  headerDropdownShadow: '0 18px 55px rgba(0, 0, 0, 0.48)',
  headerDropdownZIndex: 1100,
  headerDesktopBreakpoint: '1024px',
  headerNavCollapseWidth: '1180px',

  cardPadding: '24px',
  cardTransition: '180ms',
  buttonHeight: '48px',
} as const

export type Ds001Layout = typeof ds001Layout
