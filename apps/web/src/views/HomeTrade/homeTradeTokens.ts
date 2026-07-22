import { premiumStudioLayout, premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'
import { studioConstitutionLayout } from 'design-system/melega/tokens/studioConstitution'
import { ds001Colors, ds001FontFamily, ds001Spacing, ds001TypeRoles } from 'design-system/melega/tokens/ds001'
import { tradeTypography, tradeLayout } from 'views/Trade/tradeTokens'

/** Home / Overview — DS001.1 foundations + R760 Trade-aligned typography. */
export const homeTradeLayout = {
  ...premiumStudioLayout,
  ...studioConstitutionLayout,
  columnGap: ds001Spacing[16],
  compactGap: ds001Spacing[12],
  gridGutter: ds001Spacing[16],
  heroGap: studioConstitutionLayout.sectionGap,
  heroMaxHeight: '404px',
  swapWidth: '470px',
  liveActivityHeight: tradeLayout.recentSwapsHeight,
  activityRowHeight: tradeLayout.swapRowHeight,
  /** 36px outside DS001.1 allow-list → 40. */
  mobileSectionGap: ds001Spacing[40],
} as const

/** R760 — mirrors Trade numeric surfaces; type roles snapped to DS001.1. */
export const homeTypography = {
  ...tradeTypography,
  sectionTitle: { size: ds001TypeRoles.bodyLarge.size, weight: 700, lineHeight: '1.2' },
  heroTitle: { size: ds001TypeRoles.h2.size, weight: 700, lineHeight: '1.12' },
  heroSubtitle: { size: ds001TypeRoles.caption.size, weight: 500, lineHeight: '1.35' },
  heroSubtitleMaxWidth: studioConstitutionLayout.heroSubtitleMaxWidth,
  mobileHeroTitle: { size: ds001TypeRoles.h3.size, weight: 700, lineHeight: '1.12' },
  mobileBody: {
    fontFamily: ds001FontFamily.body,
    size: ds001TypeRoles.body.size,
    weight: 400,
    lineHeight: '1.5',
  },
} as const

/** Legacy tokens for orphaned pre-DS-002 HomeTrade shell modules (not mounted on `/`). */
export const ht = {
  ...homeTradeLayout,
  canvas: premiumStudioColors.canvas,
  surface1: premiumStudioColors.card,
  surface2: premiumStudioColors.card,
  surface3: ds001Colors.surfaceElevated,
  surfaceHover: ds001Colors.cardHoverBackground,
  borderSoft: premiumStudioColors.cardBorder,
  borderSidebar: premiumStudioColors.divider,
  borderMedium: premiumStudioColors.cardBorder,
  borderGold: 'rgba(244,196,48,0.42)',
  gold: premiumStudioColors.gold,
  goldBright: premiumStudioColors.gold,
  goldDark: ds001Colors.pressedGold,
  goldSoftBg: premiumStudioColors.goldBg,
  white: premiumStudioColors.text,
  textMain: ds001Colors.primaryText,
  textMuted: premiumStudioColors.muted,
  textPlaceholder: premiumStudioColors.muted,
  textNavInactive: premiumStudioColors.secondary,
  textSoft: premiumStudioColors.muted,
  textMeta: premiumStudioColors.secondary,
  green: premiumStudioColors.green,
  greenSoftBg: 'rgba(34,197,94,0.10)',
  red: premiumStudioColors.red,
  sidebarBg: premiumStudioColors.canvas,
  fontBody: ds001FontFamily.body,
  fontDisplay: ds001FontFamily.display,
  sidebarWidth: '230px',
  mainOffset: '250px',
  marcoLogoUri: '/images/melega.png',
  melegaLogoUri: '/images/melega.png',
} as const
