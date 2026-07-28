/**
 * LIQUIDITY_V1_INFORMATION_ARCHITECTURE_REDESIGN — presentation order gates.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB = path.resolve(__dirname, '../../../../')

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

describe('LIQUIDITY_V1 Information Architecture Redesign', () => {
  it('orders Hero → Actions workspace → Positions → Insights → Explore', () => {
    const page = load('src/pages/liquidity.tsx')
    const order = [
      'LiquidityHeroModule',
      'LiquidityActionsModule',
      'LiquidityMyPositionsModule',
      'LiquidityInsightsModule',
      'LiquidityPoolDiscoveryModule',
    ]
    let prev = -1
    for (const name of order) {
      const idx = page.indexOf(`<${name}`)
      expect(idx, name).toBeGreaterThan(prev)
      prev = idx
    }
    expect(page).not.toContain('<LiquidityAddModule')
    expect(page).toContain('data-liquidity-ia="provider-first-v1"')
    expect(page).toContain('LiquidityRuntimeProvider')
  })

  it('Actions workspace embeds expanded forms (not nav-only cards)', () => {
    const actions = load('src/views/LiquidityStudio/modules/LiquidityActionsModule.tsx')
    expect(actions).toContain('LiquidityAddModule')
    expect(actions).toContain('embedded')
    expect(actions).toContain('LiquidityBuildingCard')
    expect(actions).toContain('forceExpanded')
    expect(actions).toContain('liquidity-actions-ai-new-badge')
    expect(actions).not.toContain('JourneySteps')
  })

  it('Hero keeps a single Add Liquidity CTA into the form anchor', () => {
    const hero = load('src/views/LiquidityStudio/modules/LiquidityHeroModule.tsx')
    const tokens = load('src/views/LiquidityStudio/modules/liquidityHeroTokens.ts')
    expect(hero).toContain('liquidity-hero-cta-add')
    expect(hero).not.toContain('liquidity-hero-journeys')
    expect(tokens).toContain("addLiquidityHref: '#add-liquidity'")
  })

  it('Explore Pools uses dense card geometry for market browsing', () => {
    const tokens = load('src/views/LiquidityStudio/modules/liquidityPoolDiscoveryTokens.ts')
    const card = load('src/views/LiquidityStudio/modules/LiquidityPoolDiscoveryCard.tsx')
    const module = load('src/views/LiquidityStudio/modules/LiquidityPoolDiscoveryModule.tsx')
    expect(tokens).toContain("cardMinH: '158px'")
    expect(tokens).toContain('desktopColumns: 5')
    expect(tokens).toContain('wideColumns: 6')
    expect(card).toContain('data-discovery-density="compact"')
    expect(module).toContain('repeat(5, minmax(0, 1fr))')
    expect(module).toContain('min-width: 1920px')
  })

  it('Insights shows exactly four factual cards without mounting both modules', () => {
    const insights = load('src/views/LiquidityStudio/modules/LiquidityInsightsModule.tsx')
    expect(insights).toContain('Liquidity Insights')
    expect(insights).toContain('useLiquidityMarketSnapshot')
    expect(insights).toContain('useLiquidityAnalytics')
    expect(insights).not.toContain('LiquidityMarketSnapshotModule')
    expect(insights).not.toContain('LiquidityAnalyticsModule')
    expect(insights).toContain('data-liquidity-insights="four-cards"')
    expect(insights).toContain('Total Liquidity')
    expect(insights).toContain('24H Volume')
    expect(insights).toContain('Active Markets')
    expect(insights).toContain('Liquidity Activity')
  })
})
