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

export const DEFAULT_CONFIDENCE_BREAKDOWN: ConfidenceBreakdownItem[] = [
  { label: 'Liquidity', value: 96 },
  { label: 'Volume', value: 92 },
  { label: 'Contract', value: 99 },
  { label: 'Community', value: 88 },
  { label: 'Developer', value: 91 },
  { label: 'Whales', value: 94 },
  { label: 'Momentum', value: 89 },
  { label: 'Social', value: 84 },
]

export const DEFAULT_RISK_MATRIX: RiskMatrixItem[] = [
  { label: 'Contract', level: 'green', tooltip: 'Verified bytecode matches published source' },
  { label: 'Liquidity', level: 'green', tooltip: 'LP depth stable across indexed pools' },
  { label: 'Taxes', level: 'yellow', tooltip: 'Buy/sell tax within moderate range' },
  { label: 'Ownership', level: 'green', tooltip: 'Ownership renounced on-chain' },
  { label: 'Developer', level: 'green', tooltip: 'Active commits in last 14 days' },
  { label: 'Proxy', level: 'green', tooltip: 'No proxy delegate detected' },
  { label: 'Blacklist', level: 'green', tooltip: 'No blacklist function in ABI' },
  { label: 'Whales', level: 'yellow', tooltip: 'Top 10 wallets hold 38% supply' },
  { label: 'Community', level: 'green', tooltip: 'Holder growth accelerating' },
  { label: 'Upgradeability', level: 'yellow', tooltip: 'Upgrade path exists but timelocked' },
]

export const DEFAULT_PROVENANCE: ProvenanceSource[] = [
  { id: 'bscscan', label: 'BscScan', available: true },
  { id: 'dexscreener', label: 'DexScreener', available: true },
  { id: 'coingecko', label: 'CoinGecko', available: true },
  { id: 'cmc', label: 'CoinMarketCap', available: true },
  { id: 'website', label: 'Official Website', available: true },
  { id: 'social', label: 'Social', available: true },
  { id: 'github', label: 'Github', available: false },
  { id: 'ai', label: 'Internal AI', available: true },
]

export const DEFAULT_OPERATIONAL_METRICS: OperationalMetric[] = [
  { label: 'Liquidity', status: 'green', description: 'Stable depth across indexed pools' },
  { label: 'Ownership', status: 'green', description: 'Renounced with no admin keys' },
  { label: 'Mint', status: 'green', description: 'Mint authority disabled' },
  { label: 'Blacklist', status: 'green', description: 'No blacklist functions detected' },
  { label: 'Proxy', status: 'green', description: 'No proxy pattern indexed' },
  { label: 'Upgradeable', status: 'yellow', description: 'Timelocked upgrade path present' },
  { label: 'LP Lock', status: 'green', description: 'Liquidity locked 12 months' },
  { label: 'Taxes', status: 'yellow', description: '2% buy / 2% sell within norms' },
  { label: 'Holder Distribution', status: 'yellow', description: 'Top wallets moderately concentrated' },
  { label: 'Contract Age', status: 'green', description: 'Deployed 8 months ago' },
  { label: 'Developer Activity', status: 'green', description: 'Commits indexed this week' },
  { label: 'Last Upgrade', status: 'green', description: 'No upgrades in 90 days' },
]

export const MOCK_CONTRACT_PREVIEW: ContractPreviewData = {
  address: '0x8f3a…4e2c',
  network: 'BNB Smart Chain',
  score: 96,
  projectName: 'MARCO',
  symbol: 'MARCO',
  metrics: DEFAULT_OPERATIONAL_METRICS,
  operationalSummary:
    'The contract appears operationally healthy. Liquidity remains stable. Ownership has been renounced. No blacklist functionality detected. Holder distribution appears balanced. Monitoring recommended for whale concentration.',
  provenance: DEFAULT_PROVENANCE,
  lastUpdated: '12s ago',
  freshness: 'Live',
  evidenceCount: 7,
  aiVersion: 'Melega AI v2.4',
}

export function buildContractPreview(
  event: RadarEventCard,
  address?: string,
  network?: string,
): ContractPreviewData {
  return {
    address: address || '0x8f3a…4e2c',
    network: network || event.network,
    score: event.aiConfidence,
    projectName: event.name,
    symbol: event.symbol,
    metrics: DEFAULT_OPERATIONAL_METRICS.map((m) => {
      if (m.label === 'Taxes' && event.contractRisk === 'Elevated') return { ...m, status: 'orange' as const }
      if (m.label === 'Holder Distribution' && event.riskLevel === 'Medium') return { ...m, status: 'yellow' as const }
      return m
    }),
    operationalSummary: event.intelSummary,
    provenance: DEFAULT_PROVENANCE,
    lastUpdated: event.freshness,
    freshness: event.lastDetection,
    evidenceCount: 7,
    aiVersion: 'Melega AI v2.4',
  }
}

const MARCO_TIMELINE: TimelineEvent[] = [
  { timestamp: '2m ago', label: 'Whale buy detected', severity: 'green', confidence: '97%' },
  { timestamp: '18m ago', label: 'Liquidity added', severity: 'green', confidence: '94%' },
  { timestamp: '1h ago', label: 'Contract verified', severity: 'green', confidence: '99%' },
  { timestamp: '3h ago', label: 'DEX listed', severity: 'green', confidence: '88%' },
]

const NAIIVE_TIMELINE: TimelineEvent[] = [
  { timestamp: '5m ago', label: 'New LP detected', severity: 'green', confidence: '88%' },
  { timestamp: '22m ago', label: 'Holder acceleration', severity: 'yellow', confidence: '82%' },
  { timestamp: '2h ago', label: 'CMC listed', severity: 'green', confidence: '76%' },
]

export const RADAR_KPIS: RadarKpiItem[] = [
  { id: 'indexed', label: 'Projects Indexed', value: '12.8K', delta: '+185 24h', deltaPositive: true },
  { id: 'signals', label: 'AI Signals', value: '1.24K', delta: '+34 24h', deltaPositive: true },
  { id: 'whales', label: 'Whale Alerts', value: '287', delta: '+8 24h', deltaPositive: true },
  { id: 'confidence', label: 'High Confidence', value: '632', delta: '+19 24h', deltaPositive: true },
  { id: 'risk', label: 'Risk Alerts', value: '94', delta: '-3 24h', deltaPositive: false },
]

export const LIVE_EVENTS: LiveEventItem[] = [
  { id: '1', type: 'whale', project: 'MARCO', event: 'Whale bought 480K MARCO', timestamp: '12s', confidence: '96%' },
  { id: '2', type: 'liquidity', project: 'NAIIVE', event: 'New LP detected', timestamp: '28s', confidence: '88%' },
  { id: '3', type: 'contract', project: 'APX', event: 'Ownership Renounced', timestamp: '45s', confidence: '82%' },
  { id: '4', type: 'verification', project: 'MARCO', event: 'Contract Verified', timestamp: '1m', confidence: '97%' },
  { id: '5', type: 'liquidity', project: 'LAB', event: 'Liquidity Increased +$42K', timestamp: '2m', confidence: '74%' },
  { id: '6', type: 'community', project: 'NAIIVE', event: 'Holder Surge +1.2K', timestamp: '3m', confidence: '85%' },
  { id: '7', type: 'audit', project: 'MARCO', event: 'New Audit Published', timestamp: '4m', confidence: '91%' },
  { id: '8', type: 'listing', project: 'HAY', event: 'CMC Listing Indexed', timestamp: '5m', confidence: '68%' },
]

export const RADAR_FILTER_CHIPS = [
  'All', 'AI Verified', 'Trending', 'New', 'Whales', 'Liquidity', 'Contracts',
  'Holder Growth', 'Gaming', 'AI', 'Infrastructure', 'DeFi', 'RWA', 'More',
] as const

export const RADAR_EVENTS: RadarEventCard[] = [
  {
    id: 'evt-marco-whale',
    rank: 1,
    name: 'MARCO',
    network: 'BNB Chain',
    symbol: 'MARCO',
    aiConfidence: 97,
    summary: 'Sustained whale accumulation with rising liquidity depth. Contract checks pass with low honeypot probability.',
    signals: ['Whale', 'Liquidity', 'Contract', 'Holder Growth', 'Audit'],
    liquidity: '$3.21M',
    volume: '$1.28M',
    newHolders: '+2.4K',
    whales: '3 active',
    contractStatus: 'Verified',
    contractRisk: 'Low',
    riskLevel: 'Low',
    freshness: 'Live',
    lastDetection: '2m ago',
    detectionReasons: ['Whale accumulation', 'Liquidity spike', 'Holder acceleration', 'Contract verified'],
    confidenceBreakdown: DEFAULT_CONFIDENCE_BREAKDOWN,
    riskMatrix: DEFAULT_RISK_MATRIX,
    timeline: MARCO_TIMELINE,
    contractIntel: [],
    riskScore: 12,
    gasComplexity: 'Low',
    intelSummary: MOCK_CONTRACT_PREVIEW.operationalSummary,
  },
  {
    id: 'evt-naiive-lp',
    rank: 2,
    name: 'NAIIVE',
    network: 'BNB Chain',
    aiConfidence: 88,
    summary: 'New LP indexed with accelerating volume. Smart money wallets entering; monitor holder concentration.',
    signals: ['Liquidity', 'Whale', 'Social', 'Holder Growth'],
    liquidity: '$840K',
    volume: '$420K',
    newHolders: '+840',
    whales: '2 active',
    contractStatus: 'Verified',
    contractRisk: 'Medium',
    riskLevel: 'Medium',
    freshness: 'Live',
    lastDetection: '5m ago',
    detectionReasons: ['New LP detected', 'Volume anomaly', 'Smart money entry', 'Holder acceleration'],
    confidenceBreakdown: DEFAULT_CONFIDENCE_BREAKDOWN.map((c) =>
      c.label === 'Contract' ? c : { ...c, value: Math.max(70, c.value - 8) },
    ),
    riskMatrix: DEFAULT_RISK_MATRIX.map((r) =>
      r.label === 'Taxes' ? { ...r, level: 'yellow' as const } : r,
    ),
    timeline: NAIIVE_TIMELINE,
    contractIntel: [],
    riskScore: 28,
    gasComplexity: 'Medium',
    intelSummary:
      'Partial audit coverage with mint restrictions disabled. Liquidity lock confirmed; social momentum rising across indexed channels.',
  },
  {
    id: 'evt-apx-contract',
    rank: 3,
    name: 'APX',
    network: 'BNB Chain',
    aiConfidence: 79,
    summary: 'Ownership renouncement flagged. Volume stable with moderate whale presence; upgradeability needs monitoring.',
    signals: ['Contract', 'Audit', 'Risk', 'Liquidity'],
    liquidity: '$520K',
    volume: '$180K',
    newHolders: '+312',
    whales: '1 active',
    contractStatus: 'Renounced',
    contractRisk: 'Medium',
    riskLevel: 'Medium',
    freshness: '14m ago',
    lastDetection: '14m ago',
    detectionReasons: ['Ownership renounced', 'Contract upgrade', 'Moderate whale activity', 'Audit pending'],
    confidenceBreakdown: DEFAULT_CONFIDENCE_BREAKDOWN.map((c) => ({ ...c, value: Math.max(65, c.value - 14) })),
    riskMatrix: DEFAULT_RISK_MATRIX.map((r) =>
      r.label === 'Upgradeability' ? { ...r, level: 'orange' as const } : r,
    ),
    timeline: [
      { timestamp: '14m ago', label: 'Ownership renounced', severity: 'green', confidence: '82%' },
      { timestamp: '1h ago', label: 'Contract updated', severity: 'yellow', confidence: '71%' },
    ],
    contractIntel: [],
    riskScore: 42,
    gasComplexity: 'Medium',
    intelSummary:
      'Proxy pattern not detected but upgrade path exists. Automated scan flags moderate complexity; manual review recommended before large positions.',
  },
  {
    id: 'evt-lab-holders',
    rank: 4,
    name: 'LAB',
    network: 'BNB Chain',
    aiConfidence: 71,
    summary: 'Holder surge after social momentum spike. Early liquidity building; audit pending indexer confirmation.',
    signals: ['Holder Growth', 'Social', 'Liquidity', 'Risk'],
    liquidity: '$280K',
    volume: '$92K',
    newHolders: '+1.1K',
    whales: '0 active',
    contractStatus: 'Indexed',
    contractRisk: 'Elevated',
    riskLevel: 'Elevated',
    freshness: '22m ago',
    lastDetection: '22m ago',
    detectionReasons: ['Holder surge', 'Social momentum', 'Early liquidity build', 'Audit not indexed'],
    confidenceBreakdown: DEFAULT_CONFIDENCE_BREAKDOWN.map((c) => ({ ...c, value: Math.max(55, c.value - 22) })),
    riskMatrix: DEFAULT_RISK_MATRIX.map((r) =>
      r.label === 'Liquidity' ? { ...r, level: 'yellow' as const } : r,
    ),
    timeline: [
      { timestamp: '22m ago', label: 'Holder surge', severity: 'yellow', confidence: '71%' },
      { timestamp: '45m ago', label: 'Social spike', severity: 'yellow', confidence: '68%' },
    ],
    contractIntel: [],
    riskScore: 48,
    gasComplexity: 'Low',
    intelSummary:
      'Emerging project with growing community signals. Contract verified on-chain; professional audit not yet indexed by Melega AI.',
  },
]

export const WHALE_ROWS: WhaleRow[] = [
  { wallet: '0x8f3a…4e2c', token: 'MARCO', amount: '$1.25M', action: 'buy', time: '1m' },
  { wallet: '0x2c41…9a01', token: 'NAIIVE', amount: '$420K', action: 'buy', time: '4m' },
  { wallet: '0x7b12…c4ef', token: 'APX', amount: '$180K', action: 'sell', time: '9m' },
]

export const WALLET_ACCUMULATION_ROWS: WalletAccumulationRow[] = [
  { wallet: '0x8f3a…4e2c', token: 'MARCO', amount: '+$1.25M', confidence: '97%' },
  { wallet: '0x2c41…9a01', token: 'NAIIVE', amount: '+$420K', confidence: '88%' },
  { wallet: '0xAlpha…92', token: 'MARCO', amount: '+$310K', confidence: '94%' },
]

export const SMART_MONEY_ROWS: SmartMoneyRow[] = [
  { wallet: '0xAlpha…92', roi: '+284%', winRate: '78%', confidence: 'High', lastActivity: 'MARCO buy' },
  { wallet: '0xBeta…41', roi: '+192%', winRate: '71%', confidence: 'High', lastActivity: 'NAIIVE LP' },
  { wallet: '0xGamma…77', roi: '+128%', winRate: '64%', confidence: 'Med', lastActivity: 'APX stake' },
]

export const AI_OPPORTUNITY = {
  score: 96,
  recommendation: 'Strong Buy',
  confidence: 96,
  reasons: [
    'Whales accumulating',
    'Liquidity increasing',
    'Low contract risk',
    'Healthy ownership',
    'Growing holders',
  ],
  summary: 'Composite AI score elevated by whale inflow, contract safety, and liquidity depth on MARCO.',
}

export const AI_WARNINGS: WarningRow[] = [
  { label: 'Holder concentration', level: 'yellow' },
  { label: 'Liquidity depth', level: 'green' },
  { label: 'Ownership structure', level: 'green' },
  { label: 'Mint authority', level: 'green' },
  { label: 'Tax configuration', level: 'yellow' },
  { label: 'Upgradeability', level: 'orange' },
]

export const RECENT_DISCOVERIES: RecentDiscoveryRow[] = [
  { time: '2m', project: 'MARCO', event: 'Whale accumulation', confidence: '97%' },
  { time: '6m', project: 'NAIIVE', event: 'LP indexed', confidence: '88%' },
  { time: '11m', project: 'LAB', event: 'Holder surge', confidence: '71%' },
  { time: '18m', project: 'FIRE', event: 'Risk flag', confidence: '52%' },
]

export const HIGHEST_CONFIDENCE_TODAY = [
  { project: 'MARCO', confidence: 97, signal: 'Whale accumulation' },
  { project: 'NAIIVE', confidence: 88, signal: 'New LP indexed' },
  { project: 'APX', confidence: 79, signal: 'Ownership renounced' },
]

export const TOP_CONTRACTS: TopContractRow[] = [
  { rank: 1, name: 'MARCO', symbol: 'MARCO', confidence: 97, signal: 'Verified · Locked LP' },
  { rank: 2, name: 'NAIIVE', confidence: 88, signal: 'New pool indexed' },
  { rank: 3, name: 'APX', confidence: 79, signal: 'Renounced ownership' },
]

export const AI_RECOMMENDATION = {
  title: 'AI Recommendation',
  action: 'Monitor MARCO accumulation',
  detail: 'Whale inflow and contract safety support elevated opportunity score. Continue monitoring holder concentration.',
  confidence: '96%',
}

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

export const HEATMAP_PROJECTS: HeatmapProject[] = [
  {
    rank: 1, name: 'MARCO', symbol: 'MARCO',
    liquidity: 92, volume: 88, whales: 78, holders: 90, developers: 88,
    community: 89, momentum: 91, social: 82, audit: 95, contract: 94,
    ownership: 96, taxes: 82, lpLock: 94,
  },
  {
    rank: 2, name: 'NAIIVE',
    liquidity: 72, volume: 76, whales: 68, holders: 74, developers: 65,
    community: 78, momentum: 82, social: 75, audit: 70, contract: 72,
    ownership: 80, taxes: 68, lpLock: 76,
  },
  {
    rank: 3, name: 'APX',
    liquidity: 58, volume: 62, whales: 48, holders: 60, developers: 58,
    community: 58, momentum: 64, social: 52, audit: 55, contract: 60,
    ownership: 88, taxes: 62, lpLock: 58,
  },
  {
    rank: 4, name: 'LAB',
    liquidity: 48, volume: 52, whales: 44, holders: 56, developers: 50,
    community: 60, momentum: 62, social: 58, audit: 40, contract: 55,
    ownership: 72, taxes: 55, lpLock: 48,
  },
  {
    rank: 5, name: 'HAY',
    liquidity: 44, volume: 46, whales: 38, holders: 50, developers: 45,
    community: 46, momentum: 48, social: 42, audit: 42, contract: 48,
    ownership: 70, taxes: 58, lpLock: 44,
  },
]

export function heatBlockColor(value: number, invert = false): string {
  const v = invert ? 100 - value : value
  if (v >= 80) return '#00E884'
  if (v >= 60) return '#D4AF37'
  if (v >= 40) return '#FFB84D'
  return '#FF4D4D'
}

export function statusColor(level: RadarStatusLevel): string {
  return heatBlockColor(level === 'green' ? 90 : level === 'yellow' ? 65 : level === 'orange' ? 45 : 20)
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
