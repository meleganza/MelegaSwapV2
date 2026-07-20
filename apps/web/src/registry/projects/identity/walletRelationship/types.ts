import type {
  PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION,
  RelationshipAvailability,
  RelationshipReasonCode,
  RelationshipStatus,
  RelationshipType,
  WALLET_RELATIONSHIP_RESOLVER_REVISION,
  WalletConnectionState,
} from './schema'

export interface WalletRelationshipSubject {
  subjectType: 'ASSET' | 'PAIR' | 'FARM' | 'POOL' | 'REWARD' | 'CAPABILITY' | 'CONTROL' | 'GOVERNANCE' | 'ROLE'
  subjectId: string
  label: string
}

export interface WalletRelationshipRecord {
  relationshipId: string
  projectId: string
  walletAccount: string
  relationshipType: RelationshipType
  subject: WalletRelationshipSubject
  chainId: number | null
  caip2: string | null
  status: RelationshipStatus
  availability: RelationshipAvailability
  source: string
  observedAt: string
  updatedAt: string
  dataRevision: string
  relatedAssetIds: string[]
  relatedContractIds: string[]
  relatedCapabilityIds: string[]
  positionReference: string | null
  /** Raw amount string when known; never inferred fiat. */
  rawAmount: string | null
  formattedAmount: string | null
  displaySummary: string
  deepLink: { href: string; label: string } | null
  limitations: string[]
  reasonCode: RelationshipReasonCode | null
}

export interface RelevantCapability {
  capabilityKey: string
  label: string
  relevance: 'RELEVANT' | 'NOT_RELEVANT' | 'UNKNOWN'
  reasonCode: string
  destination: { href: string; label: string } | null
}

export interface WalletRelationshipError {
  reasonCode: RelationshipReasonCode
  category: RelationshipType | 'RESOLVER'
  message: string
  chainId: number | null
}

export interface WalletRelationshipSummary {
  detectedRelationshipCount: number
  activeHoldingCount: number
  liquidityPositionCount: number
  farmPositionCount: number
  poolPositionCount: number
  claimableCount: number
  supportedCategories: RelationshipType[]
  unavailableCategories: RelationshipType[]
  partial: boolean
}

export interface ProjectWalletRelationshipDocument {
  schemaVersion: typeof PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION
  projectId: string
  slug: string
  walletAccount: string | null
  walletConnectionState: WalletConnectionState
  observedChains: number[]
  generatedAt: string
  resolverRevision: typeof WALLET_RELATIONSHIP_RESOLVER_REVISION
  status: 'OK' | 'PARTIAL' | 'UNAVAILABLE' | 'DISCONNECTED' | 'INVALID_ACCOUNT'
  availability: RelationshipAvailability
  summary: WalletRelationshipSummary
  relationships: WalletRelationshipRecord[]
  relevantCapabilities: RelevantCapability[]
  dataSources: string[]
  errors: WalletRelationshipError[]
  limitations: readonly string[]
}

/** Live observation supplied by client readers (or tests). Pure builder never invents these. */
export interface LiveAssetBalanceFact {
  assetId: string
  chainId: number
  contractAddress: string
  symbol: string
  rawAmount: string
  formattedAmount: string
  decimals: number
  source: string
  observedAt: string
}

export interface LiveLiquidityPositionFact {
  positionId: string
  chainId: number
  pairAddress: string
  pairLabel: string
  tokenAddresses: string[]
  lpRawAmount: string
  lpFormattedAmount: string
  source: string
  observedAt: string
}

export interface LiveFarmPositionFact {
  positionId: string
  chainId: number
  farmId: string
  label: string
  stakedRawAmount: string
  stakedFormattedAmount: string
  pendingRewardRaw: string | null
  pendingRewardFormatted: string | null
  relatedTokenAddresses: string[]
  source: string
  observedAt: string
}

export interface LivePoolPositionFact {
  positionId: string
  chainId: number
  poolId: string
  label: string
  stakedRawAmount: string
  stakedFormattedAmount: string
  pendingRewardRaw: string | null
  pendingRewardFormatted: string | null
  relatedTokenAddresses: string[]
  source: string
  observedAt: string
}

export interface LiveWalletObservation {
  walletAccountCaip10: string | null
  connectionState: WalletConnectionState
  activeChainId: number | null
  observedAt: string
  assetBalances: LiveAssetBalanceFact[] | null
  assetBalanceAvailability: RelationshipAvailability
  assetBalanceReason: RelationshipReasonCode | null
  liquidityPositions: LiveLiquidityPositionFact[] | null
  liquidityAvailability: RelationshipAvailability
  liquidityReason: RelationshipReasonCode | null
  farmPositions: LiveFarmPositionFact[] | null
  farmAvailability: RelationshipAvailability
  farmReason: RelationshipReasonCode | null
  poolPositions: LivePoolPositionFact[] | null
  poolAvailability: RelationshipAvailability
  poolReason: RelationshipReasonCode | null
}

export interface WalletRelationshipSupportMetadata {
  extension: typeof import('./schema').PROJECT_PAGE_WALLET_RELATIONSHIP_SUPPORT_EXTENSION
  supported: boolean
  resolverRevision: typeof WALLET_RELATIONSHIP_RESOLVER_REVISION
  schemaVersion: typeof PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION
  supportedCategories: RelationshipType[]
  contextualApiPath: string
  notes: string[]
}
