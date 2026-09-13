/**
 * First canonical Uniswap EVM venue — SHADOW/QUOTE readiness only.
 * Chain is taken from the certified catalog. This module does not choose a chain.
 * Reuses existing health/timeout/circuit-breaker/net-output/fallback/evidence/fee primitives.
 * productionEnabled=false. execution=false. No canary. Fee bypass stays fail-closed.
 */

import { CANONICAL_EXAMPLE_ASSETS } from './assetIdentity'
import {
  PANCAKE_SWAP_VENUE,
  UNISWAP_VENUE,
  UNISWAP_VENUE_ID,
  VENUE_SUPPORT,
  isQuoteCapable,
  type CertifiedEvmVenue,
  type VenueSupportState,
} from './certifiedVenues'
import { EVM_CHAIN_IDS, evmNetwork, isEvmNetwork, solanaExecutionEnabled } from './domain'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import { PROTOCOL_FEE_STATE, canMarkRouteProductionCapable, markFeeCollected } from './fee'
import { probeEvmRpcReadinessBounded } from './evmV2Quote'
import { buildEvmShadowVenueRegistry } from './evmShadowRegistry'
import type { LatencyBudget } from './latency'
import type { LegacyMelegaQuoteSnapshot } from './melegaDexAdapter'
import {
  PRODUCTION_EXECUTION_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from './operatingMode'
import type { NormalizedQuote, SmartSwapRequest } from './quote'
import { CROSS_CHAIN_FORBIDDEN, runEvmShadowCompetition, type ShadowCompetitionResult, type ShadowVenueReadinessProbe } from './shadowCompetition'
import type { ShadowQuoteSource } from './shadowQuoteSource'
import { ScopedVenueHealth } from './scopedHealth'
import { VENUE_FEE_ENFORCEMENT_FUTURE } from './venueFeeEnforcementFuture'
import { EXTERNAL_VENUE_IDS } from './venueRegistry'

export const UNISWAP_SHADOW_QUOTE_READINESS_ID = 'SMARTSWAP_UNISWAP_ETHEREUM_SHADOW_QUOTE_READINESS' as const
export const UNISWAP_FIRST_TARGET_CHAIN_ARCHITECT_DECISION_MISSING =
  'UNISWAP_FIRST_TARGET_CHAIN_ARCHITECT_DECISION_MISSING' as const
export const UNISWAP_SHADOW_QUOTE_WRONG_CHAIN = 'UNISWAP_SHADOW_QUOTE_WRONG_CHAIN' as const
export const UNISWAP_CANARY_NEXT_GATE =
  'FOUNDER_AUTHORIZED_UNISWAP_ETHEREUM_WRAPPER_EXECUTOR_FEE_ENFORCEABLE_CANARY' as const

export interface FirstCanonicalUniswapVenue {
  venueId: typeof UNISWAP_VENUE_ID
  chainId: number
  support: VenueSupportState
  certifiedRouter: string
  wrappedNative: string
  productionEnabled: false
  executionEnabled: false
  shadowQuoteEnabled: true
  catalog: CertifiedEvmVenue
}

export interface UniswapShadowQuoteCertification {
  id: typeof UNISWAP_SHADOW_QUOTE_READINESS_ID
  venue: FirstCanonicalUniswapVenue
  productionExecutionMode: typeof PRODUCTION_EXECUTION_MODE
  universalEngineMode: typeof UNIVERSAL_ENGINE_MODE
  productionCutoverAllowed: false
  productionEnabled: false
  executionEnabled: false
  canary: false
  feeBypassClosed: true
  feeEnforcementImplemented: false
  treasury: typeof CANONICAL_SMARTSWAP_FEE_BENEFICIARY
  solanaExecutionEnabled: false
  robinhoodReason: 'FEASIBILITY_REQUIRED'
  nextGate: typeof UNISWAP_CANARY_NEXT_GATE
  pancakePreserved: {
    venueId: 'pancakeswap'
    support: CertifiedEvmVenue['support']
    routers: CertifiedEvmVenue['routers']
    productionEnabled: false
    bscSupport: VenueSupportState
    bscRouter: string
  }
}

export interface UniswapShadowQuoteReadinessRun {
  venue: FirstCanonicalUniswapVenue
  certification: UniswapShadowQuoteCertification
  result: ShadowCompetitionResult
}

function quoteCapableUniswapChainIds(catalog: CertifiedEvmVenue): number[] {
  return Object.keys(catalog.support)
    .map(Number)
    .filter((chainId) => isQuoteCapable(catalog.support[chainId] ?? VENUE_SUPPORT.NOT_VERIFIED) && Boolean(catalog.routers[chainId]))
    .sort((left, right) => left - right)
}

export function resolveFirstCanonicalUniswapVenueFromCatalog(
  catalog: CertifiedEvmVenue = UNISWAP_VENUE,
): FirstCanonicalUniswapVenue {
  const capable = quoteCapableUniswapChainIds(catalog)
  if (capable.length === 0) {
    throw new Error(UNISWAP_FIRST_TARGET_CHAIN_ARCHITECT_DECISION_MISSING)
  }
  const chainId = capable[0]
  const support = catalog.support[chainId]
  const certifiedRouter = catalog.routers[chainId]
  const wrappedNative = catalog.wrappedNative[chainId]
  if (!support || !certifiedRouter || !wrappedNative) {
    throw new Error(UNISWAP_FIRST_TARGET_CHAIN_ARCHITECT_DECISION_MISSING)
  }
  return {
    venueId: UNISWAP_VENUE_ID,
    chainId,
    support,
    certifiedRouter,
    wrappedNative,
    productionEnabled: false,
    executionEnabled: false,
    shadowQuoteEnabled: true,
    catalog,
  }
}

export function certifyUniswapShadowQuoteReadiness(): UniswapShadowQuoteCertification {
  const venue = resolveFirstCanonicalUniswapVenueFromCatalog()
  if (venue.chainId !== EVM_CHAIN_IDS.ETHEREUM) {
    throw new Error(UNISWAP_FIRST_TARGET_CHAIN_ARCHITECT_DECISION_MISSING)
  }
  if (venue.support !== VENUE_SUPPORT.QUOTE_ONLY) {
    throw new Error(UNISWAP_FIRST_TARGET_CHAIN_ARCHITECT_DECISION_MISSING)
  }
  if (isProductionCutoverAllowed()) {
    throw new Error('PRODUCTION_CUTOVER_FORBIDDEN')
  }
  if (PRODUCTION_EXECUTION_MODE !== 'LEGACY_PRODUCTION' || UNIVERSAL_ENGINE_MODE !== 'SHADOW') {
    throw new Error('UNISWAP_SHADOW_QUOTE_MODE_VIOLATION')
  }
  if (solanaExecutionEnabled()) {
    throw new Error('SOLANA_EXECUTION_FORBIDDEN')
  }
  if (VENUE_FEE_ENFORCEMENT_FUTURE.uniswap.implemented !== false) {
    throw new Error('UNISWAP_FEE_ENFORCEMENT_MUST_REMAIN_UNIMPLEMENTED')
  }
  const bscRouter = PANCAKE_SWAP_VENUE.routers[EVM_CHAIN_IDS.BSC]
  if (!bscRouter) {
    throw new Error('PANCAKE_BSC_CERTIFICATION_MISSING')
  }
  return {
    id: UNISWAP_SHADOW_QUOTE_READINESS_ID,
    venue,
    productionExecutionMode: PRODUCTION_EXECUTION_MODE,
    universalEngineMode: UNIVERSAL_ENGINE_MODE,
    productionCutoverAllowed: false,
    productionEnabled: false,
    executionEnabled: false,
    canary: false,
    feeBypassClosed: true,
    feeEnforcementImplemented: false,
    treasury: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
    solanaExecutionEnabled: false,
    robinhoodReason: 'FEASIBILITY_REQUIRED',
    nextGate: UNISWAP_CANARY_NEXT_GATE,
    pancakePreserved: {
      venueId: 'pancakeswap',
      support: PANCAKE_SWAP_VENUE.support,
      routers: PANCAKE_SWAP_VENUE.routers,
      productionEnabled: false,
      bscSupport: PANCAKE_SWAP_VENUE.support[EVM_CHAIN_IDS.BSC],
      bscRouter,
    },
  }
}

export function firstCanonicalUniswapShadowRequest(inputAmountRaw = '1000000000000000000'): SmartSwapRequest {
  const venue = resolveFirstCanonicalUniswapVenueFromCatalog()
  return {
    requestId: 'uniswap-shadow-quote-eth',
    network: evmNetwork(venue.chainId),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.weth,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
    inputAmountRaw,
    exactOut: false,
    slippageBps: 50,
  }
}

export function createExistingEvmReadinessProbe(input: {
  rpcUrlByChain: Partial<Record<number, string>>
  fetchImpl?: typeof fetch
  budget?: LatencyBudget
}): ShadowVenueReadinessProbe {
  return async ({ adapter, request, nowIso }) => {
    if (!isEvmNetwork(request.network)) return null
    return probeEvmRpcReadinessBounded({
      venueId: adapter.identity().venueId,
      chainId: request.network.chainId,
      rpcUrlByChain: input.rpcUrlByChain,
      fetchImpl: input.fetchImpl,
      nowIso,
      budget: input.budget,
    })
  }
}

export function assertUniswapFeeBypassForbidden(quote: NormalizedQuote | null | undefined): void {
  if (!quote) throw new Error('UNISWAP_QUOTE_MISSING')
  if (canMarkRouteProductionCapable(quote.protocolFee)) {
    throw new Error('UNISWAP_FEE_BYPASS_OPEN')
  }
  if (quote.productionExecutionCapable) {
    throw new Error('UNISWAP_PRODUCTION_EXECUTION_ENABLED')
  }
  if (quote.protocolFee.productionExecutionEligible) {
    throw new Error('UNISWAP_FEE_BYPASS_OPEN')
  }
  if (quote.protocolFee.state !== PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY) {
    throw new Error('UNISWAP_FEE_BYPASS_OPEN')
  }
  let collected = false
  try {
    markFeeCollected(quote.protocolFee)
    collected = true
  } catch {
    collected = false
  }
  if (collected) throw new Error('UNISWAP_FEE_BYPASS_OPEN')
}

export async function runCertifiedUniswapShadowQuoteCompetition(input: {
  pancakeSource: ShadowQuoteSource
  uniswapSource: ShadowQuoteSource
  melegaSnapshot: LegacyMelegaQuoteSnapshot | null
  productionQuote?: NormalizedQuote | null
  request?: SmartSwapRequest
  health?: ScopedVenueHealth
  budget?: LatencyBudget
  nowIso?: string
  readinessProbe?: ShadowVenueReadinessProbe
}): Promise<UniswapShadowQuoteReadinessRun> {
  const certification = certifyUniswapShadowQuoteReadiness()
  const request = input.request ?? firstCanonicalUniswapShadowRequest()
  if (!isEvmNetwork(request.network) || request.network.chainId !== certification.venue.chainId) {
    throw new Error(`${UNISWAP_SHADOW_QUOTE_WRONG_CHAIN}:${isEvmNetwork(request.network) ? request.network.chainId : 'non-evm'}`)
  }
  if (request.inputAsset.network.chainId !== request.outputAsset.network.chainId) {
    throw new Error(CROSS_CHAIN_FORBIDDEN)
  }
  const registry = buildEvmShadowVenueRegistry({
    melegaSnapshot: input.melegaSnapshot,
    pancakeSource: input.pancakeSource,
    uniswapSource: input.uniswapSource,
  })
  const uniswapRow = registry.catalog.find((row) => row.venueId === UNISWAP_VENUE_ID)
  const pancakeRow = registry.catalog.find((row) => row.venueId === 'pancakeswap')
  if (!uniswapRow || uniswapRow.productionEnabled !== false || uniswapRow.shadowQuoteEnabled !== true) {
    throw new Error('UNISWAP_SHADOW_QUOTE_REGISTRY_VIOLATION')
  }
  if (!pancakeRow || pancakeRow.productionEnabled !== false) {
    throw new Error('PANCAKE_PRODUCTION_ENABLED')
  }
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: input.productionQuote ?? null,
    adapters: registry.adapters,
    health: input.health,
    budget: input.budget,
    nowIso: input.nowIso,
    readinessProbe: input.readinessProbe,
  })
  return {
    venue: certification.venue,
    certification,
    result,
  }
}

export function robinhoodRemainsFeasibilityRequired(): boolean {
  return EXTERNAL_VENUE_IDS.includes('robinhood')
}
