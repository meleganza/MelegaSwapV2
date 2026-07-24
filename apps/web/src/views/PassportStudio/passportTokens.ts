/**
 * PASSPORT_ARCHITECTURE_000 — MARCO Passport design tokens + geometry contracts.
 * Visual source of truth: founder-approved mockup (docs/runtime/passport-architecture-000/).
 * Illustrative mockup numbers are NEVER production data.
 */
export const passportOne = {
  /* Product */
  productName: 'MARCO Passport',
  navLabel: 'Passport',
  route: '/passport',

  /* Page canvas */
  pageBg: '#050505',
  card: '#101010',
  elevated: '#151515',
  input: '#121212',
  border: '#1F1F1F',
  borderStrong: '#2A2A2A',
  text: '#F5F5F5',
  secondary: '#A8A8A8',
  muted: '#747474',
  gold: '#DDB92F',
  goldHover: '#E8C83B',
  positive: '#16D977',
  warning: '#F4B942',
  error: '#F04F5F',

  canvas: 1440,
  contentMax: '1376px',
  pageInset: '32px',
  topAfterTrending: '24px',
  moduleGap: '16px',
  sectionGapLarge: '24px',
  pageBottomPad: '48px',
  radius: '16px',
  radiusCompact: '12px',

  /* MODULE 001 geometry targets (desktop 1440) — MODULE_001 locks right region 664 */
  heroW: '1376px',
  heroH: '360px',
  heroModuleRadius: '18px',
  heroModulePad: '28px',
  heroModuleBorder: '1px solid rgba(255,255,255,0.09)',
  heroModuleBg: '#090B0E',
  heroModuleShadow: '0 22px 60px rgba(0,0,0,0.38)',
  heroLeftW: '616px',
  heroGap: '40px',
  heroRightW: '664px',
  identityCardW: '640px',
  identityCardH: '304px',
  identityCardRadius: '20px',
  heroPrimaryCtaW: '186px',
  heroSecondaryCtaW: '124px',
  heroCtaH: '44px',

  portfolioW: '1376px',
  portfolioH: '176px',

  assetsW: '1376px',
  assetsH: '176px',

  projectsW: '1376px',
  projectsH: '176px',

  liquidityW: '1376px',
  liquidityMinH: '232px',

  bottomColW: '680px',
  bottomGap: '16px',

  /* Mobile */
  mobileCanvas: 390,
  mobileContentW: '358px',
  mobilePadX: '16px',
  mobileMinTextCol: '280px',
  mobileTouchMin: '44px',

  font: "Inter, 'Inter var', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const

/** Locked module order — never reorder. */
export const PASSPORT_MODULE_ORDER = [
  '001-hero-identity',
  '002-portfolio',
  '003-assets',
  '004-projects',
  '005-liquidity',
  '006-activity',
  '007-security',
  '008-mobile',
  '009-polish',
] as const

export type PassportModuleId = (typeof PASSPORT_MODULE_ORDER)[number]

/** Forbidden product names in Passport UI copy. */
export const PASSPORT_FORBIDDEN_LABELS = [
  'Melega Passport',
  'Passport Wallet',
  'Melega Wallet',
  'user wallet',
  'exchange account',
] as const

export const PASSPORT_MOCKUP = {
  relativePath: 'apps/web/docs/runtime/passport-architecture-000/founder-approved-passport-mockup.png',
  sha256: '14e0f0e570583aa05d06dc67b1e3f327bf890a17f6bd06b5787664bd699024df',
  bytes: 147547,
  width: 844,
  height: 1024,
  /** Asset bytes are JPEG JFIF despite .png filename (Founder export as provided). */
  format: 'jpeg',
} as const
