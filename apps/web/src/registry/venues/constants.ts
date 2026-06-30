import { VenueCapabilities } from './types'

export const VENUE_REGISTRY_AS_OF = '2026-06-26'

export const VENUE_REGISTRY_DISCLAIMER =
  'Venue listed ≠ audited. Static venue registry MVP — no live TVL, APR, or volume. Observed = legacy-config indexed only.'

export const VENUE_REGISTRY_API_VERSION = '0.1.0'

export const CHAIN_LABELS: Record<number, string> = {
  1: 'Ethereum',
  56: 'BSC',
  137: 'Polygon',
  8453: 'Base',
}

export const VENUE_TYPE_LABELS: Record<import('./types').VenueType, string> = {
  spot_lp: 'Spot LP',
  farm: 'Farm',
  stake_pool: 'Stake Pool',
  launch: 'Launch',
  future: 'Future',
}

export const VENUE_CAPABILITY_LABELS: Record<keyof VenueCapabilities, string> = {
  swap: 'Swap',
  liquidity: 'Liquidity',
  farm: 'Farm',
  stake: 'Stake',
  launch: 'Launch',
  lock: 'Lock',
  treasury: 'Treasury',
  radar: 'Radar',
}

export const buildUvi = (venueType: string, chainId: number, ref: string, version = 1): string =>
  `uvi://melega/venue/${venueType}/${chainId}/${ref}@${version}`

// Legacy config snapshots — not imported from farm/pool modules to avoid coupling execution logic.
export const LEGACY_BSC_MARCO_BNB_LP = '0x7286c16c3c05d4c17B689bE7948Ec4Fa4e861d1E'
export const LEGACY_BSC_MARCO_FARM_PID = 1
export const LEGACY_BSC_MASTER_CHEF = '0x41D5487836452d23f2c467070244E5842B412794'
export const LEGACY_BSC_STAKE_SOUS_ID = 0
export const LEGACY_BSC_IFO_V3 = '0xabB5176ad486019fb0F7564d9F7C9510999c779A'
export const LEGACY_WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
