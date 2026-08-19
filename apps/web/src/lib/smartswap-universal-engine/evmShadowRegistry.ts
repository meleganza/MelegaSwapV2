/**
 * M3 SHADOW venue registry. Does not replace M1 `buildVenueRegistry`.
 * External adapters may quote in shadow only. productionEnabled stays false.
 */

import type { SmartSwapVenueAdapter } from './venueAdapter'
import { V2_EXTERNAL_VENUE_NOT_ENABLED } from './operatingMode'
import { createMelegaDexAdapter, MELEGA_DEX_VENUE_ID, type LegacyMelegaQuoteSnapshot } from './melegaDexAdapter'
import { createPancakeSwapVenueAdapter } from './pancakeSwapAdapter'
import { createUniswapVenueAdapter } from './uniswapAdapter'
import { PANCAKESWAP_VENUE_ID, UNISWAP_VENUE_ID } from './certifiedVenues'
import type { ShadowQuoteSource } from './shadowQuoteSource'
import { EXTERNAL_VENUE_IDS, type VenueRegistryEntry } from './venueRegistry'

export const V2_M3_SHADOW_QUOTE_ONLY = 'V2_M3_SHADOW_QUOTE_ONLY' as const

export function buildEvmShadowVenueRegistry(input: {
  melegaSnapshot: LegacyMelegaQuoteSnapshot | null
  pancakeSource: ShadowQuoteSource
  uniswapSource: ShadowQuoteSource
}): {
  adapters: SmartSwapVenueAdapter[]
  catalog: VenueRegistryEntry[]
} {
  const melega = createMelegaDexAdapter(input.melegaSnapshot)
  const pancake = createPancakeSwapVenueAdapter(input.pancakeSource)
  const uniswap = createUniswapVenueAdapter(input.uniswapSource)
  const catalog: VenueRegistryEntry[] = [
    {
      venueId: MELEGA_DEX_VENUE_ID,
      enabled: true,
      productionEnabled: false,
      shadowQuoteEnabled: true,
      reason: 'M1 Melega adapter preserved. Shadow candidate only. EXECUTE remains false.',
    },
    {
      venueId: PANCAKESWAP_VENUE_ID,
      enabled: false,
      productionEnabled: false,
      shadowQuoteEnabled: true,
      reason: V2_M3_SHADOW_QUOTE_ONLY,
    },
    {
      venueId: UNISWAP_VENUE_ID,
      enabled: false,
      productionEnabled: false,
      shadowQuoteEnabled: true,
      reason: V2_M3_SHADOW_QUOTE_ONLY,
    },
    ...EXTERNAL_VENUE_IDS.filter((id) => id !== PANCAKESWAP_VENUE_ID && id !== UNISWAP_VENUE_ID).map((venueId) => ({
      venueId,
      enabled: false,
      productionEnabled: false,
      shadowQuoteEnabled: false,
      reason: venueId === 'robinhood' ? 'FEASIBILITY_REQUIRED' : V2_EXTERNAL_VENUE_NOT_ENABLED,
    })),
  ]
  return { adapters: [melega, pancake, uniswap], catalog }
}
