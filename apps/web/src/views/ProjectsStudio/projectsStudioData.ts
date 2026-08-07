/** Chain filter labels — BSC is the display name (legacy BNB alias still matches). */
export const FILTER_CHAINS = ['BSC', 'BNB', 'Base', 'Polygon', 'Ethereum', 'Arbitrum', 'Avalanche'] as const
export const FILTER_CATEGORIES = ['AI', 'DeFi', 'Gaming', 'Infrastructure', 'Meme', 'RWA'] as const
/**
 * Status chips — Trending lives only in FILTER_SORT (one control / Part G honesty).
 * V3 Status: Featured · Boosted · Verified · New
 */
export const FILTER_STATUS = ['Featured', 'Boosted', 'Verified', 'New', 'New Listings'] as const
export const FILTER_SORT = [
  'Trending',
  'Newest',
  'Price Change',
  'Liquidity',
  'Volume',
  'Holders',
  'Highest Rated',
  'Highest Liquidity',
  'Recently Listed',
] as const

export const PROJECT_FILTER_CHIPS = [
  'All',
  'Featured',
  'Boosted',
  'Trending',
  'Verified',
  'New',
  'New Listings',
  'AI Verified',
  'BSC',
  'BNB',
  'Base',
  'Polygon',
  'Ethereum',
  'Arbitrum',
  'Avalanche',
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
  'Price Change',
  'Liquidity',
  'Volume',
  'Holders',
] as const

export type ProjectRatingTier = 'exceptional' | 'strong' | 'active' | 'emerging' | 'high-risk' | 'unknown'
export type MetricTone = 'green' | 'gold' | 'red' | 'gray'
export type ProjectStatus = 'verified' | 'community' | 'new' | 'pending'
export type ProjectRankingLayer = 'organic' | 'featured' | 'boosted' | null

export interface ProjectsKpiItem {
  id: string
  label: string
  value: string
  subline?: string
  reasonCode?: string
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
  /** Optional sector tags for category filter (V3). */
  sectorTags?: string[]
  chains: string[]
  chainId?: number
  status: ProjectStatus
  verified?: boolean
  featured?: boolean
  boosted?: boolean
  rankingLayer?: ProjectRankingLayer
  priceDisplay?: string
  change24hDisplay?: string
  change24hPct?: number | null
  /** Indexed pair for factual sparkline when available. */
  pairAddress?: string
  /** Factual listing timestamp (ms) for New / Newest sort. */
  listedAtMs?: number | null
  /** Canonical project logo when known (logo resolution priority 1). */
  logoURI?: string | null
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
