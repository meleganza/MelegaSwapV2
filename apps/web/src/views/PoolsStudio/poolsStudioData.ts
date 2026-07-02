export type PoolStatus = 'live' | 'indexing' | 'coming-soon'

export interface PoolsKpiItem {
  id: string
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  gold?: boolean
  sparkline?: number[]
}

export interface PoolAnalyzePreview {
  aprHistory: string
  rewardToken: string
  emission: string
  contract: string
  risk: string
  autoCompound: string
  estimatedRoi: string
}

export interface PoolPreviewCard {
  id: string
  name: string
  tokens: string[]
  tokenLogos?: string[]
  apr?: string
  status: PoolStatus
  tvl: string
  liquidity: string
  rewardToken: string
  dailyRewards: string
  multiplier: string
  participants: string
  cta?: 'stake' | 'analyze' | 'none'
  analyzePreview?: PoolAnalyzePreview
}

export interface PoolsActivityRow {
  time: string
  pool: string
  action: string
  amount: string
  reward: string
  status: 'completed' | 'preview' | 'pending'
  actionTone?: 'green' | 'gold' | 'muted'
}

export const DEFAULT_POOL_ANALYZE: PoolAnalyzePreview = {
  aprHistory: '7d stable',
  rewardToken: 'MARCO',
  emission: '42,000/day',
  contract: 'Indexed',
  risk: 'Low',
  autoCompound: 'Available',
  estimatedRoi: '+12.4% / 30d',
}

export const POOLS_KPIS: PoolsKpiItem[] = [
  {
    id: 'staked',
    label: 'Total Staked',
    value: '$42.6M',
    delta: '+3.74%',
    deltaPositive: true,
    sparkline: [4, 6, 5, 8, 7, 9, 10, 11],
  },
  { id: 'active', label: 'Active Pools', value: '24', delta: '+2', deltaPositive: true },
  {
    id: 'rewards',
    label: 'MARCO Rewards Today',
    value: '184,200',
    delta: '+8.42%',
    deltaPositive: true,
    sparkline: [3, 5, 4, 7, 8, 9, 8, 10],
  },
  {
    id: 'stakers',
    label: 'Total Stakers',
    value: '18,420',
    delta: '+4.1%',
    deltaPositive: true,
  },
  { id: 'ai', label: 'AI Recommended', value: 'MARCO STAKING', gold: true },
]

export const DONUT_SEGMENTS = [
  { label: '0–1K', value: 18, color: '#D4AF37' },
  { label: '1K–10K', value: 28, color: '#00E676' },
  { label: '10K–100K', value: 32, color: '#4DA3FF' },
  { label: '100K+', value: 22, color: '#A78BFA' },
]

export const AI_REWARD_ROWS = [
  { label: "Today's Recommendation", value: 'MARCO Flexible', tone: 'green' as const, icon: '★' },
  { label: 'Highest Yield', value: 'MARCO Locked 90D', tone: 'green' as const, icon: '↗' },
  { label: 'Lowest Risk', value: 'MARCO Flexible', tone: 'gold' as const, icon: '◎' },
  { label: 'Best For AI Agents', value: 'NAIIVE Staking', tone: 'blue' as const, icon: '◇' },
]

export const REWARD_SUSTAINABILITY = { label: 'Reward Sustainability', score: 92, level: 'Very High' }

export const POOL_FILTER_CHIPS = [
  'All',
  'Official',
  'MARCO',
  'Community',
  'Locked',
  'Flexible',
  'Highest APR',
  'Newest',
  'AI Suggested',
] as const

export const POOL_PREVIEW_CARDS: PoolPreviewCard[] = [
  {
    id: 'marco-flex',
    name: 'MARCO Flexible',
    tokens: ['MARCO'],
    apr: '36.08%',
    status: 'live',
    tvl: '$18.72M',
    liquidity: '$18.72M',
    rewardToken: 'MARCO',
    dailyRewards: '42,000',
    multiplier: '3x',
    participants: '6,842',
    cta: 'stake',
    analyzePreview: DEFAULT_POOL_ANALYZE,
  },
  {
    id: 'marco-locked',
    name: 'MARCO Locked 90D',
    tokens: ['MARCO'],
    apr: '28.4%',
    status: 'live',
    tvl: '$8.4M',
    liquidity: '$8.4M',
    rewardToken: 'MARCO',
    dailyRewards: '24,800',
    multiplier: '2.5x',
    participants: '3,210',
    cta: 'stake',
    analyzePreview: DEFAULT_POOL_ANALYZE,
  },
  {
    id: 'community',
    name: 'Community Pool',
    tokens: ['MARCO', 'BNB'],
    apr: '19.2%',
    status: 'live',
    tvl: '$2.1M',
    liquidity: '$2.1M',
    rewardToken: 'MARCO',
    dailyRewards: '9,600',
    multiplier: '1.8x',
    participants: '1,420',
    cta: 'stake',
    analyzePreview: DEFAULT_POOL_ANALYZE,
  },
  {
    id: 'naiive',
    name: 'NAIIVE Staking',
    tokens: ['NAIIVE'],
    apr: '14.6%',
    status: 'live',
    tvl: '$640K',
    liquidity: '$640K',
    rewardToken: 'MARCO',
    dailyRewards: '4,200',
    multiplier: '1.2x',
    participants: '892',
    cta: 'stake',
    analyzePreview: DEFAULT_POOL_ANALYZE,
  },
  {
    id: 'marco-eth',
    name: 'MARCO / ETH',
    tokens: ['MARCO', 'ETH'],
    apr: 'Indexing...',
    status: 'indexing',
    tvl: '—',
    liquidity: '—',
    rewardToken: 'MARCO',
    dailyRewards: '—',
    multiplier: '—',
    participants: '—',
    cta: 'analyze',
    analyzePreview: DEFAULT_POOL_ANALYZE,
  },
  {
    id: 'marco-base',
    name: 'MARCO × BASE',
    tokens: ['MARCO'],
    status: 'coming-soon',
    tvl: '—',
    liquidity: '—',
    rewardToken: '—',
    dailyRewards: '—',
    multiplier: '—',
    participants: '—',
    cta: 'none',
  },
]

export const POOLS_ACTIVITY: PoolsActivityRow[] = [
  {
    time: '2m ago',
    pool: 'MARCO Flexible',
    action: 'Stake',
    amount: '12,400 MARCO',
    reward: '—',
    status: 'completed',
    actionTone: 'green',
  },
  {
    time: '8m ago',
    pool: 'MARCO Locked 90D',
    action: 'Claim',
    amount: '840 MARCO',
    reward: '840 MARCO',
    status: 'completed',
    actionTone: 'gold',
  },
  {
    time: '14m ago',
    pool: 'Community Pool',
    action: 'Unstake',
    amount: '2,100 MARCO',
    reward: '—',
    status: 'preview',
    actionTone: 'muted',
  },
  {
    time: '22m ago',
    pool: 'NAIIVE Staking',
    action: 'Compound',
    amount: '420 NAIIVE',
    reward: '18 MARCO',
    status: 'completed',
    actionTone: 'green',
  },
  {
    time: '31m ago',
    pool: 'MARCO Flexible',
    action: 'Pool Created',
    amount: '—',
    reward: '—',
    status: 'pending',
    actionTone: 'gold',
  },
]

export const ANALYTICS_REWARDS_BARS = [42, 58, 48, 72, 64, 80, 76, 88, 70, 92, 84, 96]
