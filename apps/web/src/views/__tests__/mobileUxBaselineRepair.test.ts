import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB = path.resolve(__dirname, '../../..')

function load(relativePath: string) {
  return readFileSync(path.join(WEB, relativePath), 'utf8')
}

describe('mobile UX repair built on the approved production baseline', () => {
  it('keeps one canonical desktop wallet surface and one mobile MARCO control', () => {
    const shell = load('src/app-shell/MelegaAppShell.tsx')
    const header = load('src/design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx')
    const styles = load('src/app-shell/AppShellStyles.tsx')

    expect(shell).toContain('<MarcoConnect size="icon" activation="mobile" />')
    expect(shell).not.toContain("import UserMenu from 'components/Menu/UserMenu'")
    expect(header).toContain('<MarcoConnect size="navbar" activation="desktop" />')
    expect(header).not.toContain("import UserMenu from 'components/Menu/UserMenu'")
    expect(styles).toContain("[data-testid='marco-connect']")
    expect(styles).toContain('flex: 0 0 40px !important')
  })

  it('contains Farms and Liquidity artwork inside their mobile grid columns', () => {
    const farms = load('src/views/FarmsStudio/modules/FarmsHeroModule.tsx')
    const liquidity = load('src/views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx')

    expect(farms).toContain("[data-testid='farms-hero-artwork']")
    expect(farms).toContain('overflow: hidden')
    expect(liquidity).toContain("[data-testid='liquidity-hero-artwork']")
    expect(liquidity).toContain('max-width: 100% !important')
  })

  it('fits the vertical Featured Project card inside the Swap mobile hero', () => {
    const hero = load('src/views/Trade/components/TradeSwapHero.tsx')

    expect(hero).toContain('& > section > div > *')
    expect(hero).toContain('flex: 0 0 100%')
    expect(hero).toContain('max-width: 100%')
  })

  it('keeps every Boost checkout step within a safe mobile modal surface', () => {
    const checkout = load('src/views/shared/monetization/CommercialCheckoutModal.tsx')

    expect(checkout).toContain('@media (max-width: 639px)')
    expect(checkout).toContain('min-height: 108px')
    expect(checkout).toContain('min-height: 116px')
    expect(checkout).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
  })
})
