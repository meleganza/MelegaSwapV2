import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS } from '../assetIdentity'
import { UNISWAP_VENUE, VENUE_SUPPORT } from '../certifiedVenues'
import { evmNetwork, solanaExecutionEnabled } from '../domain'
import { buildEvmShadowVenueRegistry, V2_M3_SHADOW_QUOTE_ONLY } from '../evmShadowRegistry'
import {
  CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
  assertCanonicalFeeBeneficiary,
} from '../feeEnforcement'
import { PROTOCOL_FEE_STATE, canMarkRouteProductionCapable, markFeeCollected } from '../fee'
import { DEFAULT_LATENCY_BUDGET } from '../latency'
import { normalizeMelegaLegacyQuote, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
import {
  PRODUCTION_EXECUTION_MODE,
  UNIVERSAL_ENGINE_MODE,
  V2_SHADOW_EXECUTION_FORBIDDEN,
  isProductionCutoverAllowed,
} from '../operatingMode'
import { applyShadowWinnerToProduction } from '../productionIsolation'
import type { SmartSwapRequest } from '../quote'
import { selectBestNetRoute } from '../routeSelection'
import { CROSS_CHAIN_FORBIDDEN, assertSameChainOnly, runEvmShadowCompetition } from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import {
  UNISWAP_NEXT_REQUIRED_GATE,
  buildUniswapSecondVenueCatalog,
  uniswapFirstCanonicalEvmTarget,
  uniswapProductionExecutionEnabled,
  uniswapShadowRegistryEntry,
} from '../uniswapSecondVenue'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { VENUE_FEE_ENFORCEMENT_FUTURE } from '../venueFeeEnforcementFuture'
import { EXTERNAL_VENUE_IDS, assertNoExternalVenueEnabled, buildVenueRegistry } from '../venueRegistry'

const WEB = path.resolve(__dirname, '../../../..')
const ENGINE = path.join(WEB, 'src/lib/smartswap-universal-engine')
const NOW = '2026-08-19T12:00:00.000Z'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_BSC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC_ETH = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

const LEGACY_BSC: LegacyMelegaQuoteSnapshot = {
  chainId: 56,
  input: { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', symbol: 'WBNB', decimals: 18 },
  output: { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', decimals: 18 },
  inputAmountRaw: '1000000000000000000',
  expectedOutputRaw: '600000000000000000000',
  pathAddresses: [
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  ],
  priceImpactPercent: 0.42,
  gasUnits: 220000,
  freshness: NOW,
  slippageBps: 50,
}

const LEGACY_ETH: LegacyMelegaQuoteSnapshot = {
  chainId: 1,
  input: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', decimals: 18 },
  output: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6 },
  inputAmountRaw: '1000000000000000000',
  expectedOutputRaw: '1800000000',
  pathAddresses: [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  ],
  priceImpactPercent: 0.3,
  gasUnits: 180000,
  freshness: NOW,
  slippageBps: 50,
}

function bscRequest(): SmartSwapRequest {
  return {
    requestId: 'uni-bsc',
    network: evmNetwork(56),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw: '1000000000000000000',
    exactOut: false,
    slippageBps: 50,
  }
}

function ethRequest(): SmartSwapRequest {
  return {
    requestId: 'uni-eth',
    network: evmNetwork(1),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.weth,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
    inputAmountRaw: '1000000000000000000',
    exactOut: false,
    slippageBps: 50,
  }
}

function pancakeQuotes(amountOutRaw: string) {
  return createSyntheticQuoteSource({
    [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw },
  })
}

function uniswapQuotes(amountOutRaw: string) {
  return createSyntheticQuoteSource({
    [`1:${WETH}>${USDC_ETH}`]: { amountOutRaw },
  })
}

function hangingSource(inner: ReturnType<typeof uniswapQuotes>) {
  return {
    async fetch(request: Parameters<ReturnType<typeof uniswapQuotes>['fetch']>[0]) {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 5_000)
        request.signal.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new Error('ADAPTER_TIMEOUT'))
        })
      })
      return inner.fetch(request)
    },
  }
}

describe('Uniswap second EVM venue SHADOW readiness', () => {
  it('represents the certified Ethereum Uniswap target as QUOTE_ONLY/SHADOW with production disabled', () => {
    expect(PRODUCTION_EXECUTION_MODE).toBe('LEGACY_PRODUCTION')
    expect(UNIVERSAL_ENGINE_MODE).toBe('SHADOW')
    expect(isProductionCutoverAllowed()).toBe(false)
    expect(uniswapProductionExecutionEnabled()).toBe(false)

    const target = uniswapFirstCanonicalEvmTarget()
    expect(target.chainId).toBe(1)
    expect(target.support).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(target.router).toBe(UNISWAP_VENUE.routers[1])
    expect(target.router).toBe('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(target.wrappedNative).toBe('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')

    const catalog = buildUniswapSecondVenueCatalog()
    expect(catalog.venueId).toBe('uniswap')
    expect(catalog.support).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(catalog.operatingMode).toBe('SHADOW')
    expect(catalog.productionEnabled).toBe(false)
    expect(catalog.enabled).toBe(false)
    expect(catalog.shadowQuoteEnabled).toBe(true)
    expect(catalog.executionEnabled).toBe(false)
    expect(catalog.firstCanonicalChainId).toBe(1)
    expect(catalog.certifiedRouter).toBe(target.router)
    expect(catalog.quoteMethod).toBe('v2-getAmountsOut')
    expect(catalog.v2LpFeeBps).toBe(30)
    expect(catalog.reason).toBe(V2_M3_SHADOW_QUOTE_ONLY)
    expect(catalog.feeEnforcementImplemented).toBe(false)
    expect(catalog.feeBeneficiary).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(assertCanonicalFeeBeneficiary(catalog.feeBeneficiary)).toBe(
      '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
    )
    expect(catalog.nextRequiredGate).toBe(UNISWAP_NEXT_REQUIRED_GATE)
    expect(VENUE_FEE_ENFORCEMENT_FUTURE.uniswap.implemented).toBe(false)

    const shadow = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY_BSC,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('1'),
    })
    expect(shadow.catalog.find((row) => row.venueId === 'uniswap')).toEqual(uniswapShadowRegistryEntry())
    expect(shadow.catalog.find((row) => row.venueId === 'uniswap')?.productionEnabled).toBe(false)
    expect(shadow.catalog.find((row) => row.venueId === 'pancakeswap')).toEqual({
      venueId: 'pancakeswap',
      enabled: false,
      productionEnabled: false,
      shadowQuoteEnabled: true,
      reason: V2_M3_SHADOW_QUOTE_ONLY,
    })
    expect(() => assertNoExternalVenueEnabled(shadow.catalog)).not.toThrow()
    expect(buildVenueRegistry(LEGACY_BSC).catalog.find((row) => row.venueId === 'uniswap')?.shadowQuoteEnabled).toBe(
      false,
    )
  })

  it('lets a valid Uniswap Ethereum quote participate in SHADOW ranking', async () => {
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('2000000000'),
    })
    const result = await runEvmShadowCompetition({
      request: ethRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY_ETH, NOW),
      adapters,
      nowIso: NOW,
    })
    expect(result.uniswap?.status).toBe('ok')
    expect(result.uniswap?.quote?.venueId).toBe('uniswap')
    expect(result.uniswap?.quote?.network).toEqual(evmNetwork(1))
    expect(result.uniswap?.quote?.productionExecutionCapable).toBe(false)
    expect(result.uniswap?.feeEnforcementState).toBe(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY)
    expect(result.uniswap?.smartSwapFeeBps).toBe(15)
    expect(result.pancake?.status).toBe('unsupported')
    expect(result.melega?.status).toBe('ok')
    expect(result.shadowWinner?.venueId).toBe('uniswap')
    expect(BigInt(result.uniswap!.net!.netUserOutputRaw)).toBeGreaterThan(BigInt(result.melega!.net!.netUserOutputRaw))
    expect(result.productionMutated).toBe(false)
    expect(result.decisionEvidence.selectedVenueId).toBe('uniswap')
    expect(result.decisionEvidence.productionActivation).toBe(false)
  })

  it('excludes Uniswap from selection on timeout, failure, or invalid quote', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY_ETH, NOW)
    const timed = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: hangingSource(uniswapQuotes('2000000000')),
    })
    const timeoutResult = await runEvmShadowCompetition({
      request: ethRequest(),
      productionQuote: production,
      adapters: timed.adapters,
      budget: { ...DEFAULT_LATENCY_BUDGET, quoteTimeoutMs: 40, overallBudgetMs: 120 },
      nowIso: NOW,
    })
    expect(timeoutResult.uniswap?.status).toBe('timeout')
    expect(timeoutResult.uniswap?.quote).toBeNull()
    expect(timeoutResult.shadowWinner?.venueId).toBe('melega-dex')
    expect(timeoutResult.shadowWinner?.venueId).not.toBe('uniswap')
    expect(timeoutResult.decisionEvidence.selectedVenueId).toBe('melega-dex')

    const failing = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: {
        async fetch() {
          throw new Error('RPC_DOWN')
        },
      },
    })
    const failResult = await runEvmShadowCompetition({
      request: ethRequest(),
      productionQuote: production,
      adapters: failing.adapters,
      nowIso: NOW,
    })
    expect(failResult.uniswap?.status).toBe('error')
    expect(failResult.shadowWinner?.venueId).toBe('melega-dex')
    expect(failResult.shadowWinner?.venueId).not.toBe('uniswap')

    const invalid = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('0'),
    })
    const invalidResult = await runEvmShadowCompetition({
      request: ethRequest(),
      productionQuote: production,
      adapters: invalid.adapters,
      nowIso: NOW,
    })
    expect(invalidResult.uniswap?.status).toBe('no_route')
    expect(invalidResult.shadowWinner?.venueId).toBe('melega-dex')
    expect(invalidResult.shadowWinner?.venueId).not.toBe('uniswap')
  })

  it('forbids Uniswap fee bypass and production execution', async () => {
    const adapter = createUniswapVenueAdapter(uniswapQuotes('2000000000'))
    const quote = await adapter.quote(ethRequest(), { signal: new AbortController().signal, nowIso: NOW })
    expect(quote.productionExecutionCapable).toBe(false)
    expect(quote.protocolFee.state).toBe(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY)
    expect(canMarkRouteProductionCapable(quote.protocolFee)).toBe(false)
    await expect(adapter.execute!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
    await expect(adapter.prepareExecution!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
    expect(() => markFeeCollected(quote.protocolFee)).toThrow('FEE_COLLECTION_CLAIM_FORBIDDEN')
    expect(() => applyShadowWinnerToProduction()).toThrow('V2_SHADOW_WINNER_CANNOT_REPLACE_PRODUCTION')
    expect(uniswapProductionExecutionEnabled()).toBe(false)
    expect(isProductionCutoverAllowed()).toBe(false)
  })

  it('keeps fallback ranking deterministic when Uniswap and Melega both quote', async () => {
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('2000000000'),
    })
    const result = await runEvmShadowCompetition({
      request: ethRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY_ETH, NOW),
      adapters,
      nowIso: NOW,
    })
    const usable = result.candidates
      .filter(
        (row) =>
          row.status === 'ok' &&
          row.net?.netUserOutputRaw &&
          row.quote &&
          row.quote.productionExecutionCapable === false,
      )
      .map((row) => ({
        quoteId: row.quote!.quoteId,
        venueId: row.venueId,
        netUserOutputRaw: row.net!.netUserOutputRaw,
        confidenceOk: true,
      }))
    const ranked = selectBestNetRoute(usable)
    expect(ranked.selectedVenueId).toBe('uniswap')
    expect(ranked.fallbackVenueId).toBe('melega-dex')
    expect(result.decisionEvidence.fallbackVenueId).toBe('melega-dex')
    expect(result.decisionEvidence.fallbackQuoteId).toBe(ranked.fallbackQuoteId)
    expect(result.decisionEvidence.fallbackQuoteId).not.toBeNull()
    expect(ranked.productionActivation).toBe(false)
  })

  it('leaves certified Pancake BSC shadow behavior unchanged', async () => {
    const { adapters, catalog } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY_BSC,
      pancakeSource: pancakeQuotes('800000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    expect(catalog.find((row) => row.venueId === 'pancakeswap')).toEqual({
      venueId: 'pancakeswap',
      enabled: false,
      productionEnabled: false,
      shadowQuoteEnabled: true,
      reason: V2_M3_SHADOW_QUOTE_ONLY,
    })
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY_BSC, NOW),
      adapters,
      nowIso: NOW,
    })
    expect(result.pancake?.status).toBe('ok')
    expect(result.pancake?.smartSwapFeeBps).toBe(20)
    expect(result.melega?.smartSwapFeeBps).toBe(20)
    expect(result.shadowWinner?.venueId).toBe('pancakeswap')
    expect(result.uniswap?.status).toBe('unsupported')
    expect(result.productionMutated).toBe(false)
  })

  it('preserves isolation invariants and does not own engine primitives or UX', () => {
    expect(solanaExecutionEnabled()).toBe(false)
    expect(EXTERNAL_VENUE_IDS).toContain('robinhood')
    expect(buildVenueRegistry(LEGACY_BSC).catalog.find((row) => row.venueId === 'robinhood')?.reason).toBe(
      'FEASIBILITY_REQUIRED',
    )
    expect(() =>
      assertSameChainOnly({
        ...ethRequest(),
        outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
      }),
    ).toThrow(CROSS_CHAIN_FORBIDDEN)

    const src = readFileSync(path.join(ENGINE, 'uniswapSecondVenue.ts'), 'utf8')
    expect(src).not.toMatch(/circuitBreaker|quoteTimeoutMs|selectBestNetRoute|window\.ethereum|useSigner|wagmi/)
    expect(src).not.toContain('0x10ED43C718714eb63d5aA57B78B54704E256024E')
    for (const rel of SMARTSWAP_UX_FREEZE_FILES) {
      const abs = path.join(WEB, rel)
      const text = readFileSync(abs, 'utf8')
      expect(text).not.toContain('uniswapSecondVenue')
      expect(text).not.toContain('buildUniswapSecondVenueCatalog')
    }
  })
})
