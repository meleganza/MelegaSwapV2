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
  it('locks active-flow geometry tokens; inactive summary may compact', () => {
    const tokens = load('onePage/onePageTokens.ts')
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(tokens).toContain("lbHeaderExpanded: '210px'")
    expect(tokens).toContain("lbHeaderCollapsed: '72px'")
    expect(tokens).toContain("lbWizardH: '48px'")
    expect(tokens).toContain("lbBodyH: '442px'")
    expect(tokens).toContain("lbBodyHCollapsed: '580px'")
    expect(tokens).toContain("lbFooterH: '160px'")
    // Product polish: compact layout for inactive + in-flow + active (no 860px empty laptop shell).
    expect(card).toContain('compactInactive')
    expect(card).toContain('compactLayout')
    expect(card).toContain("data-lb-compact={compactLayout ? '1' : '0'}")
    expect(card).toContain('data-lb-module="002"')
  })

  it('keeps a single footer CTA path and product entry CTA', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('LB_UX.startCta')
    expect(card).toContain('liq-lb-footer')
    expect(card).toContain('CurrencySearchModal')
    expect(card).toContain('useModal')
    expect(card).toContain('ConnectSlot')
    // Final polish may render ConnectWalletButton in more than one gated branch; keep ≤2.
    expect((card.match(/<ConnectWalletButton/g) || []).length).toBeLessThanOrEqual(2)
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
