/**
 * PP005 — Project Swap and Markets Orchestration schema.
 * Navigation/orchestration only — never quotes, calldata, or execution.
 */

export const PROJECT_MARKETS_SCHEMA_VERSION = 'melega.project-markets.v1' as const
export const MARKET_RESOLVER_REVISION = 'PP005_SWAP_MARKETS_V1' as const
export const PROJECT_PAGE_MARKETS_SUMMARY_EXTENSION = 'marketsSummary.v1' as const

/** Market types backed by current repository architecture. */
export const MARKET_TYPES = ['AMM_V2_PAIR'] as const
export type MarketType = (typeof MARKET_TYPES)[number]

export const MARKET_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'PAUSED',
  'DEPRECATED',
  'UNRESOLVED',
] as const
export type MarketStatus = (typeof MARKET_STATUSES)[number]

export const MARKET_AVAILABILITIES = [
  'AVAILABLE',
  'UNAVAILABLE',
  'NOT_APPLICABLE',
  'STALE',
  'CONFLICTED',
] as const
export type MarketAvailability = (typeof MARKET_AVAILABILITIES)[number]

export const MARKET_SOURCE_CLASSES = [
  'EXPLICIT_REGISTRY',
  'VENUE_REGISTRY',
  'DETERMINISTIC_FACTORY',
  'PROJECT_ATTESTED',
  'MELEGA_VERIFIED',
  'OBSERVED_ONCHAIN',
] as const
export type MarketSourceClass = (typeof MARKET_SOURCE_CLASSES)[number]

export const MARKET_VERIFICATION_LEVELS = [
  'UNVERIFIED',
  'PROJECT_ATTESTED',
  'OBSERVED',
  'MELEGA_VERIFIED',
] as const
export type MarketVerificationLevel = (typeof MARKET_VERIFICATION_LEVELS)[number]

export const MARKET_REASON_CODES = [
  'PROJECT_HAS_NO_ASSETS',
  'PROJECT_HAS_NO_REGISTERED_MARKETS',
  'MARKET_NOT_FOUND',
  'MARKET_INACTIVE',
  'MARKET_PAUSED',
  'MARKET_DEPRECATED',
  'MARKET_MAPPING_CONFLICTED',
  'ASSET_MAPPING_CONFLICTED',
  'CHAIN_UNSUPPORTED',
  'LIVE_READ_UNAVAILABLE',
  'LIVE_DATA_STALE',
  'PARTIAL_MARKET_COVERAGE',
  'SWAP_DESTINATION_UNAVAILABLE',
  'INVALID_MARKET_CONTRACT',
  'INVALID_ASSET_IDENTIFIER',
  'MULTIPLE_EQUAL_PREFERRED_MARKETS',
  'VENUE_NOT_SWAP_CAPABLE',
  'ASSET_TRADABLE_WITHOUT_REGISTERED_MARKET',
] as const
export type MarketReasonCode = (typeof MARKET_REASON_CODES)[number]

export const MARKET_LIMITATIONS = [
  'Markets are project-scoped orchestration over existing Melega DEX swap routes.',
  'No quotes, slippage, approvals, calldata, or transaction execution are included.',
  'No price, volume, liquidity USD, market cap, or holder analytics are invented.',
  'Venue or registry listing is not independent on-chain verification of trade safety.',
  'The existing Melega DEX swap surface remains the sole execution authority.',
] as const

/** Canonical swap path used by deep links (Trade Terminal; /swap is legacy alias). */
export const CANONICAL_SWAP_ROUTE = '/trade' as const

/** Supported swap query parameter names (must match existing Trade URL parser). */
export const SUPPORTED_SWAP_QUERY_PARAMS = [
  'inputCurrency',
  'outputCurrency',
  'chain',
  'chainId',
  'exactAmount',
  'exactField',
  'recipient',
] as const
