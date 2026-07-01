import { describe, expect, it } from 'vitest'
import { melegaTokens } from '../tokens'
import { breakpoints } from '../theme'

describe('Melega design system tokens (DS-001)', () => {
  it('exposes canonical color palette', () => {
    expect(melegaTokens.colors.canvas).toBe('#050505')
    expect(melegaTokens.colors.gold).toBe('#D4AF37')
    expect(melegaTokens.colors.green).toBe('#22C55E')
  })

  it('uses Inter for body typography', () => {
    expect(melegaTokens.typography.fontFamily.body).toContain('Inter')
  })

  it('defines spacing on 4px grid', () => {
    expect(melegaTokens.spacing[1]).toBe('4px')
    expect(melegaTokens.spacing[4]).toBe('16px')
  })

  it('defines responsive breakpoints', () => {
    expect(breakpoints.mobile).toBe(390)
    expect(breakpoints.tablet).toBe(1024)
    expect(breakpoints.desktop).toBe(1440)
  })

  it('defines animation tokens only from spec', () => {
    expect(melegaTokens.animation.hover).toBe('150ms ease')
    expect(melegaTokens.animation.ticker).toBe('45s linear')
  })
})
