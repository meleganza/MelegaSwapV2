import { CHAIN_LABELS } from 'registry/projects/constants'
import type { PendingProjectRecord } from 'registry/projects/pending/types'
import { formatPendingReviewStatusLabel } from 'registry/projects/pending/updatePendingReview'
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
import type { ProjectLiveMetricsSnapshot } from 'lib/projects-data/projectLiveMetrics'
import { metricUiReasonLabel, type ProjectDataReasonCode } from 'lib/projects-data/dataReasonCodes'

const EMPTY = '—'

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
      return { risk: EMPTY, tone: 'gray' }
  }
}

function auditLabel(project: StaticProjectRecord): { value: string; tone: MetricTone } {
  if (project.trustBadges.includes('canonical')) return { value: 'Canonical', tone: 'green' }
  if (project.verificationStatus === 'observed') return { value: 'Observed', tone: 'gold' }
  if (project.verificationStatus === 'unverified') return { value: 'Unverified', tone: 'red' }
  return { value: EMPTY, tone: 'gray' }
}

function websiteDisplay(url?: string): string {
  if (!url) return '—'
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function mapProjectToPreviewCard(
  project: EnrichedProjectRecord,
  rank: number,
  live?: ProjectLiveMetricsSnapshot,
): ProjectPreviewCard {
  const token = project.resources.tokens[0]
  const rating = buildProjectRating(project)
  const metrics = buildOnChainMetrics(project, live)
  const { risk, tone: riskTone } = riskFromTier(rating.tier)
  const audit = auditLabel(project)
  const symbol = token?.symbol ?? project.tickers[0]
  const muted = (value: string) => value === EMPTY

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
      { label: 'Liquidity', value: metrics.liquidity, tone: muted(metrics.liquidity) ? 'gray' : 'green' },
      { label: 'Volume', value: metrics.volume, tone: muted(metrics.volume) ? 'gray' : undefined },
      { label: 'Holders', value: metrics.holders, tone: muted(metrics.holders) ? 'gray' : undefined },
      { label: 'Age', value: metrics.age, tone: muted(metrics.age) ? 'gray' : undefined },
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
    contractAddress: token?.address,
    tradeHref: token?.address
      ? `/swap?outputCurrency=${token.address}`
      : project.deepLinks.buyMarco ?? project.deepLinks.swap ?? '/trade',
    radarHref: token?.address ? `/radar?contract=${token.address}` : undefined,
    projectHref: `/@${project.slug}/`,
  }
}

function pendingChainBadge(chainId: number): string {
  const label = CHAIN_LABELS[chainId]
  if (label === 'BSC') return 'BNB'
  return label?.replace('Ethereum', 'ETH') ?? `Chain ${chainId}`
}

export function mapPendingToPreviewCard(pending: PendingProjectRecord, rank: number): ProjectPreviewCard {
  const name = pending.name.available ? (pending.name.value ?? 'Unknown') : 'Unknown'
  const symbol = pending.symbol.available ? pending.symbol.value : undefined
  const score = pending.health.readiness_score

  return {
    id: pending.id,
    rank,
    name: symbol ?? name,
    slug: pending.id,
    symbol,
    category: 'Pending Review',
    chains: [pendingChainBadge(pending.chain)],
    status: 'pending',
    rating: score,
    ratingTier: score >= 70 ? 'active' : 'emerging',
    aiSummary: `Pending registry profile — ${formatPendingReviewStatusLabel(pending.status)}. Awaiting canonical promotion.`,
    metrics: [
      { label: 'Liquidity', value: EMPTY, tone: 'gray' },
      { label: 'Volume', value: EMPTY, tone: 'gray' },
      { label: 'Holders', value: EMPTY, tone: 'gray' },
      { label: 'Age', value: EMPTY, tone: 'gray' },
      { label: 'Audit', value: 'Pending', tone: 'gold' },
      { label: 'Risk', value: 'Pending', tone: 'gold' },
    ],
    aiConfidence: `${pending.health.identity_completeness}%`,
    melegaRating: 'Pending Review',
    risk: 'Pending',
    riskTone: 'gold',
    website: '—',
    contract: shortAddress(pending.contract),
    contractAddress: pending.contract,
    tradeHref: `/swap?outputCurrency=${pending.contract}`,
    radarHref: `/radar?contract=${pending.contract}`,
    projectHref: `/import-existing-token?contract=${encodeURIComponent(pending.contract)}`,
    registryTier: 'pending',
    pendingId: pending.id,
    reviewStatus: formatPendingReviewStatusLabel(pending.status),
    importHref: `/import-existing-token?contract=${encodeURIComponent(pending.contract)}`,
  }
}

export function buildActivityFromPending(pendingRecords: PendingProjectRecord[]): ProjectsActivityRow[] {
  return pendingRecords.slice(0, 4).map((pending) => ({
    time: pending.updated_at,
    project: pending.symbol.available ? (pending.symbol.value ?? 'Unknown') : 'Unknown',
    projectSymbol: pending.symbol.available ? pending.symbol.value : undefined,
    action: 'Pending Review',
    details: `${formatPendingReviewStatusLabel(pending.status)} — non-canonical registry intake`,
    source: 'Pending Registry',
    status: 'indexed',
    actionTone: 'gold',
  }))
}

export function aggregateKpis(
  projects: EnrichedProjectRecord[],
  pendingCount = 0,
  holdersMetric?: { display: string; reasonCode?: string },
): ProjectsKpiItem[] {
  const indexed = projects.length
  const live = projects.filter((p) =>
    Object.values(p.capabilities).some((c) => c.status === 'live' || c.status === 'partial'),
  ).length
  const verified = projects.filter((p) => p.trustBadges.includes('canonical')).length
  const aiRecommended = projects.filter((p) => buildProjectRating(p).score >= 70).length

  const holdersValue = holdersMetric?.display ?? EMPTY
  const holdersSubline = holdersMetric?.reasonCode
    ? metricUiReasonLabel(holdersMetric.reasonCode as ProjectDataReasonCode)
    : holdersValue === EMPTY
      ? metricUiReasonLabel('EXPLORER_SOURCE_MISSING')
      : undefined

  return [
    { id: 'indexed', label: 'Projects Indexed', value: String(indexed) },
    { id: 'pending', label: 'Pending Review', value: String(pendingCount), gold: pendingCount > 0 },
    { id: 'live', label: 'Live Projects', value: String(live) },
    { id: 'verified', label: 'Verified Projects', value: String(verified) },
    {
      id: 'holders',
      label: 'Total Holders',
      value: holdersValue,
      subline: holdersSubline,
      reasonCode: holdersMetric?.reasonCode ?? (holdersValue === EMPTY ? 'EXPLORER_SOURCE_MISSING' : undefined),
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

export function buildFeaturedProject(
  project: EnrichedProjectRecord,
  priceUsd?: number,
  live?: ProjectLiveMetricsSnapshot,
): FeaturedProjectView {
  const token = project.resources.tokens[0]
  const onChain = buildOnChainMetrics(project, live)
  const symbol = token?.symbol ?? project.tickers[0] ?? project.displayName

  let price: string | undefined
  let priceChange: string | undefined
  let hasPriceData = false
  if (priceUsd != null && Number.isFinite(priceUsd) && priceUsd > 0) {
    hasPriceData = true
    price = priceUsd >= 1 ? `$${priceUsd.toFixed(4)}` : `$${priceUsd.toFixed(6)}`
    priceChange = onChain.priceChange && onChain.priceChange !== EMPTY ? onChain.priceChange : undefined
  }

  return {
    name: symbol,
    symbol,
    slug: project.slug,
    verified: project.trustBadges.includes('canonical'),
    tags: [...project.sectorTags.slice(0, 2), ...chainBadges(project).slice(0, 2)],
    description: project.tagline ?? project.description,
    metrics: [
      { label: 'Holders', value: onChain.holders, tone: onChain.holders === EMPTY ? 'gray' : undefined },
      { label: 'Liquidity', value: onChain.liquidity, tone: onChain.liquidity === EMPTY ? 'gray' : 'green' },
      { label: 'FDV', value: onChain.fdv ?? EMPTY, tone: onChain.fdv === EMPTY ? 'gray' : undefined },
      { label: 'Volume 24h', value: onChain.volume, tone: onChain.volume === EMPTY ? 'gray' : undefined },
      { label: 'Age', value: onChain.age, tone: 'gray' },
    ],
    contractAddress: token?.address,
    spaceUrl: project.spaceProfileUrl,
    tradeHref: project.deepLinks.buyMarco ?? project.deepLinks.swap ?? '/swap',
    projectHref: `/@${project.slug}/`,
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
      return { label, value: EMPTY, score: '—', tone: 'gold' as const }
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
  const onChain = buildOnChainMetrics(project, undefined)

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
    metrics: {
      ...onChain,
      reason_codes: onChain.reasonCodes ?? {},
    },
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

  if (chip === 'Pending Review') {
    return cards.filter((c) => c.registryTier === 'pending')
  }

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
