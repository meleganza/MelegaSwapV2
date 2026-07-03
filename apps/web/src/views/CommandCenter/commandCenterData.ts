export interface SparklinePoint {
  values: number[]
}

export interface AssetRow {
  id: string
  symbol: string
  name: string
  amount: string
  usd: string
  change24h: number
  color: string
}

export interface LiquidityPosition {
  id: string
  pair: string
  apr: string
  tag: string
  impermanentLoss: string
}

export interface PoolPosition {
  id: string
  name: string
  apr: string
  pending: string
}

export interface FarmPosition {
  id: string
  name: string
  apr: string
  pending: string
}

export interface AIRecommendation {
  id: string
  title: string
  description: string
  icon: 'rebalance' | 'claim' | 'pool' | 'radar' | 'audit'
}

export interface NotificationItem {
  id: string
  title: string
  time: string
}

export interface ReportItem {
  id: string
  title: string
  status: 'Completed' | 'In Progress' | 'Available'
}

export interface CollectibleItem {
  id: string
  title: string
  subtitle: string
  icon: string
}

export interface ActivityEvent {
  id: string
  label: string
  time: string
  icon: string
}

export const AI_BRIEFING = {
  greeting: 'Good morning, Marco.',
  bullets: [
    'Your liquidity increased 2.4% in the last 24 hours.',
    'One staking pool requires attention — reward emissions end in 3 days.',
    'Radar detected 5 new high-confidence project matches.',
    'Your Builder Identity unlocked 2 new infrastructure privileges.',
  ],
  estimatedActions: '11 minutes',
}

export const KPI_NET_WORTH = {
  value: '$24,780.45',
  delta: '+3.27%',
  deltaPositive: true,
  sparkline: [22, 23, 22.5, 24, 23.8, 24.2, 24.78],
}

export const KPI_ACTIONS = { value: '3', label: 'Pending actions' }
export const KPI_RADAR = { value: '5', label: 'New matches' }
export const KPI_REWARDS = { value: '$1,248.75', label: 'Rewards pending' }
export const KPI_INFRASTRUCTURE = { value: '7', label: 'Active components' }
export const KPI_AI_SCORE = { value: 87, label: 'High performance' }

export const ASSETS: AssetRow[] = [
  { id: 'bnb', symbol: 'BNB', name: 'BNB', amount: '12.4', usd: '$7,842.10', change24h: 1.8, color: '#F4C542' },
  { id: 'marco', symbol: 'MARCO', name: 'MARCO', amount: '48,200', usd: '$9,640.00', change24h: 4.2, color: '#D6B445' },
  { id: 'usdt', symbol: 'USDT', name: 'Tether', amount: '4,120', usd: '$4,120.00', change24h: 0.01, color: '#1BE77A' },
  { id: 'kiri', symbol: 'KIRI', name: 'KIRI', amount: '2,800', usd: '$1,960.00', change24h: -1.4, color: '#8B7CF6' },
  { id: 'melega', symbol: 'MELEGA', name: 'MELEGA', amount: '1,050', usd: '$1,218.35', change24h: 2.1, color: '#D6B445' },
]

export const LIQUIDITY: LiquidityPosition[] = [
  { id: '1', pair: 'USDT / BNB', apr: '18.4%', tag: 'Concentrated', impermanentLoss: '-2.1%' },
  { id: '2', pair: 'KIRI / USDT', apr: '24.2%', tag: 'Concentrated', impermanentLoss: '-0.8%' },
]

export const POOLS: PoolPosition[] = [
  { id: '1', name: 'MARCO Staking', apr: '32.5%', pending: '$142.80' },
  { id: '2', name: 'KIRI Pool', apr: '18.0%', pending: '$68.40' },
]

export const FARMS: FarmPosition[] = [
  { id: '1', name: 'MARCO / BNB', apr: '42.1%', pending: '$284.50' },
  { id: '2', name: 'KIRI / USDT', apr: '28.6%', pending: '$96.20' },
]

export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  { id: '1', title: 'Rebalance Liquidity', description: 'USDT/BNB position drifted 4.2% — rebalance recommended.', icon: 'rebalance' },
  { id: '2', title: 'Claim Rewards', description: '$1,248.75 pending across 3 farms and pools.', icon: 'claim' },
  { id: '3', title: 'Create Staking Pool', description: 'MARCO holder pool eligible — high D87 contribution.', icon: 'pool' },
  { id: '4', title: 'Review Radar Match', description: 'Golden Lion matches your builder profile.', icon: 'radar' },
  { id: '5', title: 'Request Space Audit', description: 'Smart contract audit available via Melega Space.', icon: 'audit' },
]

export const NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'Reward Claimed — MARCO Farm', time: '2m ago' },
  { id: '2', title: 'Farm APR Update — KIRI/USDT', time: '18m ago' },
  { id: '3', title: 'Radar Alert — Whale activity on MARCO', time: '1h ago' },
]

export const REPORTS: ReportItem[] = [
  { id: '1', title: 'Smart Contract Audit', status: 'Completed' },
  { id: '2', title: 'Marketing Campaign', status: 'In Progress' },
  { id: '3', title: 'Due Diligence Report', status: 'Available' },
]

export const COLLECTIBLES: CollectibleItem[] = [
  { id: '1', title: 'Builder ID', subtitle: 'Level 3', icon: '🔨' },
  { id: '2', title: 'Genesis Pass', subtitle: 'Tier 2', icon: '🛡' },
  { id: '3', title: 'AI Passport', subtitle: 'Active', icon: '🤖' },
  { id: '4', title: 'Validator', subtitle: 'Candidate', icon: '✓' },
]

export const INFRASTRUCTURE_SUMMARY = {
  tokens: 3,
  pools: 2,
  farms: 2,
  smartdrop: 1,
  score: 82,
}

export const BUILDER_STATUS = {
  level: 3,
  progress: 68,
  projects: 2,
  pools: 2,
  farms: 2,
  tvlManaged: '$48,560',
}

export const RECENT_ACTIVITY: ActivityEvent[] = [
  { id: '1', label: 'Token Imported', time: '2h ago', icon: '📥' },
  { id: '2', label: 'Pool Created', time: '5h ago', icon: '🏊' },
  { id: '3', label: 'Farm Created', time: '1d ago', icon: '🌾' },
  { id: '4', label: 'Liquidity Added', time: '2d ago', icon: '💧' },
  { id: '5', label: 'Reward Claimed', time: '3d ago', icon: '💰' },
  { id: '6', label: 'Radar Indexed', time: '4d ago', icon: '📡' },
]

export interface QuickActionItem {
  id: string
  label: string
  href: string
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  { id: '1', label: 'Claim Rewards', href: '/farms' },
  { id: '2', label: 'Add Liquidity', href: '/liquidity-studio' },
  { id: '3', label: 'Open Radar', href: '/radar' },
  { id: '4', label: 'Build Studio', href: '/build-studio' },
]

export const MACHINE_SUMMARY = {
  schema: 'melega.command-center.v1',
  generatedAt: '2026-07-03T12:00:00Z',
  operator: 'marco',
  netWorthUsd: 24780.45,
  pendingRewardsUsd: 1248.75,
  radarAlerts: 5,
  aiScore: 87,
  infrastructure: {
    tokens: 3,
    pools: 2,
    farms: 2,
    smartdrop: 1,
    score: 82,
  },
  builder: {
    level: 3,
    progressPct: 68,
    tvlManagedUsd: 48560,
  },
  positions: {
    assets: 5,
    liquidity: 2,
    pools: 2,
    farms: 2,
  },
  status: 'operational',
}
