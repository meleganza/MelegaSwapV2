import { describe, expect, it } from 'vitest'
import { melegaTokens, ds001Tokens, ds001Colors, ds001Spacing, ds001Radius, ds001Shadows } from '../tokens'
import { breakpoints } from '../theme'

describe('Melega design system tokens (DS001.1)', () => {
  it('exposes DS001.1 canonical color palette', () => {
    expect(melegaTokens.colors.canvas).toBe('#080808')
    expect(melegaTokens.colors.gold).toBe('#F4C430')
    expect(melegaTokens.colors.green).toBe('#22C55E')
    expect(ds001Colors.primaryGold).toBe('#F4C430')
    expect(ds001Colors.background).toBe('#080808')
  })

  it('uses Sora (Inter fallback) for body typography', () => {
    expect(melegaTokens.typography.fontFamily.body).toContain('Sora')
    expect(melegaTokens.typography.fontFamily.body).toContain('Inter')
  })

  it('defines spacing on DS001.1 allow-list', () => {
    expect(melegaTokens.spacing[1]).toBe('4px')
    expect(melegaTokens.spacing[4]).toBe('16px')
    expect(melegaTokens.spacing[24]).toBe('96px')
    expect(melegaTokens.spacing[32]).toBe('128px')
    expect(ds001Spacing[32]).toBe('32px')
  })

  it('defines DS001.1 semantic radii', () => {
    expect(ds001Radius.card).toBe('20px')
    expect(ds001Radius.input).toBe('16px')
    expect(ds001Radius.button).toBe('14px')
    expect(ds001Radius.badge).toBe('999px')
    expect(ds001Radius.modal).toBe('24px')
    expect(melegaTokens.radius.panel).toBe('20px')
  })

  it('defines DS001.1 shadows without glow', () => {
    expect(ds001Shadows.default).toBe('none')
    expect(ds001Shadows.hover).toBe('0 8px 24px rgba(0,0,0,0.18)')
    expect(ds001Shadows.modal).toBe('0 24px 80px rgba(0,0,0,0.45)')
  })

  it('exposes foundation barrel on melegaTokens', () => {
    expect(melegaTokens.foundation).toBe(ds001Tokens)
    expect(ds001Tokens.version).toBe('1.0')
    expect(ds001Tokens.layout.contentMaxWidth).toBe('1380px')
    expect(ds001Tokens.layout.headerHeight).toBe('72px')
  })

  it('defines responsive breakpoints', () => {
    expect(breakpoints.mobile).toBe(390)
    expect(breakpoints.tablet).toBe(1024)
    expect(breakpoints.desktop).toBe(1440)
  })

  it('defines animation tokens aligned to DS001.1 card hover', () => {
    expect(melegaTokens.animation.hover).toBe('180ms ease')
    expect(melegaTokens.animation.ticker).toBe('42s linear')
  })
})
