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
  it('orders V3 shell (tabs supersede V1 stacked modules)', () => {
    const page = load('src/pages/liquidity.tsx')
    expect(page).toContain('LiquidityStudioV3Shell')
    expect(page).not.toContain('LiquidityHeroModule')
    expect(page).not.toContain('LiquidityActionsModule')
    expect(page).toContain("from 'views/LiquidityStudio/v3/LiquidityStudioV3Shell'")
  })

  it('Actions workspace embeds expanded forms (not nav-only cards)', () => {
    const actions = load('src/views/LiquidityStudio/modules/LiquidityActionsModule.tsx')
    expect(actions).toContain('LiquidityAddModule')
    expect(actions).toContain('embedded')
    expect(actions).toContain('LiquidityBuildingCard')
    expect(actions).toContain('forceExpanded')
    expect(actions).toContain('liquidity-actions-ai-beta-badge')
    expect(actions).toContain('BNB Chain only')
    expect(actions).not.toContain('JourneySteps')
  })

  it('V3 hero exposes Add Liquidity + My Positions + AI entry', () => {
    const shell = load('src/views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx')
    expect(shell).toContain('liquidity-v3-hero-add')
    expect(shell).toContain('liquidity-v3-hero-positions')
    expect(shell).toContain('liquidity-v3-hero-ai')
  })

  it('Explore Pools uses dense card geometry for market browsing', () => {
    const tokens = load('src/views/LiquidityStudio/modules/liquidityPoolDiscoveryTokens.ts')
    const card = load('src/views/LiquidityStudio/modules/LiquidityPoolDiscoveryCard.tsx')
    const module = load('src/views/LiquidityStudio/modules/LiquidityPoolDiscoveryModule.tsx')
    expect(tokens).toContain("cardMinH: '188px'")
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
    expect(insights).toContain("label: 'Markets'")
    expect(insights).toContain('Liquidity Activity')
  })
})
