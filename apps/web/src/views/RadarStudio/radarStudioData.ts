export type RadarStatusLevel = 'green' | 'yellow' | 'orange' | 'red'
export type LiveEventType =
  | 'whale'
  | 'liquidity'
  | 'audit'
  | 'contract'
  | 'community'
  | 'dex'
  | 'listing'
  | 'verification'

export type SignalType =
  | 'Whale'
  | 'Liquidity'
  | 'Contract'
  | 'Holder Growth'
  | 'Audit'
  | 'Social'
  | 'Risk'

export interface RadarKpiItem {
  id: string
  label: string
  value: string
  delta: string
  deltaPositive?: boolean
}

export interface LiveEventItem {
  id: string
  type: LiveEventType
  project: string
  event: string
  timestamp: string
  confidence: string
}

export interface OperationalMetric {
  label: string
  status: RadarStatusLevel
  description: string
}

export interface ProvenanceSource {
  id: string
  label: string
  available: boolean
}

export interface ContractPreviewData {
  address: string
  network: string
  score: number
  metrics: OperationalMetric[]
  operationalSummary: string
  provenance: ProvenanceSource[]
  lastUpdated: string
  freshness: string
  evidenceCount: number
  aiVersion: string
  projectName?: string
  symbol?: string
}

export interface ConfidenceBreakdownItem {
  label: string
  value: number
}

export interface RiskMatrixItem {
  label: string
  level: RadarStatusLevel
  tooltip: string
}

export interface TimelineEvent {
  timestamp: string
  label: string
  severity: RadarStatusLevel
  confidence: string
}

export interface RadarEventCard {
  id: string
  rank: number
  name: string
  network: string
  symbol?: string
  aiConfidence: number
  summary: string
  signals: SignalType[]
  liquidity: string
  volume: string
  newHolders: string
  whales: string
  contractStatus: string
  contractRisk: string
  riskLevel: string
  freshness: string
  lastDetection: string
  detectionReasons: string[]
  confidenceBreakdown: ConfidenceBreakdownItem[]
  riskMatrix: RiskMatrixItem[]
  timeline: TimelineEvent[]
  contractIntel: { label: string; value: string; status: RadarStatusLevel }[]
  riskScore: number
  gasComplexity: string
  intelSummary: string
  projectSlug?: string
  contractAddress?: string
  tradeHref?: string
  projectHref?: string
  registryTier?: 'canonical' | 'pending'
  reviewStatus?: string
}

export interface WhaleRow {
  wallet: string
  token: string
  amount: string
  action: 'buy' | 'sell'
  time: string
}

export interface WalletAccumulationRow {
  wallet: string
  token: string
  amount: string
  confidence: string
}

export interface SmartMoneyRow {
  wallet: string
  roi: string
  winRate: string
  confidence: string
  lastActivity: string
}

export interface WarningRow {
  label: string
  level: RadarStatusLevel
}

export interface RecentDiscoveryRow {
  time: string
  project: string
  event: string
  confidence: string
}

export interface TopContractRow {
  rank: number
  name: string
  symbol?: string
  confidence: number
  signal: string
}

export interface HeatmapProject {
  rank: number
  name: string
  symbol?: string
  liquidity: number
  volume: number
  whales: number
  holders: number
  developers: number
  community: number
  momentum: number
  social: number
  audit: number
  contract: number
  ownership: number
  taxes: number
  lpLock: number
}

export const LIVE_EVENT_ICONS: Record<LiveEventType, string> = {
  whale: '🐋',
  liquidity: '◈',
  audit: '🛡',
  contract: '◎',
  community: '✦',
  dex: '⇄',
  listing: '★',
  verification: '✓',
}

export const RADAR_FILTER_CHIPS = [
  'All', 'AI Verified', 'Trending', 'New', 'Whales', 'Liquidity', 'Contracts',
  'Holder Growth', 'Gaming', 'AI', 'Infrastructure', 'DeFi', 'RWA', 'More',
] as const

export const FILTER_CHAINS = ['BNB', 'Ethereum', 'Base', 'Polygon', 'Solana'] as const
export const FILTER_CATEGORIES = ['AI', 'DeFi', 'Gaming', 'Infrastructure', 'Meme', 'RWA'] as const
export const FILTER_SORT = ['Trending', 'Highest Rated', 'Highest Liquidity', 'Newest', 'Recently Listed'] as const

export const HEATMAP_TOOLTIPS: Record<string, string> = {
  liquidity: 'Indexed liquidity depth vs ecosystem median',
  volume: '24h volume momentum',
  whales: 'Active whale wallet participation',
  holders: 'Holder growth velocity',
  developers: 'On-chain dev activity signals',
  community: 'Community engagement index',
  momentum: 'Price and volume momentum composite',
  social: 'Social channel velocity',
  audit: 'Audit coverage and freshness',
  contract: 'Bytecode safety scan',
  ownership: 'Ownership renouncement status',
  taxes: 'Buy/sell tax configuration risk',
  lpLock: 'Liquidity lock duration and coverage',
}

export const HEATMAP_METRICS = [
  { key: 'liquidity', label: 'Liquidity' },
  { key: 'volume', label: 'Volume' },
  { key: 'whales', label: 'Whales' },
  { key: 'holders', label: 'Holders' },
  { key: 'developers', label: 'Developers' },
  { key: 'community', label: 'Community' },
  { key: 'momentum', label: 'Momentum' },
  { key: 'social', label: 'Social' },
  { key: 'audit', label: 'Audit' },
  { key: 'contract', label: 'Contract' },
  { key: 'ownership', label: 'Ownership' },
  { key: 'taxes', label: 'Taxes', invert: true as const },
  { key: 'lpLock', label: 'LP Lock' },
] as const

export function heatBlockColor(value: number, invert = false): string {
  if (value <= 0) return '#222222'
  const v = invert ? 100 - value : value
  if (v >= 80) return '#00E884'
  if (v >= 60) return '#D4AF37'
  if (v >= 40) return '#FFB84D'
  return '#FF4D4D'
}

export function statusColor(level: RadarStatusLevel): string {
  return heatBlockColor(level === 'green' ? 90 : level === 'yellow' ? 65 : level === 'orange' ? 45 : 20)
}
