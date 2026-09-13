import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB = path.resolve(__dirname, '../../../..')

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

describe('P0 homepage swap isolation and enabling guards', () => {
  it('HomeSwapPanel is inside its own DataSurface boundary', () => {
    const src = load('src/views/HomeTrade/DexHomeScreen.tsx')
    expect(src).toContain('surface="Homepage Swap"')
    expect(src).toContain('<HomeSwapPanel />')
    expect(src).toContain('data-testid="dex-home-instant-swap"')
    expect(src).toContain('userReason="Homepage market modules are temporarily unavailable."')
  })

  it('swap form and trade runtime use safe slippage optional chaining', () => {
    const form = load('src/views/Swap/SmartSwap/index.tsx')
    const runtime = load('src/views/Trade/tradeRuntime/useTradeSwapRuntime.ts')
    expect(form).toContain('tradeInfo?.slippageAdjustedAmounts?.[Field.INPUT]')
    expect(runtime).toContain('tradeInfo?.slippageAdjustedAmounts?.[Field.INPUT]')
    expect(form).not.toMatch(/tradeInfo\?\.slippageAdjustedAmounts\[Field\.INPUT\]/)
    expect(runtime).not.toMatch(/tradeInfo\?\.slippageAdjustedAmounts\[Field\.INPUT\]/)
  })

  it('useBestTrade never conditionally skips hooks', () => {
    const src = load('src/views/Swap/SmartSwap/hooks/useBestTrade.ts')
    const hookIndex = src.indexOf('const bestTradeFromChain = useBestTradeFromChain')
    const kerlReturn = src.indexOf('if (isKerlRoutingAuthorityEnforced(chainId))')
    expect(hookIndex).toBeGreaterThan(-1)
    expect(kerlReturn).toBeGreaterThan(hookIndex)
  })

  it('direct pair reserve reads tolerate missing contracts', () => {
    const src = load('src/hooks/useCanonicalMarcoPair.ts')
    expect(src).toContain("result === '0x'")
    expect(src).toContain('return null')
  })

  it('disconnected wallet CTA remains a single swap action, not Enabling', () => {
    const commit = load('src/views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx')
    expect(commit).toContain('data-swap-action-cta')
    expect(commit).toContain('ConnectWalletButton')
  })
})
