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
  privileges: string[]
}

export interface ActivityEvent {
  id: string
  label: string
  time: string
  icon: string
}

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
