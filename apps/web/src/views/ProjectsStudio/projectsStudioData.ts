export type ProjectRatingTier = 'exceptional' | 'strong' | 'active' | 'emerging' | 'high-risk' | 'unknown'
export type MetricTone = 'green' | 'gold' | 'red' | 'gray'
export type ProjectStatus = 'verified' | 'community' | 'new'

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
  'Highest Rated',
  'Highest Liquidity',
  'Newest',
] as const

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
