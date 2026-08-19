export const VENUE_CAPABILITY = {
  QUOTE: 'QUOTE',
  EXACT_IN: 'EXACT_IN',
  EXACT_OUT: 'EXACT_OUT',
  EXECUTE: 'EXECUTE',
  SIMULATE: 'SIMULATE',
  SPLIT_ROUTE: 'SPLIT_ROUTE',
  EVM: 'EVM',
  SOLANA: 'SOLANA',
  CROSS_CHAIN: 'CROSS_CHAIN',
} as const

export type VenueCapability = (typeof VENUE_CAPABILITY)[keyof typeof VENUE_CAPABILITY]

export type VenueCapabilityMap = Record<VenueCapability, boolean>

export function capabilityMap(enabled: VenueCapability[]): VenueCapabilityMap {
  const map = {
    QUOTE: false,
    EXACT_IN: false,
    EXACT_OUT: false,
    EXECUTE: false,
    SIMULATE: false,
    SPLIT_ROUTE: false,
    EVM: false,
    SOLANA: false,
    CROSS_CHAIN: false,
  } satisfies VenueCapabilityMap
  for (const cap of enabled) map[cap] = true
  return map
}

export function assertCapability(map: VenueCapabilityMap, capability: VenueCapability): void {
  if (!map[capability]) {
    throw new Error(`VENUE_CAPABILITY_UNSUPPORTED:${capability}`)
  }
}
