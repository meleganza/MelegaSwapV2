/** LIST_MODULE_001 — List page hero geometry + color tokens. */
export const listOne = {
  pageBg: '#050505',
  card: '#101010',
  elevated: '#151515',
  border: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  secondary: '#C8C8C8',
  muted: '#8A8A8A',
  gold: '#F2C84C',
  goldSoft: '#D4AF37',

  canvas: 1440,
  contentMax: '1376px',
  pageInset: '32px',
  heroTop: '24px',
  heroTopMobile: '16px',

  /* Desktop hero — exact lock */
  heroW: '1376px',
  heroH: '360px',
  leftPct: 52,
  rightPct: 48,
  colGap: '24px',

  headlineW: '520px',
  headlineSize: '56px',
  headlineLh: '60px',
  headlineWeight: 750,

  descW: '480px',
  descSize: '16px',
  descLh: '24px',
  descTop: '20px',

  statW: '120px',
  statH: '72px',
  statGap: '16px',

  artW: '560px',
  artH: '320px',

  /* Mobile */
  heroWMobile: '358px',

  /* MODULE_002 — action cards (geometry only; hero locks unchanged) */
  cardsTop: '24px',
  cardsRowH: '272px',
  cardW: '256px',
  cardH: '272px',
  cardGap: '24px',
  cardPad: '20px',
  cardRadius: '16px',
  iconTile: '56px',
  iconSize: '24px',
  contentGap: '14px',
  titleH: '26px',
  descH: '66px',
  ctaW: '216px',
  ctaH: '44px',
  badgeW: '68px',
  badgeH: '20px',
  badgeTop: '-10px',

  /* Mobile cards */
  mobileCardW: '358px',
  mobileCardH: '82px',
  mobileCardGap: '10px',
  mobileCardRadius: '13px',
  mobileCardPad: '12px',
  mobileIcon: '46px',
  mobileBadgeW: '52px',
  mobileBadgeH: '16px',

  /* Tablet */
  tabletCardH: '240px',
  tabletGap: '16px',

  /* MODULE_003 — Why build on Melega rail (hero + cards locks unchanged) */
  whyTop: '24px',
  whyW: '1376px',
  whyH: '112px',
  whyPad: '16px',
  whyRadius: '16px',
  whyInnerW: '1344px',
  whyInnerH: '80px',
  whyIntroW: '220px',
  whyBenefitW: '265px',
  whyColGap: '16px',
  whyIconTile: '44px',
  whyIconSize: '20px',
  whyTextW: '209px',
  whySepH: '48px',
  whyMobileBenefitH: '64px',
  whyMobileGap: '10px',
  whyTabletBenefitH: '72px',
  whyTabletGap: '12px',

  /* MODULE_004 — How it works (001–003 locks unchanged) */
  howTop: '24px',
  howW: '1376px',
  howH: '176px',
  howPad: '20px',
  howRadius: '16px',
  howHeaderH: '28px',
  howHeaderGap: '20px',
  howTimelineW: '1336px',
  howTimelineH: '108px',
  howStepW: '208px',
  howStepH: '108px',
  howCircle: '32px',
  howDescW: '190px',
  howConnectorL: '124px',
  howConnectorR: '1212px',
  howConnectorW: '1088px',
  howConnectorY: '22px',
  howMobileStepMinH: '48px',
  howMobileGap: '8px',
  howMobileCircle: '28px',
  howMobileTitleRow: '44px',
  howTabletGapX: '16px',
  howTabletGapY: '20px',
  howTabletStepMinH: '88px',

  /* MODULE_005 — unified list workspace (001–004 locks unchanged) */
  workspaceTop: '24px',
  workspaceW: '1376px',
  workspaceH: '920px',
  workspacePadX: '24px',
  /* 11+11 vertical + 1+1 border = 24; keeps header+body+footer at 896 inside 920 */
  workspacePadY: '11px',
  workspaceRadius: '16px',
  workspaceHeaderH: '64px',
  workspaceBodyH: '760px',
  workspaceFooterH: '72px',
  workspaceBg: '#101010',

  /* MODULE_006 — premium workspace internals (001–005 outer locks unchanged) */
  workspaceSplitLeft: '65%',
  workspaceSplitRight: '35%',
  workspaceContextW: '340px',
  workspaceProgressDot: '20px',
  workspaceProgressGap: '12px',
  workspaceStatusH: '24px',
  workspaceCompleteRing: '72px',
  workspaceFieldGap: '24px',
  workspaceAnimMs: '120ms',
  workspaceAnimSlide: '8px',

  /* MODULE_007 — AI Copilot panel internals (001–006 outer locks unchanged) */
  aiSuggestSectionH: '260px',
  aiSuggestCardH: '52px',
  aiSuggestCardPad: '12px',
  aiAnalysisH: '120px',
  aiMemoryH: '120px',
  aiStatusH: '24px',
  aiTitleSize: '16px',

  font: "Inter, 'Inter var', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const

export const LIST_HERO_BG = '/images/list/list-hero-background.png'
export const LIST_HERO_ART = '/images/list/list-hero-artwork.png'

export type ListIntent =
  | 'import-token'
  | 'create-token'
  | 'claim-project'
  | 'create-project'
  | 'ai-assistant'

export const LIST_INTENTS: readonly ListIntent[] = [
  'import-token',
  'create-token',
  'claim-project',
  'create-project',
  'ai-assistant',
] as const

/** Create Token factory is not certified-operational on List — honest Coming Soon. */
export const LIST_CREATE_TOKEN_AVAILABLE = false
