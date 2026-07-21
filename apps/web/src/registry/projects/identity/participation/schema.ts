/**
 * PP006 — Liquidity, Farms and Pools Orchestration schema.
 * Navigation/orchestration only — no studio duplication, no yield metrics, no execution.
 */

export const PROJECT_PARTICIPATION_SCHEMA_VERSION = 'melega.project-participation.v1' as const
export const PARTICIPATION_RESOLVER_REVISION = 'PP006_PARTICIPATION_V1' as const
export const PROJECT_PAGE_PARTICIPATION_SUMMARY_EXTENSION = 'participationSummary.v1' as const

/** Public opportunity types (wallet-independent). */
export const PARTICIPATION_OPPORTUNITY_TYPES = [
  'LIQUIDITY_POOL',
  'FARM',
  'STAKING_POOL',
] as const
export type ParticipationOpportunityType = (typeof PARTICIPATION_OPPORTUNITY_TYPES)[number]

/** Wallet-scoped relationship types (contextual only — from PP004). */
export const PARTICIPATION_RELATIONSHIP_TYPES = [
  'USER_LIQUIDITY_POSITION',
  'USER_FARM_POSITION',
  'USER_POOL_POSITION',
  'REWARD_RELATIONSHIP',
] as const
export type ParticipationRelationshipType = (typeof PARTICIPATION_RELATIONSHIP_TYPES)[number]

export const PARTICIPATION_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'PAUSED',
  'DEPRECATED',
  'UNRESOLVED',
] as const
export type ParticipationStatus = (typeof PARTICIPATION_STATUSES)[number]

export const PARTICIPATION_AVAILABILITIES = [
  'AVAILABLE',
  'UNAVAILABLE',
  'NOT_APPLICABLE',
  'STALE',
  'CONFLICTED',
] as const
export type ParticipationAvailability = (typeof PARTICIPATION_AVAILABILITIES)[number]

export const PARTICIPATION_SOURCE_CLASSES = [
  'REGISTERED',
  'DISCOVERED',
  'DERIVED_FROM_MARKET',
  'ONCHAIN_OBSERVED',
  'PROJECT_ATTESTED',
  'VENUE_REGISTRY',
] as const
export type ParticipationSourceClass = (typeof PARTICIPATION_SOURCE_CLASSES)[number]

export const PARTICIPATION_REASON_CODES = [
  'PROJECT_HAS_NO_PARTICIPATION',
  'PROJECT_HAS_NO_ASSETS',
  'LIQUIDITY_POOL_NOT_FOUND',
  'FARM_NOT_FOUND',
  'STAKING_POOL_NOT_FOUND',
  'ATTRIBUTION_REJECTED',
  'CHAIN_UNSUPPORTED',
  'DESTINATION_UNAVAILABLE',
  'PARTIAL_PARTICIPATION_COVERAGE',
  'WALLET_DISCONNECTED',
  'ACCOUNT_INVALID',
  'LIVE_READ_CLIENT_REQUIRED',
  'POSITION_READER_UNAVAILABLE',
] as const
export type ParticipationReasonCode = (typeof PARTICIPATION_REASON_CODES)[number]

export const PARTICIPATION_LIMITATIONS = [
  'Participation opportunities are project-scoped discovery over existing Melega DEX studios.',
  'Liquidity Studio, Farms Studio, and Pools Studio remain the sole execution authorities.',
  'No APR, APY, TVL, yield ranking, or fabricated attractiveness metrics are introduced.',
  'No deposit, withdraw, stake, unstake, harvest, claim, or approval actions are available here.',
  'Wallet positions reuse the PP004 Wallet Relationship Layer and never appear in public APIs.',
] as const

export const STUDIO_DESTINATION_ROUTES = {
  liquidity: '/liquidity-studio',
  farms: '/farms',
  pools: '/pools',
  commandCenter: '/command-center',
} as const
