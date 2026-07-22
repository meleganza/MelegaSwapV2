/**
 * DS001.1 — Global Design System · Button foundations.
 */
import { ds001Colors } from './colors'
import { ds001Radius } from './radius'
import { ds001Layout } from './layout'
import { ds001FontSize, ds001FontWeight } from './typography'

export const ds001Buttons = {
  height: ds001Layout.buttonHeight,
  radius: ds001Radius.button,
  fontSize: ds001FontSize.nav,
  fontWeight: ds001FontWeight.semibold,

  primary: {
    background: ds001Colors.primaryGold,
    color: ds001Colors.background,
    hoverBackground: ds001Colors.hoverGold,
    pressedBackground: ds001Colors.pressedGold,
    disabledBackground: ds001Colors.disabled,
    disabledColor: ds001Colors.disabledText,
  },
  secondary: {
    background: 'transparent',
    border: `1px solid ${ds001Colors.border}`,
    hoverBackground: '#1A1A1A',
  },
  ghost: {
    background: 'transparent',
    border: 'none',
    hoverBackground: ds001Colors.ghostHover,
  },
} as const

export type Ds001Buttons = typeof ds001Buttons
