/** R200 premium consistency — canonical visual language (Command Center · Projects · Radar). */
export const PREMIUM_FONT_DISPLAY = "'Orbitron', sans-serif"
export const PREMIUM_FONT_BODY = "'Inter', sans-serif"

export const premiumStudioLayout = {
  contentMax: '1180px',
  contentPaddingX: '32px',
  contentPaddingTop: '24px',
  contentPaddingBottom: '48px',
  sectionGap: '28px',
  cardGap: '20px',
  cardRadius: '20px',
  cardPadding: '24px',
  btnHeight: '48px',
  btnRadius: '12px',
  tagHeight: '36px',
  tagRadius: '999px',
  actionGroupGap: '12px',
  actionGroupRadius: '12px',
  actionGroupPadding: '12px',
  kpiHeight: '120px',
  timelineRowHeight: '68px',
  timelineDotSize: '12px',
  mobileBottomPad: 'calc(96px + env(safe-area-inset-bottom, 0px))',
  mobileBreakpoint: '390px',
  stackBreakpoint: '1024px',
  hoverTransition: '180ms',
} as const

export const premiumStudioColors = {
  canvas: '#050505',
  card: '#141414',
  cardBorder: '#2A2A2A',
  cardBorderHover: '#D4AF37',
  gold: '#D4AF37',
  green: '#1BE77A',
  red: '#FF4D4F',
  orange: '#FF9F43',
  muted: '#8F8F8F',
  secondary: '#A3A3A3',
  subtitle: '#A3A3A3',
  summary: '#D8D8D8',
  text: '#FFFFFF',
  divider: '#262626',
  goldBg: 'rgba(212,175,55,0.14)',
} as const

export const premiumStudioType = {
  sectionTitle: '32px',
  pageSubtitle: '16px',
  cardTitle: '18px',
  metric: '36px',
  body: '14px',
  caption: '13px',
  timelineTitle: '15px',
  timelineSub: '13px',
} as const

export const PREMIUM_EMPTY = '—' as const

const PREMIUM_UNAVAILABLE = 'Unavailable' as const

export function isPremiumEmptyValue(value?: string | null): boolean {
  return !value || value === PREMIUM_EMPTY || value === PREMIUM_UNAVAILABLE
}

/** Maps runtime unavailable strings to canonical premium empty display. */
export function premiumUiValue(value?: string | null): string {
  if (!value) return PREMIUM_EMPTY
  if (value === PREMIUM_UNAVAILABLE || value === PREMIUM_EMPTY) return PREMIUM_EMPTY
  if (value.startsWith(PREMIUM_UNAVAILABLE)) return PREMIUM_EMPTY
  return value
}
