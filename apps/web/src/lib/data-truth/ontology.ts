/**
 * R780 — Canonical data ontology for Melega DEX production surfaces.
 * Every UI count maps to exactly one machine-readable definition.
 */

export type DataTruthOwner =
  | 'factory'
  | 'router'
  | 'masterchef'
  | 'smartchef'
  | 'pair_contract'
  | 'registry'
  | 'indexer'
  | 'explorer_api'
  | 'coingecko'
  | 'computed'

export interface OntologyTerm {
  id: string
  label: string
  definition: string
  owner: DataTruthOwner
  contract?: string
  query?: string
  freshnessMaxSec?: number
}

export const MELEGA_PRODUCTION_CONTRACTS = {
  factory: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
  router: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3',
  masterChef: '0x41D5487836452d23f2c467070244E5842B412794',
  vault: '0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C',
  smartChefFactory: '0x4c33eb3d40c78461dd1a079150fcac6da3c701cf',
  treasury: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
  feeCollector: '0xb5a8707FfA045E0FC7db6eFC63161e853C80139a',
} as const

export const INDEXER_TIER_DEFINITIONS = {
  TIER_1: {
    id: 'TIER_1',
    label: 'Core pairs',
    definition: 'MARCO/WBNB and Factory-proven core pairs — continuous forward + 7d bootstrap',
    maxPairs: 8,
    bootstrapDays: 7,
  },
  TIER_2: {
    id: 'TIER_2',
    label: 'Active pairs',
    definition: 'Up to 20 tradeable pairs ranked by reserves + indexed swap activity',
    maxPairs: 20,
    bootstrapDays: 7,
  },
  TIER_3: {
    id: 'TIER_3',
    label: 'Inventory only',
    definition: 'Inactive or zero-liquidity pairs — factory enumeration only, no event indexing',
  },
} as const

export const ONTOLOGY: OntologyTerm[] = [
  {
    id: 'pair_discovered',
    label: 'Pair discovered',
    definition: 'AMM pair address returned by Factory.allPairs(i) with valid contract code',
    owner: 'factory',
    contract: MELEGA_PRODUCTION_CONTRACTS.factory,
    query: 'allPairsLength + allPairs(i)',
  },
  {
    id: 'pair_tradeable',
    label: 'Pair tradeable',
    definition: 'Discovered pair with token0, token1, and reserve0 > 0 OR reserve1 > 0',
    owner: 'pair_contract',
    query: 'getReserves()',
  },
  {
    id: 'pair_with_liquidity',
    label: 'Pair with liquidity',
    definition: 'Tradeable pair where both reserves are non-zero',
    owner: 'pair_contract',
  },
  {
    id: 'pool_discovered',
    label: 'Pool discovered',
    definition: 'SmartChef/SousChef staking contract known from on-chain inventory or registry enumeration',
    owner: 'smartchef',
    contract: MELEGA_PRODUCTION_CONTRACTS.smartChefFactory,
  },
  {
    id: 'pool_active',
    label: 'Pool active',
    definition: 'Current block >= startBlock AND current block < endBlock AND rewardPerBlock > 0',
    owner: 'smartchef',
  },
  {
    id: 'pool_funded',
    label: 'Pool funded',
    definition: 'Reward token balance on pool contract > 0 OR remaining blocks × rewardPerBlock > 0',
    owner: 'smartchef',
  },
  {
    id: 'pool_rewarding',
    label: 'Pool rewarding',
    definition: 'Active pool with funded reward balance and displayable sustainable APR',
    owner: 'smartchef',
  },
  {
    id: 'pool_ended',
    label: 'Pool ended',
    definition: 'Current block >= bonusEndBlock OR isFinished flag OR rewardPerBlock == 0',
    owner: 'smartchef',
  },
  {
    id: 'farm_discovered',
    label: 'Farm discovered',
    definition: 'MasterChef pool index 0..poolLength-1 with valid poolInfo LP token',
    owner: 'masterchef',
    contract: MELEGA_PRODUCTION_CONTRACTS.masterChef,
    query: 'poolLength + poolInfo(pid)',
  },
  {
    id: 'farm_active',
    label: 'Farm active',
    definition: 'MasterChef pid with multiplier != 0X, pid != 0, allocPoint > 0',
    owner: 'masterchef',
  },
  {
    id: 'farm_emitting',
    label: 'Farm emitting',
    definition: 'Active farm receiving poolWeight × dexTokenPerBlock > 0',
    owner: 'masterchef',
  },
  {
    id: 'farm_ended',
    label: 'Farm ended',
    definition: 'MasterChef pid with multiplier 0X or archived',
    owner: 'masterchef',
  },
  {
    id: 'indexed_asset',
    label: 'Indexed asset',
    definition: 'Unique token address (chainId + lowercase address) present in canonical asset registry',
    owner: 'registry',
  },
  {
    id: 'verified_asset',
    label: 'Verified asset',
    definition: 'Indexed asset with registry canonical project or on-chain symbol/decimals verified',
    owner: 'registry',
  },
  {
    id: 'live_asset',
    label: 'Live asset',
    definition: 'Verified asset with fresh price (<15m) and tradeable pair liquidity',
    owner: 'computed',
    freshnessMaxSec: 900,
  },
  {
    id: 'recent_event',
    label: 'Recent event',
    definition: 'Indexed Swap/Mint/Burn within the configured activity window (default 24H)',
    owner: 'indexer',
    freshnessMaxSec: 86_400,
  },
  {
    id: 'live_activity',
    label: 'Live activity',
    definition: 'Same as recent_event — never includes events older than the activity window',
    owner: 'indexer',
    freshnessMaxSec: 86_400,
  },
  {
    id: 'trending_asset',
    label: 'Trending asset',
    definition: 'Live asset with measurable 24H volume OR 24H price change from indexed candles; ranked by volume → liquidity → trades',
    owner: 'indexer',
  },
]

export const ONTOLOGY_BY_ID = Object.fromEntries(ONTOLOGY.map((t) => [t.id, t])) as Record<
  string,
  OntologyTerm
>

export const LIVE_ACTIVITY_WINDOW_SEC = 86_400
