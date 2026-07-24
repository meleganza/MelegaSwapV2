/**
 * LIQUIDITY_MODULE_004 — DEX Liquidity Snapshot geometry + truthfulness guards.
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIQUIDITY_MODULE_004 DEX Snapshot', () => {
  it('locks desktop section heights 44+76+132+72 = 324', () => {
    const tokens = load('onePage/onePageTokens.ts')
    expect(tokens).toContain("snapH: '324px'")
    expect(tokens).toContain("snapHeadH: '44px'")
    expect(tokens).toContain("snapKpiH: '76px'")
    expect(tokens).toContain("snapChartH: '132px'")
    expect(tokens).toContain("snapFooterH: '72px'")
    expect(tokens).toContain("snapKpiW: '310px'")
  })

  it('card uses fixed desktop height and mobile natural height', () => {
    const snap = load('onePage/DexLiquiditySnapshot.tsx')
    expect(snap).toContain('liqOne.snapH')
    expect(snap).toContain('overflow: hidden')
    expect(snap).toContain("max-width: 1375px")
    expect(snap).toContain('height: auto')
    expect(snap).toContain('data-pixel-snap="324"')
    expect(snap).toContain('data-testid="liq-snap-header"')
    expect(snap).toContain('data-testid="liq-snap-kpis"')
    expect(snap).toContain('data-testid="liq-snap-chart"')
    expect(snap).toContain('data-testid="liq-snap-footer"')
  })

  it('forbids fabricated metrics and hardcoded legend tokens', () => {
    const snap = load('onePage/DexLiquiditySnapshot.tsx')
    expect(snap).toContain('useProtocolDataSWR')
    expect(snap).toContain('Awaiting Indexer')
    expect(snap).toContain('24H Volume')
    expect(snap).toContain('Indexed Pools')
    expect(snap).toContain('Indexed Tokens')
    expect(snap).toContain('Last Sync')
    expect(snap).not.toContain('$58.74M')
    expect(snap).not.toContain('sparkline')
    expect(snap).not.toContain("'BNB'")
    expect(snap).not.toContain("'USDT'")
    expect(snap).not.toContain("'MARCO'")
  })

  it('does not modify locked sibling modules', () => {
    const siblings = [
      'onePage/AddLiquidityCard.tsx',
      'onePage/LiquidityBuildingCard.tsx',
      'onePage/LiquidityPageHeader.tsx',
      'onePage/WalletLiquidityOverview.tsx',
      'onePage/LiquidityPositions.tsx',
      'onePage/LiquidityEducationRail.tsx',
      'onePage/UnifiedLiquidityPage.tsx',
    ]
    for (const rel of siblings) {
      expect(load(rel).length).toBeGreaterThan(100)
    }
  })
})
