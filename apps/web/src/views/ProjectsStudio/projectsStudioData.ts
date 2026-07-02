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

export const PROJECTS_KPIS: ProjectsKpiItem[] = [
  {
    id: 'indexed',
    label: 'Projects Indexed',
    value: '1,245',
    delta: '+18',
    deltaPositive: true,
    sparkline: [3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 'live',
    label: 'Live Projects',
    value: '583',
    delta: '+12',
    deltaPositive: true,
    sparkline: [4, 5, 4, 6, 7, 8, 8, 9],
  },
  {
    id: 'verified',
    label: 'Verified Projects',
    value: '231',
    delta: '+7',
    deltaPositive: true,
  },
  {
    id: 'holders',
    label: 'Total Holders',
    value: '2.48M',
    delta: '+4.21%',
    deltaPositive: true,
    sparkline: [5, 6, 5, 7, 8, 9, 10, 11],
  },
  {
    id: 'ai',
    label: 'AI Recommended',
    value: '128',
    delta: '+9',
    deltaPositive: true,
    gold: true,
  },
]

export const AI_ADVISOR_ROWS = [
  { label: 'Best Long-Term Potential', value: 'MARCO', score: '95/100', tone: 'green' as const },
  { label: 'Highest Growth', value: 'NAIIVE', score: '88/100', tone: 'green' as const },
  { label: 'Lowest Risk', value: 'BLINK', score: '82/100', tone: 'gold' as const },
  { label: 'Best For AI Agents', value: 'APX', score: '79/100', tone: 'gold' as const },
  { label: 'Emerging Watchlist', value: 'LAB', score: '71/100', tone: 'gold' as const },
]

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

export const PROJECT_PREVIEW_CARDS: ProjectPreviewCard[] = [
  {
    id: 'marco',
    rank: 1,
    name: 'MARCO',
    slug: 'melega-dex',
    symbol: 'MARCO',
    category: 'DEX · DeFi',
    chains: ['BNB'],
    status: 'verified',
    rating: 97,
    ratingTier: 'exceptional',
    aiSummary:
      'AI analysis indicates a healthy liquidity profile with active trading and consistent community activity across Melega DEX.',
    metrics: [
      { label: 'Liquidity', value: '$3.21M', tone: 'green' },
      { label: '24h Volume', value: '$1.28M', tone: 'green' },
      { label: 'Holders', value: '186.4K', tone: 'green' },
      { label: 'Age', value: '312 Days', tone: 'gray' },
      { label: 'Audit', value: 'Verified', tone: 'green' },
      { label: 'Contract', value: 'Verified', tone: 'green' },
      { label: 'Community', value: 'Strong', tone: 'green' },
      { label: 'Risk Level', value: 'Low', tone: 'green' },
    ],
    aiConfidence: '96%',
    melegaRating: 'Strong',
    risk: 'Low',
    riskTone: 'green',
  },
  {
    id: 'naiive',
    rank: 2,
    name: 'NAIIVE',
    slug: 'naiive',
    category: 'AI · DeFi',
    chains: ['BNB'],
    status: 'verified',
    rating: 88,
    ratingTier: 'strong',
    aiSummary:
      'Strong on-chain activity with growing holder base. AI confidence high for ecosystem integrations.',
    metrics: [
      { label: 'Liquidity', value: '$840K', tone: 'gold' },
      { label: '24h Volume', value: '$420K', tone: 'green' },
      { label: 'Holders', value: '42.8K', tone: 'green' },
      { label: 'Age', value: '186 Days', tone: 'gray' },
      { label: 'Audit', value: 'Partial', tone: 'gold' },
      { label: 'Contract', value: 'Verified', tone: 'green' },
      { label: 'Community', value: 'Active', tone: 'gold' },
      { label: 'Risk Level', value: 'Medium', tone: 'gold' },
    ],
    aiConfidence: '88%',
    melegaRating: 'Strong',
    risk: 'Medium',
    riskTone: 'gold',
  },
  {
    id: 'apx',
    rank: 3,
    name: 'APX',
    slug: 'apx',
    category: 'Infrastructure',
    chains: ['BNB', 'ETH'],
    status: 'community',
    rating: 79,
    ratingTier: 'active',
    aiSummary:
      'Moderate liquidity with steady volume. Limited social footprint outside core DeFi channels.',
    metrics: [
      { label: 'Liquidity', value: '$520K', tone: 'gold' },
      { label: '24h Volume', value: '$180K', tone: 'gold' },
      { label: 'Holders', value: '18.2K', tone: 'gold' },
      { label: 'Age', value: '94 Days', tone: 'gray' },
      { label: 'Audit', value: 'Unknown', tone: 'gray' },
      { label: 'Contract', value: 'Verified', tone: 'green' },
      { label: 'Community', value: 'Growing', tone: 'gold' },
      { label: 'Risk Level', value: 'Medium', tone: 'gold' },
    ],
    aiConfidence: '74%',
    melegaRating: 'Active',
    risk: 'Medium',
    riskTone: 'gold',
  },
  {
    id: 'lab',
    rank: 4,
    name: 'LAB',
    slug: 'lab',
    category: 'AI · Gaming',
    chains: ['BNB'],
    status: 'new',
    rating: 71,
    ratingTier: 'active',
    aiSummary: 'Emerging project with early traction. Liquidity building; monitor holder distribution.',
    metrics: [
      { label: 'Liquidity', value: '$280K', tone: 'gold' },
      { label: '24h Volume', value: '$92K', tone: 'gold' },
      { label: 'Holders', value: '8.4K', tone: 'gold' },
      { label: 'Age', value: '42 Days', tone: 'gray' },
      { label: 'Audit', value: 'Pending', tone: 'gray' },
      { label: 'Contract', value: 'Verified', tone: 'green' },
      { label: 'Community', value: 'Early', tone: 'gold' },
      { label: 'Risk Level', value: 'Medium', tone: 'gold' },
    ],
    aiConfidence: '68%',
    melegaRating: 'Active',
    risk: 'Medium',
    riskTone: 'gold',
  },
  {
    id: 'fire',
    rank: 5,
    name: 'FIRE',
    slug: 'fire',
    category: 'Meme',
    chains: ['BNB'],
    status: 'community',
    rating: 58,
    ratingTier: 'emerging',
    aiSummary: 'Low liquidity detected. Limited social footprint. High volatility expected.',
    metrics: [
      { label: 'Liquidity', value: '$120K', tone: 'red' },
      { label: '24h Volume', value: '$48K', tone: 'gold' },
      { label: 'Holders', value: '4.2K', tone: 'gold' },
      { label: 'Age', value: '28 Days', tone: 'gray' },
      { label: 'Audit', value: 'None', tone: 'red' },
      { label: 'Contract', value: 'Unverified', tone: 'red' },
      { label: 'Community', value: 'Volatile', tone: 'red' },
      { label: 'Risk Level', value: 'High', tone: 'red' },
    ],
    aiConfidence: '52%',
    melegaRating: 'Emerging',
    risk: 'High',
    riskTone: 'red',
  },
  {
    id: 'hay',
    rank: 6,
    name: 'HAY',
    slug: 'hay',
    category: 'DeFi',
    chains: ['BNB'],
    status: 'community',
    rating: 64,
    ratingTier: 'emerging',
    aiSummary: 'Stable holder count with moderate DEX presence. Audit status unavailable.',
    metrics: [
      { label: 'Liquidity', value: '$210K', tone: 'gold' },
      { label: '24h Volume', value: '$64K', tone: 'gold' },
      { label: 'Holders', value: '6.1K', tone: 'gold' },
      { label: 'Age', value: '156 Days', tone: 'gray' },
      { label: 'Audit', value: 'Unknown', tone: 'gray' },
      { label: 'Contract', value: 'Verified', tone: 'green' },
      { label: 'Community', value: 'Moderate', tone: 'gold' },
      { label: 'Risk Level', value: 'Medium', tone: 'gold' },
    ],
    aiConfidence: '61%',
    melegaRating: 'Emerging',
    risk: 'Medium',
    riskTone: 'gold',
  },
]

export const PROJECTS_ACTIVITY: ProjectsActivityRow[] = [
  {
    time: '2m ago',
    project: 'MARCO',
    projectSymbol: 'MARCO',
    action: 'New Pool Created',
    details: 'MARCO / BNB pool indexed',
    source: 'Melega DEX',
    status: 'verified',
    actionTone: 'green',
  },
  {
    time: '8m ago',
    project: 'NAIIVE',
    action: 'Liquidity Added',
    details: '+$42K TVL',
    source: 'BscScan',
    status: 'indexed',
    actionTone: 'green',
  },
  {
    time: '14m ago',
    project: 'APX',
    action: 'Rating Updated',
    details: 'AI score 79/100',
    source: 'Melega AI',
    status: 'live',
    actionTone: 'gold',
  },
  {
    time: '22m ago',
    project: 'LAB',
    action: 'Project Listed',
    details: 'New AI-indexed entry',
    source: 'Melega DEX',
    status: 'indexed',
    actionTone: 'green',
  },
  {
    time: '31m ago',
    project: 'FIRE',
    action: 'Risk Flag',
    details: 'Low liquidity warning',
    source: 'TokenSniffer',
    status: 'live',
    actionTone: 'gold',
  },
]

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
