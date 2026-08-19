import { createExternalEvmVenueAdapter } from './externalEvmAdapter'
import { UNISWAP_VENUE } from './certifiedVenues'
import type { ShadowQuoteSource } from './shadowQuoteSource'
import type { SmartSwapVenueAdapter } from './venueAdapter'

export function createUniswapVenueAdapter(source: ShadowQuoteSource): SmartSwapVenueAdapter {
  return createExternalEvmVenueAdapter(UNISWAP_VENUE, source)
}
