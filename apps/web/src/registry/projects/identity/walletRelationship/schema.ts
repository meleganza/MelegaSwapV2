/**
 * PP004 — Project-scoped Wallet Relationship Layer schema.
 * Wallet-specific; never part of public SEO or PP001 static project JSON body.
 */

export const PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION = 'melega.project-wallet-relationship.v1' as const
export const WALLET_RELATIONSHIP_RESOLVER_REVISION = 'PP004_WALLET_RELATIONSHIP_V1' as const

/** Static support metadata only — safe on PP001 public project JSON. */
export const PROJECT_PAGE_WALLET_RELATIONSHIP_SUPPORT_EXTENSION = 'walletRelationshipSupport.v1' as const

export const RELATIONSHIP_TYPES = [
  'ASSET_HOLDING',
  'LIQUIDITY_POSITION',
  'FARM_POSITION',
  'POOL_POSITION',
  'CLAIMABLE_REWARD',
  'GOVERNANCE_ELIGIBILITY',
  'PROJECT_CONTROL',
  'CONTRIBUTOR_ROLE',
  'CAPABILITY_ELIGIBILITY',
] as const

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number]

/** Categories backed by current live producers (others stay UNAVAILABLE / NOT_APPLICABLE). */
export const LIVE_SUPPORTED_RELATIONSHIP_TYPES: readonly RelationshipType[] = [
  'ASSET_HOLDING',
  'LIQUIDITY_POSITION',
  'FARM_POSITION',
  'POOL_POSITION',
  'CLAIMABLE_REWARD',
  'CAPABILITY_ELIGIBILITY',
]

export const RELATIONSHIP_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'ELIGIBLE',
  'NOT_ELIGIBLE',
  'CLAIMABLE',
  'NO_CLAIM',
  'OBSERVED',
  'UNRESOLVED',
] as const

export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number]

export const RELATIONSHIP_AVAILABILITIES = [
  'AVAILABLE',
  'UNAVAILABLE',
  'NOT_APPLICABLE',
  'STALE',
  'CONFLICTED',
] as const

export type RelationshipAvailability = (typeof RELATIONSHIP_AVAILABILITIES)[number]

export const WALLET_CONNECTION_STATES = [
  'DISCONNECTED',
  'CONNECTING',
  'CONNECTED',
  'RECONNECTING',
] as const

export type WalletConnectionState = (typeof WALLET_CONNECTION_STATES)[number]

export const RELATIONSHIP_REASON_CODES = [
  'WALLET_DISCONNECTED',
  'ACCOUNT_INVALID',
  'CHAIN_UNSUPPORTED',
  'PROJECT_HAS_NO_REGISTERED_ASSETS',
  'PROJECT_HAS_NO_REGISTERED_POSITIONS',
  'RPC_UNAVAILABLE',
  'BALANCE_READ_UNAVAILABLE',
  'LIQUIDITY_READER_UNAVAILABLE',
  'FARM_READER_UNAVAILABLE',
  'POOL_READER_UNAVAILABLE',
  'REWARD_READER_UNAVAILABLE',
  'PROJECT_MAPPING_CONFLICTED',
  'PARTIAL_CHAIN_COVERAGE',
  'DATA_STALE',
  'NO_RELATIONSHIP_DETECTED',
  'ZERO_BALANCE',
  'GOVERNANCE_NOT_REGISTERED',
  'CONTROL_EVIDENCE_UNAVAILABLE',
  'CONTRIBUTOR_ROLE_UNAVAILABLE',
  'LIVE_READ_CLIENT_REQUIRED',
] as const

export type RelationshipReasonCode = (typeof RELATIONSHIP_REASON_CODES)[number]

export const WALLET_RELATIONSHIP_LIMITATIONS = [
  'This layer shows only relationships attributable to the current project via registered assets, contracts, and Melega DEX position readers.',
  'It is not a portfolio dashboard, transaction history, or investment analysis.',
  'Zero balances are factual observations and are not errors.',
  'Unavailable readers are not treated as zero holdings.',
  'No swap, liquidity, farm, pool, claim, vote, or owner actions are available from this section.',
] as const
