import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { Field } from 'state/swap/actions'
import { queryParametersToSwapState, coerceNativeSymbol } from 'state/swap/queryParameters'
import {
  FOUNDER_MARCO_BSC,
  FOUNDER_MARCO_RAKY_LP,
  FOUNDER_MARCO_RAKY_QUERY,
  FOUNDER_RAKY_BSC,
  founderMarcoRakyPair,
  simulateFounderMarcoRakyQuery,
  simulateListedPairRoute,
} from '..'

const WEB = path.resolve(__dirname, '../../../..')

describe('P0 MARCO→RAKY founder URL', () => {
  it('parses the exact founder query addresses without crashing', () => {
    const parsed = simulateFounderMarcoRakyQuery()
    expect(parsed[Field.INPUT].currencyId?.toLowerCase()).toBe(FOUNDER_MARCO_BSC.toLowerCase())
    expect(parsed[Field.OUTPUT].currencyId?.toLowerCase()).toBe(FOUNDER_RAKY_BSC.toLowerCase())
    expect(parsed.typedValue).toBe('')
    expect(typeof parsed[Field.INPUT].currencyId).toBe('string')
    expect(typeof parsed[Field.OUTPUT].currencyId).toBe('string')
  })

  it('treats Next.js string[] query values the same as the founder URL', () => {
    const parsed = queryParametersToSwapState(
      {
        inputCurrency: [FOUNDER_MARCO_BSC],
        outputCurrency: [FOUNDER_RAKY_BSC],
      },
      'BNB',
    )
    expect(parsed[Field.INPUT].currencyId?.toLowerCase()).toBe(FOUNDER_MARCO_BSC.toLowerCase())
    expect(parsed[Field.OUTPUT].currencyId?.toLowerCase()).toBe(FOUNDER_RAKY_BSC.toLowerCase())
  })

  it('ignores NativeCurrency class / object lookups used as nativeSymbol', () => {
    expect(coerceNativeSymbol(undefined)).toBeUndefined()
    expect(coerceNativeSymbol({})).toBeUndefined()
    expect(coerceNativeSymbol({ chainId: 56 })).toBeUndefined()
    const parsed = queryParametersToSwapState(
      {
        inputCurrency: FOUNDER_MARCO_BSC,
        outputCurrency: FOUNDER_RAKY_BSC,
      },
      // historical bug: NativeCurrency[chainId] is not a symbol string
      undefined,
    )
    expect(parsed[Field.INPUT].currencyId?.toLowerCase()).toBe(FOUNDER_MARCO_BSC.toLowerCase())
    expect(parsed[Field.OUTPUT].currencyId?.toLowerCase()).toBe(FOUNDER_RAKY_BSC.toLowerCase())
  })

  it('canonical farm inventory includes MARCO/RAKY at the listed LP', () => {
    const pair = founderMarcoRakyPair()
    expect(pair.lpAddress.toLowerCase()).toBe(FOUNDER_MARCO_RAKY_LP.toLowerCase())
    expect(pair.lpSymbol).toBe('MARCO-RAKY LP')
    const sides = [pair.token.address.toLowerCase(), pair.quoteToken.address.toLowerCase()]
    expect(sides).toContain(FOUNDER_MARCO_BSC.toLowerCase())
    expect(sides).toContain(FOUNDER_RAKY_BSC.toLowerCase())
  })

  it('MARCO→RAKY simulation reaches a quote and does not throw', () => {
    const result = simulateListedPairRoute(founderMarcoRakyPair())
    expect(result.queryParsed).toBe(true)
    expect(result.pairAddressComputable).toBe(true)
    expect(result.directQuote).toBe('OK')
    expect(result.zeroLiquidity).toBe('ZERO_LIQUIDITY')
    expect(result.missingPair).toBe('UNSUPPORTED')
    expect(result.approvalDoesNotLatch).toBe(true)
    expect(result.minAmountOutOk).toBe(true)
    expect(result.noPageCrash).toBe(true)
    expect(result.feeCannotBypass).toBe(true)
    expect(result.shadowDoesNotBreakLegacy).toBe(true)
  })

  it('homepage isolates swap from market modules so a swap throw cannot replace the page', () => {
    const home = readFileSync(path.join(WEB, 'src/views/HomeTrade/DexHomeScreen.tsx'), 'utf8')
    expect(home).toContain('surface="Homepage Swap"')
    expect(home).toContain('userReason="Homepage market modules are temporarily unavailable."')
    expect(home).toContain('<HomeSwapPanel />')
    const swapBoundary = home.indexOf('surface="Homepage Swap"')
    const marketBoundary = home.indexOf('userReason="Homepage market modules are temporarily unavailable."')
    const swapPanel = home.indexOf('<HomeSwapPanel />')
    expect(swapBoundary).toBeGreaterThan(-1)
    expect(marketBoundary).toBeGreaterThan(swapBoundary)
    expect(swapPanel).toBeGreaterThan(swapBoundary)
    expect(swapPanel).toBeLessThan(marketBoundary)
    expect(FOUNDER_MARCO_RAKY_QUERY).toContain(FOUNDER_MARCO_BSC)
    expect(FOUNDER_MARCO_RAKY_QUERY).toContain(FOUNDER_RAKY_BSC)
  })

  it('URL defaults use native.symbol rather than NativeCurrency[chainId]', () => {
    const hooks = readFileSync(path.join(WEB, 'src/state/swap/hooks.ts'), 'utf8')
    const trade = readFileSync(path.join(WEB, 'src/views/Trade/hooks/useTradeDefaultsFromURL.ts'), 'utf8')
    expect(hooks).toContain('native.symbol')
    expect(hooks).not.toContain('NativeCurrency[chainId]')
    expect(trade).toContain('native.symbol')
    expect(trade).not.toContain('NativeCurrency[chainId]')
  })
})
