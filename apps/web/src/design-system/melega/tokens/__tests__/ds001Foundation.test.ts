import { describe, expect, it } from 'vitest'
import {
  DS001_SPACING_SCALE,
  assertDs001Spacing,
  ds001Buttons,
  ds001Colors,
  ds001Icons,
  ds001Layout,
  ds001Radius,
  ds001Shadows,
  ds001Tokens,
  ds001TypeRoles,
  snapToDs001Spacing,
} from '../ds001'

describe('DS001.1 foundation tokens', () => {
  it('locks color SSOT values from the specification', () => {
    expect(ds001Colors.primaryGold).toBe('#F4C430')
    expect(ds001Colors.hoverGold).toBe('#FFD34D')
    expect(ds001Colors.pressedGold).toBe('#D9A500')
    expect(ds001Colors.background).toBe('#080808')
    expect(ds001Colors.surface).toBe('#121212')
    expect(ds001Colors.surfaceElevated).toBe('#181818')
    expect(ds001Colors.border).toBe('#2A2A2A')
    expect(ds001Colors.divider).toBe('#202020')
    expect(ds001Colors.primaryText).toBe('#FFFFFF')
    expect(ds001Colors.secondaryText).toBe('#B5B5B5')
    expect(ds001Colors.muted).toBe('#7A7A7A')
    expect(ds001Colors.success).toBe('#22C55E')
    expect(ds001Colors.warning).toBe('#F59E0B')
    expect(ds001Colors.danger).toBe('#EF4444')
    expect(ds001Colors.info).toBe('#3B82F6')
  })

  it('locks typography roles', () => {
    expect(ds001TypeRoles.hero).toEqual({ size: '64px', weight: 700, lineHeight: '72px' })
    expect(ds001TypeRoles.h1).toEqual({ size: '48px', weight: 600, lineHeight: '56px' })
    expect(ds001TypeRoles.h2).toEqual({ size: '36px', weight: 600, lineHeight: '44px' })
    expect(ds001TypeRoles.h3).toEqual({ size: '28px', weight: 600, lineHeight: '34px' })
    expect(ds001TypeRoles.body).toEqual({ size: '16px', weight: 400, lineHeight: '24px' })
    expect(ds001TypeRoles.caption).toEqual({ size: '13px', weight: 400, lineHeight: '18px' })
    expect(ds001TypeRoles.smallLabel.letterSpacing).toBe('0.04em')
  })

  it('allows only the DS001.1 spacing scale', () => {
    expect([...DS001_SPACING_SCALE]).toEqual([4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128])
    expect(snapToDs001Spacing(28)).toBe(32)
    expect(snapToDs001Spacing(6)).toBe(8) // tie → round up
    expect(() => assertDs001Spacing(28)).toThrow(/allow-list/)
    expect(() => assertDs001Spacing(32)).not.toThrow()
  })

  it('locks radius / shadow / button / icon foundations', () => {
    expect(ds001Radius).toMatchObject({
      card: '20px',
      input: '16px',
      button: '14px',
      badge: '999px',
      modal: '24px',
    })
    expect(ds001Shadows.default).toBe('none')
    expect(ds001Buttons.height).toBe('48px')
    expect(ds001Buttons.radius).toBe('14px')
    expect(ds001Icons.library).toBe('lucide')
    expect(ds001Icons.strokeWidth).toBe(1.75)
  })

  it('stores DS001.2 header geometry tokens', () => {
    expect(ds001Layout.headerHeight).toBe('72px')
    expect(ds001Layout.headerZIndex).toBe(1000)
    expect(ds001Layout.headerLogoBlockWidth).toBe('180px')
    expect(ds001Layout.headerLogoSize).toBe('36px')
    expect(ds001Layout.contentMaxWidth).toBe('1380px')
    expect(ds001Layout.pagePaddingTopBelowHeader).toBe('32px')
    expect(ds001Tokens.mission).toBe('DS001.1')
  })
})
