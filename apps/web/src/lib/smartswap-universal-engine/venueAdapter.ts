import { assertCapability, type VenueCapability, type VenueCapabilityMap } from './capabilities'
import type { ExecutionNetwork } from './domain'
import type { NormalizedQuote, SmartSwapRequest } from './quote'
import { V2_SHADOW_EXECUTION_FORBIDDEN, assertV2CannotExecute } from './operatingMode'
import type { VenueHealthSnapshot } from './health'

export interface VenueIdentity {
  venueId: string
  label: string
  executionDomain: ExecutionNetwork['domain']
  networks: ExecutionNetwork[]
}

export interface VenueQuoteContext {
  signal: AbortSignal
  nowIso: string
}

export interface SmartSwapVenueAdapter {
  identity(): VenueIdentity
  capabilities(): VenueCapabilityMap
  supportsAssetPair(request: SmartSwapRequest): boolean
  quote(request: SmartSwapRequest, context: VenueQuoteContext): Promise<NormalizedQuote>
  estimateGas?(request: SmartSwapRequest, quote: NormalizedQuote): Promise<string | null>
  simulate?(request: SmartSwapRequest, quote: NormalizedQuote, signal: AbortSignal): Promise<{ ok: boolean; reason?: string }>
  prepareExecution?(request: SmartSwapRequest, quote: NormalizedQuote): Promise<never>
  execute?(request: SmartSwapRequest, quote: NormalizedQuote): Promise<never>
  verifyReceipt?(txRef: string): Promise<{ verified: boolean; feeCollected: boolean }>
  health(): VenueHealthSnapshot
}

export function venueHas(adapter: SmartSwapVenueAdapter, capability: VenueCapability): boolean {
  return adapter.capabilities()[capability]
}

export async function quoteIfCapable(
  adapter: SmartSwapVenueAdapter,
  request: SmartSwapRequest,
  context: VenueQuoteContext,
): Promise<NormalizedQuote> {
  assertCapability(adapter.capabilities(), 'QUOTE')
  if (!adapter.supportsAssetPair(request)) {
    throw new Error(`VENUE_PAIR_UNSUPPORTED:${adapter.identity().venueId}`)
  }
  return adapter.quote(request, context)
}

export async function refuseV2Execution(): Promise<never> {
  assertV2CannotExecute()
  throw new Error(V2_SHADOW_EXECUTION_FORBIDDEN)
}
