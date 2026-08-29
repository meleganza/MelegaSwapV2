/**
 * Engine-owned certified multichain SHADOW readiness inventory.
 * Read-only facts from existing tables. No execution, adapters, or host wiring.
 */

import { EVM_CHAIN_IDS, solanaExecutionEnabled } from './domain'
import {
  MELEGA_CHAIN_SUPPORT,
  PANCAKE_SWAP_VENUE,
  UNISWAP_VENUE,
  PANCAKESWAP_VENUE_ID,
  UNISWAP_VENUE_ID,
  isQuoteCapable,
  type VenueSupportState,
} from './certifiedVenues'
import { V2_SOLANA_EXECUTION_NOT_ENABLED, V2_EXTERNAL_VENUE_NOT_ENABLED } from './operatingMode'
import { MELEGA_DEX_VENUE_ID } from './melegaDexAdapter'
import { EXTERNAL_VENUE_IDS } from './venueRegistry'

export type CertifiedShadowVenueId =
  typeof MELEGA_DEX_VENUE_ID | typeof PANCAKESWAP_VENUE_ID | typeof UNISWAP_VENUE_ID

export interface CertifiedEvmChainVenueReadinessRow {
  chainId: number
  venueId: CertifiedShadowVenueId
  support: VenueSupportState | null
  quoteCapable: boolean
  certifiedRouter: string | null
}

export interface CertifiedMultichainShadowReadinessInventory {
  evmChainIds: number[]
  rows: CertifiedEvmChainVenueReadinessRow[]
  solanaExecutionEnabled: boolean
  solanaExecutionReason: typeof V2_SOLANA_EXECUTION_NOT_ENABLED
  robinhoodReason: 'FEASIBILITY_REQUIRED'
  disabledExternalVenueReason: typeof V2_EXTERNAL_VENUE_NOT_ENABLED
  externalVenueIds: readonly string[]
}

const CERTIFIED_SHADOW_VENUE_IDS: CertifiedShadowVenueId[] = [
  MELEGA_DEX_VENUE_ID,
  PANCAKESWAP_VENUE_ID,
  UNISWAP_VENUE_ID,
]

export function certifiedEvmVenueSupport(
  chainId: number,
  venueId: CertifiedShadowVenueId,
): VenueSupportState | null {
  if (venueId === MELEGA_DEX_VENUE_ID) return MELEGA_CHAIN_SUPPORT[chainId] ?? null
  if (venueId === PANCAKESWAP_VENUE_ID) return PANCAKE_SWAP_VENUE.support[chainId] ?? null
  return UNISWAP_VENUE.support[chainId] ?? null
}

function certifiedRouterFor(chainId: number, venueId: CertifiedShadowVenueId): string | null {
  if (venueId === PANCAKESWAP_VENUE_ID) return PANCAKE_SWAP_VENUE.routers[chainId] ?? null
  if (venueId === UNISWAP_VENUE_ID) return UNISWAP_VENUE.routers[chainId] ?? null
  return null
}

export function buildCertifiedMultichainShadowReadinessInventory(): CertifiedMultichainShadowReadinessInventory {
  const evmChainIds = Object.values(EVM_CHAIN_IDS).slice().sort((left, right) => left - right)
  const rows: CertifiedEvmChainVenueReadinessRow[] = []
  for (const chainId of evmChainIds) {
    for (const venueId of CERTIFIED_SHADOW_VENUE_IDS) {
      const support = certifiedEvmVenueSupport(chainId, venueId)
      rows.push({
        chainId,
        venueId,
        support,
        quoteCapable: support != null && isQuoteCapable(support),
        certifiedRouter: certifiedRouterFor(chainId, venueId),
      })
    }
  }
  return {
    evmChainIds,
    rows,
    solanaExecutionEnabled: solanaExecutionEnabled(),
    solanaExecutionReason: V2_SOLANA_EXECUTION_NOT_ENABLED,
    robinhoodReason: 'FEASIBILITY_REQUIRED',
    disabledExternalVenueReason: V2_EXTERNAL_VENUE_NOT_ENABLED,
    externalVenueIds: EXTERNAL_VENUE_IDS,
  }
}
