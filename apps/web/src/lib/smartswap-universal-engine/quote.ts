import type { CanonicalAssetId } from './assetIdentity'
import type { ExecutionNetwork } from './domain'
import type { ProtocolFeeFact } from './fee'

export interface QuoteHop {
  index: number
  venueId: string
  poolRef: string | null
  tokenIn: CanonicalAssetId
  tokenOut: CanonicalAssetId
}

export interface NormalizedQuote {
  quoteId: string
  venueId: string
  venueLabel: string
  executionDomain: ExecutionNetwork['domain']
  network: ExecutionNetwork
  inputAsset: CanonicalAssetId
  outputAsset: CanonicalAssetId
  inputAmountRaw: string
  grossOutputRaw: string
  netUserOutputRaw: string | null
  estimatedGasUnits: string | null
  gasAsset: CanonicalAssetId | null
  gasCostRaw: string | null
  venueFeeRaw: string | null
  priceImpactPercent: number | null
  minimumReceivedRaw: string | null
  hops: QuoteHop[]
  quotedAt: string
  expiresAt: string | null
  stale: boolean
  confidence: number | null
  valid: boolean
  protocolFee: ProtocolFeeFact
  /** True only when V2 may later become the user execution path. Always false in M1. */
  productionExecutionCapable: boolean
}

export interface SmartSwapRequest {
  requestId: string
  network: ExecutionNetwork
  inputAsset: CanonicalAssetId
  outputAsset: CanonicalAssetId
  inputAmountRaw: string
  exactOut: boolean
  slippageBps: number
  quotedAt?: string
}

export function computeMinimumReceived(grossOutputRaw: string, slippageBps: number): string {
  const out = BigInt(grossOutputRaw)
  if (slippageBps < 0 || slippageBps > 10_000) throw new Error('INVALID_SLIPPAGE_BPS')
  return ((out * BigInt(10_000 - slippageBps)) / 10_000n).toString()
}

export function quoteIsStale(quote: NormalizedQuote, nowIso: string, staleAfterMs: number): boolean {
  const quoted = Date.parse(quote.quotedAt)
  const now = Date.parse(nowIso)
  if (!Number.isFinite(quoted) || !Number.isFinite(now)) return true
  return now - quoted > staleAfterMs
}
