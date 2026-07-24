/**
 * LIQUIDITY_MODULE_005 — Wallet Liquidity Overview geometry + truthfulness guards.
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIQUIDITY_MODULE_005 Wallet Overview', () => {
  it('locks 1376×180 module and 336/336/216/216/192 column tokens', () => {
    const tokens = load('onePage/onePageTokens.ts')
    expect(tokens).toContain("overviewH: '180px'")
    expect(tokens).toContain("overviewInnerH: '148px'")
    expect(tokens).toContain("overviewPad: '16px'")
    expect(tokens).toContain("overviewGap: '12px'")
    expect(tokens).toContain("overviewColA: '336px'")
    expect(tokens).toContain("overviewColB: '336px'")
    expect(tokens).toContain("overviewColC: '216px'")
    expect(tokens).toContain("overviewColD: '216px'")
    expect(tokens).toContain("overviewColE: '192px'")
    expect(tokens).toContain("contentMax: '1376px'")
  })

  it('keeps heading outside module and uses Total LP Value not TVL', () => {
    const ov = load('onePage/WalletLiquidityOverview.tsx')
    expect(ov).toContain('Your Liquidity Overview')
    expect(ov).toContain('data-pixel-overview="180"')
    expect(ov).toContain('Total LP Value')
    expect(ov).not.toMatch(/>\s*TVL\s*</)
    expect(ov).toContain('Holdings composition unavailable')
    expect(ov).toContain('Fees unavailable')
    expect(ov).toContain('ConnectWalletButton')
    expect(ov).toContain('overflow: hidden')
  })

  it('does not hardcode legend assets as production defaults', () => {
    const ov = load('onePage/WalletLiquidityOverview.tsx')
    expect(ov).not.toContain("symbol: 'MARCO'")
    expect(ov).not.toContain("symbol: 'WBNB'")
    expect(ov).not.toContain("symbol: 'USDT'")
    expect(ov).toContain('buildHoldings')
    expect(ov).toContain('underlyingAssets')
  })

  it('does not modify locked sibling modules', () => {
    const siblings = [
      'onePage/AddLiquidityCard.tsx',
      'onePage/LiquidityBuildingCard.tsx',
      'onePage/DexLiquiditySnapshot.tsx',
      'onePage/LiquidityPositions.tsx',
      'onePage/LiquidityEducationRail.tsx',
      'onePage/LiquidityPageHeader.tsx',
      'onePage/UnifiedLiquidityPage.tsx',
    ]
    for (const rel of siblings) {
      expect(load(rel).length).toBeGreaterThan(100)
    }
  })
})
