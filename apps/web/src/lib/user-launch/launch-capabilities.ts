import { LaunchCapability, LaunchCapabilityStatus } from './launch-types'

export const USER_LAUNCH_VERSION = '0.1.0'

export const USER_LAUNCH_AS_OF = '2026-06-28'

export const USER_LAUNCH_DISCLAIMER =
  'User Launch & Listing read model only. No blockchain writes, fake buttons, or hidden capabilities. Links to existing flows where already implemented.'

export const CANONICAL_CHAINS = ['BNB Chain', 'Ethereum', 'Polygon', 'Base'] as const

export const statusToAvailability = (
  status: LaunchCapabilityStatus,
): LaunchCapability['availability'] => {
  switch (status) {
    case 'LIVE':
    case 'AVAILABLE_EXISTING_FLOW':
      return 'available'
    case 'PLANNED':
      return 'planned'
    case 'BLOCKED':
      return 'blocked'
    case 'DEPRECATED':
      return 'deprecated'
    case 'NOT_SUPPORTED':
    default:
      return 'not_supported'
  }
}

export const LAUNCH_CAPABILITY_IDS = [
  'create_token',
  'submit_token_metadata',
  'upload_logo',
  'create_liquidity',
  'create_pool',
  'create_farm',
  'create_staking_pool',
  'mint_civilization_collectible',
  'launch_through_labs',
  'activate_economic_presence',
] as const

export type LaunchCapabilityId = (typeof LAUNCH_CAPABILITY_IDS)[number]
