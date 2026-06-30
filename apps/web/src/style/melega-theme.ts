import { dark } from '@pancakeswap/uikit'
import { melegaOperational as t } from 'ui/tokens'

const surfaceHeader = t.surfaceSecondary

/** Melega DEX presentation theme — extends UIKit dark without touching business logic. */
export const melegaDarkTheme = {
  ...dark,
  colors: {
    ...dark.colors,
    primary: t.gold,
    primaryBright: t.goldHighlight,
    secondary: t.textSecondary,
    tertiary: t.surfaceSecondary,
    background: t.bg,
    backgroundAlt: t.surface,
    backgroundAlt2: t.surfaceSecondary,
    text: t.text,
    textSubtle: t.textSecondary,
    textDisabled: '#6B6B6B',
    failure: '#EF4444',
    success: t.success,
    warning: t.gold,
    cardBorder: t.border,
    input: t.surfaceSecondary,
    inputSecondary: t.surface,
    dropdown: t.surface,
    dropdownDeep: t.bg,
    modal: t.surface,
    modalBackground: 'rgba(0, 0, 0, 0.78)',
    gradientBubblegum: surfaceHeader,
    gradientCardHeader: surfaceHeader,
    gradientBlue: surfaceHeader,
    gradientViolet: surfaceHeader,
    gradientVioletAlt: surfaceHeader,
    gradientInverseBubblegum: surfaceHeader,
    gradientBold: `linear-gradient(135deg, ${t.gold} 0%, ${t.goldHighlight} 100%)`,
    gradientGold: `linear-gradient(135deg, ${t.gold} 0%, ${t.goldHighlight} 100%)`,
    gradientBakcground: t.bg,
  },
  card: {
    ...dark.card,
    background: t.surface,
    cardHeaderBackground: {
      default: surfaceHeader,
      blue: surfaceHeader,
      bubblegum: surfaceHeader,
      violet: surfaceHeader,
    },
  },
  nav: {
    background: t.bg,
  },
  modal: {
    ...dark.modal,
    background: t.surface,
  },
  toggle: {
    ...dark.toggle,
    handleBackground: t.surfaceSecondary,
  },
  alert: {
    ...dark.alert,
  },
}

export default melegaDarkTheme
