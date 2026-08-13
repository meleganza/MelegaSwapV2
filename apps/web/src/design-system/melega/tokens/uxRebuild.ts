/**
 * Melega DEX Complete UX Rebuild — shared visual tokens.
 * Applied across Home, Liquidity, Farms, Pools, List, Passport, Project Page.
 */
export const uxRebuildColors = {
  pageBg: '#050607',
  headerBg: 'rgba(5,6,7,0.92)',
  card: '#0D0F11',
  cardElevated: '#14171A',
  input: '#121518',
  hover: '#191D21',
  borderStrong: 'rgba(255,255,255,0.13)',
  border: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.07)',
  text: '#F5F5F5',
  secondary: '#A7ADB4',
  muted: '#737B84',
  gold: '#DDB92F',
  goldHover: '#E8C83B',
  goldDarkSurface: '#1A170A',
  goldBorder: '#3A2D0A',
  positive: '#16D977',
  warning: '#F4B942',
  error: '#F04F5F',
  newViolet: '#7C3AED',
  bodySoft: '#C4C4C4',
} as const

export const uxRebuildLayout = {
  contentMax: '1376px',
  pageInset: '32px',
  sectionGap: '24px',
  cardGap: '12px',
  headerHeight: '72px',
  mobileHeaderHeight: '60px',
  bottomNavHeight: '68px',
  gutter: '24px',
} as const

export const uxRebuildRadius = {
  control: '8px',
  input: '10px',
  button: '12px',
  card: '16px',
  panel: '20px',
  hero: '24px',
  pill: '999px',
} as const

export const uxRebuildShadow = {
  card: '0 18px 52px rgba(0,0,0,0.28)',
  elevated: '0 28px 80px rgba(0,0,0,0.48)',
  goldCta: '0 10px 30px rgba(221,185,47,0.16)',
} as const

export const uxRebuildFont = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const uxRebuildDisplayFont = "'Melega Relative', 'Inter', system-ui, sans-serif"

export const uxRebuildMotion = {
  fast: '140ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  standard: '180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  reveal: '420ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const
