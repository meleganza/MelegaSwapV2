/**
 * R758 Studio Design Constitution — single visual language for all Studios.
 * Extends R200 premiumStudio; studios must not override these core rhythm values.
 */
import {
  PREMIUM_FONT_BODY,
  PREMIUM_FONT_DISPLAY,
  premiumStudioColors,
  premiumStudioLayout,
  premiumStudioType,
} from './premiumStudio'

export const STUDIO_FONT_DISPLAY = PREMIUM_FONT_DISPLAY
export const STUDIO_FONT_BODY = PREMIUM_FONT_BODY

/** Ledger (TrendingRibbon) → Hero → KPIs → Content vertical rhythm. */
export const studioConstitutionLayout = {
  ...premiumStudioLayout,
  contentMax: premiumStudioLayout.contentMax,
  contentPaddingX: premiumStudioLayout.contentPaddingX,
  contentPaddingTop: premiumStudioLayout.contentPaddingTop,
  contentPaddingBottom: premiumStudioLayout.contentPaddingBottom,
  sectionGap: premiumStudioLayout.sectionGap,
  cardRadius: premiumStudioLayout.cardRadius,
  cardPadding: premiumStudioLayout.cardPadding,
  cardGap: premiumStudioLayout.cardGap,
  kpiHeight: premiumStudioLayout.kpiHeight,
  btnHeight: premiumStudioLayout.btnHeight,
  btnRadius: premiumStudioLayout.btnRadius,
  heroMinHeight: '96px',
  heroTitleSize: '44px',
  heroTitleSizeMobile: '36px',
  heroTitleLineHeight: '1.05',
  heroSubtitleMaxWidth: '720px',
  heroSubtitleSize: premiumStudioType.pageSubtitle,
  heroSubtitleLineHeight: '1.5',
  heroInnerGap: '6px',
  heroRowGap: '16px',
  heroMarginBottom: premiumStudioLayout.sectionGap,
  heroActionsGap: premiumStudioLayout.actionGroupGap,
  badgeHeight: premiumStudioLayout.tagHeight,
  badgeRadius: premiumStudioLayout.tagRadius,
  cardBorder: '1px solid rgba(255, 255, 255, 0.08)',
  cardShadow: 'none',
  cardShadowHover: '0 10px 24px rgba(212, 175, 55, 0.08)',
  cardHoverLift: 'translateY(-2px)',
  mobileBreakpoint: '767px',
  tabletBreakpoint: premiumStudioLayout.stackBreakpoint,
} as const

export const studioConstitutionColors = {
  ...premiumStudioColors,
} as const

export const studioConstitutionType = {
  ...premiumStudioType,
  pageTitle: studioConstitutionLayout.heroTitleSize,
  pageSubtitle: studioConstitutionLayout.heroSubtitleSize,
} as const

/** Title Case studio names — never ALL CAPS in hero titles. */
export const STUDIO_PAGE_TITLES = {
  trade: 'Trade',
  liquidity: 'Liquidity Studio',
  pools: 'Pools',
  farms: 'Farms',
  projects: 'Projects',
  radar: 'DEX Intelligence',
  identityHub: 'Identity Hub',
  build: 'Build Studio',
} as const
