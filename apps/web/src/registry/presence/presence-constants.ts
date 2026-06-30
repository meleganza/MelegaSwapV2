import {
  CanonicalRelationship,
  ExecutionEligibility,
  LiquidityConfidence,
  PresenceStatus,
  PresenceType,
} from './presence-types'

export const PRESENCE_REGISTRY_AS_OF = '2026-06-28'

export const PRESENCE_REGISTRY_API_VERSION = '0.1.0'

export const PRESENCE_REGISTRY_DISCLAIMER =
  'Economic Presence describes where a project, asset, or venue has presence outside the Canonical Economy. Presence is NOT Canonical Economy. MARCO on BNB Chain remains immutable.'

export const CONSTITUTIONAL_CANONICAL_CHAIN = 'BNB Chain'

export const CONSTITUTIONAL_CANONICAL_ASSET = 'MARCO'

export const CONSTITUTIONAL_CANONICAL_STATUS = 'LIVE' as const

export const MARCO_CANONICAL_UAI =
  'uai://melega/asset/fungible/56/0x963556de0eb8138E97A85F0A86eE0acD159D210b@1'

export const MELEGA_DEX_UPI = 'upi://melega/project/melega-dex@1'

export const CHAIN_LABELS: Record<number, string> = {
  1: 'Ethereum',
  56: 'BNB Chain',
  137: 'Polygon',
  8453: 'Base',
}

export const PRESENCE_TYPE_LABELS: Record<PresenceType, string> = {
  canonical: 'Canonical Presence',
  economic_presence: 'Economic Presence',
  planned_surface: 'Planned Surface',
  bridge: 'Bridge Presence',
}

export const PRESENCE_STATUS_LABELS: Record<PresenceStatus, string> = {
  LIVE: 'LIVE',
  OBSERVED: 'OBSERVED',
  PLANNED: 'PLANNED',
  NOT_INDEXED: 'NOT INDEXED',
}

export const LIQUIDITY_CONFIDENCE_LABELS: Record<LiquidityConfidence, string> = {
  canonical: 'Canonical',
  observed: 'Observed',
  low: 'Low',
  planned: 'Planned',
  not_indexed: 'Not Indexed',
}

export const EXECUTION_ELIGIBILITY_LABELS: Record<ExecutionEligibility, string> = {
  eligible: 'Eligible',
  conditional: 'Conditional',
  not_eligible: 'Not Eligible',
  illustrative_only: 'Illustrative Only',
}

export const CANONICAL_RELATIONSHIP_LABELS: Record<CanonicalRelationship, string> = {
  canonical: 'Canonical Economy',
  economic_presence_only: 'Economic Presence Only',
  planned_presence: 'Planned Presence',
  not_canonical: 'Not Canonical',
}

export const buildPresenceId = (slug: string, version = 1): string =>
  `presence://melega/presence/${slug}@${version}`
