import { premiumStudioColors, premiumStudioLayout, PREMIUM_FONT_BODY, PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { studioConstitutionLayout } from 'design-system/melega/tokens/studioConstitution'

/** Collectibles Studio — R758 constitution rhythm. */
export const collectiblesStudioLayout = {
  ...premiumStudioLayout,
  ...studioConstitutionLayout,
  cardPadding: premiumStudioLayout.cardPadding,
  gridGap: premiumStudioLayout.cardGap,
  heroHeight: '240px',
  heroLeftPct: '45%',
  heroRightPct: '55%',
  kpiGap: '18px',
  kpiHeight: premiumStudioLayout.kpiHeight,
  kpiRadius: premiumStudioLayout.cardRadius,
  kpiPadding: '20px 22px',
  featuredHeight: '300px',
  featuredRadius: premiumStudioLayout.cardRadius,
  advisorWidth: '300px',
  sidebarWidth: '300px',
  filterHeight: '44px',
  filterGap: '10px',
  gridColumns: 0,
  cardWidth: 'auto',
  cardHeight: 'auto',
  cardMinHeight: '360px',
  artworkH: '150px',
  artworkRadius: premiumStudioLayout.cardRadius,
  scoreRingSm: '64px',
  scoreRingLg: '64px',
  sparklineW: 42,
  sparklineH: 16,
  btnExploreW: '176px',
  btnCreateW: '192px',
  btnFeaturedW: '160px',
  btnFeaturedH: premiumStudioLayout.btnHeight,
  btnViewW: '140px',
  btnViewH: premiumStudioLayout.tagHeight,
  btnFavorite: premiumStudioLayout.tagHeight,
  bannerHeight: '180px',
} as const

export const collectiblesStudioColors = {
  ...premiumStudioColors,
  pageBg: premiumStudioColors.canvas,
  panel: premiumStudioColors.card,
  border: premiumStudioColors.cardBorder,
  goldHover: premiumStudioColors.cardBorderHover,
  white: premiumStudioColors.text,
  body: premiumStudioColors.summary,
  label: premiumStudioColors.muted,
  purple: '#9B7CFF',
  blue: '#4CA3FF',
  greenBg: 'rgba(27,231,122,0.1)',
  shadow: '0 18px 44px rgba(0,0,0,0.34)',
  transition: premiumStudioLayout.hoverTransition,
} as const

export const CS_FONT_DISPLAY = PREMIUM_FONT_DISPLAY
export const CS_FONT_BODY = PREMIUM_FONT_BODY
