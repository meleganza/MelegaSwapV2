/** Liquidity Studio layout constants — R004-A foundation grid. */
export const liquidityStudioLayout = {
  contentMax: '1180px',
  leftWidth: '360px',
  centerWidth: '500px',
  rightWidth: '300px',
  columnGap: '16px',
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
} as const

export const liquidityStudioColors = {
  canvas: '#050505',
  panel: '#111111',
  panelGradient: 'linear-gradient(180deg, #141414 0%, #101010 100%)',
  gold: '#D4AF37',
  goldBright: '#F4C542',
  green: '#00E676',
  muted: '#8A8A8A',
  text: '#FFFFFF',
  border: 'rgba(255,255,255,0.08)',
  previewBadge: 'rgba(212,175,55,0.14)',
} as const

export const LIQUIDITY_STUDIO_PREVIEW_LABEL = 'Preview Layout'
