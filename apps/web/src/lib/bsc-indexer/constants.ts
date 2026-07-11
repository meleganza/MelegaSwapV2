export const MELEGA_CHAIN_ID = 56

export const MELEGA_FACTORY_BSC = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
export const MELEGA_ROUTER_BSC = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
export const MELEGA_MASTERCHEF_BSC = '0x41D5487836452d23f2c467070244E5842B412794'
export const MELEGA_SMARTCHEF_FACTORY_BSC = '0x4c33eb3d40c78461dd1a079150fcac6da3c701cf'
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

export const BOOTSTRAP_DAYS_PRIMARY = 30
export const BOOTSTRAP_DAYS_FALLBACK = 7
export const BSC_AVG_BLOCK_SECONDS = 3
export const INDEXER_SCHEMA_VERSION = 2
export const FEATURED_PAIR_SLUG = 'marco-wbnb'
/** R772 verified MARCO/WBNB swap — one-time anchor backfill after topic correction. */
export const VERIFIED_R772_SWAP_BLOCK = 86_326_727
export const VERIFIED_R772_SWAP_TX =
  '0x76c0b12d2fe149a6c524661f2bdd93fe51da373e561b870b53c9141b0db240c9'
/** Per cron sync — 5 blocks; QuickNode single-block filter budget for serverless. */
export const MAX_BLOCKS_PER_SYNC = 5
export const BOOTSTRAP_MAX_BLOCKS_PER_SYNC = 5
export const RECENT_BOOTSTRAP_BLOCKS = 250
export const LIVE_LAG_THRESHOLD_BLOCKS = 5_000
/** Legacy R768 genesis — not used by v2 featured-pair indexer. */
export const DEFAULT_START_BLOCK = 26_000_000
export const DEFAULT_CHUNK_SIZE = 1
export const MIN_CHUNK_SIZE = 1
export const REORG_SAFETY_BLOCKS = 12
export const MAX_EVENTS_PER_SYNC = 500

export const INTERVAL_SECONDS = {
  '1H': 3600,
  '4H': 14400,
  '1D': 86400,
} as const
