/**
 * LIQUIDITY_MODULE_002_LB_CARD — fixed section geometry contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIQUIDITY_MODULE_002_LB_CARD', () => {
  it('locks 210 + 48 + 442 + 160 = 860 desktop sections', () => {
    const tokens = load('onePage/onePageTokens.ts')
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(tokens).toContain("lbHeaderExpanded: '210px'")
    expect(tokens).toContain("lbHeaderCollapsed: '72px'")
    expect(tokens).toContain("lbWizardH: '48px'")
    expect(tokens).toContain("lbBodyH: '442px'")
    expect(tokens).toContain("lbBodyHCollapsed: '580px'")
    expect(tokens).toContain("lbFooterH: '160px'")
    expect(card).toContain("data-pixel-lb-body={heroCollapsed ? '580' : '442'}")
    expect(card).toContain('data-lb-module="002"')
    expect(card).toContain('overflow: hidden')
  })

  it('keeps a single footer CTA path and Learn More accordion', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('Set Up Liquidity Building')
    expect(card).toContain('Learn More')
    expect(card).toContain('liq-lb-footer')
    expect(card).not.toContain('CurrencySearchModal')
    expect(card).not.toContain('useModal')
    expect(card).toContain('ConnectSlot')
    // Single ConnectWalletButton usage (footer activate step only)
    expect((card.match(/<ConnectWalletButton/g) || []).length).toBe(1)
  })

  it('does not alter sibling Liquidity modules', () => {
    for (const f of [
      'onePage/AddLiquidityCard.tsx',
      'onePage/DexLiquiditySnapshot.tsx',
      'onePage/WalletLiquidityOverview.tsx',
      'onePage/LiquidityPositions.tsx',
      'onePage/LiquidityPageHeader.tsx',
    ]) {
      const src = load(f)
      expect(src).not.toContain('data-lb-module="002"')
      expect(src).not.toContain("lbBodyH: '442px'")
    }
  })
})
