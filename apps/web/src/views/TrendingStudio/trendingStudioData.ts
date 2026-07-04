export type HeatLevel = 'green' | 'yellow' | 'orange' | 'red'
export type WhaleDirection = 'buy' | 'sell' | 'transfer'
export type DiscoveryStatus = 'verified' | 'indexed' | 'live'
export type OpportunityTone = 'strong-buy' | 'neutral' | 'avoid'

export interface TrendingKpiItem {
  id: string
  label: string
  value: string
  delta: string
  sparkline: number[]
}

export interface HeatmapRow {
  rank: number
  project: string
  symbol?: string
  momentum: number
  liquidity: number
  holders: number
  aiScore: number
  social: number
  whales: number
  volume: number
  slug?: string
  provenance?: string
}

export interface TrendingProjectCard {
  rank: number
  name: string
  pair: string
  symbol?: string
  chain: string
  slug?: string
  tags: string[]
  aiScore: number
  signalLabel?: string
  summary: string
  holders: string
  liquidity: string
  volume: string
  growth: string
  growthPositive?: boolean
  sparkline: number[]
  provenance?: string
  projectHref?: string
  radarHref?: string
  tradeHref?: string
}

export interface WhaleActivityRow {
  wallet: string
  amount: string
  token: string
  time: string
  direction: WhaleDirection
}

export interface SmartMoneyRow {
  wallet: string
  performance: string
  roi: string
  lastTrade: string
  confidence: string
}

export interface AIWarningRow {
  label: string
  level: HeatLevel
}

export interface AIDiscoveryRow {
  time: string
  project: string
  event: string
  score: string
  status: DiscoveryStatus
}

export const TRENDING_KPIS: TrendingKpiItem[] = [
  {
    id: 'projects',
    label: 'Trending Projects',
    value: '246',
    delta: '+18',
    sparkline: [4, 5, 6, 7, 8, 9, 10, 11],
  },
  {
    id: 'signals',
    label: 'AI Signals',
    value: '984',
    delta: '+42',
    sparkline: [6, 7, 6, 8, 9, 10, 11, 12],
  },
  {
    id: 'whales',
    label: 'Whale Alerts',
    value: '47',
    delta: '+6',
    sparkline: [3, 4, 5, 4, 6, 7, 8, 9],
  },
  {
    id: 'listings',
    label: 'New Listings',
    value: '32',
    delta: '+4',
    sparkline: [2, 3, 3, 4, 5, 5, 6, 7],
  },
  {
    id: 'confidence',
    label: 'AI Confidence',
    value: '96%',
    delta: '+2%',
    sparkline: [8, 8, 9, 9, 9, 10, 10, 10],
  },
]

export const TRENDING_FILTER_CHIPS = [
  'All',
  'AI Verified',
  'Highest AI Score',
  'Whale Activity',
  'New Listings',
  'BNB',
  'Ethereum',
  'Gaming',
  'AI',
  'DeFi',
  'Meme',
] as const

export type TrendingFilterChip = (typeof TRENDING_FILTER_CHIPS)[number]

export const HEATMAP_ROWS: HeatmapRow[] = [
  {
    rank: 1,
    project: 'MARCO',
    symbol: 'MARCO',
    momentum: 92,
    liquidity: 88,
    holders: 90,
    aiScore: 97,
    social: 85,
    whales: 78,
    volume: 91,
  },
  {
    rank: 2,
    project: 'NAIIVE',
    momentum: 84,
    liquidity: 72,
    holders: 76,
    aiScore: 88,
    social: 80,
    whales: 70,
    volume: 82,
  },
  {
    rank: 3,
    project: 'APX',
    momentum: 68,
    liquidity: 58,
    holders: 62,
    aiScore: 79,
    social: 55,
    whales: 48,
    volume: 64,
  },
  {
    rank: 4,
    project: 'LAB',
    momentum: 62,
    liquidity: 52,
    holders: 58,
    aiScore: 71,
    social: 60,
    whales: 44,
    volume: 56,
  },
  {
    rank: 5,
    project: 'FIRE',
    momentum: 38,
    liquidity: 28,
    holders: 34,
    aiScore: 58,
    social: 42,
    whales: 30,
    volume: 36,
  },
  {
    rank: 6,
    project: 'HAY',
    momentum: 48,
    liquidity: 44,
    holders: 50,
    aiScore: 64,
    social: 46,
    whales: 40,
    volume: 48,
  },
]

export const TRENDING_NOW_CARDS: TrendingProjectCard[] = [
  {
    rank: 1,
    name: 'MARCO',
    pair: 'MARCO / BNB',
    symbol: 'MARCO',
    chain: 'BNB Smart Chain',
    tags: ['DEX', 'DeFi', 'AI Verified'],
    aiScore: 97,
    summary:
      'AI analysis indicates healthy liquidity profile with active trading and consistent community activity across Melega DEX.',
    holders: '186.4K',
    liquidity: '$3.21M',
    volume: '$1.28M',
    growth: '+12.4%',
    growthPositive: true,
    sparkline: [5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    rank: 2,
    name: 'NAIIVE',
    pair: 'NAIIVE / BNB',
    chain: 'BNB Smart Chain',
    tags: ['AI', 'DeFi', 'AI Verified'],
    aiScore: 88,
    summary:
      'Strong on-chain activity with growing holder base. AI confidence high for ecosystem integrations and sustained volume.',
    holders: '42.8K',
    liquidity: '$840K',
    volume: '$420K',
    growth: '+8.6%',
    growthPositive: true,
    sparkline: [4, 5, 5, 6, 7, 8, 8, 9],
  },
  {
    rank: 3,
    name: 'APX',
    pair: 'APX / BNB',
    chain: 'BNB Smart Chain',
    tags: ['Infrastructure', 'BNB'],
    aiScore: 79,
    summary:
      'Moderate liquidity with steady volume. Limited social footprint outside core DeFi channels but improving DEX depth.',
    holders: '18.2K',
    liquidity: '$520K',
    volume: '$180K',
    growth: '+4.2%',
    growthPositive: true,
    sparkline: [3, 4, 4, 5, 5, 6, 6, 7],
  },
  {
    rank: 4,
    name: 'LAB',
    pair: 'LAB / BNB',
    chain: 'BNB Smart Chain',
    tags: ['AI', 'Gaming', 'New'],
    aiScore: 71,
    summary:
      'Emerging project with early traction. Liquidity building; monitor holder distribution and social momentum closely.',
    holders: '8.4K',
    liquidity: '$280K',
    volume: '$92K',
    growth: '+6.1%',
    growthPositive: true,
    sparkline: [2, 3, 4, 4, 5, 5, 6, 7],
  },
]

export const WHALE_ACTIVITY: WhaleActivityRow[] = [
  { wallet: '0x8f3a…4e2c', amount: '$842K', token: 'MARCO', time: '2m ago', direction: 'buy' },
  { wallet: '0x2c41…9a01', amount: '$420K', token: 'NAIIVE', time: '6m ago', direction: 'buy' },
  { wallet: '0x7b12…c4ef', amount: '$180K', token: 'APX', time: '11m ago', direction: 'sell' },
  { wallet: '0x91de…2b88', amount: '$2.1M', token: 'MARCO', time: '18m ago', direction: 'transfer' },
]

export const SMART_MONEY_ROWS: SmartMoneyRow[] = [
  { wallet: '0xAlpha…92', performance: 'Top 1%', roi: '+284%', lastTrade: 'MARCO', confidence: '96%' },
  { wallet: '0xBeta…41', performance: 'Top 3%', roi: '+192%', lastTrade: 'NAIIVE', confidence: '88%' },
  { wallet: '0xGamma…77', performance: 'Top 5%', roi: '+128%', lastTrade: 'APX', confidence: '74%' },
]

export const AI_OPPORTUNITY = {
  score: 92,
  recommendation: 'Strong Buy' as const,
  tone: 'strong-buy' as OpportunityTone,
  summary: 'MARCO shows strongest composite AI score with healthy liquidity and low contract risk.',
}

export const AI_WARNINGS: AIWarningRow[] = [
  { label: 'Contract verified', level: 'green' },
  { label: 'Moderate holder concentration', level: 'yellow' },
  { label: 'Whale sell pressure detected', level: 'orange' },
  { label: 'Low liquidity on FIRE', level: 'red' },
]

export const AI_DISCOVERIES: AIDiscoveryRow[] = [
  {
    time: '3m ago',
    project: 'MARCO',
    event: 'Liquidity Surge',
    score: '97/100',
    status: 'verified',
  },
  {
    time: '9m ago',
    project: 'NAIIVE',
    event: 'Volume Spike',
    score: '88/100',
    status: 'indexed',
  },
  {
    time: '14m ago',
    project: 'LAB',
    event: 'New Listing',
    score: '71/100',
    status: 'live',
  },
  {
    time: '22m ago',
    project: 'FIRE',
    event: 'Risk Flag',
    score: '58/100',
    status: 'indexed',
  },
]

export function heatLevel(value: number): HeatLevel {
  if (value >= 80) return 'green'
  if (value >= 60) return 'yellow'
  if (value >= 40) return 'orange'
  return 'red'
}

export function aiScoreColor(score: number): 'green' | 'yellow' {
  return score >= 85 ? 'green' : 'yellow'
}
