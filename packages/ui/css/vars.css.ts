import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css'
import deepmerge from 'deepmerge'
import { Mode, tokens } from '../tokens'
import type { Theme } from './types'

const getVarName = (_value: string | null, path: string[]) => path.join('-')

const baseTokens: Omit<Theme, 'colors'> = tokens
const baseVars = createGlobalThemeContract(baseTokens, getVarName)
createGlobalTheme(':root', baseVars, baseTokens)

const makeColorScheme = (mode: Mode = 'light') => {
  const colors = {
    ...tokens.colors[mode],
    background: '#000000',
    backgroundAlt: '#000000',
    backgroundAltBlur: '#000000',
    backgroundDisabled: '#3c3742',
    textSubtle: '#b8add2',
    textDisabled: '#666171',
    dropdownDeep: '#100c18',
    cardBorder: '#ffffff',
    secondary: '#ffffff',
    tertiary: '#353547',
    bg: '#31d0aa',
    dropdown: '#000000',
    disabled: '#ffffff',
    input: '#372f47',
    primaryBright: '#ffffff',
    spec: '#aba0c4',
    gradientBubblegum: '#aba0c4',
    gradientBubblegumHover: '#8b81a2',
    modalBackground: "#000000",
    text99: "#52329288", // Modal Overlay
    poolDivider: "#524b63",
  }

  return {
    colors,
  }
}

const modeTokens = makeColorScheme('light')
export const modeVars = createGlobalThemeContract(modeTokens, getVarName)
createGlobalTheme('[data-theme="light"]', modeVars, modeTokens)
createGlobalTheme('[data-theme="dark"]', modeVars, makeColorScheme('dark'))

type BaseVars = typeof baseVars
type ModeVars = typeof modeVars
type Vars = BaseVars & ModeVars
export const vars = deepmerge(baseVars, modeVars) as Vars
