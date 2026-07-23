/** LIQUIDITY_PIXEL_PERFECTION_001 — exact desktop art-direction tokens. */
export const liqOne = {
  pageBg: '#050505',
  card: '#101010',
  elevated: '#151515',
  input: '#121212',
  border: '#252525',
  borderDefault: '#1F1F1F',
  borderStrong: '#2A2A2A',
  text: '#F5F5F5',
  secondary: '#A8A8A8',
  muted: '#747474',
  bodySoft: '#B5B5B5',
  gold: '#DDB92F',
  goldHover: '#E8C83B',
  goldBorder: 'rgba(221,185,47,0.55)',
  goldBorderSoft: 'rgba(221,185,47,0.45)',
  positive: '#16D977',
  warning: '#F4B942',
  error: '#F04F5F',

  /* Global grid @ 1440 */
  canvas: 1440,
  contentMax: '1376px',
  pageInset: '32px',
  mainTopPad: '32px',
  col: '672px',
  colGap: '32px',
  mainRowH: '860px',
  belowMainGap: '24px',

  /* Left Liquidity Building card */
  lbHeaderExpanded: '120px',
  lbHeaderCollapsed: '72px',
  lbWizardH: '48px',
  lbBodyH: '540px',
  lbFooterH: '80px',
  lbPadY: '36px', /* 36+36 = 72 → 120+48+540+80+72 = 860 */

  /* Right column */
  addH: '520px',
  addArtH: '120px',
  addFormH: '300px',
  addCtaH: '100px',
  snapH: '324px',
  rightGap: '16px',
  snapHeadH: '40px',
  snapKpiH: '92px',
  snapDonutH: '120px',
  snapLegendH: '72px',

  /* Bottom */
  overviewH: '150px',
  positionsHeadH: '64px',
  positionsRowH: '72px',
  educationH: '96px',

  sectionGap: '24px',
  bottomPad: '48px',
  introMinH: '78px',
  introBottom: '18px',
  titleSize: '40px',
  titleLh: '46px',
  cardRadius: '16px',
  controlRadius: '10px',
  actionH: '44px',
  font: "Inter, 'Inter var', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const
