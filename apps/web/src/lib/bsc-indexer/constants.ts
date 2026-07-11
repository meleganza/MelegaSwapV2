export const MELEGA_CHAIN_ID = 56

export const MELEGA_FACTORY_BSC = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
export const MELEGA_ROUTER_BSC = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
export const MELEGA_MASTERCHEF_BSC = '0x41D5487836452d23f2c467070244E5842B412794'
export const MELEGA_SMARTCHEF_FACTORY_BSC = '0x4c33eb3d40c78461dd1a079150fcac6da3c701cf'
export const MARCO_WBNB_PAIR_BSC = '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e'

export const SWAP_TOPIC = '0xd78ad95fa46c994b655c0d0f448cbf7efa837466c05fc46eca8c283b072db6b'
export const MINT_TOPIC = '0x4c209b5fc8ad50758f13e5e1943ba2e18854ec9f5580fa75b326a67a4c672b55'
export const BURN_TOPIC = '0xdccd412f0b1252819cb1fd330b93224ca4ace6189ba8ebd092bd5d43eafe2fd'
export const SYNC_TOPIC = '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1'
export const PAIR_CREATED_TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'

export const BOOTSTRAP_DAYS_PRIMARY = 30
export const BOOTSTRAP_DAYS_FALLBACK = 7
export const BSC_AVG_BLOCK_SECONDS = 3
export const INDEXER_SCHEMA_VERSION = 2
export const FEATURED_PAIR_SLUG = 'marco-wbnb'
/** Per cron sync — 10 blocks via public dataseed log RPC (rate-limit aware). */
export const MAX_BLOCKS_PER_SYNC = 10
export const BOOTSTRAP_MAX_BLOCKS_PER_SYNC = 10
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
