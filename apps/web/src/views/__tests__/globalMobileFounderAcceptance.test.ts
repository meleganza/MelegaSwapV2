/**
 * Global Mobile Founder Acceptance — source locks (presentation only).
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { mobileDensity } from 'design-system/melega/tokens/mobileDensity'

const WEB = path.resolve(__dirname, '../../..')
const ROOT = path.resolve(WEB, '../..')

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

describe('MELEGA_DEX_V1_GLOBAL_MOBILE_FOUNDER_ACCEPTANCE', () => {
  it('exposes shared mobile density tokens in target ranges', () => {
    expect(mobileDensity.pagePadX).toBe('16px')
    expect(mobileDensity.btnPrimaryH).toBe('48px')
    expect(mobileDensity.fabSize).toBe('48px')
    expect(mobileDensity.touchMin).toBe('44px')
    expect(mobileDensity.insightsCardMinH).toBe('108px')
    expect(existsSync(path.join(WEB, 'src/design-system/melega/tokens/mobileDensity.ts'))).toBe(true)
  })

  it('Farms hero uses local token logos with initials fallback (no pancake CDN)', () => {
    const art = load('src/views/FarmsStudio/modules/FarmsHeroArtwork.tsx')
    expect(art).toContain('/images/56/tokens/')
    expect(art).toContain('onError')
    expect(art).toContain('TokenFallback')
    expect(art).not.toContain('tokens.pancakeswap.finance')
    expect(art).toContain('mobileArtworkMaxH')
  })

  it('Farms hero mobile height is materially reduced', () => {
    const tokens = load('src/views/FarmsStudio/modules/farmsHeroTokens.ts')
    expect(tokens).toContain("mobileArtworkMaxH: '148px'")
    expect(tokens).toContain("mobileHeroMaxH: '520px'")
    expect(tokens).toContain("mobileTitleSize: '36px'")
  })

  it('Liquidity Insights keeps 2×2 at phone widths', () => {
    const mod = load('src/views/LiquidityStudio/modules/LiquidityInsightsModule.tsx')
    expect(mod).toContain('repeat(2, minmax(0, 1fr))')
    expect(mod).toContain('max-width: 359px')
    expect(mod).toContain('min-height: 108px')
    // Must not force single-column at the mobileBreak (767)
    const mobileBlock = mod.slice(mod.indexOf('mobileBreak'))
    expect(mobileBlock).toContain('repeat(2, minmax(0, 1fr))')
  })

  it('Home KPI rail stays 2-column on mobile with compact values', () => {
    const home = load('src/views/HomeTrade/DexHomeScreen.tsx')
    expect(home).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    expect(home).toContain('min-height: 96px')
    expect(home).toContain('text-overflow: ellipsis')
  })

  it('Top Farms rows and ecosystem stay compact on mobile', () => {
    const home = load('src/views/HomeTrade/DexHomeScreen.tsx')
    expect(home).toContain('min-height: 48px')
    const eco = load('src/views/HomeTrade/ExploreMelegaEcosystem.tsx')
    expect(eco).toContain('height: 68px')
    expect(eco).not.toMatch(/@media \(max-width: 430px\)[\s\S]{0,80}grid-template-columns: 1fr/)
  })

  it('Featured carousel uses intentional snap without page overflow', () => {
    const rail = load('src/views/HomeTrade/FeaturedProjectsRail.tsx')
    expect(rail).toContain('scroll-snap-type: x mandatory')
    expect(rail).toContain('scroll-snap-stop: always')
    expect(rail).toContain('overscroll-behavior-x: contain')
    expect(rail).toContain('calc(100vw - 48px)')
  })

  it('floating back-to-top sits above bottom nav with safe area', () => {
    const fab = readFileSync(
      path.join(ROOT, 'packages/uikit/src/components/ScrollToTopButton/ScrollToTopButtonV2.tsx'),
      'utf8',
    )
    expect(fab).toContain('72px + env(safe-area-inset-bottom')
    expect(fab).toContain('passive: true')
    expect(fab).toContain('Back to top')
    expect(fab).toContain('z-index: 180')
    expect(fab).toContain('width: 48px')
  })

  it('shell + bottom nav clear content with safe-area', () => {
    const shell = load('src/app-shell/MelegaAppShell.tsx')
    expect(shell).toContain("MOBILE_HEADER_H = '56px'")
    expect(shell).toContain("MOBILE_BOTTOM_NAV_H = '64px'")
    expect(shell).toContain('100dvh')
    expect(shell).toContain('safe-area-inset-bottom')
    const nav = load('src/design-system/melega/components/BottomNavigation/MelegaBottomNavigation.tsx')
    expect(nav).toContain('64px + env(safe-area-inset-bottom')
  })

  it('wallet modal wraps content with compact mobile padding', () => {
    const modal = readFileSync(path.join(ROOT, 'packages/ui-wallets/src/WalletModal.tsx'), 'utf8')
    expect(modal).toContain("px=\"20px\"")
    expect(modal).toContain('safe-area-inset-bottom')
    expect(modal).toContain('48dvh')
    expect(modal).toContain("textAlign: 'left'")
  })

  it('ticker height reduced and synced to 56px header', () => {
    const bar = load('src/app-shell/GlobalTrendingBar.tsx')
    expect(bar).toContain("TRENDING_BAR_MOBILE_H = '36px'")
    expect(bar).toContain("MOBILE_HEADER_H = '56px'")
  })

  it('Builder stepper densifies on mobile without changing deployment honesty', () => {
    const card = load('src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('BUILDER_STEPS')
    expect(card).toContain('LbDeployReadinessPanel')
    expect(card).toContain('@media (max-width: 767px)')
    expect(card).toContain('Liquidity Building contracts not deployed')
  })

  it('Add Liquidity densifies token boxes and metrics on mobile', () => {
    const add = load('src/views/LiquidityStudio/modules/LiquidityAddModule.tsx')
    expect(add).toContain('font-size: 22px')
    expect(add).toContain('padding: 10px 12px')
    expect(add).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))')
  })

  it('does not alter Liquidity Builder deployment binding nulls', () => {
    const cfg = load('src/config/constants/liquidityBuildingDeployment.ts')
    expect(cfg).toContain('lbFactory: null')
    expect(cfg).toContain('lbAuthorizer: null')
    expect(cfg).toContain('lbFeeSink: null')
  })

  it('respects prefers-reduced-motion on FAB and Farms artwork', () => {
    const fab = readFileSync(
      path.join(ROOT, 'packages/uikit/src/components/ScrollToTopButton/ScrollToTopButtonV2.tsx'),
      'utf8',
    )
    expect(fab).toContain('prefers-reduced-motion')
    const art = load('src/views/FarmsStudio/modules/FarmsHeroArtwork.tsx')
    expect(art).toContain('prefers-reduced-motion')
  })
})
