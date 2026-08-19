/**
 * Melega DEX as the first Venue Adapter.
 * Maps existing SmartSwap quote snapshots into the V2 normalized quote.
 * Does not rewrite AMM/router. Does not execute.
 */

import { MELEGA_TREASURY_FEE_DESTINATION } from 'config/constants/feeSchedule'
import { D87_DEX_PRICING_RATIFIED } from 'lib/d87-pricing/codex/ratified'
import { SMART_ROUTER_GAS_PROTOCOL_FEE_BPS } from 'lib/smart-swap-gas-protocol-fee/types'
import { evmContract, evmNative, type CanonicalAssetId } from './assetIdentity'
import { capabilityMap } from './capabilities'
import { EXECUTION_DOMAIN, evmNetwork, type ExecutionNetwork } from './domain'
import {
  PROTOCOL_FEE_STATE,
  SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP,
  evaluateProtocolFeeState,
  type ProtocolFeeFact,
} from './fee'
import { VENUE_HEALTH_STATE, healthSnapshot, type VenueHealthSnapshot } from './health'
import { refuseV2Execution, type SmartSwapVenueAdapter, type VenueIdentity } from './venueAdapter'
import { computeMinimumReceived, type NormalizedQuote } from './quote'

export const MELEGA_DEX_VENUE_ID = 'melega-dex' as const

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

export function createMelegaDexAdapter(snapshot: LegacyMelegaQuoteSnapshot | null): SmartSwapVenueAdapter {
  const identity: VenueIdentity = {
    venueId: MELEGA_DEX_VENUE_ID,
    label: 'Melega DEX',
    executionDomain: EXECUTION_DOMAIN.EVM,
    networks: [evmNetwork(snapshot?.chainId ?? 56)],
  }
  const capabilities = capabilityMap(['QUOTE', 'EXACT_IN', 'EXACT_OUT', 'EVM'])
  const health: VenueHealthSnapshot = healthSnapshot(
    MELEGA_DEX_VENUE_ID,
    snapshot ? VENUE_HEALTH_STATE.HEALTHY : VENUE_HEALTH_STATE.UNAVAILABLE,
    snapshot ? null : 'no-legacy-snapshot',
  )

  return {
    identity: () => identity,
    capabilities: () => capabilities,
    supportsAssetPair: (request) => request.network.domain === EXECUTION_DOMAIN.EVM,
    async quote(request) {
      if (!snapshot) throw new Error('MELEGA_DEX_QUOTE_UNAVAILABLE')
      if (request.network.domain !== EXECUTION_DOMAIN.EVM) {
        throw new Error('MELEGA_DEX_EVM_ONLY')
      }
      return normalizeMelegaLegacyQuote(snapshot)
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
