/**
 * M3 same-chain EVM multi-venue SHADOW competition.
 * Parallel quotes. Failure isolated. Winner never replaces production.
 */

import { PROTOCOL_FEE_STATE } from './fee'
import { DEFAULT_LATENCY_BUDGET, collectBoundedParallel, type LatencyBudget } from './latency'
import { computeStructuralRouteCost } from './costTaxonomy'
import { evaluateRevenuePolicy } from './evaluateRevenuePolicy'
import { computeNetUserOutput, type NetExecutionResult } from './netExecution'
import { FEE_ASSET_SOURCE, sealSmartSwapFee, type SealedSmartSwapFee } from './quoteFee'
import { selectBestNetRoute } from './routeSelection'
import { quoteIfCapable, type SmartSwapVenueAdapter } from './venueAdapter'
import { quoteIsStale, type NormalizedQuote, type SmartSwapRequest } from './quote'
import { isEvmNetwork } from './domain'
import { assetsEqual } from './assetIdentity'
import { HEALTH_EVENT, ScopedVenueHealth, classifyAdapterError, healthScopeKey } from './scopedHealth'
import { VENUE_FEE_SEMANTICS_BY_ID, VENUE_STRUCTURAL_FEE_BPS, type VenueFeeSemantics } from './venueFeeSemantics'
import { cloneProductionQuote } from './productionIsolation'
import type { RevenuePolicyAssessment } from './evaluateRevenuePolicy'
import { MELEGA_DEX_VENUE_ID } from './melegaDexAdapter'
import { PANCAKESWAP_VENUE_ID, UNISWAP_VENUE_ID } from './certifiedVenues'

export const CROSS_CHAIN_FORBIDDEN = 'CROSS_CHAIN_FORBIDDEN' as const
export const SPLIT_ROUTE_FORBIDDEN = 'SPLIT_ROUTE_FORBIDDEN' as const

export interface ShadowCandidate {
  venueId: string
  status: 'ok' | 'timeout' | 'error' | 'no_route' | 'unsupported' | 'stale' | 'skipped'
  quote: NormalizedQuote | null
  durationMs: number
  structuralRouteCostBps: number | null
  smartSwapFeeBps: number | null
  feeBand: string | null
  feeEnforcementState: string
  venueFeeSemantics: VenueFeeSemantics | null
  sealedFee: SealedSmartSwapFee | null
  net: NetExecutionResult | null
  assessment: RevenuePolicyAssessment | null
  error: string | null
  kind: 'SYNTHETIC' | 'FACTUAL' | 'LEGACY_MELEGA' | null
}

export interface ShadowCompetitionResult {
  productionQuote: NormalizedQuote | null
  melega: ShadowCandidate | null
  pancake: ShadowCandidate | null
  uniswap: ShadowCandidate | null
  candidates: ShadowCandidate[]
  shadowWinner: ShadowCandidate | null
  grossOutputDifferenceRaw: string | null
  netOutputDifferenceRaw: string | null
  latencyDifferenceMs: number | null
  productionMutated: false
  sameChain: true
}

function assertSameChainRequest(request: SmartSwapRequest): void {
  if (!isEvmNetwork(request.network) || !isEvmNetwork(request.inputAsset.network) || !isEvmNetwork(request.outputAsset.network)) {
    throw new Error(CROSS_CHAIN_FORBIDDEN)
  }
  if (request.network.chainId !== request.inputAsset.network.chainId) throw new Error(CROSS_CHAIN_FORBIDDEN)
  if (request.inputAsset.network.chainId !== request.outputAsset.network.chainId) throw new Error(CROSS_CHAIN_FORBIDDEN)
}

export function assertSingleVenueRoute(quote: NormalizedQuote): void {
  const venues = new Set(quote.hops.map((hop) => hop.venueId))
  if (venues.size > 1) throw new Error(SPLIT_ROUTE_FORBIDDEN)
  if (quote.hops.some((hop) => hop.venueId !== quote.venueId)) throw new Error(SPLIT_ROUTE_FORBIDDEN)
}

function enrich(quote: NormalizedQuote, durationMs: number, kind: ShadowCandidate['kind']): ShadowCandidate {
  assertSingleVenueRoute(quote)
  const venueFeesBps = VENUE_STRUCTURAL_FEE_BPS[quote.venueId] ?? null
  const semantics = VENUE_FEE_SEMANTICS_BY_ID[quote.venueId] ?? null
  const structural = computeStructuralRouteCost({
    venueFeesBps,
    bridgeCostsBps: 0,
    gasCostBps: null,
    venueFeesEmbeddedInGross: semantics === 'EMBEDDED_IN_QUOTED_OUTPUT',
    bridgeCostsEmbeddedInGross: true,
  })
  const assessment = evaluateRevenuePolicy({
    structuralRouteCostBps: structural.structuralRouteCostBps,
    swapValueNormalized: null,
    inputAmountRaw: quote.inputAmountRaw,
    feeEnforcementState: quote.protocolFee.state,
  })
  const sealedFee =
    assessment.feeBand && assessment.feeBps != null
      ? sealSmartSwapFee({
          assessment,
          baseAmountRaw: quote.grossOutputRaw,
          feeAssetSource: FEE_ASSET_SOURCE.OUTPUT,
          feeAsset: quote.outputAsset,
          quoteTimestamp: quote.quotedAt,
          quoteExpiry: quote.expiresAt ?? quote.quotedAt,
        })
      : null
  const net =
    sealedFee != null
      ? computeNetUserOutput({
          grossOutputRaw: quote.grossOutputRaw,
          venueFeeRaw: quote.venueFeeRaw,
          venueFeesEmbeddedInGross: semantics === 'EMBEDDED_IN_QUOTED_OUTPUT',
          bridgeCostRaw: null,
          bridgeCostsEmbeddedInGross: true,
          gasCostInOutputRaw: null,
          smartSwapFeeRaw: sealedFee.feeAmountRaw,
          smartSwapFeeEmbeddedInGross: false,
        })
      : null
  return {
    venueId: quote.venueId,
    status: quote.stale ? 'stale' : 'ok',
    quote: {
      ...quote,
      netUserOutputRaw: net?.netUserOutputRaw ?? quote.netUserOutputRaw,
      productionExecutionCapable: false,
      protocolFee: {
        ...quote.protocolFee,
        bps: assessment.feeBps,
        amountRaw: sealedFee?.feeAmountRaw ?? null,
        productionExecutionEligible: false,
        state:
          quote.protocolFee.state === PROTOCOL_FEE_STATE.FEE_ENFORCEABLE
            ? PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY
            : quote.protocolFee.state,
      },
    },
    durationMs,
    structuralRouteCostBps: structural.structuralRouteCostBps,
    smartSwapFeeBps: assessment.feeBps,
    feeBand: assessment.feeBand,
    feeEnforcementState: quote.protocolFee.state,
    venueFeeSemantics: semantics,
    sealedFee,
    net,
    assessment,
    error: null,
    kind,
  }
}

function emptyCandidate(venueId: string, status: ShadowCandidate['status'], durationMs: number, error: string | null): ShadowCandidate {
  return {
    venueId,
    status,
    quote: null,
    durationMs,
    structuralRouteCostBps: VENUE_STRUCTURAL_FEE_BPS[venueId] ?? null,
    smartSwapFeeBps: null,
    feeBand: null,
    feeEnforcementState: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
    venueFeeSemantics: VENUE_FEE_SEMANTICS_BY_ID[venueId] ?? null,
    sealedFee: null,
    net: null,
    assessment: null,
    error,
    kind: null,
  }
}

export function assertSameChainOnly(request: SmartSwapRequest): void {
  assertSameChainRequest(request)
}

export async function runEvmShadowCompetition(input: {
  request: SmartSwapRequest
  productionQuote: NormalizedQuote | null
  adapters: SmartSwapVenueAdapter[]
  health?: ScopedVenueHealth
  budget?: LatencyBudget
  nowIso?: string
  now?: () => number
}): Promise<ShadowCompetitionResult> {
  assertSameChainRequest(input.request)
  const productionQuote = cloneProductionQuote(input.productionQuote)
  const nowIso = input.nowIso ?? new Date().toISOString()
  const health = input.health ?? new ScopedVenueHealth()
  const chainId = isEvmNetwork(input.request.network) ? input.request.network.chainId : null

  const tasks = input.adapters.map((adapter) => {
    const venueId = adapter.identity().venueId
    return {
      id: venueId,
      run: async (signal: AbortSignal) => {
        const scope = healthScopeKey(venueId, chainId)
        if (health.breaker.isOpen(scope)) {
          throw new Error('CIRCUIT_BREAKER_OPEN')
        }
        if (!adapter.supportsAssetPair(input.request)) {
          throw new Error(`VENUE_PAIR_UNSUPPORTED:${venueId}`)
        }
        const quoted = await quoteIfCapable(adapter, input.request, { signal, nowIso })
        if (!assetsEqual(quoted.inputAsset, input.request.inputAsset) || !assetsEqual(quoted.outputAsset, input.request.outputAsset)) {
          throw new Error(`VENUE_PAIR_UNSUPPORTED:${venueId}:identity`)
        }
        if (quoted.stale || quoteIsStale(quoted, nowIso, (input.budget ?? DEFAULT_LATENCY_BUDGET).staleQuoteMs)) {
          throw new Error('QUOTE_STALE')
        }
        return quoted
      },
    }
  })

  const results = await collectBoundedParallel(tasks, input.budget ?? DEFAULT_LATENCY_BUDGET, input.now)

  const candidates: ShadowCandidate[] = results.map((row) => {
    const scope = healthScopeKey(row.id, chainId)
    if (row.status === 'ok') {
      health.record(scope, HEALTH_EVENT.QUOTE_SUCCESS, row.durationMs)
      const kind =
        row.id === MELEGA_DEX_VENUE_ID
          ? 'LEGACY_MELEGA'
          : row.value.confidence === 70
            ? 'FACTUAL'
            : 'SYNTHETIC'
      return enrich(row.value, row.durationMs, kind)
    }
    const message = row.status === 'timeout' ? 'ADAPTER_TIMEOUT' : row.status === 'error' ? row.error : row.status
    if (message.includes('CIRCUIT_BREAKER_OPEN')) {
      return emptyCandidate(row.id, 'skipped', row.durationMs, message)
    }
    const event = row.status === 'timeout' ? HEALTH_EVENT.TIMEOUT : classifyAdapterError(message)
    health.record(scope, event, row.durationMs)
    if (event === HEALTH_EVENT.UNSUPPORTED_PAIR || event === HEALTH_EVENT.UNSUPPORTED_CHAIN || event === HEALTH_EVENT.NO_ROUTE) {
      const status = event === HEALTH_EVENT.NO_ROUTE ? 'no_route' : 'unsupported'
      return emptyCandidate(row.id, status, row.durationMs, message)
    }
    if (row.status === 'timeout') return emptyCandidate(row.id, 'timeout', row.durationMs, 'ADAPTER_TIMEOUT')
    if (message === 'QUOTE_STALE') return emptyCandidate(row.id, 'stale', row.durationMs, message)
    return emptyCandidate(row.id, 'error', row.durationMs, message)
  })

  const usable = candidates.filter(
    (row) =>
      row.status === 'ok' &&
      row.net?.netUserOutputRaw &&
      row.quote &&
      row.quote.productionExecutionCapable === false,
  )
  const winnerPick = selectBestNetRoute(
    usable.map((row) => ({
      quoteId: row.quote!.quoteId,
      venueId: row.venueId,
      netUserOutputRaw: row.net!.netUserOutputRaw,
      confidenceOk: true,
    })),
  )
  const shadowWinner = usable.find((row) => row.quote?.quoteId === winnerPick.selectedQuoteId) ?? null
  const productionNet = productionQuote?.netUserOutputRaw ?? productionQuote?.grossOutputRaw ?? null
  const winnerGross = shadowWinner?.quote?.grossOutputRaw ?? null
  const winnerNet = shadowWinner?.net?.netUserOutputRaw ?? null
  const productionGross = productionQuote?.grossOutputRaw ?? null

  return {
    productionQuote,
    melega: candidates.find((row) => row.venueId === MELEGA_DEX_VENUE_ID) ?? null,
    pancake: candidates.find((row) => row.venueId === PANCAKESWAP_VENUE_ID) ?? null,
    uniswap: candidates.find((row) => row.venueId === UNISWAP_VENUE_ID) ?? null,
    candidates,
    shadowWinner,
    grossOutputDifferenceRaw:
      winnerGross != null && productionGross != null ? (BigInt(winnerGross) - BigInt(productionGross)).toString() : null,
    netOutputDifferenceRaw:
      winnerNet != null && productionNet != null && /^\d+$/.test(productionNet)
        ? (BigInt(winnerNet) - BigInt(productionNet)).toString()
        : null,
    latencyDifferenceMs:
      shadowWinner && productionQuote ? shadowWinner.durationMs : null,
    productionMutated: false,
    sameChain: true,
  }
}

export function potentialProtocolRevenueRaw(candidate: ShadowCandidate | null): string | null {
  return candidate?.sealedFee?.feeAmountRaw ?? null
}
