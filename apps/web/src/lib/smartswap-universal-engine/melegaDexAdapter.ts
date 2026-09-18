/**
 * Melega DEX as the first Venue Adapter.
 * Maps existing SmartSwap quote snapshots into the V2 normalized quote.
 * Does not rewrite AMM/router. Does not execute.
 */

import { MELEGA_TREASURY_FEE_DESTINATION } from 'config/constants/feeSchedule'
import { D87_DEX_PRICING_RATIFIED } from 'lib/d87-pricing/codex/ratified'
import { SMART_ROUTER_GAS_PROTOCOL_FEE_BPS } from 'lib/smart-swap-gas-protocol-fee/types'
import { assetsEqual, evmContract, evmNative, type CanonicalAssetId } from './assetIdentity'
import { capabilityMap } from './capabilities'
import { MELEGA_DEX_VENUE, VENUE_SUPPORT, isQuoteCapable } from './certifiedVenues'
import { EXECUTION_DOMAIN, evmNetwork, isEvmNetwork, type ExecutionNetwork } from './domain'
import {
  PROTOCOL_FEE_STATE,
  SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP,
  evaluateProtocolFeeState,
  emptyFeeFact,
  type ProtocolFeeFact,
} from './fee'
import { VENUE_HEALTH_STATE, healthSnapshot, type VenueHealthSnapshot } from './health'
import { refuseV2Execution, type SmartSwapVenueAdapter, type VenueIdentity } from './venueAdapter'
import { computeMinimumReceived, type NormalizedQuote, type QuoteHop, type SmartSwapRequest } from './quote'
import type { ShadowQuoteSource } from './shadowQuoteSource'

export const MELEGA_DEX_VENUE_ID = 'melega-dex' as const
export const MELEGA_DEX_NET_INPUT_QUOTE_UNAVAILABLE = 'MELEGA_DEX_NET_INPUT_QUOTE_UNAVAILABLE' as const
export const MELEGA_DEX_FOT_UNPROVEN = 'MELEGA_DEX_FOT_UNPROVEN' as const
export const MELEGA_DEX_EXACT_QUOTE_ROUTER_MISSING = 'MELEGA_DEX_EXACT_QUOTE_ROUTER_MISSING' as const

export interface LegacyMelegaQuoteSnapshot {
  chainId: number
  input: {
    address: string
    symbol: string
    decimals: number
    isNative?: boolean
  }
  output: {
    address: string
    symbol: string
    decimals: number
    isNative?: boolean
  }
  inputAmountRaw: string
  expectedOutputRaw: string
  pathAddresses: string[]
  priceImpactPercent?: number | null
  gasUnits?: number | null
  source?: string | null
  freshness?: string | null
  slippageBps?: number
  buyMarcoOutput?: boolean
}

const EVM_NATIVE_SENTINEL = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

function toAsset(chainId: number, token: LegacyMelegaQuoteSnapshot['input']): CanonicalAssetId {
  if (token.isNative) return evmNative(chainId, token.symbol, token.decimals)
  return evmContract(chainId, token.address, token.symbol, token.decimals)
}

function fromPathAddress(chainId: number, address: string): CanonicalAssetId {
  if (address.toLowerCase() === EVM_NATIVE_SENTINEL) return evmNative(chainId)
  return evmContract(chainId, address)
}

function melegaFeeFact(snapshot: LegacyMelegaQuoteSnapshot): ProtocolFeeFact {
  const evaluated = evaluateProtocolFeeState({
    calculated: true,
    displayedInFrozenUx: true,
    includedInExecutionPlan: false,
    collectionEnforceable: false,
    destinationCanonical: true,
    collectionProven: false,
    atomicWithSwap: false,
  })
  const bps = snapshot.buyMarcoOutput
    ? D87_DEX_PRICING_RATIFIED.services.swap.protocolFeeBuyMarcoBps
    : D87_DEX_PRICING_RATIFIED.services.swap.protocolFeeStandardBps
  return {
    ...evaluated,
    state: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
    bps,
    formulaId: 'd87-swap-protocol-fee+smart-router-gas-protocol-fee',
    amountRaw: null,
    assetSymbol: null,
    recipient: MELEGA_TREASURY_FEE_DESTINATION,
    collectionProven: false,
    atomicWithSwap: false,
    productionExecutionEligible: false,
    gapCode: SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP,
  }
}

export function normalizeMelegaLegacyQuote(
  snapshot: LegacyMelegaQuoteSnapshot,
  nowIso = new Date().toISOString(),
): NormalizedQuote {
  const network: ExecutionNetwork = evmNetwork(snapshot.chainId)
  const inputAsset = toAsset(snapshot.chainId, snapshot.input)
  const outputAsset = toAsset(snapshot.chainId, snapshot.output)
  const slippageBps = snapshot.slippageBps ?? 50
  const hops = snapshot.pathAddresses.slice(1).map((address, index) => ({
    index,
    venueId: MELEGA_DEX_VENUE_ID,
    poolRef: null,
    tokenIn: index === 0 ? inputAsset : fromPathAddress(snapshot.chainId, snapshot.pathAddresses[index]),
    tokenOut: fromPathAddress(snapshot.chainId, address),
  }))
  const protocolFee = melegaFeeFact(snapshot)
  return {
    quoteId: `melega-dex:${snapshot.chainId}:${snapshot.pathAddresses.join('>')}:${snapshot.inputAmountRaw}`,
    venueId: MELEGA_DEX_VENUE_ID,
    venueLabel: 'Melega DEX',
    executionDomain: EXECUTION_DOMAIN.EVM,
    network,
    inputAsset,
    outputAsset,
    inputAmountRaw: snapshot.inputAmountRaw,
    grossOutputRaw: snapshot.expectedOutputRaw,
    netUserOutputRaw: snapshot.expectedOutputRaw,
    estimatedGasUnits: snapshot.gasUnits != null ? String(snapshot.gasUnits) : null,
    gasAsset: evmNative(snapshot.chainId),
    gasCostRaw: null,
    venueFeeRaw: null,
    priceImpactPercent: snapshot.priceImpactPercent ?? null,
    minimumReceivedRaw: computeMinimumReceived(snapshot.expectedOutputRaw, slippageBps),
    hops,
    quotedAt: snapshot.freshness || nowIso,
    expiresAt: null,
    stale: false,
    confidence: 70,
    valid: Boolean(snapshot.expectedOutputRaw && snapshot.expectedOutputRaw !== '0'),
    protocolFee,
    productionExecutionCapable: false,
  }
}

export interface MelegaDexAdapterOptions {
  quoteSource?: ShadowQuoteSource
  feeOnTransferUnproven?: boolean
}

const NATIVE_SENTINEL = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

function pathAddress(asset: CanonicalAssetId, wrappedNative: string | undefined): string {
  if (asset.location.kind === 'native') {
    if (!wrappedNative) throw new Error(MELEGA_DEX_EXACT_QUOTE_ROUTER_MISSING)
    return wrappedNative.toLowerCase()
  }
  if (asset.location.kind !== 'contract') throw new Error('NON_EVM_ASSET')
  return asset.location.address
}

function snapshotMatchesRequest(snapshot: LegacyMelegaQuoteSnapshot, request: SmartSwapRequest): boolean {
  if (!isEvmNetwork(request.network) || snapshot.chainId !== request.network.chainId) return false
  return (
    assetsEqual(toAsset(snapshot.chainId, snapshot.input), request.inputAsset) &&
    assetsEqual(toAsset(snapshot.chainId, snapshot.output), request.outputAsset)
  )
}

/** Reuse a real Melega path when one already exists. Never invent hops from symbols. */
export function resolveMelegaExactQuotePath(
  request: SmartSwapRequest,
  snapshot: LegacyMelegaQuoteSnapshot | null,
  wrappedNative: string,
): string[] {
  if (snapshot && snapshotMatchesRequest(snapshot, request) && snapshot.pathAddresses.length >= 2) {
    return snapshot.pathAddresses.map((address) =>
      address.toLowerCase() === NATIVE_SENTINEL ? wrappedNative.toLowerCase() : address.toLowerCase(),
    )
  }
  const path = [pathAddress(request.inputAsset, wrappedNative), pathAddress(request.outputAsset, wrappedNative)]
  if (path[0] === path[1]) throw new Error('NO_ROUTE')
  return path
}

function hopsFromPath(request: SmartSwapRequest, path: string[], chainId: number): QuoteHop[] {
  if (path.length === 2) {
    return [
      {
        index: 0,
        venueId: MELEGA_DEX_VENUE_ID,
        poolRef: null,
        tokenIn: request.inputAsset,
        tokenOut: request.outputAsset,
      },
    ]
  }
  return path.slice(1).map((address, index) => ({
    index,
    venueId: MELEGA_DEX_VENUE_ID,
    poolRef: null,
    tokenIn: index === 0 ? request.inputAsset : evmContract(chainId, path[index]),
    tokenOut: index === path.length - 2 ? request.outputAsset : evmContract(chainId, address),
  }))
}

export function createMelegaDexAdapter(
  snapshot: LegacyMelegaQuoteSnapshot | null,
  options?: MelegaDexAdapterOptions,
): SmartSwapVenueAdapter {
  const identity: VenueIdentity = {
    venueId: MELEGA_DEX_VENUE_ID,
    label: 'Melega DEX',
    executionDomain: EXECUTION_DOMAIN.EVM,
    networks: [evmNetwork(snapshot?.chainId ?? 56)],
  }
  const capabilities = capabilityMap(['QUOTE', 'EXACT_IN', 'EXACT_OUT', 'EVM'])
  const canExactQuote = Boolean(options?.quoteSource)
  const health: VenueHealthSnapshot = healthSnapshot(
    MELEGA_DEX_VENUE_ID,
    snapshot || canExactQuote ? VENUE_HEALTH_STATE.HEALTHY : VENUE_HEALTH_STATE.UNAVAILABLE,
    snapshot || canExactQuote ? null : 'no-legacy-snapshot',
  )

  return {
    identity: () => identity,
    capabilities: () => capabilities,
    supportsAssetPair: (request) => request.network.domain === EXECUTION_DOMAIN.EVM,
    async quote(request, context) {
      if (options?.feeOnTransferUnproven) throw new Error(MELEGA_DEX_FOT_UNPROVEN)
      if (request.network.domain !== EXECUTION_DOMAIN.EVM) {
        throw new Error('MELEGA_DEX_EVM_ONLY')
      }
      if (options?.quoteSource) {
        if (!isEvmNetwork(request.network)) throw new Error('MELEGA_DEX_EVM_ONLY')
        const chainId = request.network.chainId
        const router = MELEGA_DEX_VENUE.routers[chainId]
        const wrapped = MELEGA_DEX_VENUE.wrappedNative[chainId]
        if (!router || !wrapped || !isQuoteCapable(MELEGA_DEX_VENUE.support[chainId] ?? VENUE_SUPPORT.NOT_VERIFIED)) {
          throw new Error(`${MELEGA_DEX_EXACT_QUOTE_ROUTER_MISSING}:${chainId}`)
        }
        const path = resolveMelegaExactQuotePath(request, snapshot, wrapped)
        const observation = await options.quoteSource.fetch({
          chainId,
          router,
          amountInRaw: request.inputAmountRaw,
          path,
          signal: context.signal,
        })
        if (!observation.amountOutRaw || observation.amountOutRaw === '0') throw new Error('NO_ROUTE')
        const quotedAt = observation.quotedAt || context.nowIso
        return {
          quoteId: `${MELEGA_DEX_VENUE_ID}:${chainId}:${path.join('>')}:${request.inputAmountRaw}`,
          venueId: MELEGA_DEX_VENUE_ID,
          venueLabel: 'Melega DEX',
          executionDomain: EXECUTION_DOMAIN.EVM,
          network: evmNetwork(chainId),
          inputAsset: request.inputAsset,
          outputAsset: request.outputAsset,
          inputAmountRaw: request.inputAmountRaw,
          grossOutputRaw: observation.amountOutRaw,
          netUserOutputRaw: observation.amountOutRaw,
          estimatedGasUnits: observation.gasUnits,
          gasAsset: evmNative(chainId),
          gasCostRaw: null,
          venueFeeRaw: null,
          priceImpactPercent: observation.priceImpactPercent ?? null,
          minimumReceivedRaw: computeMinimumReceived(observation.amountOutRaw, request.slippageBps),
          hops: hopsFromPath(request, path, chainId),
          quotedAt,
          expiresAt: null,
          stale: false,
          confidence: observation.kind === 'FACTUAL' ? 70 : 50,
          valid: true,
          protocolFee: {
            ...emptyFeeFact(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY, SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP),
            formulaId: 'smartswap-revenue-policy-v1-shadow',
          },
          productionExecutionCapable: false,
        }
      }
      if (!snapshot) throw new Error('MELEGA_DEX_QUOTE_UNAVAILABLE')
      if (snapshot.inputAmountRaw !== request.inputAmountRaw) {
        throw new Error(MELEGA_DEX_NET_INPUT_QUOTE_UNAVAILABLE)
      }
      const normalized = normalizeMelegaLegacyQuote(snapshot)
      return {
        ...normalized,
        minimumReceivedRaw: computeMinimumReceived(normalized.grossOutputRaw, request.slippageBps),
      }
    },
    async simulate() {
      return { ok: false, reason: 'SIMULATE_UNSUPPORTED' }
    },
    prepareExecution: refuseV2Execution,
    execute: refuseV2Execution,
    async verifyReceipt() {
      return { verified: false, feeCollected: false }
    },
    health: () => health,
  }
}

export const MELEGA_GAS_PROTOCOL_FEE_BPS = SMART_ROUTER_GAS_PROTOCOL_FEE_BPS
