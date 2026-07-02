export type RadarStatusLevel = 'green' | 'yellow' | 'orange' | 'red'
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
  icon: string
  project: string
  event: string
  timestamp: string
  confidence: string
}

export interface ContractIntelField {
  label: string
  value: string
  status: RadarStatusLevel
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
  contractRisk: string
  contractIntel: ContractIntelField[]
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

export interface ContractPreviewData {
  address: string
  network: string
  score: number
  checklist: { label: string; status: RadarStatusLevel }[]
  summary: string
  projectName?: string
  symbol?: string
}

export const MOCK_CONTRACT_PREVIEW: ContractPreviewData = {
  address: '0x8f3a…4e2c',
  network: 'BNB Smart Chain',
  score: 96,
  projectName: 'MARCO',
  symbol: 'MARCO',
  checklist: [
    { label: 'Contract verified', status: 'green' },
    { label: 'Liquidity locked', status: 'green' },
    { label: 'Ownership renounced', status: 'green' },
    { label: 'Mint function present', status: 'yellow' },
    { label: 'Holder concentration moderate', status: 'yellow' },
    { label: 'Honeypot risk not detected', status: 'green' },
  ],
  summary:
    'Automated scan indicates a standard token structure with renounced ownership and locked liquidity. Mint authority disabled; moderate holder concentration warrants monitoring before large positions.',
}

export interface HeatmapProject {
  rank: number
  name: string
  symbol?: string
  liquidity: number
  volume: number
  whales: number
  holders: number
  age: number
  social: number
  developers: number
  audit: number
  contract: number
  momentum: number
  community: number
  risk: number
}

export const RADAR_KPIS: RadarKpiItem[] = [
  { id: 'indexed', label: 'Projects Indexed', value: '12.8K', delta: '+185 24h', deltaPositive: true },
  { id: 'signals', label: 'AI Signals', value: '1.24K', delta: '+34 24h', deltaPositive: true },
  { id: 'whales', label: 'Whale Alerts', value: '287', delta: '+8 24h', deltaPositive: true },
  { id: 'confidence', label: 'High Confidence', value: '632', delta: '+19 24h', deltaPositive: true },
  { id: 'risk', label: 'Risk Alerts', value: '94', delta: '-3 24h', deltaPositive: false },
]

export const LIVE_EVENTS: LiveEventItem[] = [
  { id: '1', icon: '🐋', project: 'MARCO', event: 'Whale bought 480K MARCO', timestamp: '12s', confidence: '96%' },
  { id: '2', icon: '◈', project: 'NAIIVE', event: 'New LP detected', timestamp: '28s', confidence: '88%' },
  { id: '3', icon: '✓', project: 'APX', event: 'Ownership Renounced', timestamp: '45s', confidence: '82%' },
  { id: '4', icon: '◎', project: 'MARCO', event: 'Contract Verified', timestamp: '1m', confidence: '97%' },
  { id: '5', icon: '↗', project: 'LAB', event: 'Liquidity Increased +$42K', timestamp: '2m', confidence: '74%' },
  { id: '6', icon: '★', project: 'NAIIVE', event: 'Holder Surge +1.2K', timestamp: '3m', confidence: '85%' },
  { id: '7', icon: '🛡', project: 'MARCO', event: 'New Audit Published', timestamp: '4m', confidence: '91%' },
  { id: '8', icon: '✦', project: 'HAY', event: 'Social Momentum Spike', timestamp: '5m', confidence: '68%' },
]

export const RADAR_FILTER_CHIPS = [
  'All',
  'AI Verified',
  'Trending',
  'New',
  'Whales',
  'Liquidity',
  'Contracts',
  'Holder Growth',
  'Gaming',
  'AI',
  'Infrastructure',
  'DeFi',
  'RWA',
  'More',
] as const

const DEFAULT_INTEL: ContractIntelField[] = [
  { label: 'Contract Verification', value: 'Verified', status: 'green' },
  { label: 'Ownership', value: 'Renounced', status: 'green' },
  { label: 'Liquidity Lock', value: '12 months', status: 'green' },
  { label: 'Mint Authority', value: 'Disabled', status: 'green' },
  { label: 'Blacklist Functions', value: 'None', status: 'green' },
  { label: 'Upgradeable', value: 'No', status: 'green' },
  { label: 'Tax', value: '2% / 2%', status: 'yellow' },
  { label: 'Proxy', value: 'Not detected', status: 'green' },
  { label: 'Renounced', value: 'Yes', status: 'green' },
  { label: 'Verified Source', value: 'Match', status: 'green' },
]

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
    contractRisk: 'Low',
    contractIntel: DEFAULT_INTEL,
    riskScore: 12,
    gasComplexity: 'Low',
    intelSummary:
      'Contract structure appears standard with renounced ownership and locked liquidity. No critical honeypot patterns detected in automated scan.',
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
    contractRisk: 'Medium',
    contractIntel: DEFAULT_INTEL.map((f) =>
      f.label === 'Tax' ? { ...f, value: '3% / 3%', status: 'yellow' as const } : f,
    ),
    riskScore: 28,
    gasComplexity: 'Medium',
    intelSummary:
      'Partial audit coverage with active mint restrictions disabled. Liquidity lock confirmed; social momentum rising across indexed channels.',
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
    contractRisk: 'Medium',
    contractIntel: DEFAULT_INTEL.map((f) =>
      f.label === 'Upgradeable' ? { ...f, value: 'Yes', status: 'yellow' as const } : f,
    ),
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
    contractRisk: 'Elevated',
    contractIntel: DEFAULT_INTEL.map((f) =>
      f.label === 'Liquidity Lock' ? { ...f, value: '6 months', status: 'yellow' as const } : f,
    ),
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

export const SMART_MONEY_ROWS: SmartMoneyRow[] = [
  { wallet: '0xAlpha…92', roi: '+284%', winRate: '78%', confidence: 'High', lastActivity: 'MARCO buy' },
  { wallet: '0xBeta…41', roi: '+192%', winRate: '71%', confidence: 'High', lastActivity: 'NAIIVE LP' },
  { wallet: '0xGamma…77', roi: '+128%', winRate: '64%', confidence: 'Med', lastActivity: 'APX stake' },
]

export const AI_OPPORTUNITY = {
  score: 96,
  recommendation: 'Strong Buy',
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

export const HEATMAP_PROJECTS: HeatmapProject[] = [
  {
    rank: 1,
    name: 'MARCO',
    symbol: 'MARCO',
    liquidity: 92,
    volume: 88,
    whales: 78,
    holders: 90,
    age: 85,
    social: 82,
    developers: 88,
    audit: 95,
    contract: 94,
    momentum: 91,
    community: 89,
    risk: 15,
  },
  {
    rank: 2,
    name: 'NAIIVE',
    liquidity: 72,
    volume: 76,
    whales: 68,
    holders: 74,
    age: 70,
    social: 75,
    developers: 65,
    audit: 70,
    contract: 72,
    momentum: 82,
    community: 78,
    risk: 28,
  },
  {
    rank: 3,
    name: 'APX',
    liquidity: 58,
    volume: 62,
    whales: 48,
    holders: 60,
    age: 55,
    social: 52,
    developers: 58,
    audit: 55,
    contract: 60,
    momentum: 64,
    community: 58,
    risk: 42,
  },
  {
    rank: 4,
    name: 'LAB',
    liquidity: 48,
    volume: 52,
    whales: 44,
    holders: 56,
    age: 35,
    social: 58,
    developers: 50,
    audit: 40,
    contract: 55,
    momentum: 62,
    community: 60,
    risk: 48,
  },
  {
    rank: 5,
    name: 'HAY',
    liquidity: 44,
    volume: 46,
    whales: 38,
    holders: 50,
    age: 62,
    social: 42,
    developers: 45,
    audit: 42,
    contract: 48,
    momentum: 48,
    community: 46,
    risk: 52,
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
