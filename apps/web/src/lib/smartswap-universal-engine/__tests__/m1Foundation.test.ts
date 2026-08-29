import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  CANONICAL_EXAMPLE_ASSETS,
  assetIdentityKey,
  assetsEqual,
  assertNotSymbolIdentity,
  distinguishSymbolCollisions,
} from '../assetIdentity'
import { capabilityMap } from '../capabilities'
import { EXECUTION_DOMAIN, solanaExecutionEnabled, solanaNetwork } from '../domain'
import {
  PROTOCOL_FEE_STATE,
  SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP,
  canMarkRouteProductionCapable,
  evaluateProtocolFeeState,
  markFeeCollected,
} from '../fee'
import { VENUE_HEALTH_STATE, isQuoteEligible, healthSnapshot } from '../health'
import { VenueCircuitBreaker, normalizeAdapterError } from '../isolation'
import { DEFAULT_LATENCY_BUDGET, collectBoundedParallel } from '../latency'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  V2_SHADOW_EXECUTION_FORBIDDEN,
  isLegacyProductionAuthoritative,
  isProductionCutoverAllowed,
  isUniversalEngineShadowOnly,
} from '../operatingMode'
import { compareNormalizedQuotes } from '../routeSelection'
import { runMelegaShadowComparison, shadowMustNotAffectUserTransaction } from '../shadow'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { createMelegaDexAdapter, normalizeMelegaLegacyQuote, type LegacyMelegaQuoteSnapshot } from '../melegaDexAdapter'
import { EXTERNAL_VENUE_IDS, assertNoExternalVenueEnabled, buildVenueRegistry } from '../venueRegistry'
import { engineMustNotOwnUx, hostMustNotOwnRouting } from '../widget'
import type { NormalizedQuote } from '../quote'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')
const FREEZE_MANIFEST = path.join(
  WEB,
  'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json',
)

const LEGACY: LegacyMelegaQuoteSnapshot = {
  chainId: 56,
  input: {
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    symbol: 'WBNB',
    decimals: 18,
    isNative: false,
  },
  output: {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    symbol: 'USDC',
    decimals: 18,
  },
  inputAmountRaw: '1000000000000000000',
  expectedOutputRaw: '600000000000000000000',
  pathAddresses: [
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  ],
  priceImpactPercent: 0.42,
  gasUnits: 220000,
  source: 'smart-router',
  freshness: '2026-08-19T12:00:00.000Z',
  slippageBps: 50,
  buyMarcoOutput: false,
}

function quote(partial: Partial<NormalizedQuote> & Pick<NormalizedQuote, 'quoteId' | 'venueId' | 'grossOutputRaw'>): NormalizedQuote {
  const base = normalizeMelegaLegacyQuote(LEGACY)
  return {
    ...base,
    ...partial,
    protocolFee: partial.protocolFee ?? base.protocolFee,
    productionExecutionCapable: false,
  }
}

describe('SmartSwap Universal Engine M1 foundation', () => {
  it('keeps production execution on LEGACY_PRODUCTION and V2 in SHADOW', () => {
    expect(isLegacyProductionAuthoritative()).toBe(true)
    expect(isUniversalEngineShadowOnly()).toBe(true)
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(isProductionCutoverAllowed()).toBe(false)
  })

  it('prevents symbol-based identity and distinguishes colliding tickers', () => {
    const keys = distinguishSymbolCollisions()
    expect(keys.nativeBnb).not.toBe(keys.wbnb)
    expect(keys.nativeEth).not.toBe(keys.weth)
    expect(keys.usdcBase).not.toBe(keys.usdcBnb)
    expect(keys.usdcBnb).not.toBe(keys.usdcSolana)
    expect(assetsEqual(CANONICAL_EXAMPLE_ASSETS.usdcBase, CANONICAL_EXAMPLE_ASSETS.usdcBnb)).toBe(false)
    const usdc = assertNotSymbolIdentity('USDC', [
      CANONICAL_EXAMPLE_ASSETS.usdcBase,
      CANONICAL_EXAMPLE_ASSETS.usdcBnb,
      CANONICAL_EXAMPLE_ASSETS.usdcSolana,
    ])
    expect(new Set(usdc.map(assetIdentityKey)).size).toBe(3)
    expect(CANONICAL_EXAMPLE_ASSETS.usdcSolana.domain).toBe(EXECUTION_DOMAIN.SOLANA)
    expect(solanaExecutionEnabled()).toBe(false)
    expect(solanaNetwork().domain).toBe(EXECUTION_DOMAIN.SOLANA)
  })

  it('registers Melega quote capabilities without EXECUTE and without external venues', () => {
    const { adapters, catalog } = buildVenueRegistry(LEGACY)
    expect(adapters).toHaveLength(1)
    expect(adapters[0].capabilities()).toEqual(
      capabilityMap(['QUOTE', 'EXACT_IN', 'EXACT_OUT', 'EVM']),
    )
    expect(adapters[0].capabilities().EXECUTE).toBe(false)
    expect(adapters[0].capabilities().SOLANA).toBe(false)
    expect(EXTERNAL_VENUE_IDS).toEqual(['pancakeswap', 'uniswap', 'jupiter', 'raydium', 'orca', 'robinhood'])
    expect(catalog.find((row) => row.venueId === 'robinhood')?.reason).toBe('FEASIBILITY_REQUIRED')
    expect(() => assertNoExternalVenueEnabled(catalog)).not.toThrow()
  })

  it('normalizes a Melega legacy quote without claiming production execution', () => {
    const normalized = normalizeMelegaLegacyQuote(LEGACY)
    expect(normalized.venueId).toBe('melega-dex')
    expect(normalized.grossOutputRaw).toBe(LEGACY.expectedOutputRaw)
    expect(normalized.minimumReceivedRaw).toBe('597000000000000000000')
    expect(normalized.protocolFee.state).toBe(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY)
    expect(normalized.protocolFee.collectionProven).toBe(false)
    expect(normalized.productionExecutionCapable).toBe(false)
    expect(normalized.executionDomain).toBe(EXECUTION_DOMAIN.EVM)
  })

  it('compares routes by net outcome with no Melega home-venue preference', () => {
    const melega = quote({
      quoteId: 'melega-low',
      venueId: 'melega-dex',
      grossOutputRaw: '100',
      netUserOutputRaw: '100',
    })
    const other = quote({
      quoteId: 'external-high',
      venueId: 'unenabled-shadow-peer',
      grossOutputRaw: '140',
      netUserOutputRaw: '140',
    })
    const result = compareNormalizedQuotes([melega, other])
    expect(result.productionActivation).toBe(false)
    expect(result.selectedQuoteId).toBe('external-high')
    expect(result.orderedQuoteIds[0]).toBe('external-high')
  })

  it('excludes a missing-net quote even when its gross output is larger', () => {
    const missingNet = quote({
      quoteId: 'gross-only',
      venueId: 'unenabled-shadow-peer',
      grossOutputRaw: '999999',
      netUserOutputRaw: null,
    })
    const explicitNet = quote({
      quoteId: 'explicit-net',
      venueId: 'melega-dex',
      grossOutputRaw: '10',
      netUserOutputRaw: '10',
    })
    const result = compareNormalizedQuotes([missingNet, explicitNet])
    expect(result.productionActivation).toBe(false)
    expect(result.selectedQuoteId).toBe('explicit-net')
    expect(result.orderedQuoteIds).toEqual(['explicit-net'])
    expect(result.scores.find((row) => row.quoteId === 'gross-only')?.eligible).toBe(false)
  })

  it('returns no winner when every otherwise-eligible quote lacks usable net output', () => {
    const a = quote({
      quoteId: 'missing-a',
      venueId: 'melega-dex',
      grossOutputRaw: '500',
      netUserOutputRaw: null,
    })
    const b = quote({
      quoteId: 'missing-b',
      venueId: 'unenabled-shadow-peer',
      grossOutputRaw: '800',
      netUserOutputRaw: '',
    })
    const result = compareNormalizedQuotes([a, b])
    expect(result.productionActivation).toBe(false)
    expect(result.selectedQuoteId).toBeNull()
    expect(result.orderedQuoteIds).toEqual([])
    expect(result.scores.every((row) => row.eligible === false)).toBe(true)
  })

  it('times out a slow adapter without blocking a healthy one', async () => {
    const results = await collectBoundedParallel(
      [
        {
          id: 'fast',
          run: async () => 'ok',
        },
        {
          id: 'slow',
          run: async (signal) =>
            new Promise<string>((resolve, reject) => {
              const timer = setTimeout(() => resolve('late'), 5_000)
              signal.addEventListener('abort', () => {
                clearTimeout(timer)
                reject(new Error('ADAPTER_TIMEOUT'))
              })
            }),
        },
      ],
      { ...DEFAULT_LATENCY_BUDGET, quoteTimeoutMs: 40, overallBudgetMs: 80 },
    )
    expect(results.find((row) => row.id === 'fast')?.status).toBe('ok')
    expect(results.find((row) => row.id === 'slow')?.status).toBe('timeout')
  })

  it('isolates unavailable and degraded venues via circuit breaker', () => {
    const breaker = new VenueCircuitBreaker({ failureThreshold: 2, cooldownMs: 10_000 })
    breaker.recordFailure('jupiter')
    expect(breaker.isOpen('jupiter')).toBe(false)
    breaker.recordFailure('jupiter')
    expect(breaker.isOpen('jupiter')).toBe(true)
    expect(breaker.healthFor('jupiter').state).toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    breaker.recordSuccess('melega-dex')
    expect(breaker.healthFor('melega-dex').state).toBe(VENUE_HEALTH_STATE.HEALTHY)
    expect(isQuoteEligible(healthSnapshot('melega-dex', VENUE_HEALTH_STATE.DEGRADED))).toBe(true)
    expect(isQuoteEligible(healthSnapshot('jupiter', VENUE_HEALTH_STATE.UNAVAILABLE))).toBe(false)
    expect(normalizeAdapterError(new Error('ADAPTER_TIMEOUT')).code).toBe('ADAPTER_TIMEOUT')
  })

  it('keeps fee preview from being marked collected or production-capable', () => {
    const preview = evaluateProtocolFeeState({
      calculated: true,
      displayedInFrozenUx: true,
      includedInExecutionPlan: false,
      collectionEnforceable: false,
      destinationCanonical: true,
      collectionProven: false,
      atomicWithSwap: false,
    })
    expect(preview.state).toBe(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY)
    expect(preview.gapCode).toBe(SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP)
    expect(canMarkRouteProductionCapable(preview)).toBe(false)
    expect(() => markFeeCollected(preview)).toThrow('FEE_COLLECTION_CLAIM_FORBIDDEN')
  })

  it('maps Melega adapter shadow vs legacy without hiding mismatches', () => {
    const comparison = runMelegaShadowComparison(LEGACY)
    expect(comparison.match).toBe(true)
    expect(comparison.mismatches).toEqual([])
    expect(shadowMustNotAffectUserTransaction()).toBe(true)
    expect(comparison.shadowQuote.productionExecutionCapable).toBe(false)
  })

  it('records a material shadow mismatch instead of filling fallback values', () => {
    const weaker = normalizeMelegaLegacyQuote({ ...LEGACY, expectedOutputRaw: '1' })
    expect(weaker.grossOutputRaw).toBe('1')
    expect(weaker.grossOutputRaw).not.toBe(LEGACY.expectedOutputRaw)
    expect(weaker.netUserOutputRaw).toBe('1')
  })

  it('forbids V2 execution and Solana broadcast on the Melega adapter', async () => {
    const adapter = createMelegaDexAdapter(LEGACY)
    await expect(adapter.execute!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
    await expect(adapter.prepareExecution!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
    expect(adapter.capabilities().SOLANA).toBe(false)
  })

  it('keeps the widget/engine/host layers independent', () => {
    expect(hostMustNotOwnRouting()).toBe(true)
    expect(engineMustNotOwnUx()).toBe(true)
    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    const cockpit = readFileSync(path.join(WEB, 'src/views/Trade/TradeCockpit.tsx'), 'utf8')
    const callback = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/hooks/useSwapCallback.ts'), 'utf8')
    expect(form).not.toContain('smartswap-universal-engine')
    expect(cockpit).not.toContain('smartswap-universal-engine')
    expect(callback).not.toContain('smartswap-universal-engine')
    expect(callback).not.toContain('settleGasProtocolFeeOnChain')
  })

  it('freezes approved SmartSwap UX file hashes', () => {
    expect(existsSync(FREEZE_MANIFEST)).toBe(true)
    const manifest = JSON.parse(readFileSync(FREEZE_MANIFEST, 'utf8')) as {
      files: Record<string, string>
    }
    const current: Record<string, string> = {}
    for (const rel of SMARTSWAP_UX_FREEZE_FILES) {
      const abs = path.join(WEB, rel)
      expect(existsSync(abs), rel).toBe(true)
      current[rel] = createHash('sha256').update(readFileSync(abs)).digest('hex')
    }
    expect(current).toEqual(manifest.files)
  })
})
