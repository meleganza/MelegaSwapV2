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

  font: "Inter, 'Inter var', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const

export const LIST_HERO_BG = '/images/list/list-hero-background.png'
export const LIST_HERO_ART = '/images/list/list-hero-artwork.png'
