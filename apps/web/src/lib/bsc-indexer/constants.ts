export const MELEGA_CHAIN_ID = 56

export const MELEGA_FACTORY_BSC = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
export const MELEGA_ROUTER_BSC = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
export const MELEGA_MASTERCHEF_BSC = '0x41D5487836452d23f2c467070244E5842B412794'
export const MELEGA_SMARTCHEF_FACTORY_BSC = '0x4c33eb3d40c78461dd1a079150fcac6da3c701cf'
export const MELEGA_VAULT_BSC = '0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C'
export const MELEGA_TREASURY_BSC = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'
export const MELEGA_FEE_COLLECTOR_BSC = '0xb5a8707FfA045E0FC7db6eFC63161e853C80139a'
export const MARCO_WBNB_PAIR_BSC = '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e'

export {
  SWAP_TOPIC,
  MINT_TOPIC,
  BURN_TOPIC,
  SYNC_TOPIC,
  PAIR_CREATED_TOPIC,
  CANONICAL_EVENT_TOPICS,
  MALFORMED_SWAP_TOPIC_HISTORICAL,
} from './eventTopics'

export const BOOTSTRAP_DAYS_PRIMARY = 7
export const BOOTSTRAP_DAYS_FALLBACK = 7
export const BSC_AVG_BLOCK_SECONDS = 3
export const INDEXER_SCHEMA_VERSION = 2
export const FEATURED_PAIR_SLUG = 'marco-wbnb'
/** R772 verified MARCO/WBNB swap — one-time anchor backfill after topic correction. */
export const VERIFIED_R772_SWAP_BLOCK = 86_326_727
export const VERIFIED_R772_SWAP_TX =
  '0x76c0b12d2fe149a6c524661f2bdd93fe51da373e561b870b53c9141b0db240c9'
/** Per cron sync — forward/backward chunked log budgets. */
export const MAX_BLOCKS_PER_SYNC = 400
export const BOOTSTRAP_MAX_BLOCKS_PER_SYNC = 200
export const RECENT_BOOTSTRAP_BLOCKS = 250
export const LIVE_LAG_THRESHOLD_BLOCKS = 5_000
/** Legacy R768 genesis — not used by v2 featured-pair indexer. */
export const DEFAULT_START_BLOCK = 26_000_000
export const DEFAULT_CHUNK_SIZE = 200
export const MIN_CHUNK_SIZE = 1
/** Floor for checkpoint-persisted chunk sizes — prevents sticky chunk=1 poisoning. */
export const MIN_PERSISTED_CHUNK_SIZE = 25
export const REORG_SAFETY_BLOCKS = 12
export const MAX_EVENTS_PER_SYNC = 500

/**
 * R791-INFRA-003 — never persist or reload poisoned chunk=1.
 * Temporary shrink may still happen in-memory during getLogsChunked.
 */
export function sanitizePersistedChunkSize(chunkSize: number | null | undefined): number {
  if (chunkSize == null || !Number.isFinite(chunkSize) || chunkSize < MIN_PERSISTED_CHUNK_SIZE) {
    return DEFAULT_CHUNK_SIZE
  }
  return Math.min(DEFAULT_CHUNK_SIZE, Math.floor(chunkSize))
}

/** After a successful scan, never persist below floor; gradually recover toward DEFAULT. */
export function nextPersistedChunkSize(finalChunkSize: number, previousChunkSize: number): number {
  const floor = Math.max(MIN_PERSISTED_CHUNK_SIZE, finalChunkSize)
  const grown = Math.min(DEFAULT_CHUNK_SIZE, Math.max(floor, previousChunkSize * 2))
  return sanitizePersistedChunkSize(grown)
}

export const INTERVAL_SECONDS = {
  '1H': 3600,
  '4H': 14400,
  '1D': 86400,
} as const
