import { CHAIN_LABELS } from 'registry/projects/constants'
import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { StaticProjectRecord } from 'registry/projects/types'
import type {
  MetricTone,
  ProjectPreviewCard,
  ProjectRatingTier,
  ProjectsActivityRow,
  ProjectsKpiItem,
  ProjectStatus,
} from '../projectsStudioData'
import { ratingLabel } from '../projectsStudioData'
import { buildAiRecommendations } from './buildAiRecommendations'
import { buildAiSummary } from './buildAiSummary'
import { buildProjectHealth } from './buildProjectHealth'
import { buildProjectRating } from './buildProjectRating'
import { buildMarketSources } from './marketSources'
import { buildOnChainMetrics } from './onChainMetrics'

const UNAVAILABLE = 'Unavailable'

function shortAddress(address?: string): string {
  if (!address) return '—'
  if (address.length < 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function chainBadges(project: StaticProjectRecord): string[] {
  return project.supportedChains.map((id) => {
    const label = CHAIN_LABELS[id] ?? `Chain ${id}`
    if (label === 'BSC') return 'BNB'
    return label.replace('Ethereum', 'ETH')
  })
}

function projectStatus(project: StaticProjectRecord): ProjectStatus {
  if (project.trustBadges.includes('canonical')) return 'verified'
  if (project.phase === 'registered') return 'new'
  return 'community'
}

function riskFromTier(tier: ProjectRatingTier): { risk: string; tone: MetricTone } {
  switch (tier) {
    case 'exceptional':
    case 'strong':
      return { risk: 'Low', tone: 'green' }
    case 'active':
      return { risk: 'Medium', tone: 'gold' }
    case 'emerging':
      return { risk: 'Medium', tone: 'gold' }
    case 'high-risk':
      return { risk: 'High', tone: 'red' }
    default:
      return { risk: UNAVAILABLE, tone: 'gray' }
  }
}

function auditLabel(project: StaticProjectRecord): { value: string; tone: MetricTone } {
  if (project.trustBadges.includes('canonical')) return { value: 'Canonical', tone: 'green' }
  if (project.verificationStatus === 'observed') return { value: 'Observed', tone: 'gold' }
  if (project.verificationStatus === 'unverified') return { value: 'Unverified', tone: 'red' }
  return { value: UNAVAILABLE, tone: 'gray' }
}

function websiteDisplay(url?: string): string {
  if (!url) return '—'
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function mapProjectToPreviewCard(project: EnrichedProjectRecord, rank: number): ProjectPreviewCard {
  const token = project.resources.tokens[0]
  const rating = buildProjectRating(project)
  const metrics = buildOnChainMetrics(project)
  const { risk, tone: riskTone } = riskFromTier(rating.tier)
  const audit = auditLabel(project)
  const symbol = token?.symbol ?? project.tickers[0]

  return {
    id: project.slug,
    rank,
    name: symbol ?? project.displayName,
    slug: project.slug,
    symbol,
    category: project.sectorTags.slice(0, 2).join(' · ') || 'DeFi',
    chains: chainBadges(project),
    status: projectStatus(project),
    rating: rating.score,
    ratingTier: rating.tier,
    aiSummary: buildAiSummary(project),
    metrics: [
      { label: 'Liquidity', value: metrics.liquidity, tone: 'gray' },
      { label: 'Volume', value: metrics.volume, tone: 'gray' },
      { label: 'Holders', value: metrics.holders, tone: 'gray' },
      { label: 'Age', value: metrics.age, tone: 'gray' },
      { label: 'Audit', value: audit.value, tone: audit.tone },
      { label: 'Risk', value: risk, tone: riskTone },
    ],
    aiConfidence: `${rating.confidence}%`,
    melegaRating: ratingLabel(rating.tier),
    risk,
    riskTone,
    website: websiteDisplay(project.websiteUrl),
    contract:
      project.verificationStatus === 'unverified'
        ? 'Unverified'
        : token?.address
          ? shortAddress(token.address)
          : '—',
  }
}

export function aggregateKpis(projects: EnrichedProjectRecord[]): ProjectsKpiItem[] {
  const indexed = projects.length
  const live = projects.filter((p) =>
    Object.values(p.capabilities).some((c) => c.status === 'live' || c.status === 'partial'),
  ).length
  const verified = projects.filter((p) => p.trustBadges.includes('canonical')).length
  const aiRecommended = projects.filter((p) => buildProjectRating(p).score >= 70).length

  return [
    { id: 'indexed', label: 'Projects Indexed', value: String(indexed) },
    { id: 'live', label: 'Live Projects', value: String(live) },
    { id: 'verified', label: 'Verified Projects', value: String(verified) },
    {
      id: 'holders',
      label: 'Total Holders',
      value: UNAVAILABLE,
    },
    {
      id: 'ai',
      label: 'AI Recommended',
      value: String(aiRecommended),
      gold: true,
    },
  ]
}

export interface FeaturedProjectView {
  name: string
  symbol: string
  slug: string
  verified: boolean
  tags: string[]
  description: string
  metrics: { label: string; value: string; tone?: MetricTone }[]
  contractAddress?: string
  spaceUrl?: string
  tradeHref?: string
  projectHref: string
  radarHref?: string
  price?: string
  priceChange?: string
  hasPriceData: boolean
}

export function buildFeaturedProject(project: EnrichedProjectRecord, priceUsd?: number): FeaturedProjectView {
  const token = project.resources.tokens[0]
  const onChain = buildOnChainMetrics(project)
  const symbol = token?.symbol ?? project.tickers[0] ?? project.displayName

  let price: string | undefined
  let priceChange: string | undefined
  let hasPriceData = false
  if (priceUsd != null && Number.isFinite(priceUsd) && priceUsd > 0) {
    hasPriceData = true
    price = priceUsd >= 1 ? `$${priceUsd.toFixed(4)}` : `$${priceUsd.toFixed(6)}`
    priceChange = UNAVAILABLE
  }

  return {
    name: symbol,
    symbol,
    slug: project.slug,
    verified: project.trustBadges.includes('canonical'),
    tags: [...project.sectorTags.slice(0, 2), ...chainBadges(project).slice(0, 2)],
    description: project.tagline ?? project.description,
    metrics: [
      { label: 'Holders', value: onChain.holders },
      { label: 'Liquidity', value: onChain.liquidity },
      { label: 'FDV', value: UNAVAILABLE },
      { label: 'Volume 24h', value: onChain.volume },
      { label: 'Age', value: onChain.age, tone: 'gray' },
    ],
    contractAddress: token?.address,
    spaceUrl: project.spaceProfileUrl,
    tradeHref: project.deepLinks.buyMarco ?? project.deepLinks.swap ?? '/swap',
    projectHref: `/projects/${project.slug}`,
    radarHref: token?.address ? `/radar?contract=${token.address}` : undefined,
    price,
    priceChange,
    hasPriceData,
  }
}

export function buildAdvisorRows(projects: EnrichedProjectRecord[]): {
  label: string
  value: string
  score: string
  tone: 'green' | 'gold'
}[] {
  const rated = [...projects]
    .map((p) => ({ project: p, rating: buildProjectRating(p) }))
    .sort((a, b) => b.rating.score - a.rating.score)

  const labels = [
    'Best Long-Term Potential',
    'Highest Growth',
    'Lowest Risk',
    'Best For AI Agents',
    'Emerging Watchlist',
  ]

  return labels.map((label, i) => {
    const entry = rated[i]
    if (!entry) {
      return { label, value: UNAVAILABLE, score: '—', tone: 'gold' as const }
    }
    const symbol = entry.project.resources.tokens[0]?.symbol ?? entry.project.displayName
    return {
      label,
      value: symbol,
      score: `${entry.rating.score}/100`,
      tone: entry.rating.score >= 85 ? ('green' as const) : ('gold' as const),
    }
  })
}

export function buildActivityFromRegistry(projects: EnrichedProjectRecord[]): ProjectsActivityRow[] {
  const rows: ProjectsActivityRow[] = []

  projects.forEach((project) => {
    const symbol = project.resources.tokens[0]?.symbol ?? project.displayName
    rows.push({
      time: project.asOf,
      project: symbol,
      projectSymbol: symbol,
      action: 'Registry Indexed',
      details: `${project.displayName} indexed in Melega project registry`,
      source: 'Internal Melega Runtime',
      status: project.trustBadges.includes('canonical') ? 'verified' : 'indexed',
      actionTone: 'green',
    })

    if (project.capabilities.pool.status === 'live') {
      rows.push({
        time: project.asOf,
        project: symbol,
        projectSymbol: symbol,
        action: 'Staking Live',
        details: 'MARCO staking pools available on Melega',
        source: 'Melega DEX',
        status: 'live',
        actionTone: 'gold',
      })
    }

    const rating = buildProjectRating(project)
    rows.push({
      time: project.asOf,
      project: symbol,
      projectSymbol: symbol,
      action: 'Rating Updated',
      details: `AI score ${rating.score}/100`,
      source: 'Melega AI',
      status: 'live',
      actionTone: 'gold',
    })
  })

  return rows.slice(0, 8)
}

export function buildMachineProfile(project: EnrichedProjectRecord) {
  const rating = buildProjectRating(project)
  const health = buildProjectHealth(project)
  const sources = buildMarketSources(project, project.asOf)
  const recommendations = buildAiRecommendations(project)
  const onChain = buildOnChainMetrics(project)

  return {
    schema: 'https://melega.finance/schemas/projects-runtime/v1',
    project: {
      upi: project.upi,
      slug: project.slug,
      display_name: project.displayName,
      metadata: {
        tagline: project.tagline,
        sector_tags: project.sectorTags,
        supported_chains: project.supportedChains,
      },
    },
    capabilities: project.capabilities,
    links: {
      website: project.websiteUrl ?? null,
      docs: project.docsUrl ?? null,
      space: project.spaceProfileUrl ?? null,
      social: project.socialLinks ?? [],
    },
    metrics: onChain,
    sources: sources.map((s) => ({
      key: s.key,
      available: s.available,
      last_update: s.lastUpdate ?? null,
    })),
    status: {
      registry: project.registryStatus,
      verification: project.verificationStatus,
      health,
    },
    rating: {
      score: rating.score,
      confidence: rating.confidence,
      reason: rating.reason,
      tier: rating.tier,
    },
    recommendations: recommendations.map((r) => r.text),
    civilization_readiness: project.civilizationReadiness,
    as_of: project.asOf,
    data_source: 'projects-runtime-registry',
  }
}

export type ProjectFilterChip = (typeof import('../projectsStudioData').PROJECT_FILTER_CHIPS)[number]

export function filterProjectsByChip(
  cards: ProjectPreviewCard[],
  projects: EnrichedProjectRecord[],
  chip: ProjectFilterChip,
): ProjectPreviewCard[] {
  if (chip === 'All') return cards

  const projectBySlug = new Map(projects.map((p) => [p.slug, p]))

  switch (chip) {
    case 'AI Verified':
      return cards.filter((c) => {
        const p = projectBySlug.get(c.slug)
        return p?.trustBadges.includes('canonical')
      })
    case 'Trending':
      return cards.filter((c) => c.rating >= 70)
    case 'BNB':
      return cards.filter((c) => c.chains.includes('BNB'))
    case 'Ethereum':
      return cards.filter((c) => c.chains.includes('ETH') || c.chains.includes('Ethereum'))
    case 'Base':
      return cards.filter((c) => c.chains.includes('Base'))
    case 'Polygon':
      return cards.filter((c) => c.chains.includes('Polygon'))
    case 'Highest Rated':
      return [...cards].sort((a, b) => b.rating - a.rating)
    case 'Newest':
      return [...cards].sort((a, b) => b.rank - a.rank)
    case 'Recently Listed':
      return cards
    default:
      return cards.filter((c) => {
        const p = projectBySlug.get(c.slug)
        if (!p) return false
        const sector = p.sectorTags.join(' ').toLowerCase()
        const chipLower = chip.toLowerCase()
        return sector.includes(chipLower) || c.category.toLowerCase().includes(chipLower)
      })
  }
}
