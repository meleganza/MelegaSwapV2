/**
 * MARCO Multichain Network — shared route-state authority (DEX consumer).
 * Runtime availability is owned exclusively by the Portal endpoint.
 * These constants are for schema validation / anti-legacy guards only — never enable routes.
 */

export const MARCO_ROUTE_STATE_URL = 'https://marco.melega.ai/api/public/bridge/route-state'

/** Bound cache — never keep an ENABLED snapshot longer than Portal max-age. */
export const ROUTE_STATE_CACHE_TTL_MS = 30_000

/** Canonical route identities — do not invent additional routes. */
export const CANONICAL_ROUTE_IDS = [
  'BNB_BASE',
  'BASE_BNB',
  'BNB_ROBINHOOD',
  'ROBINHOOD_BNB',
  'BNB_SOLANA',
  'SOLANA_BNB',
] as const

export type CanonicalRouteId = (typeof CANONICAL_ROUTE_IDS)[number]

export const ROUTE_ID_BY_PAIR: Record<string, CanonicalRouteId> = {
  'bnb>base': 'BNB_BASE',
  'base>bnb': 'BASE_BNB',
  'bnb>robinhood': 'BNB_ROBINHOOD',
  'robinhood>bnb': 'ROBINHOOD_BNB',
  'bnb>solana': 'BNB_SOLANA',
  'solana>bnb': 'SOLANA_BNB',
}

/** Expected network identities for fail-closed validation (not enable flags). */
export const EXPECTED_NETWORK_IDENTITY = {
  bnb: { chainId: 56, eid: 30102 },
  base: { chainId: 8453, eid: 30184 },
  solana: { chainId: null as number | null, eid: 30168 },
  robinhood: { chainId: 4663, eid: 30416 },
} as const

/** Retired / forbidden identities — presence in active response fails closed. */
export const LEGACY_FORBIDDEN_CHAIN_IDS = new Set([62831])

/** Old Base/RH OFT hex — must not appear as Base or Robinhood token. BNB adapter may keep this hex. */
export const LEGACY_RETIRED_BASE_RH_TOKEN = '0xc92b49ddf9312cbfc01ad397963df915c7a2399e'

export const REQUIRED_NETWORK_IDS = ['bnb', 'base', 'solana', 'robinhood'] as const
