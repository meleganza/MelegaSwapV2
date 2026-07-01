/** Liquidity Studio layout constants — L001 pixel-perfect grid. */
export const liquidityStudioLayout = {
  contentMax: '1180px',
  leftWidth: '360px',
  centerWidth: '520px',
  rightWidth: '300px',
  columnGap: '16px',
  verticalRhythm: '16px',
  contentPaddingX: '24px',
  contentPaddingTop: '18px',
  panelRadius: '18px',
  panelPadding: '18px',
  builderPairHeight: '52px',
  tokenRowHeight: '84px',
  metricCardHeight: '76px',
  ilChartHeight: '90px',
  positionPreviewHeight: '430px',
  connectButtonHeight: '46px',
  liquidityBarWidth: '32px',
  liquidityBarHeight: '96px',
  marketIntelHeight: '170px',
  aiAdvisorHeight: '150px',
  topPoolsHeight: '190px',
  activityHeight: '220px',
} as const

export const liquidityStudioColors = {
  canvas: '#090909',
  panel: '#111111',
  panelGradient: 'linear-gradient(180deg, #141414 0%, #101010 100%)',
  surfaceSecondary: '#181818',
  gold: '#D4AF37',
  goldBright: '#F4C542',
  green: '#19E37A',
  red: '#FF5A5A',
  muted: '#A8A8A8',
  subtitle: '#A7A7A7',
  text: '#FFFFFF',
  border: 'rgba(255,255,255,0.08)',
  rowBorder: 'rgba(255,255,255,0.05)',
  previewBadgeBg: 'rgba(212,175,55,0.1)',
} as const

export const LIQUIDITY_STUDIO_PREVIEW_LABEL = 'PREVIEW LAYOUT'
