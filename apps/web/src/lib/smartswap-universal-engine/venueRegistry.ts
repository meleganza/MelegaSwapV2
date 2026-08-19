import type { SmartSwapVenueAdapter } from './venueAdapter'
import { VENUE_HEALTH_STATE, healthSnapshot } from './health'
import { V2_EXTERNAL_VENUE_NOT_ENABLED } from './operatingMode'
import { createMelegaDexAdapter, MELEGA_DEX_VENUE_ID, type LegacyMelegaQuoteSnapshot } from './melegaDexAdapter'

export const EXTERNAL_VENUE_IDS = [
  'pancakeswap',
  'uniswap',
  'jupiter',
  'raydium',
  'orca',
  'robinhood',
] as const

export type ExternalVenueId = (typeof EXTERNAL_VENUE_IDS)[number]

export interface VenueRegistryEntry {
  venueId: string
  enabled: boolean
  productionEnabled: boolean
  shadowQuoteEnabled: boolean
  reason: string
}

export function buildVenueRegistry(melegaSnapshot: LegacyMelegaQuoteSnapshot | null): {
  adapters: SmartSwapVenueAdapter[]
  catalog: VenueRegistryEntry[]
} {
  const melega = createMelegaDexAdapter(melegaSnapshot)
  const catalog: VenueRegistryEntry[] = [
    {
      venueId: MELEGA_DEX_VENUE_ID,
      enabled: true,
      productionEnabled: false,
      shadowQuoteEnabled: true,
      reason: 'First adapter. Shadow quote mapping only. Legacy execution remains authoritative.',
    },
    ...EXTERNAL_VENUE_IDS.map((venueId) => ({
      venueId,
      enabled: false,
      productionEnabled: false,
      shadowQuoteEnabled: false,
      reason: venueId === 'robinhood' ? 'FEASIBILITY_REQUIRED' : V2_EXTERNAL_VENUE_NOT_ENABLED,
    })),
  ]
  return { adapters: [melega], catalog }
}

export function assertNoExternalVenueEnabled(catalog: VenueRegistryEntry[]): void {
  const enabledExternal = catalog.filter(
    (row) => row.venueId !== MELEGA_DEX_VENUE_ID && (row.enabled || row.productionEnabled),
  )
  if (enabledExternal.length > 0) {
    throw new Error(`EXTERNAL_VENUE_ENABLED:${enabledExternal.map((row) => row.venueId).join(',')}`)
  }
}

export function disabledVenueHealth(venueId: string) {
  return healthSnapshot(venueId, VENUE_HEALTH_STATE.DISABLED, V2_EXTERNAL_VENUE_NOT_ENABLED)
}
