/**
 * R758 Studio Design Constitution — single visual language for all Studios.
 * Extends R200 premiumStudio; studios must not override these core rhythm values.
 */
import {
  PREMIUM_FONT_BODY,
  PREMIUM_FONT_DISPLAY,
  premiumStudioColors,
  premiumStudioLayout,
  premiumStudioShadows,
  premiumStudioType,
} from './premiumStudio'
import { ds001TypeRoles } from './ds001/typography'
import { ds001Spacing } from './ds001/spacing'

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
  heroMinHeight: ds001Spacing[96],
  heroTitleSize: ds001TypeRoles.h1.size,
  heroTitleSizeMobile: ds001TypeRoles.h2.size,
  heroTitleLineHeight: ds001TypeRoles.h1.lineHeight,
  heroSubtitleMaxWidth: '720px',
  heroSubtitleSize: premiumStudioType.pageSubtitle,
  heroSubtitleLineHeight: ds001TypeRoles.body.lineHeight,
  /** 6px was outside DS001.1 allow-list → 8. */
  heroInnerGap: ds001Spacing[8],
  heroRowGap: ds001Spacing[16],
  heroMarginBottom: premiumStudioLayout.sectionGap,
  heroActionsGap: premiumStudioLayout.actionGroupGap,
  badgeHeight: premiumStudioLayout.tagHeight,
  badgeRadius: premiumStudioLayout.tagRadius,
  cardBorder: `1px solid ${premiumStudioColors.cardBorder}`,
  cardShadow: premiumStudioShadows.default,
  cardShadowHover: premiumStudioShadows.hover,
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
