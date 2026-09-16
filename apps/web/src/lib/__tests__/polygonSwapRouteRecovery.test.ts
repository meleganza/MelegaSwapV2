/**
 * P0 Polygon /swap?chain=polygon — page must bind same-chain defaults and
 * never throw from query parsing, native aliases, or pair address math.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ChainId, Native, Pair, WNATIVE } from '@pancakeswap/sdk'
import { CAKE, USDT } from '@pancakeswap/tokens'
import { Field } from 'state/swap/actions'
import { queryParametersToSwapState } from 'state/swap/queryParameters'
import { isNativeCurrencyId, resolveSwapDefaultNativeId } from 'hooks/nativeCurrencyIds'
import {
  resolveSwapDefaultInputCurrencyId,
  resolveSwapDefaultOutputCurrencyId,
} from 'views/Trade/hooks/resolveSwapDefaultCurrencies'
import { getChainId } from 'config/chains'
import { isChainSupported } from 'utils/wagmi'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { MELEGA_POLYGON_ROUTER, isMelegaCapabilityEnabled } from 'config/melegaChainRegistry'
import { ROUTER_ADDRESS } from 'config/constants/exchange'

const WEB = path.resolve(__dirname, '../..')
const POLYGON_MARCO = '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2'

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

describe('P0 Polygon swap route recovery', () => {
  it('classifies Polygon as LIVE swap-capable with canonical router', () => {
    expect(isMelegaCapabilityEnabled(137, 'swap')).toBe(true)
    expect(SUPPORT_MULTI_CHAINS).toContain(ChainId.POLYGON)
    expect(isChainSupported(137)).toBe(true)
    expect(getChainId('polygon')).toBe(137)
    expect(ROUTER_ADDRESS[ChainId.POLYGON]).toBe(MELEGA_POLYGON_ROUTER)
  })

  it('parses /swap?chain=polygon without throwing and binds POL + Polygon MARCO', () => {
    const native = Native.onChain(ChainId.POLYGON)
    const inputId = resolveSwapDefaultInputCurrencyId(ChainId.POLYGON, native.symbol)
    const outputId = resolveSwapDefaultOutputCurrencyId(ChainId.POLYGON)
    const parsed = queryParametersToSwapState({ chain: 'polygon' }, inputId, outputId)
    expect(parsed[Field.INPUT].currencyId).toBe('POL')
    expect(parsed[Field.OUTPUT].currencyId?.toLowerCase()).toBe(POLYGON_MARCO.toLowerCase())
    expect(parsed[Field.OUTPUT].currencyId?.toLowerCase()).not.toBe(MARCO_BSC_ADDRESS.toLowerCase())
  })

  it('treats POL and MATIC as Polygon native and does not treat WMATIC as native', () => {
    const native = Native.onChain(ChainId.POLYGON)
    expect(isNativeCurrencyId('POL', native.symbol, ChainId.POLYGON)).toBe(true)
    expect(isNativeCurrencyId('matic', native.symbol, ChainId.POLYGON)).toBe(true)
    expect(isNativeCurrencyId(native.symbol, native.symbol, ChainId.POLYGON)).toBe(true)
    expect(isNativeCurrencyId('WMATIC', native.symbol, ChainId.POLYGON)).toBe(false)
    expect(isNativeCurrencyId('BNB', native.symbol, ChainId.POLYGON)).toBe(false)
    expect(resolveSwapDefaultNativeId(ChainId.POLYGON, 'MATIC')).toBe('POL')
  })

  it('keeps BSC swap defaults on BNB + BSC MARCO', () => {
    const parsed = queryParametersToSwapState(
      { chain: 'bsc' },
      resolveSwapDefaultInputCurrencyId(ChainId.BSC, 'BNB'),
      resolveSwapDefaultOutputCurrencyId(ChainId.BSC),
    )
    expect(parsed[Field.INPUT].currencyId).toBe('BNB')
    expect(parsed[Field.OUTPUT].currencyId?.toLowerCase()).toBe(MARCO_BSC_ADDRESS.toLowerCase())
  })

  it('keeps Base / Ethereum / Arbitrum / Avalanche query defaults on the same chain', () => {
    const cases: Array<[number, string]> = [
      [ChainId.BASE, 'ETH'],
      [ChainId.ETHEREUM, 'ETH'],
      [ChainId.ARBITRUM, 'ETH'],
      [ChainId.AVAX, 'AVAX'],
    ]
    for (const [chainId, symbol] of cases) {
      const output = resolveSwapDefaultOutputCurrencyId(chainId)
      const parsed = queryParametersToSwapState({}, resolveSwapDefaultInputCurrencyId(chainId, symbol), output)
      expect(parsed[Field.INPUT].currencyId).toBe(symbol)
      expect(output).toBe(CAKE[chainId]?.address ?? USDT[chainId]?.address)
      expect(CAKE[chainId]?.chainId ?? USDT[chainId]?.chainId).toBe(chainId)
    }
  })

  it('computes a Polygon pair address without throwing', () => {
    const wmatic = WNATIVE[ChainId.POLYGON]
    const marco = CAKE[ChainId.POLYGON]
    expect(wmatic).toBeTruthy()
    expect(marco).toBeTruthy()
    const addr = Pair.getAddress(wmatic, marco)
    expect(addr).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })

  it('trade URL binder and swap page stay chain-aware and isolate market crashes', () => {
    const defaults = load('views/Trade/hooks/useTradeDefaultsFromURL.ts')
    expect(defaults).toContain('resolveSwapDefaultOutputCurrencyId')
    expect(defaults).toContain('resolveSwapDefaultInputCurrencyId')
    expect(defaults).toContain('native.symbol')
    expect(defaults).not.toContain('NativeCurrency[chainId]')

    const resolver = load('views/Trade/hooks/resolveSwapDefaultCurrencies.ts')
    expect(resolver).toContain('CAKE[chainId]')
    expect(resolver).toContain('ChainId.BSC')

    const screen = load('views/Trade/TradeTerminalScreen.tsx')
    expect(screen).toContain('surface="Swap Market"')
    expect(screen).toContain('TradeCockpit')
    expect(screen).toContain('DataSurfaceErrorBoundary')

    const tokens = load('hooks/Tokens.ts')
    expect(tokens).toContain('isNativeCurrencyId')
  })
})
