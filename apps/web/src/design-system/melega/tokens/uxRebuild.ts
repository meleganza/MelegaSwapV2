/**
 * Melega DEX Complete UX Rebuild — shared visual tokens.
 * Applied across Home, Liquidity, Farms, Pools, List, Passport, Project Page.
 */
export const uxRebuildColors = {
  pageBg: '#050505',
  headerBg: 'rgba(5,5,5,0.96)',
  card: '#101010',
  cardElevated: '#151515',
  input: '#121212',
  hover: '#181818',
  borderStrong: '#2A2A2A',
  border: '#1F1F1F',
  divider: 'rgba(255,255,255,0.06)',
  text: '#F5F5F5',
  secondary: '#A8A8A8',
  muted: '#747474',
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
  card: '0 10px 32px rgba(0,0,0,0.26)',
  elevated: '0 18px 48px rgba(0,0,0,0.36)',
  goldCta: '0 8px 28px rgba(221,185,47,0.14)',
} as const

export const uxRebuildFont =
  "Inter, 'Inter var', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
