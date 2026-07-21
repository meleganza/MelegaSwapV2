import type {
  PARTICIPATION_RESOLVER_REVISION,
  PROJECT_PARTICIPATION_SCHEMA_VERSION,
  PROJECT_PAGE_PARTICIPATION_SUMMARY_EXTENSION,
  ParticipationAvailability,
  ParticipationOpportunityType,
  ParticipationReasonCode,
  ParticipationRelationshipType,
  ParticipationSourceClass,
  ParticipationStatus,
} from './schema'

export interface ParticipationDestination {
  destinationId: string
  href: string
  label: string
  module: 'LIQUIDITY_STUDIO' | 'FARMS_STUDIO' | 'POOLS_STUDIO' | 'COMMAND_CENTER'
  availability: ParticipationAvailability
  reasonCode: ParticipationReasonCode | null
  limitations: string[]
}

export interface ParticipationOpportunityRecord {
  participationId: string
  projectId: string
  type: ParticipationOpportunityType
  chainId: number
  caip2: string
  venue: string
  venueSlug: string | null
  displayLabel: string
  assetIds: string[]
  contractIds: string[]
  relatedMarketId: string | null
  farmPid: number | null
  sousId: number | null
  status: ParticipationStatus
  availability: ParticipationAvailability
  source: ParticipationSourceClass
  observedAt: string
  updatedAt: string
  dataRevision: string
  destination: ParticipationDestination | null
  limitations: string[]
  reasonCode: ParticipationReasonCode | null
}

/** Wallet-scoped — never in public document body. */
export interface ParticipationUserRelationship {
  participationId: string
  projectId: string
  type: ParticipationRelationshipType
  walletAccount: string
  chainId: number | null
  status: string
  availability: ParticipationAvailability
  positionReference: string | null
  displaySummary: string
  relatedOpportunityId: string | null
  destination: ParticipationDestination | null
  source: string
  observedAt: string
  limitations: string[]
  reasonCode: ParticipationReasonCode | null
}

export interface ParticipationWarning {
  reasonCode: ParticipationReasonCode
  message: string
  participationId: string | null
  chainId: number | null
}

export interface ProjectParticipationSummary {
  participationSupport: ParticipationAvailability
  liquidityPoolCount: number
  farmCount: number
  stakingPoolCount: number
  supportedTypes: ParticipationOpportunityType[]
  supportedChains: number[]
  participationEndpoint: string
  contextualEndpoint: string
  schemaVersion: typeof PROJECT_PARTICIPATION_SCHEMA_VERSION
  lastObservationAt: string | null
  partial: boolean
}

export interface ProjectParticipationDocument {
  schemaVersion: typeof PROJECT_PARTICIPATION_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  participationRevision: string
  resolverRevision: typeof PARTICIPATION_RESOLVER_REVISION
  generatedAt: string
  summary: ProjectParticipationSummary
  pools: ParticipationOpportunityRecord[]
  farms: ParticipationOpportunityRecord[]
  stakingPools: ParticipationOpportunityRecord[]
  destinations: ParticipationDestination[]
  capabilities: {
    VIEW_LIQUIDITY: ParticipationAvailability
    VIEW_FARMS: ParticipationAvailability
    VIEW_POOLS: ParticipationAvailability
    ADD_LIQUIDITY: ParticipationAvailability
    OPEN_FARM: ParticipationAvailability
    OPEN_POOL: ParticipationAvailability
  }
  walletRelationshipSupport: {
    supported: boolean
    contextualEndpoint: string
    notes: string[]
  }
  availability: ParticipationAvailability
  warnings: ParticipationWarning[]
  limitations: readonly string[]
}

/** Contextual document — may include wallet relationships. */
export interface ProjectParticipationContextualDocument extends ProjectParticipationDocument {
  walletAccount: string | null
  walletConnectionState: 'DISCONNECTED' | 'CONNECTED' | 'INVALID_ACCOUNT'
  userRelationships: ParticipationUserRelationship[]
}

export interface ParticipationSummaryForProjectApi {
  extension: typeof PROJECT_PAGE_PARTICIPATION_SUMMARY_EXTENSION
  schemaVersion: typeof PROJECT_PARTICIPATION_SCHEMA_VERSION
  participationSupport: ParticipationAvailability
  supportedTypes: ParticipationOpportunityType[]
  liquidityPoolCount: number
  farmCount: number
  stakingPoolCount: number
  supportedChains: number[]
  participationEndpoint: string
  contextualEndpoint: string
  lastObservationAt: string | null
  partial: boolean
}
