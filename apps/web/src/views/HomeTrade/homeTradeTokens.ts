import { premiumStudioLayout, premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'
import { studioConstitutionLayout } from 'design-system/melega/tokens/studioConstitution'
import { tradeTypography, tradeLayout } from 'views/Trade/tradeTokens'

/** Home / Overview — R758 constitution + R760 Trade-aligned typography. */
export const homeTradeLayout = {
  ...premiumStudioLayout,
  ...studioConstitutionLayout,
  columnGap: '16px',
  compactGap: '12px',
  gridGutter: '16px',
  heroGap: studioConstitutionLayout.sectionGap,
  heroMaxHeight: '404px',
  swapWidth: '470px',
  liveActivityHeight: tradeLayout.recentSwapsHeight,
  activityRowHeight: tradeLayout.swapRowHeight,
} as const

/** R760 — mirrors Trade numeric surfaces for institutional parity. */
export const homeTypography = {
  ...tradeTypography,
  sectionTitle: { size: '18px', weight: 800, lineHeight: '1.2' },
  heroTitle: { size: '38px', weight: 800, lineHeight: '1.05' },
  heroSubtitle: { size: '13px', weight: 500, lineHeight: '1.35' },
  heroSubtitleMaxWidth: studioConstitutionLayout.heroSubtitleMaxWidth,
} as const

/** Legacy tokens for orphaned pre-DS-002 HomeTrade shell modules (not mounted on `/`). */
export const ht = {
  ...homeTradeLayout,
  canvas: premiumStudioColors.canvas,
  surface1: premiumStudioColors.card,
  surface2: premiumStudioColors.card,
  surface3: '#1C1C1C',
  surfaceHover: '#1E1E1E',
  borderSoft: premiumStudioColors.cardBorder,
  borderSidebar: premiumStudioColors.divider,
  borderMedium: premiumStudioColors.cardBorder,
  borderGold: 'rgba(212,175,55,0.42)',
  gold: premiumStudioColors.gold,
  goldBright: premiumStudioColors.gold,
  goldDark: '#8F6D16',
  goldSoftBg: premiumStudioColors.goldBg,
  white: premiumStudioColors.text,
  textMain: '#F5F5F5',
  textMuted: premiumStudioColors.muted,
  textPlaceholder: premiumStudioColors.muted,
  textNavInactive: premiumStudioColors.secondary,
  textSoft: premiumStudioColors.muted,
  textMeta: premiumStudioColors.secondary,
  green: premiumStudioColors.green,
  greenSoftBg: 'rgba(27,231,122,0.10)',
  red: premiumStudioColors.red,
  sidebarBg: premiumStudioColors.canvas,
  fontBody: "'Inter', sans-serif",
  fontDisplay: "'Orbitron', sans-serif",
  sidebarWidth: '230px',
  mainOffset: '250px',
  marcoLogoUri: '/images/melega.png',
  melegaLogoUri: '/images/melega.png',
} as const
