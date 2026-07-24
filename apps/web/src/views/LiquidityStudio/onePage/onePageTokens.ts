/** LIQUIDITY_PIXEL_PERFECTION_001 — exact desktop art-direction tokens.
 * MODULE_007: color/polish values only — geometry locks unchanged. */
export const liqOne = {
  pageBg: '#050505',
  card: '#101010',
  elevated: '#151515',
  input: '#121212',
  border: 'rgba(255,255,255,0.05)',
  borderDefault: 'rgba(255,255,255,0.04)',
  borderStrong: 'rgba(255,255,255,0.08)',
  text: '#F5F5F5',
  secondary: '#A8A8A8',
  muted: '#747474',
  bodySoft: '#B5B5B5',
  /* Restrained gold — CTAs / active / key KPI only */
  gold: '#C9A84A',
  goldHover: '#D4B45C',
  goldBorder: 'rgba(201,168,74,0.45)',
  goldBorderSoft: 'rgba(201,168,74,0.32)',
  positive: '#16D977',
  warning: '#F4B942',
  error: '#F04F5F',
  /* Visual polish (non-geometry) */
  cardShadow: '0 16px 40px rgba(0,0,0,0.35)',
  cardHighlight: 'inset 0 1px 0 rgba(255,255,255,0.03)',
  transitionMs: '120ms',
  transitionEase: 'ease',

  /* Global grid @ 1440 */
  canvas: 1440,
  contentMax: '1376px',
  pageInset: '32px',
  mainTopPad: '32px',
  col: '672px',
  colGap: '32px',
  mainRowH: '860px',
  belowMainGap: '24px',

  /* Left Liquidity Building card — MODULE_002: 210+48+442+160 = 860
   * When hero collapses 210→72, body grows 442→580 so card stays 860. */
  lbHeaderExpanded: '210px',
  lbHeaderCollapsed: '72px',
  lbWizardH: '48px',
  lbBodyH: '442px',
  lbBodyHCollapsed: '580px', /* 442 + (210-72) */
  lbFooterH: '160px',
  lbProgramH: '44px',
  lbPadX: '20px',

  /* Right column — MODULE_003 Add Liquidity: 96+70+250+44+60 = 520 */
  addH: '520px',
  addHeaderH: '96px',
  addPairH: '70px',
  addFormH: '250px',
  addSummaryH: '44px',
  addFooterH: '60px',
  addPadX: '20px',
  /* MODULE_004 DEX Snapshot: 44+76+132+72 = 324 */
  snapH: '324px',
  snapHeadH: '44px',
  snapKpiH: '76px',
  snapChartH: '132px',
  snapFooterH: '72px',
  snapPadX: '20px',
  snapKpiW: '310px',
  rightGap: '16px',

  /* Bottom — MODULE_005 Wallet Overview: 180 outer, 148 inner (16 pad) */
  overviewH: '180px',
  overviewInnerH: '148px',
  overviewPad: '16px',
  overviewGap: '12px',
  overviewColA: '336px',
  overviewColB: '336px',
  overviewColC: '216px',
  overviewColD: '216px',
  overviewColE: '192px',
  /* MODULE_006 Your Positions: chrome 64 + table head 52 + rows 68 */
  positionsHeadH: '64px',
  positionsTableHeadH: '52px',
  positionsRowH: '68px',
  positionsPad: '16px',
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
