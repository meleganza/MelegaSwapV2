/**
 * Melega DEX Complete UX Rebuild — shared visual tokens.
 * Applied across Home, Liquidity, Farms, Pools, List, Passport, Project Page.
 */
export const uxRebuildColors = {
  pageBg: '#F7F6F2',
  headerBg: 'rgba(247,246,242,0.94)',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  input: '#FBFAF7',
  hover: '#F0EEE7',
  borderStrong: '#D8D4C8',
  border: '#E5E2D9',
  divider: '#E5E2D9',
  text: '#171817',
  secondary: '#72736E',
  muted: '#92938D',
  gold: '#F3C928',
  goldHover: '#E5B919',
  goldDarkSurface: '#FFF2BD',
  goldBorder: '#E7C53E',
  positive: '#21865A',
  warning: '#F4B942',
  error: '#C84545',
  newViolet: '#7C3AED',
  bodySoft: '#5F605C',
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
  card: '0 16px 44px rgba(23,24,23,0.07)',
  elevated: '0 24px 72px rgba(23,24,23,0.12)',
  goldCta: '0 10px 30px rgba(243,201,40,0.18)',
} as const

export const uxRebuildFont = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const uxRebuildDisplayFont = "'Melega Relative', 'Inter', system-ui, sans-serif"

export const uxRebuildMotion = {
  fast: '140ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  standard: '180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  reveal: '420ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const
