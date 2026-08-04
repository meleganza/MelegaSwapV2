import { CHAIN_LABELS } from 'registry/projects/constants'
import type { PendingProjectRecord } from 'registry/projects/pending/types'
import { formatPendingReviewStatusLabel } from 'registry/projects/pending/updatePendingReview'
import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { StaticProjectRecord } from 'registry/projects/types'
import type { DexAssetRecord } from 'lib/dex-asset-index'
import { FOUNDER_FEATURED_SLUGS } from 'views/HomeTrade/featuredProjectsCatalog'
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

const FEATURED_SLUG_SET = new Set<string>(FOUNDER_FEATURED_SLUGS)
const EMPTY = '—'

function shortAddress(address?: string): string {
  if (!address) return '—'
  if (address.length < 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function chainLabel(chainId: number): string {
  const label = CHAIN_LABELS[chainId] ?? `Chain ${chainId}`
  if (label === 'BSC') return 'BNB'
  return label.replace('Ethereum', 'ETH')
}

/** Indexed DEX asset without a claimed Project Page — temporary address destination. */
export function mapIndexedAssetToPreviewCard(asset: DexAssetRecord, rank: number): ProjectPreviewCard | null {
  if (!asset.address) return null
  if (asset.symbol.includes('-') || asset.symbol.includes('/')) return null
  const slug = asset.registrySlug
  const featured = Boolean(slug && FEATURED_SLUG_SET.has(slug))
  const verified = asset.status === 'canonical' || asset.sources.includes('registry')
  const projectHref = slug ? `/@${slug}/` : `/project/${asset.address}`
  return {
    id: `indexed-${asset.chainId}-${asset.address.toLowerCase()}`,
    rank,
    name: asset.name?.trim() || asset.symbol,
    slug: slug || asset.address.toLowerCase(),
    symbol: asset.symbol,
    category: asset.sources.includes('farm')
      ? 'Farm'
      : asset.sources.includes('pool')
        ? 'Pool'
        : asset.sources.includes('token-list')
          ? 'Listed'
          : 'Indexed',
    chains: [chainLabel(asset.chainId)],
    chainId: asset.chainId,
    status: verified ? 'verified' : asset.status === 'listed' ? 'new' : 'community',
    verified,
    featured,
    rankingLayer: featured ? 'featured' : null,
    rating: verified ? 70 : 40,
    ratingTier: verified ? 'active' : 'emerging',
    aiSummary: 'Indexed Melega DEX listing.',
    metrics: [
      { label: 'Liquidity', value: EMPTY, tone: 'gray' },
      { label: 'Volume', value: EMPTY, tone: 'gray' },
      { label: 'Holders', value: EMPTY, tone: 'gray' },
      { label: 'Age', value: EMPTY, tone: 'gray' },
    ],
    aiConfidence: '—',
    melegaRating: verified ? 'Verified' : 'Indexed',
    risk: '—',
    riskTone: 'gray',
    website: '—',
    contract: shortAddress(asset.address),
    contractAddress: asset.address,
    tradeHref: `/swap?outputCurrency=${asset.address}`,
    projectHref,
    registryTier: slug ? 'canonical' : undefined,
  }
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

  const featured = FEATURED_SLUG_SET.has(project.slug)
  const verified =
    project.verificationStatus === 'observed' || project.trustBadges.includes('canonical')
  const status = projectStatus(project)

  return {
    id: project.slug,
    rank,
    name: symbol ?? project.displayName,
    slug: project.slug,
    symbol,
    category: project.sectorTags.slice(0, 2).join(' · ') || 'DeFi',
    chains: chainBadges(project),
    chainId: token?.chainId ?? project.supportedChains[0],
    status,
    verified,
    featured,
    rankingLayer: featured ? 'featured' : null,
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
      : project.deepLinks.buyMarco ?? project.deepLinks.swap ?? '/swap',
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
    case 'Verified':
      return cards.filter((c) => c.verified || projectBySlug.get(c.slug)?.trustBadges.includes('canonical'))
    case 'Featured':
      return cards.filter((c) => c.featured || c.rankingLayer === 'featured')
    case 'Trending':
      // Ranking layer applied by runtime (organic movers first). Chip alone does not invent movers.
      return [...cards].sort((a, b) => {
        const aRank = a.rankingLayer === 'organic' ? 0 : a.featured ? 1 : a.boosted ? 2 : 3
        const bRank = b.rankingLayer === 'organic' ? 0 : b.featured ? 1 : b.boosted ? 2 : 3
        if (aRank !== bRank) return aRank - bRank
        const aPct = Math.abs(a.change24hPct ?? 0)
        const bPct = Math.abs(b.change24hPct ?? 0)
        if (aPct !== bPct) return bPct - aPct
        return b.rating - a.rating
      })
    case 'New Listings':
    case 'Recently Listed':
    case 'Newest':
      return cards.filter((c) => c.status === 'new' || c.registryTier === 'pending').length
        ? cards.filter((c) => c.status === 'new' || c.registryTier === 'pending')
        : [...cards].sort((a, b) => b.rank - a.rank)
    case 'BNB':
      return cards.filter((c) => c.chains.includes('BNB') || c.chainId === 56)
    case 'Ethereum':
      return cards.filter(
        (c) => c.chains.includes('ETH') || c.chains.includes('Ethereum') || c.chainId === 1,
      )
    case 'Base':
      return cards.filter((c) => c.chains.includes('Base') || c.chainId === 8453)
    case 'Polygon':
      return cards.filter((c) => c.chains.includes('Polygon') || c.chainId === 137)
    case 'Arbitrum':
      return cards.filter(
        (c) => c.chains.includes('Arbitrum') || c.chains.includes('ARB') || c.chainId === 42161,
      )
    case 'Avalanche':
      return cards.filter(
        (c) => c.chains.includes('Avalanche') || c.chains.includes('AVAX') || c.chainId === 43114,
      )
    case 'Highest Rated':
      return [...cards].sort((a, b) => b.rating - a.rating)
    case 'Highest Liquidity':
      return [...cards].sort((a, b) => b.rating - a.rating)
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
