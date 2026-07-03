import { CHAIN_LABELS } from 'registry/projects/constants'
import type { StaticProjectRecord } from 'registry/projects/types'

export interface OnChainMetrics {
  liquidity: string
  volume: string
  holders: string
  transactions: string
  age: string
  chains: string
  contractVerification: string
  poolCount: string
  farmCount: string
  stakingAvailability: string
}

const UNAVAILABLE = 'Unavailable'

function capabilityLabel(status: string, liveLabel: string): string {
  if (status === 'live') return liveLabel
  if (status === 'partial') return 'Partial'
  return UNAVAILABLE
}

export function buildOnChainMetrics(project: StaticProjectRecord): OnChainMetrics {
  const chainLabels = project.supportedChains.map((id) => CHAIN_LABELS[id] ?? `Chain ${id}`).join(', ')
  const verification =
    project.trustBadges.includes('canonical')
      ? 'Canonical'
      : project.verificationStatus === 'observed'
        ? 'Observed'
        : project.verificationStatus === 'unverified'
          ? 'Unverified'
          : UNAVAILABLE

  const poolLive = project.capabilities.pool.status
  const farmLive = project.capabilities.farm.status
  const stakingLive = project.capabilities.pool.status

  return {
    liquidity: UNAVAILABLE,
    volume: UNAVAILABLE,
    holders: UNAVAILABLE,
    transactions: UNAVAILABLE,
    age: UNAVAILABLE,
    chains: chainLabels || UNAVAILABLE,
    contractVerification: verification,
    poolCount: capabilityLabel(poolLive, `${project.resources.stakingPools.length || 'Live'} on Melega`),
    farmCount: capabilityLabel(farmLive, 'Live on Melega'),
    stakingAvailability: capabilityLabel(stakingLive, 'Available on Melega'),
  }
}
