export type PlaceholderClassification =
  | 'LIVE_SOURCE_AVAILABLE'
  | 'SOURCE_EXISTS_BUT_NOT_WIRED'
  | 'SOURCE_NOT_CONFIGURED'
  | 'SOURCE_DOES_NOT_EXIST'
  | 'INTENTIONALLY_EMPTY'

export interface PlaceholderAuditEntry {
  page: string
  surface: string
  placeholder: string
  dataField: string
  classification: PlaceholderClassification
  source?: string
}

/** P0 registry — classifications before R300 wiring. */
export const PLACEHOLDER_AUDIT: PlaceholderAuditEntry[] = [
  { page: 'Overview', surface: 'QuickMarketStrip', placeholder: 'Awaiting index', dataField: 'market cards', classification: 'LIVE_SOURCE_AVAILABLE', source: 'useHomeTradeData subgraph/farms/pools' },
  { page: 'Overview', surface: 'LiveActivityFeed', placeholder: 'No recent activity indexed yet', dataField: 'swap/liquidity slots', classification: 'LIVE_SOURCE_AVAILABLE', source: 'useProtocolTransactionsSWR' },
  { page: 'Overview', surface: 'LiveActivityFeed', placeholder: 'staking slot empty', dataField: 'staking events', classification: 'SOURCE_DOES_NOT_EXIST', source: 'no staking tx indexer' },
  { page: 'Trade', surface: 'TradePairStats', placeholder: '—', dataField: '24h volume/liquidity/trades', classification: 'LIVE_SOURCE_AVAILABLE', source: 'useTokenDataSWR' },
  { page: 'Trade', surface: 'TradePairStats', placeholder: '—', dataField: 'holders', classification: 'SOURCE_NOT_CONFIGURED', source: 'EXPLORER_SOURCE_MISSING' },
  { page: 'Trade', surface: 'TradeChartPanel', placeholder: 'pair not indexed', dataField: 'price chart', classification: 'LIVE_SOURCE_AVAILABLE', source: 'subgraph pair prices + TradingView' },
  { page: 'Trade', surface: 'TradeRecentSwaps', placeholder: 'No recent swaps', dataField: 'recent swaps', classification: 'LIVE_SOURCE_AVAILABLE', source: 'useProtocolTransactionsSWR' },
  { page: 'Trade', surface: 'TradeSmartRouteBox', placeholder: 'Awaiting quote', dataField: 'route quote', classification: 'INTENTIONALLY_EMPTY', source: 'router until amount entered' },
  { page: 'Liquidity', surface: 'TopPoolsPanel', placeholder: 'Loading top pools', dataField: 'top pools', classification: 'LIVE_SOURCE_AVAILABLE', source: 'useLiquidityTerminalData' },
  { page: 'Liquidity', surface: 'LiquidityActivityTable', placeholder: 'No liquidity activity', dataField: 'mint/burn', classification: 'LIVE_SOURCE_AVAILABLE', source: 'useProtocolTransactionsSWR' },
  { page: 'Farms', surface: 'FarmsGrid', placeholder: 'Loading farms', dataField: 'farm grid', classification: 'LIVE_SOURCE_AVAILABLE', source: 'MasterChef RPC' },
  { page: 'Farms', surface: 'FarmGridCard', placeholder: 'Indexing', dataField: 'APR while loading', classification: 'LIVE_SOURCE_AVAILABLE', source: 'on-chain farm state' },
  { page: 'Pools', surface: 'PoolsGrid', placeholder: 'Loading pools', dataField: 'pool grid', classification: 'LIVE_SOURCE_AVAILABLE', source: 'SousChef bonusEndBlock RPC' },
  { page: 'Trending', surface: 'TrendingSidebar', placeholder: 'whale feed unavailable', dataField: 'whale activity', classification: 'SOURCE_DOES_NOT_EXIST' },
  { page: 'Projects', surface: 'ProjectsKpiRow', placeholder: 'holders —', dataField: 'total holders', classification: 'SOURCE_NOT_CONFIGURED', source: 'EXPLORER_SOURCE_MISSING' },
  { page: 'Projects', surface: 'FeaturedProjectPanel', placeholder: 'Chart unavailable', dataField: 'price chart', classification: 'LIVE_SOURCE_AVAILABLE', source: 'useTokenDataSWR when indexed' },
  { page: 'Radar', surface: 'RadarOpsLeftColumn', placeholder: 'whale unavailable', dataField: 'whale/smart money', classification: 'SOURCE_DOES_NOT_EXIST' },
  { page: 'Build', surface: 'CreateTokenPanel', placeholder: 'Unavailable gas', dataField: 'gas estimate', classification: 'INTENTIONALLY_EMPTY', source: 'dry-run only' },
  { page: 'Collectibles', surface: 'CollectibleGridCard', placeholder: '— floor/volume', dataField: 'NFT market stats', classification: 'SOURCE_DOES_NOT_EXIST' },
  { page: 'Command Center', surface: 'CommandDashboardCards', placeholder: 'No recent activity', dataField: 'wallet activity', classification: 'INTENTIONALLY_EMPTY', source: 'no wallet positions' },
]

export function classifyPlaceholder(page: string, surface: string): PlaceholderAuditEntry | undefined {
  return PLACEHOLDER_AUDIT.find((e) => e.page === page && e.surface === surface)
}
