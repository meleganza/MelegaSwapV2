import { createExternalEvmVenueAdapter } from './externalEvmAdapter'
import { PANCAKE_SWAP_VENUE } from './certifiedVenues'
import type { ShadowQuoteSource } from './shadowQuoteSource'
import type { SmartSwapVenueAdapter } from './venueAdapter'

export function createPancakeSwapVenueAdapter(source: ShadowQuoteSource): SmartSwapVenueAdapter {
  return createExternalEvmVenueAdapter(PANCAKE_SWAP_VENUE, source)
}
