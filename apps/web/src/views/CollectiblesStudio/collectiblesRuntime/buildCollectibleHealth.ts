import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

export type HealthTone = 'green' | 'yellow' | 'red'

export interface HealthDimension {
  label: string
  tone: HealthTone
  detail: string
}

export interface CollectibleHealth {
  score: number
  dimensions: HealthDimension[]
}

export function buildCollectibleHealth(
  record: StaticCollectibleRecord,
  ownership: WalletCollectibleOwnership,
): CollectibleHealth {
  const dimensions: HealthDimension[] = []

  dimensions.push({
    label: 'Verification',
    tone: record.status === 'live_or_legacy_existing' ? 'green' : 'yellow',
    detail: record.status === 'live_or_legacy_existing' ? 'Registry verified' : 'Planned',
  })

  dimensions.push({
    label: 'Metadata integrity',
    tone: record.metadata.status === 'not_indexed' ? 'yellow' : 'green',
    detail: record.metadata.notes,
  })

  dimensions.push({
    label: 'Ownership',
    tone: ownership.status === 'Owned' ? 'green' : ownership.status === 'Unavailable' ? 'yellow' : 'red',
    detail: ownership.status,
  })

  dimensions.push({
    label: 'Transferability',
    tone: ownership.transferable === true ? 'green' : ownership.transferable === false ? 'red' : 'yellow',
    detail: ownership.transferable === true ? 'Transferable' : ownership.transferable === false ? 'Locked' : 'Unavailable',
  })

  dimensions.push({
    label: 'On-chain availability',
    tone: record.contract.indexed ? 'green' : 'yellow',
    detail: record.contract.indexed ? 'Contract indexed' : 'Not indexed',
  })

  dimensions.push({
    label: 'Collection status',
    tone: record.status === 'live_or_legacy_existing' ? 'green' : 'yellow',
    detail: record.status,
  })

  const greens = dimensions.filter((d) => d.tone === 'green').length
  const score = Math.round((greens / dimensions.length) * 100)

  return { score, dimensions }
}
