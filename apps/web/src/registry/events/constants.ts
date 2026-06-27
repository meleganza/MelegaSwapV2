import { EventType } from './types'

export const EVENT_REGISTRY_AS_OF = '2026-06-26'

export const EVENT_REGISTRY_DISCLAIMER =
  'Registry-derived events only — not live on-chain transactions. No tx hashes, volumes, fees, or treasury amounts in static MVP.'

export const EVENT_REGISTRY_API_VERSION = '0.1.0'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  swap: 'Swap',
  liquidity_added: 'Liquidity Added',
  liquidity_removed: 'Liquidity Removed',
  farm_created: 'Farm Created',
  stake_pool_created: 'Stake Pool Created',
  launch_created: 'Launch Created',
  asset_registered: 'Asset Registered',
  venue_registered: 'Venue Registered',
  fee_observed: 'Fee Observed',
  future: 'Future',
}

export const buildUei = (eventType: string, slug: string, version = 1): string =>
  `uei://melega/event/${eventType}/${slug}@${version}`
