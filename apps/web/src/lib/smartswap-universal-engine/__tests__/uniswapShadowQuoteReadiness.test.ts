import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS } from '../assetIdentity'
import { PANCAKE_SWAP_VENUE, UNISWAP_VENUE, VENUE_SUPPORT } from '../certifiedVenues'
import { EVM_CHAIN_IDS, evmNetwork, solanaExecutionEnabled } from '../domain'
import {
  CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
  adapterMayNotSubstituteBeneficiary,
  assertCanonicalFeeBeneficiary,
} from '../feeEnforcement'
import { PROTOCOL_FEE_STATE, canMarkRouteProductionCapable, markFeeCollected } from '../fee'
import { VENUE_HEALTH_STATE, healthSnapshot } from '../health'
import { DEFAULT_LATENCY_BUDGET } from '../latency'
import { normalizeMelegaLegacyQuote, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
import {
  PRODUCTION_EXECUTION_MODE,
  UNIVERSAL_ENGINE_MODE,
  V2_SHADOW_EXECUTION_FORBIDDEN,
  isProductionCutoverAllowed,
} from '../operatingMode'
import { applyShadowWinnerToProduction, assertV2CannotCollectFeeInM3 } from '../productionIsolation'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import { assertSameChainOnly, CROSS_CHAIN_FORBIDDEN, runEvmShadowCompetition } from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { ScopedVenueHealth, healthScopeKey } from '../scopedHealth'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { VENUE_FEE_ENFORCEMENT_FUTURE } from '../venueFeeEnforcementFuture'
import { EXTERNAL_VENUE_IDS, buildVenueRegistry } from '../venueRegistry'
import { createUniswapVenueAdapter } from '../uniswapAdapter'
import { assertHostDoesNotSupplyFee } from '../widget'
import { buildEvmShadowVenueRegistry } from '../evmShadowRegistry'
import {
  UNISWAP_CANARY_NEXT_GATE,
  UNISWAP_FIRST_TARGET_CHAIN_ARCHITECT_DECISION_MISSING,
  UNISWAP_SHADOW_QUOTE_READINESS_ID,
  UNISWAP_SHADOW_QUOTE_WRONG_CHAIN,
  assertUniswapFeeBypassForbidden,
  certifyUniswapShadowQuoteReadiness,
  createExistingEvmReadinessProbe,
  firstCanonicalUniswapShadowRequest,
  resolveFirstCanonicalUniswapVenueFromCatalog,
  robinhoodRemainsFeasibilityRequired,
  runCertifiedUniswapShadowQuoteCompetition,
} from '../uniswapShadowQuoteReadiness'

const WEB = path.resolve(__dirname, '../../../..')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')
const NOW = '2026-09-11T15:00:00.000Z'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC_ETH = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC_BSC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'

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
  freshness: NOW,
  slippageBps: 50,
}

function uniswapQuotes(amountOutRaw: string) {
  return createSyntheticQuoteSource({
    [`1:${WETH}>${USDC_ETH}`]: { amountOutRaw },
  })
}

function pancakeQuotes(amountOutRaw: string) {
  return createSyntheticQuoteSource({
    [`56:${WBNB}>${USDC_BSC}`]: { amountOutRaw },
  })
}

function bscRequest() {
  return {
    requestId: 'pancake-bsc-preserve',
    network: evmNetwork(56),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw: '1000000000000000000',
    exactOut: false,
    slippageBps: 50,
  }
}

const PANCAKE_BEFORE = JSON.stringify({
  support: PANCAKE_SWAP_VENUE.support,
  routers: PANCAKE_SWAP_VENUE.routers,
  wrappedNative: PANCAKE_SWAP_VENUE.wrappedNative,
  v2LpFeeBps: PANCAKE_SWAP_VENUE.v2LpFeeBps,
})

describe('SmartSwap first canonical Uniswap SHADOW/QUOTE readiness', () => {
  it('uses the certified catalog Ethereum Uniswap target and does not invent a chain', () => {
    const venue = resolveFirstCanonicalUniswapVenueFromCatalog()
    expect(venue.chainId).toBe(EVM_CHAIN_IDS.ETHEREUM)
    expect(venue.chainId).toBe(1)
    expect(venue.venueId).toBe('uniswap')
    expect(venue.support).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(venue.certifiedRouter).toBe('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(venue.wrappedNative).toBe('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
    expect(venue.catalog).toBe(UNISWAP_VENUE)
    expect(venue.productionEnabled).toBe(false)
    expect(venue.executionEnabled).toBe(false)
    expect(venue.shadowQuoteEnabled).toBe(true)
    expect(UNISWAP_VENUE.support[56]).toBe(VENUE_SUPPORT.NOT_VERIFIED)
    expect(UNISWAP_VENUE.routers[56]).toBeUndefined()
    expect(() =>
      resolveFirstCanonicalUniswapVenueFromCatalog({
        ...UNISWAP_VENUE,
        routers: {},
        support: {
          [EVM_CHAIN_IDS.ETHEREUM]: VENUE_SUPPORT.NOT_VERIFIED,
        },
      }),
    ).toThrow(UNISWAP_FIRST_TARGET_CHAIN_ARCHITECT_DECISION_MISSING)
  })

  it('certifies SHADOW/QUOTE readiness without opening canary, execution, or fee bypass', () => {
    expect(PRODUCTION_EXECUTION_MODE).toBe('LEGACY_PRODUCTION')
    expect(UNIVERSAL_ENGINE_MODE).toBe('SHADOW')
    expect(isProductionCutoverAllowed()).toBe(false)
    const cert = certifyUniswapShadowQuoteReadiness()
    expect(cert.id).toBe(UNISWAP_SHADOW_QUOTE_READINESS_ID)
    expect(cert.venue.chainId).toBe(1)
    expect(cert.productionEnabled).toBe(false)
    expect(cert.executionEnabled).toBe(false)
    expect(cert.canary).toBe(false)
    expect(cert.productionCutoverAllowed).toBe(false)
    expect(cert.feeBypassClosed).toBe(true)
    expect(cert.feeEnforcementImplemented).toBe(false)
    expect(cert.treasury).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
    expect(cert.treasury).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(cert.solanaExecutionEnabled).toBe(false)
    expect(solanaExecutionEnabled()).toBe(false)
    expect(cert.robinhoodReason).toBe('FEASIBILITY_REQUIRED')
    expect(robinhoodRemainsFeasibilityRequired()).toBe(true)
    expect(EXTERNAL_VENUE_IDS).toContain('robinhood')
    expect(cert.nextGate).toBe(UNISWAP_CANARY_NEXT_GATE)
    expect(cert.nextGate).toBe('FOUNDER_AUTHORIZED_UNISWAP_ETHEREUM_WRAPPER_EXECUTOR_FEE_ENFORCEABLE_CANARY')
    expect(VENUE_FEE_ENFORCEMENT_FUTURE.uniswap.implemented).toBe(false)
    expect(cert.pancakePreserved.bscSupport).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(cert.pancakePreserved.bscRouter).toBe('0x10ED43C718714eb63d5aA57B78B54704E256024E')
    expect(cert.pancakePreserved.productionEnabled).toBe(false)
    expect(JSON.stringify({
      support: PANCAKE_SWAP_VENUE.support,
      routers: PANCAKE_SWAP_VENUE.routers,
      wrappedNative: PANCAKE_SWAP_VENUE.wrappedNative,
      v2LpFeeBps: PANCAKE_SWAP_VENUE.v2LpFeeBps,
    })).toBe(PANCAKE_BEFORE)
  })

  it('lets a valid Uniswap quote participate deterministically in SHADOW ranking', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY_ETH, NOW)
    const run = await runCertifiedUniswapShadowQuoteCompetition({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('3000000000'),
      productionQuote: production,
      nowIso: NOW,
    })
    expect(run.result.decisionEvidence.chainId).toBe(1)
    expect(run.result.uniswap?.status).toBe('ok')
    expect(run.result.uniswap?.quote?.venueId).toBe('uniswap')
    expect(run.result.uniswap?.quote?.network).toEqual(evmNetwork(1))
    expect(run.result.shadowWinner?.venueId).toBe('uniswap')
    expect(run.result.decisionEvidence.selectedVenueId).toBe('uniswap')
    expect(run.result.decisionEvidence.selectedQuoteId).toBe(run.result.uniswap?.quote?.quoteId)
    expect(run.result.decisionEvidence.fallbackVenueId).toBe('melega-dex')
    expect(run.result.decisionEvidence.fallbackQuoteId).toBe(run.result.melega?.quote?.quoteId)
    expect(run.result.pancake?.status).toBe('unsupported')
    expect(run.result.productionMutated).toBe(false)
    expect(run.result.decisionEvidence.productionActivation).toBe(false)
    expect(run.result.decisionEvidence.progressiveReadiness.ready).toBe(false)
    expect(run.result.uniswap?.quote?.productionExecutionCapable).toBe(false)
    assertUniswapFeeBypassForbidden(run.result.uniswap?.quote)
    const adapter = createUniswapVenueAdapter(uniswapQuotes('3000000000'))
    expect(adapter.capabilities().EXECUTE).toBe(false)
    await expect(adapter.execute!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
  })

  it('excludes Uniswap on timeout or failure and keeps fallback deterministic', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY_ETH, NOW)
    const hung = {
      async fetch(request: { signal: AbortSignal }) {
        await new Promise<void>((_resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('ADAPTER_TIMEOUT')), 5_000)
          request.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new Error('ADAPTER_TIMEOUT'))
          })
        })
        return uniswapQuotes('3000000000').fetch(request as never)
      },
    }
    const timed = await runCertifiedUniswapShadowQuoteCompetition({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: hung,
      productionQuote: production,
      budget: { ...DEFAULT_LATENCY_BUDGET, quoteTimeoutMs: 40, overallBudgetMs: 120 },
      nowIso: NOW,
    })
    expect(timed.result.uniswap?.status).toBe('timeout')
    expect(timed.result.shadowWinner?.venueId).toBe('melega-dex')
    expect(timed.result.decisionEvidence.selectedVenueId).toBe('melega-dex')
    expect(timed.result.decisionEvidence.fallbackVenueId).toBeNull()
    expect(timed.result.candidates.some((row) => row.venueId === 'uniswap' && row.status === 'ok')).toBe(false)

    const failing = await runCertifiedUniswapShadowQuoteCompetition({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: {
        async fetch() {
          throw new Error('RPC_DOWN')
        },
      },
      productionQuote: production,
      nowIso: NOW,
    })
    expect(failing.result.uniswap?.status).toBe('error')
    expect(failing.result.shadowWinner?.venueId).toBe('melega-dex')
    expect(failing.result.decisionEvidence.selectedVenueId).toBe('melega-dex')
  })

  it('excludes Uniswap when the existing readiness probe or breaker fail-closes', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY_ETH, NOW)
    const health = new ScopedVenueHealth({ failureThreshold: 1, cooldownMs: 60_000 })
    const blocked = await runCertifiedUniswapShadowQuoteCompetition({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('3000000000'),
      productionQuote: production,
      health,
      nowIso: NOW,
      readinessProbe: async ({ adapter }) => {
        if (adapter.identity().venueId !== 'uniswap') return null
        return healthSnapshot('uniswap', VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-timeout', {
          providerHealthy: false,
        }, NOW)
      },
    })
    expect(blocked.result.uniswap?.status).toBe('skipped')
    expect(blocked.result.uniswap?.error).toBe('VENUE_READINESS_BLOCKED:rpc-timeout')
    expect(blocked.result.shadowWinner?.venueId).toBe('melega-dex')
    expect(blocked.result.candidates.find((row) => row.venueId === 'uniswap')?.status).not.toBe('ok')

    const probe = createExistingEvmReadinessProbe({
      rpcUrlByChain: {},
    })
    const missingRpc = await runCertifiedUniswapShadowQuoteCompetition({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('3000000000'),
      productionQuote: production,
      nowIso: NOW,
      readinessProbe: probe,
    })
    expect(missingRpc.result.uniswap?.status).toBe('skipped')
    expect(missingRpc.result.uniswap?.error).toContain('VENUE_READINESS_BLOCKED')
  })

  it('keeps production execution and fee bypass fail-closed', async () => {
    const production = normalizeMelegaLegacyQuote(LEGACY_ETH, NOW)
    const before = JSON.stringify(production)
    const run = await runCertifiedUniswapShadowQuoteCompetition({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('1'),
      uniswapSource: uniswapQuotes('3000000000'),
      productionQuote: production,
      nowIso: NOW,
    })
    expect(JSON.stringify(production)).toBe(before)
    expect(run.result.productionQuote?.grossOutputRaw).toBe(production.grossOutputRaw)
    expect(() => applyShadowWinnerToProduction()).toThrow('V2_SHADOW_WINNER_CANNOT_REPLACE_PRODUCTION')
    expect(() => assertV2CannotCollectFeeInM3()).toThrow('V2_M3_FEE_COLLECTION_FORBIDDEN')
    expect(() => markFeeCollected(run.result.uniswap!.quote!.protocolFee)).toThrow('FEE_COLLECTION_CLAIM_FORBIDDEN')
    expect(canMarkRouteProductionCapable(run.result.uniswap!.quote!.protocolFee)).toBe(false)
    expect(run.result.uniswap?.feeEnforcementState).toBe(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY)
    expect(() => assertCanonicalFeeBeneficiary('0x0000000000000000000000000000000000000001')).toThrow(
      'FEE_BENEFICIARY_NOT_CANONICAL',
    )
    expect(() => adapterMayNotSubstituteBeneficiary('0x0000000000000000000000000000000000000001')).toThrow(
      'FEE_BENEFICIARY_NOT_CANONICAL',
    )
    expect(assertCanonicalFeeBeneficiary(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)).toBe(
      '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
    )
    expect(() =>
      assertHostDoesNotSupplyFee({
        walletConnected: false,
        walletAddress: null,
        network: null,
        requestedInput: null,
        requestedOutput: null,
        runtimeEnvironment: 'melega-dex',
        feeBps: 1,
      } as never),
    ).toThrow('HOST_CANNOT_OVERRIDE_REVENUE_POLICY')
    expect(run.certification.canary).toBe(false)
    expect(run.result.decisionEvidence.progressiveReadiness.productionActivation).toBe(false)
  })

  it('preserves Pancake catalog, evidence, and BSC SHADOW state after the Uniswap ETH run', async () => {
    const health = new ScopedVenueHealth({ failureThreshold: 3, cooldownMs: 10_000 })
    const eth = await runCertifiedUniswapShadowQuoteCompetition({
      melegaSnapshot: LEGACY_ETH,
      pancakeSource: pancakeQuotes('800000000000000000000'),
      uniswapSource: uniswapQuotes('3000000000'),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY_ETH, NOW),
      health,
      nowIso: NOW,
    })
    expect(eth.result.pancake?.status).toBe('unsupported')
    expect(health.snapshot(healthScopeKey('pancakeswap', 1), 'pancakeswap').state).not.toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    expect(health.snapshot(healthScopeKey('pancakeswap', 56), 'pancakeswap').signals.circuitBreakerOpen).toBe(false)
    expect(JSON.stringify({
      support: PANCAKE_SWAP_VENUE.support,
      routers: PANCAKE_SWAP_VENUE.routers,
      wrappedNative: PANCAKE_SWAP_VENUE.wrappedNative,
      v2LpFeeBps: PANCAKE_SWAP_VENUE.v2LpFeeBps,
    })).toBe(PANCAKE_BEFORE)
    expect(PANCAKE_SWAP_VENUE.support[56]).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(PANCAKE_SWAP_VENUE.routers[56]).toBe('0x10ED43C718714eb63d5aA57B78B54704E256024E')

    const { adapters, catalog } = buildEvmShadowVenueRegistry({
      melegaSnapshot: LEGACY_BSC,
      pancakeSource: pancakeQuotes('800000000000000000000'),
      uniswapSource: uniswapQuotes('1'),
    })
    const pancake = await runEvmShadowCompetition({
      request: bscRequest(),
      productionQuote: normalizeMelegaLegacyQuote(LEGACY_BSC, NOW),
      adapters,
      health,
      nowIso: NOW,
    })
    expect(pancake.pancake?.status).toBe('ok')
    expect(pancake.shadowWinner?.venueId).toBe('pancakeswap')
    expect(pancake.uniswap?.status).toBe('unsupported')
    expect(catalog.find((row) => row.venueId === 'pancakeswap')?.productionEnabled).toBe(false)
    expect(catalog.find((row) => row.venueId === 'pancakeswap')?.shadowQuoteEnabled).toBe(true)
    const pancakeAdapter = createPancakeSwapVenueAdapter(pancakeQuotes('800000000000000000000'))
    expect(pancakeAdapter.supportsAssetPair(bscRequest())).toBe(true)
    expect(pancakeAdapter.supportsAssetPair(firstCanonicalUniswapShadowRequest())).toBe(false)
    expect(buildVenueRegistry(LEGACY_BSC).catalog.find((row) => row.venueId === 'pancakeswap')?.enabled).toBe(false)
  })

  it('rejects a non-certified Uniswap chain and forbids cross-chain', async () => {
    await expect(
      runCertifiedUniswapShadowQuoteCompetition({
        melegaSnapshot: LEGACY_BSC,
        pancakeSource: pancakeQuotes('1'),
        uniswapSource: uniswapQuotes('1'),
        request: bscRequest(),
        nowIso: NOW,
      }),
    ).rejects.toThrow(UNISWAP_SHADOW_QUOTE_WRONG_CHAIN)
    expect(UNISWAP_VENUE.support[56]).toBe(VENUE_SUPPORT.NOT_VERIFIED)
    const request = firstCanonicalUniswapShadowRequest()
    expect(() => assertSameChainOnly(request)).not.toThrow()
    expect(() =>
      assertSameChainOnly({
        ...request,
        outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcSolana,
      }),
    ).toThrow(CROSS_CHAIN_FORBIDDEN)
    expect(() =>
      assertSameChainOnly({
        ...request,
        outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
      }),
    ).toThrow(CROSS_CHAIN_FORBIDDEN)
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
})
