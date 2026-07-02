export type FarmStatus = 'live' | 'new' | 'finished' | 'indexing' | 'coming-soon'

export interface FarmsKpiItem {
  id: string
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  gold?: boolean
  sparkline?: number[]
}

export interface FarmAnalyzePreview {
  aprHistory: string
  rewardToken: string
  emission: string
  contract: string
  risk: string
}

export interface FarmPreviewCard {
  id: string
  pair: string
  tokens: [string, string]
  apr?: string
  status: FarmStatus
  tvl: string
  dailyRewards: string
  multiplier: string
  liquidity: string
  cta?: 'stake' | 'analyze' | 'none'
  analyzePreview?: FarmAnalyzePreview
}

export interface FarmsActivityRow {
  time: string
  pair: string
  action: string
  amount: string
  rewards: string
  status: 'indexed' | 'preview'
  actionTone?: 'green' | 'gold' | 'muted'
}

export const DEFAULT_ANALYZE_PREVIEW: FarmAnalyzePreview = {
  aprHistory: '7d stable',
  rewardToken: 'MARCO',
  emission: '42,000/day',
  contract: 'Indexed',
  risk: 'Low',
}

export const FARMS_KPIS: FarmsKpiItem[] = [
  {
    id: 'tvl',
    label: 'Total TVL',
    value: '$24.56M',
    delta: '+2.35%',
    deltaPositive: true,
    sparkline: [4, 5, 6, 5, 7, 8, 9, 10],
  },
  { id: 'active', label: 'Active Farms', value: '12', delta: '+1', deltaPositive: true },
  {
    id: 'rewards',
    label: 'MARCO REWARDS TODAY',
    value: '184.2K',
    delta: '+8.42%',
    deltaPositive: true,
    sparkline: [3, 4, 5, 6, 7, 8, 9, 10],
  },
  { id: 'apr', label: 'Highest APR', value: '36.08%', gold: true },
  { id: 'ai', label: 'AI Suggested', value: 'MARCO / BNB', gold: true },
]

export const AI_ADVISOR_ROWS = [
  { label: 'Best Risk / Reward', value: 'MARCO / BNB', tone: 'green' as const },
  { label: 'Highest Stable APR', value: 'MARCO / USDT', tone: 'green' as const },
  { label: 'Best for AI Agents', value: 'NAIIVE / BNB', tone: 'gold' as const },
  { label: 'Auto-compound', value: 'Available soon', tone: 'muted' as const },
  { label: 'Risk', value: 'Low', tone: 'green' as const },
]

export const FARM_FILTER_CHIPS = [
  'All',
  'MARCO',
  'Stable',
  'High APR',
  'New',
  'My Farms',
  'Finished',
  'AI Suggested',
] as const

export const FARM_PREVIEW_CARDS: FarmPreviewCard[] = [
  {
    id: 'marco-bnb',
    pair: 'MARCO / BNB',
    tokens: ['MARCO', 'BNB'],
    apr: '36.08%',
    status: 'live',
    tvl: '$3.21M',
    dailyRewards: '42K',
    multiplier: '3x',
    liquidity: '$1.20M',
    cta: 'stake',
    analyzePreview: DEFAULT_ANALYZE_PREVIEW,
  },
  {
    id: 'marco-usdt',
    pair: 'MARCO / USDT',
    tokens: ['MARCO', 'USDT'],
    apr: '21.4%',
    status: 'live',
    tvl: '$640K',
    dailyRewards: '18.4K',
    multiplier: '2x',
    liquidity: '$640K',
    cta: 'stake',
    analyzePreview: {
      ...DEFAULT_ANALYZE_PREVIEW,
      emission: '18,400/day',
    },
  },
  {
    id: 'naiive-bnb',
    pair: 'NAIIVE / BNB',
    tokens: ['NAIIVE', 'BNB'],
    apr: '14.2%',
    status: 'live',
    tvl: '$280K',
    dailyRewards: '9.2K',
    multiplier: '1.5x',
    liquidity: '$280K',
    cta: 'stake',
    analyzePreview: {
      ...DEFAULT_ANALYZE_PREVIEW,
      emission: '9,200/day',
    },
  },
  {
    id: 'aster-bnb',
    pair: 'ASTER / BNB',
    tokens: ['ASTER', 'BNB'],
    apr: '11.8%',
    status: 'live',
    tvl: '$190K',
    dailyRewards: '6.8K',
    multiplier: '1.2x',
    liquidity: '$190K',
    cta: 'stake',
    analyzePreview: {
      ...DEFAULT_ANALYZE_PREVIEW,
      emission: '6,800/day',
    },
  },
  {
    id: 'marco-eth',
    pair: 'MARCO / ETH',
    tokens: ['MARCO', 'ETH'],
    status: 'indexing',
    tvl: '—',
    dailyRewards: '—',
    multiplier: '—',
    liquidity: '—',
    cta: 'analyze',
    analyzePreview: {
      aprHistory: '—',
      rewardToken: 'MARCO',
      emission: '—',
      contract: 'Indexing',
      risk: '—',
    },
  },
  {
    id: 'marco-base',
    pair: 'MARCO / BASE',
    tokens: ['MARCO', 'BASE'],
    status: 'coming-soon',
    tvl: '—',
    dailyRewards: '—',
    multiplier: '—',
    liquidity: '—',
    cta: 'none',
  },
]

export const FARMS_ACTIVITY_ROWS: FarmsActivityRow[] = [
  {
    time: '2m ago',
    pair: 'MARCO / BNB',
    action: 'Stake',
    amount: '0.5 LP',
    rewards: '1,260 MARCO',
    status: 'indexed',
    actionTone: 'green',
  },
  {
    time: '8m ago',
    pair: 'MARCO / USDT',
    action: 'Harvest',
    amount: '420 LP',
    rewards: '180 MARCO',
    status: 'indexed',
    actionTone: 'gold',
  },
  {
    time: '14m ago',
    pair: 'NAIIVE / BNB',
    action: 'Compound',
    amount: '1.2 LP',
    rewards: '640 MARCO',
    status: 'preview',
    actionTone: 'green',
  },
  {
    time: '22m ago',
    pair: 'ASTER / BNB',
    action: 'New Farm',
    amount: '—',
    rewards: '—',
    status: 'preview',
    actionTone: 'muted',
  },
]
