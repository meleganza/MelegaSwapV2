import { CHAIN_LABELS } from 'registry/projects/constants'
import type { StaticProjectRecord } from 'registry/projects/types'
import type { ProjectDataReasonCode } from 'lib/projects-data/dataReasonCodes'
import type { ProjectLiveMetricsSnapshot } from 'lib/projects-data/projectLiveMetrics'
import { liveMetricsToOnChainStrings } from 'lib/projects-data/projectLiveMetrics'

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
  fdv?: string
  priceChange?: string
  reasonCodes?: Partial<Record<string, ProjectDataReasonCode>>
}

function capabilityLabel(status: string, liveLabel: string): string {
  if (status === 'live') return liveLabel
  if (status === 'partial') return 'Partial'
  return '—'
}

function verificationLabel(project: StaticProjectRecord): string {
  if (project.trustBadges.includes('canonical')) return 'Canonical'
  if (project.verificationStatus === 'observed') return 'Observed'
  if (project.verificationStatus === 'unverified') return 'Unverified'
  return '—'
}

export function buildOnChainMetrics(
  project: StaticProjectRecord,
  live?: ProjectLiveMetricsSnapshot,
): OnChainMetrics {
  const chainLabels = project.supportedChains.map((id) => CHAIN_LABELS[id] ?? `Chain ${id}`).join(', ')
  const poolLive = project.capabilities.pool.status
  const farmLive = project.capabilities.farm.status
  const stakingLive = project.capabilities.pool.status

  if (live) {
    const strings = liveMetricsToOnChainStrings(live)
    return {
      liquidity: strings.liquidity,
      volume: strings.volume,
      holders: strings.holders,
      transactions: strings.transactions,
      age: strings.age,
      fdv: strings.fdv,
      priceChange: strings.priceChange,
      reasonCodes: strings.reasonCodes,
      chains: chainLabels || '—',
      contractVerification: verificationLabel(project),
      poolCount: capabilityLabel(poolLive, `${project.resources.stakingPools.length || 'Live'} on Melega`),
      farmCount: capabilityLabel(farmLive, 'Live on Melega'),
      stakingAvailability: capabilityLabel(stakingLive, 'Available on Melega'),
    }
  }

  return {
    liquidity: '—',
    volume: '—',
    holders: 'Source not configured',
    transactions: '—',
    age: '—',
    fdv: '—',
    reasonCodes: {
      liquidity: 'DATA_SOURCE_NOT_CONFIGURED',
      volume: 'DATA_SOURCE_NOT_CONFIGURED',
      holders: 'EXPLORER_SOURCE_MISSING',
      transactions: 'DATA_SOURCE_NOT_CONFIGURED',
      age: 'EXPLORER_SOURCE_MISSING',
      fdv: 'EXPLORER_SOURCE_MISSING',
    },
    chains: chainLabels || '—',
    contractVerification: verificationLabel(project),
    poolCount: capabilityLabel(poolLive, `${project.resources.stakingPools.length || 'Live'} on Melega`),
    farmCount: capabilityLabel(farmLive, 'Live on Melega'),
    stakingAvailability: capabilityLabel(stakingLive, 'Available on Melega'),
  }
}
