import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  CANONICAL_EXAMPLE_ASSETS,
  assetIdentityKey,
  assetsEqual,
} from '../assetIdentity'
import { capabilityMap } from '../capabilities'
import { PANCAKE_SWAP_VENUE, UNISWAP_VENUE, VENUE_SUPPORT } from '../certifiedVenues'
import { EXECUTION_DOMAIN, evmNetwork, solanaNetwork } from '../domain'
import { encodeGetAmountsOut } from '../evmV2Quote'
import { buildEvmShadowVenueRegistry } from '../evmShadowRegistry'
import {
  PROTOCOL_FEE_STATE,
  canMarkRouteProductionCapable,
  markFeeCollected,
} from '../fee'
import { normalizeSameChainGas } from '../gasNormalization'
import { VENUE_HEALTH_STATE, healthSnapshot } from '../health'
import { DEFAULT_LATENCY_BUDGET } from '../latency'
import { INSUFFICIENT_SAMPLE, latencyPercentiles } from '../latencyStats'
import { normalizeMelegaLegacyQuote, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
import {
  SMARTSWAP_UNIVERSAL_ENGINE_M3_ID,
  V2_EXTERNAL_ADAPTER_WALLET_FORBIDDEN,
  V2_M3_FEE_COLLECTION_FORBIDDEN,
  V2_SHADOW_EXECUTION_FORBIDDEN,
  V2_SHADOW_WINNER_CANNOT_REPLACE_PRODUCTION,
  isProductionCutoverAllowed,
  isUniversalEngineShadowOnly,
} from '../operatingMode'
import { createExternalEvmVenueAdapter } from '../externalEvmAdapter'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import {
  applyShadowWinnerToProduction,
  assertNoWalletRequest,
  assertV2CannotCollectFeeInM3,
} from '../productionIsolation'
import type { NormalizedQuote, SmartSwapRequest } from '../quote'
import { SMARTSWAP_REVENUE_POLICY_V1 } from '../revenuePolicy'
import { selectBestNetRoute } from '../routeSelection'
import { ScopedVenueHealth, healthScopeKey } from '../scopedHealth'
import {
  CROSS_CHAIN_FORBIDDEN,
  SPLIT_ROUTE_FORBIDDEN,
  assertSameChainOnly,
  assertSingleVenueRoute,
  evaluateShadowProgressiveReadiness,
  potentialProtocolRevenueRaw,
  runEvmShadowCompetition,
  type ShadowDecisionEvidence,
  type ShadowVenueReadinessProbe,
} from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { FEE_ENFORCEMENT_POSSIBILITY, VENUE_FEE_ENFORCEMENT_FUTURE } from '../venueFeeEnforcementFuture'
import { VENUE_FEE_SEMANTICS, VENUE_FEE_SEMANTICS_BY_ID } from '../venueFeeSemantics'
import { assertNoExternalVenueEnabled, buildVenueRegistry } from '../venueRegistry'
import { engineMustNotOwnUx, hostMustNotOwnRouting } from '../widget'
import { solanaMint } from '../assetIdentity'

const WEB = path.resolve(__dirname, '../../../..')
const ENGINE = path.join(WEB, 'src/lib/smartswap-universal-engine')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')
const NOW = '2026-08-19T12:00:00.000Z'

const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_BSC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC_ETH = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

const LEGACY: LegacyMelegaQuoteSnapshot = {
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

function bscRequest(): SmartSwapRequest {
  return {
    requestId: 'm3-bsc',
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
    requestId: 'm3-eth',
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

describe('SmartSwap Universal Engine M3 EVM multi-venue shadow', () => {
  it('keeps M1 registry Melega-only while M3 shadow registry quotes Pancake and Uniswap', () => {
    expect(SMARTSWAP_UNIVERSAL_ENGINE_M3_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M3')
    const m1 = buildVenueRegistry(LEGACY)
    expect(m1.adapters).toHaveLength(1)
    expect(() => assertNoExternalVenueEnabled(m1.catalog)).not.toThrow()
    const shadow = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('1'),
    })
    expect(shadow.adapters).toHaveLength(3)
    expect(shadow.catalog.find((row) => row.venueId === 'pancakeswap')?.shadowQuoteEnabled).toBe(true)
    expect(shadow.catalog.find((row) => row.venueId === 'pancakeswap')?.productionEnabled).toBe(false)
    expect(shadow.catalog.find((row) => row.venueId === 'uniswap')?.enabled).toBe(false)
    expect(shadow.catalog.find((row) => row.venueId === 'robinhood')?.reason).toBe('FEASIBILITY_REQUIRED')
    expect(() => assertNoExternalVenueEnabled(shadow.catalog)).not.toThrow()
  })

  it('normalizes PancakeSwap V2 quotes without EXECUTE or wallet capability', async () => {
    const adapter = createPancakeSwapVenueAdapter(pancakeQuotes('1770000000000000000000'))
    expect(adapter.capabilities()).toEqual(capabilityMap(['QUOTE', 'EXACT_IN', 'EVM']))
    expect(adapter.capabilities().EXECUTE).toBe(false)
    expect(adapter.supportsAssetPair(bscRequest())).toBe(true)
    expect(adapter.supportsAssetPair(ethRequest())).toBe(false)
    const quote = await adapter.quote(bscRequest(), { signal: new AbortController().signal, nowIso: NOW })
    expect(quote.venueId).toBe('pancakeswap')
    expect(quote.grossOutputRaw).toBe('1770000000000000000000')
    expect(quote.protocolFee.state).toBe(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY)
    expect(quote.productionExecutionCapable).toBe(false)
    expect(quote.priceImpactPercent).toBeNull()
    expect(VENUE_FEE_SEMANTICS_BY_ID.pancakeswap).toBe(VENUE_FEE_SEMANTICS.EMBEDDED_IN_QUOTED_OUTPUT)
    await expect(adapter.execute!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
    await expect(adapter.prepareExecution!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
    expect(() => assertNoWalletRequest({ signal: true, nowIso: NOW })).not.toThrow()
    expect(() => assertNoWalletRequest({ signer: {} })).toThrow(V2_EXTERNAL_ADAPTER_WALLET_FORBIDDEN)
  })

  it('normalizes Uniswap V2 quotes through the same adapter contract', async () => {
    const adapter = createUniswapVenueAdapter(uniswapQuotes('1800000000'))
    expect(adapter.capabilities().EXECUTE).toBe(false)
    expect(adapter.supportsAssetPair(ethRequest())).toBe(true)
    expect(adapter.supportsAssetPair(bscRequest())).toBe(false)
    const quote = await adapter.quote(ethRequest(), { signal: new AbortController().signal, nowIso: NOW })
    expect(quote.venueId).toBe('uniswap')
    expect(quote.executionDomain).toBe(EXECUTION_DOMAIN.EVM)
    expect(quote.network).toEqual(evmNetwork(1))
    expect(quote.protocolFee.state).toBe(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY)
    expect(canMarkRouteProductionCapable(quote.protocolFee)).toBe(false)
    await expect(adapter.execute!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
  })

  it('preserves the M1 Melega adapter as a shadow candidate only', () => {
    const normalized = normalizeMelegaLegacyQuote(LEGACY, NOW)
    expect(normalized.venueId).toBe('melega-dex')
    expect(normalized.productionExecutionCapable).toBe(false)
    const { adapters } = buildVenueRegistry(LEGACY)
    expect(adapters[0].capabilities().EXECUTE).toBe(false)
  })

  it('runs bounded parallel quotes and isolates a slow venue', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const slowPancake = createSyntheticQuoteSource({
      [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '700000000000000000000' },
    })
    const pancake = createPancakeSwapVenueAdapter({
      async fetch(request) {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 5_000)
          request.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new Error('ADAPTER_TIMEOUT'))
          })
        })
        return slowPancake.fetch(request)
      },
    })
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('1'),
    })
    adapters[1] = pancake
    const started = Date.now()
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      budget: { ...DEFAULT_LATENCY_BUDGET, quoteTimeoutMs: 40, overallBudgetMs: 120 },
      nowIso: NOW,
    })
    expect(Date.now() - started).toBeLessThan(1_000)
    expect(result.pancake?.status).toBe('timeout')
    expect(result.melega?.status).toBe('ok')
    expect(result.productionQuote?.grossOutputRaw).toBe(production.grossOutputRaw)
    expect(result.productionMutated).toBe(false)
  })

  it('isolates a stale quote from shadow competition [SYNTHETIC]', async () => {
    const staleSource = createSyntheticQuoteSource({
      [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '900000000000000000000' },
    })
    const pancake = createPancakeSwapVenueAdapter({
      async fetch(request) {
        const observation = await staleSource.fetch(request)
        return { ...observation, quotedAt: '2020-01-01T00:00:00.000Z' }
      },
    })
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('1'),
    })
    adapters[1] = pancake
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters,
      nowIso: NOW,
    })
    expect(result.pancake?.status).toBe('stale')
    expect(result.shadowWinner?.venueId).toBe('melega-dex')
  })

  it('does not mark a venue unhealthy because one pair is unsupported', async () => {
    const health = new ScopedVenueHealth({ failureThreshold: 3, cooldownMs: 10_000 })
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('1'),
    })
    await runEvmShadowCompetition({
      request: ethRequest(),
      productionQuote: null,
      adapters,
      health,
      nowIso: NOW,
    })
    const pancakeBsc = health.snapshot(healthScopeKey('pancakeswap', 1), 'pancakeswap')
    expect(pancakeBsc.state).not.toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    expect(pancakeBsc.signals.circuitBreakerOpen).toBe(false)
  })

  it('opens a circuit breaker after repeated adapter failures without touching production', async () => {
    const health = new ScopedVenueHealth({ failureThreshold: 2, cooldownMs: 60_000 })
    const failing = createPancakeSwapVenueAdapter({
      async fetch() {
        throw new Error('RPC_DOWN')
      },
    })
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('1'),
    })
    adapters[1] = failing
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    await runEvmShadowCompetition({ request: bscRequest(), productionQuote: production, adapters, health, nowIso: NOW })
    await runEvmShadowCompetition({ request: bscRequest(), productionQuote: production, adapters, health, nowIso: NOW })
    const scope = healthScopeKey('pancakeswap', 56)
    expect(health.snapshot(scope, 'pancakeswap').state).toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    const skipped = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      health,
      nowIso: NOW,
    })
    expect(skipped.pancake?.status).toBe('skipped')
    expect(skipped.productionQuote?.grossOutputRaw).toBe(production.grossOutputRaw)
    expect(skipped.melega?.status).toBe('ok')
  })

  it('blocks a venue before quote when readiness is UNAVAILABLE', async () => {
    let pancakeFetches = 0
    const pancakeSource = {
      async fetch(request: Parameters<ReturnType<typeof pancakeQuotes>['fetch']>[0]) {
        pancakeFetches += 1
        return pancakeQuotes('610000000000000000000').fetch(request)
      },
    }
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource,
      uniswapSource: uniswapQuotes('1'),
    })
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      nowIso: NOW,
      readinessProbe: async ({ adapter }) => {
        if (adapter.identity().venueId === 'pancakeswap') {
          return healthSnapshot('pancakeswap', VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-unavailable', {
            providerHealthy: false,
          }, NOW)
        }
        return null
      },
    })
    expect(result.pancake?.status).toBe('skipped')
    expect(result.pancake?.error).toBe('VENUE_READINESS_BLOCKED:rpc-unavailable')
    expect(pancakeFetches).toBe(0)
    expect(result.melega?.status).toBe('ok')
    expect(result.productionMutated).toBe(false)
  })

  it('feeds rpc-timeout readiness into the scoped breaker and skips without re-probing', async () => {
    const health = new ScopedVenueHealth({ failureThreshold: 2, cooldownMs: 15_000 })
    let pancakeFetches = 0
    let pancakeReadinessCalls = 0
    const pancakeSource = {
      async fetch(request: Parameters<ReturnType<typeof pancakeQuotes>['fetch']>[0]) {
        pancakeFetches += 1
        return pancakeQuotes('610000000000000000000').fetch(request)
      },
    }
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource,
      uniswapSource: uniswapQuotes('1'),
    })
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const readinessProbe: ShadowVenueReadinessProbe = async ({ adapter }) => {
      if (adapter.identity().venueId !== 'pancakeswap') return null
      pancakeReadinessCalls += 1
      return healthSnapshot('pancakeswap', VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-timeout', {
        providerHealthy: false,
      }, NOW)
    }
    await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      health,
      nowIso: NOW,
      readinessProbe,
    })
    await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      health,
      nowIso: NOW,
      readinessProbe,
    })
    const scope = healthScopeKey('pancakeswap', 56)
    expect(health.snapshot(scope, 'pancakeswap').state).toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    expect(health.snapshot(scope, 'pancakeswap').signals.circuitBreakerOpen).toBe(true)
    const callsAfterOpen = pancakeReadinessCalls
    expect(callsAfterOpen).toBe(2)
    const third = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      health,
      nowIso: NOW,
      readinessProbe,
    })
    expect(third.pancake?.status).toBe('skipped')
    expect(third.pancake?.error).toContain('CIRCUIT_BREAKER_OPEN')
    expect(pancakeReadinessCalls).toBe(callsAfterOpen)
    expect(pancakeFetches).toBe(0)
  })

  it('allows quote when readiness is HEALTHY or DEGRADED', async () => {
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('610000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const healthy = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      nowIso: NOW,
      readinessProbe: async ({ adapter }) => {
        if (adapter.identity().venueId === 'pancakeswap') {
          return healthSnapshot('pancakeswap', VENUE_HEALTH_STATE.HEALTHY, null, { providerHealthy: true }, NOW)
        }
        return healthSnapshot(adapter.identity().venueId, VENUE_HEALTH_STATE.DEGRADED, 'rpc-degraded', {
          providerHealthy: true,
        }, NOW)
      },
    })
    expect(healthy.pancake?.status).toBe('ok')
    expect(healthy.melega?.status).toBe('ok')
    expect(healthy.productionMutated).toBe(false)
  })

  it('distinguishes canonical USDC, ETH/WETH, and BNB/WBNB and rejects wrong-chain identity', async () => {
    expect(assetsEqual(CANONICAL_EXAMPLE_ASSETS.usdcBnb, CANONICAL_EXAMPLE_ASSETS.usdcBase)).toBe(false)
    expect(assetsEqual(CANONICAL_EXAMPLE_ASSETS.usdcBnb, CANONICAL_EXAMPLE_ASSETS.usdcEthereum)).toBe(false)
    expect(assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.nativeEth)).not.toBe(assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.weth))
    expect(assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.nativeBnb)).not.toBe(assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.wbnb))
    const pancake = createPancakeSwapVenueAdapter(pancakeQuotes('1'))
    const wrong = {
      ...bscRequest(),
      outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBase,
    }
    expect(pancake.supportsAssetPair(wrong)).toBe(false)
    await expect(pancake.quote(wrong, { signal: new AbortController().signal, nowIso: NOW })).rejects.toThrow(
      'CROSS_CHAIN_FORBIDDEN',
    )
  })

  it('forbids cross-chain competition and split routes', () => {
    expect(() =>
      assertSameChainOnly({
        ...bscRequest(),
        outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
      }),
    ).toThrow(CROSS_CHAIN_FORBIDDEN)
    const split: NormalizedQuote = {
      ...normalizeMelegaLegacyQuote(LEGACY, NOW),
      hops: [
        {
          index: 0,
          venueId: 'melega-dex',
          poolRef: null,
          tokenIn: CANONICAL_EXAMPLE_ASSETS.wbnb,
          tokenOut: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
        },
        {
          index: 1,
          venueId: 'pancakeswap',
          poolRef: null,
          tokenIn: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
          tokenOut: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
        },
      ],
    }
    expect(() => assertSingleVenueRoute(split)).toThrow(SPLIT_ROUTE_FORBIDDEN)
  })

  it('applies M2 revenue policy and prevents LP fee double-counting [SYNTHETIC]', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('610000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      nowIso: NOW,
    })
    expect(result.melega?.smartSwapFeeBps).toBe(20)
    expect(result.pancake?.smartSwapFeeBps).toBe(20)
    expect(result.melega?.structuralRouteCostBps).toBe(25)
    expect(result.pancake?.venueFeeSemantics).toBe(VENUE_FEE_SEMANTICS.EMBEDDED_IN_QUOTED_OUTPUT)
    expect(result.melega?.net?.subtractedVenueRaw).toBe('0')
    expect(result.pancake?.net?.subtractedVenueRaw).toBe('0')
    expect(result.pancake?.kind).toBe('SYNTHETIC')
  })

  it('lets an external venue win on superior net output [SYNTHETIC]', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('800000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      nowIso: NOW,
    })
    expect(result.shadowWinner?.venueId).toBe('pancakeswap')
    expect(result.shadowWinner?.venueId).not.toBe('melega-dex')
    expect(BigInt(result.pancake!.net!.netUserOutputRaw)).toBeGreaterThan(BigInt(result.melega!.net!.netUserOutputRaw))
  })

  it('lets Melega win when genuinely superior [SYNTHETIC]', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('100000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      nowIso: NOW,
    })
    expect(result.shadowWinner?.venueId).toBe('melega-dex')
  })

  it('prefers higher net over higher gross when fee bands differ [SYNTHETIC]', async () => {
    const pancake = createPancakeSwapVenueAdapter(pancakeQuotes('100000'))
    const uniswapSameChain = createExternalEvmVenueAdapter(
      {
        ...UNISWAP_VENUE,
        routers: { 56: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' },
        wrappedNative: { 56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
        support: { 56: VENUE_SUPPORT.QUOTE_ONLY },
      },
      pancakeQuotes('99950'),
    )
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY, NOW),
      adapters: [pancake, uniswapSameChain],
      nowIso: NOW,
    })
    expect(result.pancake?.smartSwapFeeBps).toBe(20)
    expect(result.uniswap?.smartSwapFeeBps).toBe(15)
    expect(result.shadowWinner?.venueId).toBe('uniswap')
    expect(BigInt(result.pancake!.quote!.grossOutputRaw)).toBeGreaterThan(BigInt(result.uniswap!.quote!.grossOutputRaw))
    expect(BigInt(result.uniswap!.net!.netUserOutputRaw)).toBeGreaterThan(BigInt(result.pancake!.net!.netUserOutputRaw))
  })

  it('isolates the shadow winner from production execution and fee collection', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const before = JSON.stringify(production)
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('900000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      nowIso: NOW,
    })
    expect(result.shadowWinner?.venueId).toBe('pancakeswap')
    expect(JSON.stringify(production)).toBe(before)
    expect(result.productionQuote?.venueId).toBe('melega-dex')
    expect(result.productionQuote?.grossOutputRaw).toBe(production.grossOutputRaw)
    expect(() => applyShadowWinnerToProduction()).toThrow(V2_SHADOW_WINNER_CANNOT_REPLACE_PRODUCTION)
    expect(() => assertV2CannotCollectFeeInM3()).toThrow(V2_M3_FEE_COLLECTION_FORBIDDEN)
    expect(() => markFeeCollected(result.shadowWinner!.quote!.protocolFee)).toThrow('FEE_COLLECTION_CLAIM_FORBIDDEN')
    expect(result.shadowWinner?.feeEnforcementState).toBe(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY)
    expect(result.shadowWinner?.quote?.productionExecutionCapable).toBe(false)
    expect(isProductionCutoverAllowed()).toBe(false)
    expect(isUniversalEngineShadowOnly()).toBe(true)
    expect(potentialProtocolRevenueRaw(result.shadowWinner)).toBe(result.shadowWinner?.sealedFee?.feeAmountRaw)
  })

  it('does not compare raw gas across chains and leaves missing conversion unavailable', () => {
    const same = normalizeSameChainGas(
      [
        { venueId: 'melega-dex', chainId: 56, gasUnits: '210000', gasCostInOutputRaw: null },
        { venueId: 'pancakeswap', chainId: 56, gasUnits: '180000', gasCostInOutputRaw: null },
      ],
      56,
    )
    expect(same.comparable).toBe(false)
    expect(same.reason).toBe('GAS_UNCOMPARABLE_NO_OUTPUT_CONVERSION')
  })

  it('records latency percentiles only from real samples', () => {
    expect(latencyPercentiles([])).toEqual({ n: 0, p50: null, p95: null, max: null })
    const stats = latencyPercentiles([10, 20, 30, 40, 50])
    expect(stats.n).toBe(5)
    expect(stats.p50).toBe(30)
    expect(stats.max).toBe(50)
    expect(INSUFFICIENT_SAMPLE).toBe('INSUFFICIENT_SAMPLE')
  })

  it('encodes V2 getAmountsOut without a third-party aggregator', () => {
    const data = encodeGetAmountsOut('1000', [WBNB, USDC_BSC])
    expect(data.startsWith('0xd06ca61f')).toBe(true)
  })

  it('keeps Solana abstract and Robinhood feasibility-only', () => {
    expect(solanaNetwork().domain).toBe(EXECUTION_DOMAIN.SOLANA)
    expect(solanaMint('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'USDC', 6).domain).toBe(
      EXECUTION_DOMAIN.SOLANA,
    )
    const pancake = createPancakeSwapVenueAdapter(pancakeQuotes('1'))
    expect(pancake.capabilities().SOLANA).toBe(false)
    expect(pancake.capabilities().CROSS_CHAIN).toBe(false)
    expect(VENUE_FEE_ENFORCEMENT_FUTURE.pancakeswap.implemented).toBe(false)
    expect(VENUE_FEE_ENFORCEMENT_FUTURE.uniswap.primary).toBe(FEE_ENFORCEMENT_POSSIBILITY.WRAPPER_EXECUTOR)
    expect(PANCAKE_SWAP_VENUE.support[56]).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(UNISWAP_VENUE.support[1]).toBe(VENUE_SUPPORT.QUOTE_ONLY)
  })

  it('keeps adapter logic out of Home, Project Page, and the frozen SmartSwap widget', () => {
    expect(hostMustNotOwnRouting()).toBe(true)
    expect(engineMustNotOwnUx()).toBe(true)
    const files = [
      'src/views/Swap/SmartSwap/index.tsx',
      'src/views/Swap/SmartSwap/hooks/useSwapCallback.ts',
      'src/views/Trade/TradeCockpit.tsx',
      'src/views/HomeTrade/HomeSwapPanel.tsx',
      'src/views/ProjectPage/v1/ProjectSwapFormIsland.tsx',
    ]
    for (const rel of files) {
      const abs = path.join(WEB, rel)
      if (!existsSync(abs)) continue
      const text = readFileSync(abs, 'utf8')
      expect(text).not.toContain('smartswap-universal-engine')
      expect(text).not.toContain('createPancakeSwapVenueAdapter')
      expect(text).not.toContain('createUniswapVenueAdapter')
    }
    for (const name of ['pancakeSwapAdapter.ts', 'uniswapAdapter.ts', 'externalEvmAdapter.ts']) {
      const src = readFileSync(path.join(ENGINE, name), 'utf8')
      expect(src).not.toContain('window.ethereum')
      expect(src).not.toContain('useSigner')
      expect(src).not.toContain('wagmi')
    }
  })

  it('cannot alter current production fee wiring', () => {
    const callback = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/hooks/useSwapCallback.ts'), 'utf8')
    expect(callback).not.toContain('evaluateRevenuePolicy')
    expect(callback).not.toContain('runEvmShadowCompetition')
    expect(callback).not.toContain('settleGasProtocolFeeOnChain')
    expect(SMARTSWAP_REVENUE_POLICY_V1.maxProtocolFeeBps).toBe(25)
  })

  it('freezes approved SmartSwap UX at SHA-256 zero diff', () => {
    const manifest = JSON.parse(readFileSync(FREEZE_MANIFEST, 'utf8')) as { files: Record<string, string> }
    const current: Record<string, string> = {}
    for (const rel of SMARTSWAP_UX_FREEZE_FILES) {
      const abs = path.join(WEB, rel)
      expect(existsSync(abs), rel).toBe(true)
      current[rel] = createHash('sha256').update(readFileSync(abs)).digest('hex')
    }
    expect(current).toEqual(manifest.files)
  })

  it('serializes decisionEvidence through JSON without transforms', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('800000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      nowIso: NOW,
    })
    expect(JSON.parse(JSON.stringify(result.decisionEvidence))).toEqual(result.decisionEvidence)
    expect(result.decisionEvidence.candidates.map((row) => row.venueId)).toEqual(
      result.candidates.map((row) => row.venueId),
    )
    expect(result.decisionEvidence.chainId).toBe(56)
    expect(result.decisionEvidence.inputAsset).toEqual(bscRequest().inputAsset)
    expect(result.decisionEvidence.outputAsset).toEqual(bscRequest().outputAsset)
  })

  it('binds decisionEvidence selected identity to shadowWinner and keeps production inert', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('800000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      nowIso: NOW,
    })
    expect(result.decisionEvidence.selectedQuoteId).toBe(result.shadowWinner?.quote?.quoteId ?? null)
    expect(result.decisionEvidence.selectedVenueId).toBe(result.shadowWinner?.venueId ?? null)
    expect(result.decisionEvidence.productionMutated).toBe(false)
    expect(result.decisionEvidence.productionActivation).toBe(false)
    expect(result.decisionEvidence.sameChain).toBe(true)
    expect(result.productionMutated).toBe(false)
  })

  it('copies A5 fallback identity when two or more usable rows exist and nulls it otherwise', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const twoUsable = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('800000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    const rankedTwo = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters: twoUsable.adapters,
      nowIso: NOW,
    })
    const a5Two = selectBestNetRoute(
      rankedTwo.candidates
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
        })),
    )
    expect(a5Two.fallbackQuoteId).not.toBeNull()
    expect(a5Two.fallbackVenueId).not.toBeNull()
    expect(rankedTwo.decisionEvidence.fallbackQuoteId).toBe(a5Two.fallbackQuoteId)
    expect(rankedTwo.decisionEvidence.fallbackVenueId).toBe(a5Two.fallbackVenueId)
    expect(rankedTwo.decisionEvidence.progressiveReadiness.ready).toBe(false)
    expect(rankedTwo.decisionEvidence.progressiveReadiness.productionMutated).toBe(false)
    expect(rankedTwo.decisionEvidence.progressiveReadiness.productionActivation).toBe(false)
    expect(rankedTwo.decisionEvidence.progressiveReadiness.productionCutoverAllowed).toBe(false)
    expect(rankedTwo.decisionEvidence.progressiveReadiness.fallbackQuoteId).toBe(a5Two.fallbackQuoteId)
    expect(rankedTwo.decisionEvidence.progressiveReadiness.fallbackVenueId).toBe(a5Two.fallbackVenueId)
    expect(rankedTwo.decisionEvidence.progressiveReadiness.fallbackReady).toBe(false)

    const slowPancake = createSyntheticQuoteSource({
      [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '700000000000000000000' },
    })
    const pancake = createPancakeSwapVenueAdapter({
      async fetch(request) {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 5_000)
          request.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new Error('ADAPTER_TIMEOUT'))
          })
        })
        return slowPancake.fetch(request)
      },
    })
    const timed = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('1'),
    })
    timed.adapters[1] = pancake
    const oneUsable = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters: timed.adapters,
      budget: { ...DEFAULT_LATENCY_BUDGET, quoteTimeoutMs: 40, overallBudgetMs: 120 },
      nowIso: NOW,
    })
    const usableCount = oneUsable.candidates.filter(
      (row) =>
        row.status === 'ok' &&
        row.net?.netUserOutputRaw &&
        row.quote &&
        row.quote.productionExecutionCapable === false,
    ).length
    expect(usableCount).toBeLessThan(2)
    expect(oneUsable.decisionEvidence.fallbackQuoteId).toBeNull()
    expect(oneUsable.decisionEvidence.fallbackVenueId).toBeNull()
    expect(oneUsable.decisionEvidence.progressiveReadiness.fallbackReady).toBeNull()
  })

  it('preserves timeout candidate status, error, duration, and snapshot health on evidence', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const health = new ScopedVenueHealth()
    const slowPancake = createSyntheticQuoteSource({
      [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw: '700000000000000000000' },
    })
    const pancake = createPancakeSwapVenueAdapter({
      async fetch(request) {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 5_000)
          request.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new Error('ADAPTER_TIMEOUT'))
          })
        })
        return slowPancake.fetch(request)
      },
    })
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('1'),
    })
    adapters[1] = pancake
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      health,
      budget: { ...DEFAULT_LATENCY_BUDGET, quoteTimeoutMs: 40, overallBudgetMs: 120 },
      nowIso: NOW,
    })
    const pancakeCandidate = result.pancake
    const pancakeEvidence = result.decisionEvidence.candidates.find((row) => row.venueId === 'pancakeswap')
    expect(pancakeCandidate?.status).toBe('timeout')
    expect(pancakeEvidence?.status).toBe(pancakeCandidate?.status)
    expect(pancakeEvidence?.error).toBe(pancakeCandidate?.error)
    expect(pancakeEvidence?.durationMs).toBe(pancakeCandidate?.durationMs)
    const snap = health.snapshot(healthScopeKey('pancakeswap', 56), 'pancakeswap', NOW)
    expect(pancakeEvidence?.healthState).toBe(snap.state)
    expect(pancakeEvidence?.healthReason).toBe(snap.reason)
    expect(pancakeEvidence?.circuitBreakerOpen).toBe(snap.signals.circuitBreakerOpen)
    expect(result.decisionEvidence.progressiveReadiness.ready).toBe(false)
  })

  it('preserves breaker-open skip evidence from the existing health snapshot', async () => {
    const health = new ScopedVenueHealth({ failureThreshold: 2, cooldownMs: 60_000 })
    const failing = createPancakeSwapVenueAdapter({
      async fetch() {
        throw new Error('RPC_DOWN')
      },
    })
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('1'),
    })
    adapters[1] = failing
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    await runEvmShadowCompetition({ request: bscRequest(), productionQuote: production, adapters, health, nowIso: NOW })
    await runEvmShadowCompetition({ request: bscRequest(), productionQuote: production, adapters, health, nowIso: NOW })
    const skipped = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      health,
      nowIso: NOW,
    })
    const pancakeEvidence = skipped.decisionEvidence.candidates.find((row) => row.venueId === 'pancakeswap')
    expect(pancakeEvidence?.status).toBe('skipped')
    expect(pancakeEvidence?.error).toContain('CIRCUIT_BREAKER_OPEN')
    const snap = health.snapshot(healthScopeKey('pancakeswap', 56), 'pancakeswap', NOW)
    expect(pancakeEvidence?.circuitBreakerOpen).toBe(true)
    expect(pancakeEvidence?.circuitBreakerOpen).toBe(snap.signals.circuitBreakerOpen)
    expect(pancakeEvidence?.healthState).toBe(snap.state)
    expect(pancakeEvidence?.healthReason).toBe(snap.reason)
    expect(skipped.decisionEvidence.progressiveReadiness.ready).toBe(false)
  })

  it('preserves readiness-blocked candidate evidence without changing the winner', async () => {
    const health = new ScopedVenueHealth()
    const { adapters } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY,
      pancakeSource: pancakeQuotes('610000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    const production = normalizeMelegaLegacyQuote(LEGACY, NOW)
    const result = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: production,
      adapters,
      health,
      nowIso: NOW,
      readinessProbe: async ({ adapter }) => {
        if (adapter.identity().venueId === 'pancakeswap') {
          return healthSnapshot('pancakeswap', VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-unavailable', {
            providerHealthy: false,
          }, NOW)
        }
        return null
      },
    })
    const pancakeCandidate = result.pancake
    const pancakeEvidence = result.decisionEvidence.candidates.find((row) => row.venueId === 'pancakeswap')
    expect(pancakeCandidate?.status).toBe('skipped')
    expect(pancakeCandidate?.error).toBe('VENUE_READINESS_BLOCKED:rpc-unavailable')
    expect(pancakeEvidence?.status).toBe(pancakeCandidate?.status)
    expect(pancakeEvidence?.error).toBe(pancakeCandidate?.error)
    const snap = health.snapshot(healthScopeKey('pancakeswap', 56), 'pancakeswap', NOW)
    expect(pancakeEvidence?.healthState).toBe(snap.state)
    expect(pancakeEvidence?.healthReason).toBe(snap.reason)
    expect(pancakeEvidence?.circuitBreakerOpen).toBe(snap.signals.circuitBreakerOpen)
    expect(result.shadowWinner?.venueId).toBe('melega-dex')
    expect(result.decisionEvidence.selectedVenueId).toBe('melega-dex')
    expect(result.melega?.status).toBe('ok')
    expect(result.decisionEvidence.progressiveReadiness.ready).toBe(false)
  })

  it('marks progressive readiness true only on an enforceable selected fixture without activating production', () => {
    const evidence = {
      chainId: 56,
      inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
      outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
      selectedQuoteId: 'sel-1',
      selectedVenueId: 'pancakeswap',
      fallbackQuoteId: null,
      fallbackVenueId: null,
      productionMutated: false as const,
      productionActivation: false as const,
      sameChain: true as const,
      candidates: [
        {
          venueId: 'pancakeswap',
          status: 'ok' as const,
          error: null,
          durationMs: 12,
          netUserOutputRaw: '100',
          feeEnforcementState: PROTOCOL_FEE_STATE.FEE_ENFORCEABLE,
          smartSwapFeeBps: 20,
          feeBand: 'standard',
          healthState: VENUE_HEALTH_STATE.HEALTHY,
          healthReason: null,
          circuitBreakerOpen: false,
        },
      ],
    } as ShadowDecisionEvidence
    const readiness = evaluateShadowProgressiveReadiness(evidence)
    expect(readiness.ready).toBe(true)
    expect(readiness.productionActivation).toBe(false)
    expect(readiness.productionCutoverAllowed).toBe(false)
    expect(readiness.fallbackReady).toBeNull()
    expect(isProductionCutoverAllowed()).toBe(false)
  })

  it('keeps progressive readiness false for preview fee and open breaker fixtures', () => {
    const base = {
      chainId: 56,
      inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
      outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
      selectedQuoteId: 'sel-1',
      selectedVenueId: 'pancakeswap',
      fallbackQuoteId: null,
      fallbackVenueId: null,
      productionMutated: false as const,
      productionActivation: false as const,
      sameChain: true as const,
      candidates: [
        {
          venueId: 'pancakeswap',
          status: 'ok' as const,
          error: null,
          durationMs: 12,
          netUserOutputRaw: '100',
          feeEnforcementState: PROTOCOL_FEE_STATE.FEE_ENFORCEABLE,
          smartSwapFeeBps: 20,
          feeBand: 'standard',
          healthState: VENUE_HEALTH_STATE.HEALTHY,
          healthReason: null,
          circuitBreakerOpen: false,
        },
      ],
    }
    const preview = {
      ...base,
      candidates: [{ ...base.candidates[0], feeEnforcementState: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY }],
    } as ShadowDecisionEvidence
    const breaker = {
      ...base,
      candidates: [{ ...base.candidates[0], circuitBreakerOpen: true }],
    } as ShadowDecisionEvidence
    expect(evaluateShadowProgressiveReadiness(preview).ready).toBe(false)
    expect(evaluateShadowProgressiveReadiness(breaker).ready).toBe(false)
    expect(evaluateShadowProgressiveReadiness(preview).productionActivation).toBe(false)
    expect(isProductionCutoverAllowed()).toBe(false)
  })
})
