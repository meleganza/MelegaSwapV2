/**
 * LIQUIDITY_MODULE_003 — Add Liquidity card geometry + locked scope guards.
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIQUIDITY_MODULE_003 Add Liquidity card', () => {
  it('locks desktop section heights 96+70+250+44+60 = 520', () => {
    const tokens = load('onePage/onePageTokens.ts')
    expect(tokens).toContain("addH: '520px'")
    expect(tokens).toContain("addHeaderH: '96px'")
    expect(tokens).toContain("addPairH: '70px'")
    expect(tokens).toContain("addFormH: '250px'")
    expect(tokens).toContain("addSummaryH: '44px'")
    expect(tokens).toContain("addFooterH: '60px'")
    expect(tokens).toContain("addPadX: '20px'")
  })

  it('card uses fixed desktop height with overflow hidden and mobile natural height', () => {
    const add = load('onePage/AddLiquidityCard.tsx')
    expect(add).toContain('liqOne.addH')
    expect(add).toContain('overflow: hidden')
    expect(add).toContain("max-width: 1375px")
    expect(add).toContain('height: auto')
    expect(add).toContain('data-pixel-add="520"')
    expect(add).toContain('data-testid="liq-add-header"')
    expect(add).toContain('data-testid="liq-add-pair"')
    expect(add).toContain('data-testid="liq-add-form"')
    expect(add).toContain('data-testid="liq-add-summary"')
    expect(add).toContain('data-testid="liq-add-footer"')
  })

  it('forbids Explore Liquidity, modal picker, and duplicated nav CTAs', () => {
    const add = load('onePage/AddLiquidityCard.tsx')
    expect(add).not.toContain('Explore Liquidity')
    expect(add).not.toContain('CurrencySearchModal')
    expect(add).not.toContain('useModal')
    expect(add).not.toContain('LiquidityBuilderPanel')
    expect(add).not.toContain('View Pools')
    expect(add).not.toContain('Create Position')
    expect(add).toContain('View Your Positions')
    expect(add).toContain('MANUAL')
    expect(add).toContain('160px')
    expect(add).toContain('110px')
  })

  it('token boxes and swap control match lock sizes', () => {
    const add = load('onePage/AddLiquidityCard.tsx')
    expect(add).toContain('height: 72px')
    expect(add).toContain('font-size: 40px')
    expect(add).toContain('height: 44px')
    expect(add).toContain('width: 40px')
    expect(add).toContain('width: 28px')
    expect(add).toContain('height: 20px')
    expect(add).toContain('gap: 16px')
  })

  it('does not modify locked sibling modules', () => {
    const siblings = [
      'onePage/LiquidityPageHeader.tsx',
      'onePage/LiquidityBuildingCard.tsx',
      'onePage/DexLiquiditySnapshot.tsx',
      'onePage/WalletLiquidityOverview.tsx',
      'onePage/LiquidityPositions.tsx',
      'onePage/UnifiedLiquidityPage.tsx',
    ]
    for (const rel of siblings) {
      const src = load(rel)
      expect(src.length).toBeGreaterThan(100)
    }
  })
})
