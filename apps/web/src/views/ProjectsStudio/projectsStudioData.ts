export const FILTER_CHAINS = ['BNB', 'Ethereum', 'Base', 'Polygon', 'Solana'] as const
export const FILTER_CATEGORIES = ['AI', 'DeFi', 'Gaming', 'Infrastructure', 'Meme', 'RWA'] as const
export const FILTER_SORT = [
  'Trending',
  'Highest Rated',
  'Highest Liquidity',
  'Newest',
  'Recently Listed',
] as const

export const PROJECT_FILTER_CHIPS = [
  'All',
  'AI Verified',
  'Trending',
  'BNB',
  'Ethereum',
  'Base',
  'Polygon',
  'Solana',
  'Gaming',
  'AI',
  'DeFi',
  'RWA',
  'Meme',
  'Infrastructure',
  'Recently Listed',
  'Pending Review',
  'Highest Rated',
  'Highest Liquidity',
  'Newest',
] as const

export type ProjectRatingTier = 'exceptional' | 'strong' | 'active' | 'emerging' | 'high-risk' | 'unknown'
export type MetricTone = 'green' | 'gold' | 'red' | 'gray'
export type ProjectStatus = 'verified' | 'community' | 'new' | 'pending'

export interface ProjectsKpiItem {
  id: string
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  gold?: boolean
  sparkline?: number[]
}

export interface ProjectMetric {
  label: string
  value: string
  tone?: MetricTone
}

export interface ProjectPreviewCard {
  id: string
  rank: number
  name: string
  slug: string
  symbol?: string
  category: string
  chains: string[]
  status: ProjectStatus
  rating: number
  ratingTier: ProjectRatingTier
  aiSummary: string
  metrics: ProjectMetric[]
  aiConfidence: string
  melegaRating: string
  risk: string
  riskTone: MetricTone
  website: string
  contract: string
  contractAddress?: string
  tradeHref?: string
  radarHref?: string
  projectHref?: string
  registryTier?: 'canonical' | 'pending'
  pendingId?: string
  reviewStatus?: string
  importHref?: string
}

export interface ProjectsActivityRow {
  time: string
  project: string
  projectSymbol?: string
  action: string
  details: string
  source: string
  status: 'verified' | 'indexed' | 'live'
  actionTone?: 'green' | 'gold' | 'muted'
}

export function ratingColor(score: number): 'green' | 'gold' | 'orange' | 'red' | 'gray' {
  if (score >= 95) return 'green'
  if (score >= 70) return score >= 85 ? 'green' : 'gold'
  if (score >= 50) return 'orange'
  if (score > 0) return 'red'
  return 'gray'
}

export function ratingLabel(tier: ProjectRatingTier): string {
  switch (tier) {
    case 'exceptional':
      return 'Exceptional'
    case 'strong':
      return 'Strong'
    case 'active':
      return 'Active'
    case 'emerging':
      return 'Emerging'
    case 'high-risk':
      return 'High Risk'
    default:
      return 'Unknown'
  }
}
