export type RadarStatusLevel = 'green' | 'yellow' | 'orange' | 'red'

export interface RadarKpiItem {
  id: string
  label: string
  icon: string
  value: string
  delta: string
  deltaPositive?: boolean
  sparkline: number[]
}

export interface ContractIntelItem {
  label: string
  status: RadarStatusLevel
}

export interface RadarDiscoveryCard {
  rank: number
  name: string
  pair: string
  symbol?: string
  tags: string[]
  aiScore: number
  summary: string
  liquidity: string
  volume: string
  holders: string
  whaleActivity: string
  age: string
  sparkline: number[]
  contractIntel: ContractIntelItem[]
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

export interface HeatmapProject {
  rank: number
  name: string
  symbol?: string
  liquidity: number
  volume: number
  whales: number
  holders: number
  social: number
  momentum: number
  developer: number
  audit: number
  risk: number
}

export const RADAR_KPIS: RadarKpiItem[] = [
  {
    id: 'indexed',
    label: 'Projects Indexed',
    icon: '◎',
    value: '12,842',
    delta: '+185 24h',
    deltaPositive: true,
    sparkline: [8, 9, 9, 10, 10, 11, 11, 12],
  },
  {
    id: 'signals',
    label: 'AI Signals',
    icon: '✦',
    value: '1,247',
    delta: '+34 24h',
    deltaPositive: true,
    sparkline: [6, 7, 8, 8, 9, 10, 10, 11],
  },
  {
    id: 'whales',
    label: 'Whale Alerts',
    icon: '◈',
    value: '287',
    delta: '+8 24h',
    deltaPositive: true,
    sparkline: [4, 5, 5, 6, 7, 7, 8, 8],
  },
  {
    id: 'confidence',
    label: 'High Confidence',
    icon: '★',
    value: '632',
    delta: '+19 24h',
    deltaPositive: true,
    sparkline: [5, 6, 6, 7, 8, 8, 9, 9],
  },
  {
    id: 'risk',
    label: 'Risk Alerts',
    icon: '⚠',
    value: '94',
    delta: '-3 24h',
    deltaPositive: false,
    sparkline: [6, 6, 5, 5, 5, 4, 4, 4],
  },
]

export const LIVE_SCAN_ITEMS = [
  'New LP detected · MARCO / BNB',
  'Liquidity increased · NAIIVE +$42K',
  'Whale entered · APX $180K buy',
  'Contract verified · LAB',
  'Holder growth · MARCO +2.4%',
  'Contract updated · HAY',
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

const DEFAULT_INTEL: ContractIntelItem[] = [
  { label: 'Contract Verified', status: 'green' },
  { label: 'Ownership Renounced', status: 'green' },
  { label: 'Liquidity Locked', status: 'green' },
  { label: 'Mint Function', status: 'yellow' },
  { label: 'Blacklist', status: 'green' },
  { label: 'Honeypot', status: 'red' },
  { label: 'Proxy', status: 'yellow' },
  { label: 'Tax', status: 'green' },
]

export const RADAR_DISCOVERIES: RadarDiscoveryCard[] = [
  {
    rank: 1,
    name: 'MARCO',
    pair: 'MARCO / BNB',
    symbol: 'MARCO',
    tags: ['DeFi', 'AI Verified'],
    aiScore: 97,
    summary:
      'Strong holder growth with healthy liquidity depth. AI confidence remains exceptional across contract and community signals.',
    liquidity: '$3.21M',
    volume: '$1.28M',
    holders: '186.4K',
    whaleActivity: 'Low',
    age: '312d',
    sparkline: [6, 7, 8, 9, 10, 11, 12, 12],
    contractIntel: DEFAULT_INTEL,
  },
  {
    rank: 2,
    name: 'NAIIVE',
    pair: 'NAIIVE / BNB',
    tags: ['AI', 'DeFi'],
    aiScore: 88,
    summary:
      'Growing on-chain footprint with rising volume. Monitor holder distribution as liquidity expands across Melega venues.',
    liquidity: '$840K',
    volume: '$420K',
    holders: '42.8K',
    whaleActivity: 'Medium',
    age: '186d',
    sparkline: [4, 5, 6, 6, 7, 8, 8, 9],
    contractIntel: DEFAULT_INTEL.map((item) =>
      item.label === 'Honeypot' ? { ...item, status: 'green' } : item,
    ),
  },
  {
    rank: 3,
    name: 'APX',
    pair: 'APX / BNB',
    tags: ['Infrastructure'],
    aiScore: 79,
    summary:
      'Steady DEX presence with moderate social reach. Contract checks pass with minor upgradeability flags to monitor.',
    liquidity: '$520K',
    volume: '$180K',
    holders: '18.2K',
    whaleActivity: 'Low',
    age: '94d',
    sparkline: [3, 4, 4, 5, 5, 6, 7, 7],
    contractIntel: DEFAULT_INTEL,
  },
  {
    rank: 4,
    name: 'LAB',
    pair: 'LAB / BNB',
    tags: ['AI', 'Gaming', 'New'],
    aiScore: 71,
    summary:
      'Early traction with building liquidity. AI flags emerging community momentum; audit status still pending full review.',
    liquidity: '$280K',
    volume: '$92K',
    holders: '8.4K',
    whaleActivity: 'Medium',
    age: '42d',
    sparkline: [2, 3, 4, 4, 5, 5, 6, 6],
    contractIntel: DEFAULT_INTEL.map((item) =>
      item.label === 'Liquidity Locked' ? { ...item, status: 'yellow' } : item,
    ),
  },
]

export const WHALE_ROWS: WhaleRow[] = [
  { wallet: '0x8f3a…4e2c', token: 'MARCO', amount: '$1.25M', action: 'buy', time: '1m' },
  { wallet: '0x2c41…9a01', token: 'NAIIVE', amount: '$420K', action: 'buy', time: '4m' },
  { wallet: '0x7b12…c4ef', token: 'APX', amount: '$180K', action: 'sell', time: '9m' },
  { wallet: '0x91de…2b88', token: 'MARCO', amount: '$2.1M', action: 'buy', time: '14m' },
]

export const SMART_MONEY_ROWS: SmartMoneyRow[] = [
  { wallet: '0xAlpha…92', roi: '+284%', winRate: '78%', confidence: 'High', lastActivity: 'MARCO' },
  { wallet: '0xBeta…41', roi: '+192%', winRate: '71%', confidence: 'High', lastActivity: 'NAIIVE' },
  { wallet: '0xGamma…77', roi: '+128%', winRate: '64%', confidence: 'Medium', lastActivity: 'APX' },
]

export const AI_OPPORTUNITY = {
  score: 92,
  recommendation: 'Strong Buy',
  summary:
    'MARCO shows the strongest composite AI score with healthy liquidity, low contract risk, and sustained holder growth.',
}

export const AI_WARNINGS: WarningRow[] = [
  { label: 'Holder concentration', level: 'yellow' },
  { label: 'Liquidity depth', level: 'green' },
  { label: 'Ownership structure', level: 'green' },
  { label: 'Mint authority', level: 'yellow' },
  { label: 'Tax configuration', level: 'green' },
  { label: 'Upgradeability', level: 'orange' },
  { label: 'Blacklist functions', level: 'green' },
  { label: 'Proxy pattern', level: 'yellow' },
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
    social: 85,
    momentum: 91,
    developer: 88,
    audit: 95,
    risk: 12,
  },
  {
    rank: 2,
    name: 'NAIIVE',
    liquidity: 72,
    volume: 76,
    whales: 68,
    holders: 74,
    social: 70,
    momentum: 82,
    developer: 65,
    audit: 70,
    risk: 28,
  },
  {
    rank: 3,
    name: 'APX',
    liquidity: 58,
    volume: 62,
    whales: 48,
    holders: 60,
    social: 52,
    momentum: 64,
    developer: 58,
    audit: 55,
    risk: 42,
  },
  {
    rank: 4,
    name: 'LAB',
    liquidity: 48,
    volume: 52,
    whales: 44,
    holders: 56,
    social: 58,
    momentum: 62,
    developer: 50,
    audit: 40,
    risk: 48,
  },
  {
    rank: 5,
    name: 'HAY',
    liquidity: 44,
    volume: 46,
    whales: 38,
    holders: 50,
    social: 42,
    momentum: 48,
    developer: 45,
    audit: 42,
    risk: 52,
  },
]

export function heatColor(value: number, invert = false): RadarStatusLevel {
  const v = invert ? 100 - value : value
  if (v >= 80) return 'green'
  if (v >= 60) return 'yellow'
  if (v >= 40) return 'orange'
  return 'red'
}

export function statusColor(level: RadarStatusLevel): string {
  switch (level) {
    case 'green':
      return '#12F27E'
    case 'yellow':
      return '#E9C84D'
    case 'orange':
      return '#F2A93B'
    default:
      return '#FF4D4F'
  }
}
