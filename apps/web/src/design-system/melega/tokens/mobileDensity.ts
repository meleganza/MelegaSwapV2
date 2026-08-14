/**
 * Shared mobile density tokens — Founder mobile acceptance.
 * Prefer these over page-local arbitrary values for chrome + compact surfaces.
 */

export const mobileDensity = {
  break: '767px',
  narrowBreak: '360px',
  phone390: '390px',
  phone430: '430px',
  shellBreak: '1023px',

  pagePadX: '16px',
  sectionGap: '24px',
  cardPad: '14px',
  compactCardPad: '12px',

  btnPrimaryH: '48px',
  btnSecondaryH: '44px',
  inputH: '48px',
  touchMin: '44px',

  kpiMinH: '96px',
  listRowH: '52px',

  h1: '40px',
  h1Line: '44px',
  h2: '28px',
  h2Line: '32px',
  body: '15px',
  bodyLine: '20px',
  caption: '12px',

  /** Sticky chrome (content column, not including safe-area). */
  headerContentH: '56px',
  tickerH: '36px',
  bottomNavH: '64px',

  /** FAB above bottom nav + safe area. */
  fabSize: '48px',
  fabBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
  fabRight: '16px',
  fabZ: 180,

  insightsCardMinH: '108px',
  insightsValueSize: '22px',
  insightsValueLine: '26px',
} as const

export type MobileDensity = typeof mobileDensity
