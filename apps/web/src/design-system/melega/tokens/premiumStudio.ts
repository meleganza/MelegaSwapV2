/**
 * R200 premium consistency — canonical visual language.
 * DS001.1 foundations override conflicting legacy values.
 * Header chrome geometry is NOT applied here (reserved for DS001.2).
 */
import { ds001Colors, ds001GoldSoft } from './ds001/colors'
import { ds001FontFamily, ds001TypeRoles } from './ds001/typography'
import { ds001Layout } from './ds001/layout'
import { ds001Radius } from './ds001/radius'
import { ds001Shadows } from './ds001/shadows'
import { ds001Spacing } from './ds001/spacing'

export const PREMIUM_FONT_DISPLAY = ds001FontFamily.display
export const PREMIUM_FONT_BODY = ds001FontFamily.body

export const premiumStudioLayout = {
  contentMax: ds001Layout.contentMaxWidth,
  contentPaddingX: ds001Layout.pagePaddingX,
  contentPaddingTop: ds001Layout.pagePaddingTopBelowHeader,
  contentPaddingBottom: ds001Layout.pagePaddingBottom,
  /** 28px was outside DS001.1 allow-list → snapped to 32. */
  sectionGap: ds001Spacing[32],
  cardGap: ds001Spacing[20],
  cardRadius: ds001Radius.card,
  cardPadding: ds001Layout.cardPadding,
  btnHeight: ds001Layout.buttonHeight,
  btnRadius: ds001Radius.button,
  tagHeight: '36px',
  tagRadius: ds001Radius.badge,
  actionGroupGap: ds001Spacing[12],
  actionGroupRadius: ds001Radius.button,
  actionGroupPadding: ds001Spacing[12],
  kpiHeight: '120px',
  timelineRowHeight: '68px',
  timelineDotSize: ds001Spacing[12],
  mobileBottomPad: 'calc(96px + env(safe-area-inset-bottom, 0px))',
  mobileBreakpoint: '390px',
  stackBreakpoint: '1024px',
  hoverTransition: ds001Layout.cardTransition,
} as const

export const premiumStudioColors = {
  canvas: ds001Colors.background,
  card: ds001Colors.surface,
  cardBorder: ds001Colors.border,
  cardBorderHover: ds001Colors.cardHoverBorder,
  gold: ds001Colors.primaryGold,
  green: ds001Colors.success,
  red: ds001Colors.danger,
  orange: ds001Colors.warning,
  muted: ds001Colors.muted,
  secondary: ds001Colors.secondaryText,
  subtitle: ds001Colors.secondaryText,
  summary: ds001Colors.secondaryText,
  text: ds001Colors.primaryText,
  divider: ds001Colors.divider,
  goldBg: ds001GoldSoft,
  surfaceElevated: ds001Colors.surfaceElevated,
  info: ds001Colors.info,
} as const

export const premiumStudioType = {
  sectionTitle: ds001TypeRoles.h2.size,
  pageSubtitle: ds001TypeRoles.body.size,
  cardTitle: ds001TypeRoles.bodyLarge.size,
  metric: ds001TypeRoles.h2.size,
  body: ds001TypeRoles.body.size,
  caption: ds001TypeRoles.caption.size,
  timelineTitle: ds001TypeRoles.body.size,
  timelineSub: ds001TypeRoles.caption.size,
} as const

export const premiumStudioShadows = {
  default: ds001Shadows.default,
  hover: ds001Shadows.hover,
  modal: ds001Shadows.modal,
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
