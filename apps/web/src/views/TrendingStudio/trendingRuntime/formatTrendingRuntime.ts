import { CHAIN_LABELS } from 'registry/projects/constants'
import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { buildAiSummary } from 'views/ProjectsStudio/projectsRuntime/buildAiSummary'
import { buildOnChainMetrics } from 'views/ProjectsStudio/projectsRuntime/onChainMetrics'
import { buildProjectRating } from 'views/ProjectsStudio/projectsRuntime/buildProjectRating'
import { buildHeatmapRow } from 'views/RadarStudio/radarRuntime/buildHeatmap'
import type { RadarLiveEvent } from 'views/RadarStudio/radarRuntime/buildLiveEvents'
import { buildOpportunityScore } from 'views/RadarStudio/radarRuntime/buildOpportunityScore'
import type {
  AIDiscoveryRow,
  AIWarningRow,
  HeatmapRow,
  TrendingFilterChip,
  TrendingKpiItem,
  TrendingProjectCard,
} from '../trendingStudioData'
import type { TierRankedAsset } from 'lib/trending/tierTrendingModel'

const UNAVAILABLE = 'Unavailable'
const EM_DASH = '—'

function formatUsdCompact(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return EM_DASH
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

function formatLiquidityScore(score: number): string {
  if (!Number.isFinite(score) || score <= 0) return EM_DASH
  if (score >= 1e18) return `${(score / 1e18).toFixed(2)} LP`
  if (score >= 1e15) return `${(score / 1e15).toFixed(2)}K LP`
  return String(score)
}

function chainLabel(project: EnrichedProjectRecord): string {
  const id = project.supportedChains[0]
  const label = CHAIN_LABELS[id]
  if (label === 'BSC') return 'BNB Chain'
  return label ?? 'Multi-chain'
}

function tokenSymbol(project: EnrichedProjectRecord): string {
  return project.resources.tokens[0]?.symbol ?? project.displayName
}

function contractAddress(project: EnrichedProjectRecord): string | undefined {
  return project.resources.tokens[0]?.address
}

function runtimeSignalLabel(ratingScore: number, indexed: boolean): string {
  if (!indexed) return 'Insufficient Data'
  if (ratingScore >= 70) return 'Runtime Signal'
  if (ratingScore > 0) return 'Indexed'
  return 'Unavailable'
}

function provenanceLabel(project: EnrichedProjectRecord): string {
  if (project.trustBadges.includes('canonical')) return 'Registry · Canonical'
  if (project.verificationStatus === 'observed') return 'Registry · Observed'
  return 'Registry · Indexed'
}

function sparklineFromScore(_score: number): number[] {
  return []
}

export function mapTierRankedAssetToTrendingCard(
  asset: TierRankedAsset,
  rank: number,
  project?: EnrichedProjectRecord,
): TrendingProjectCard {
  const sym = asset.symbol
  const change =
    asset.change24h && Math.abs(asset.change24h.pct) > 0.0001 ? asset.change24h : undefined
  const tags: string[] = [asset.tierStatus === 'READY' ? 'Live Signal' : 'Verified Empty']
  if (project?.trustBadges.includes('canonical')) tags.push('Canonical')
  tags.push('Tier Metrics')

  return {
    rank,
    name: project?.displayName ?? asset.displayName,
    pair: `${sym} · BNB Chain`,
    symbol: sym,
    chain: 'BNB Chain',
    slug: project?.slug ?? asset.slug,
    tags,
    aiScore: 0,
    signalLabel: asset.tierStatus,
    summary: project
      ? buildAiSummary(project)
      : `Ranked from tier-metrics pair ${asset.pairSlug} on Melega DEX.`,
    holders: EM_DASH,
    liquidity: formatLiquidityScore(asset.liquidityScore),
    volume: formatUsdCompact(asset.volume24h),
    growth: change?.text ?? EM_DASH,
    growthPositive: change?.positive,
    sparkline: [],
    provenance: 'Indexer · Tier Metrics',
    projectHref: project ? `/projects/${project.slug}` : '/projects',
    radarHref: asset.address ? `/radar?contract=${asset.address}` : undefined,
    tradeHref: asset.address ? `/swap?outputCurrency=${asset.address}` : '/trade',
  }
}

export function mapTierRankedToHeatmapRows(assets: TierRankedAsset[]): HeatmapRow[] {
  return assets.map((asset, index) => ({
    rank: index + 1,
    project: asset.displayName,
    symbol: asset.symbol,
    momentum: asset.change24h ? Math.abs(asset.change24h.pct) : 0,
    liquidity: asset.liquidityScore,
    holders: 0,
    aiScore: 0,
    social: 0,
    whales: 0,
    volume: asset.volume24h,
    slug: asset.slug,
    provenance: 'Tier Metrics',
  }))
}

export function aggregateTierTrendingKpis(
  rankedAssets: TierRankedAsset[],
  liveEvents: RadarLiveEvent[],
): TrendingKpiItem[] {
  const readyCount = rankedAssets.filter((a) => a.tierStatus === 'READY').length
  const verifiedEmpty = rankedAssets.filter((a) => a.tierStatus === 'EMPTY_VERIFIED').length

  return [
    {
      id: 'ranked',
      label: 'Tier Ranked',
      value: String(rankedAssets.length),
      delta: '',
      sparkline: [],
    },
    {
      id: 'signals',
      label: 'Live Signals',
      value: String(readyCount),
      delta: '',
      sparkline: [],
    },
    {
      id: 'verified',
      label: 'Verified Empty',
      value: String(verifiedEmpty),
      delta: '',
      sparkline: [],
    },
    {
      id: 'events',
      label: 'Runtime Events',
      value: String(liveEvents.length),
      delta: '',
      sparkline: [],
    },
    {
      id: 'whales',
      label: 'Whale Alerts',
      value: UNAVAILABLE,
      delta: '',
      sparkline: [],
    },
  ]
}

export function mapProjectToTrendingCard(
  project: EnrichedProjectRecord,
  rank: number,
): TrendingProjectCard {
  const sym = tokenSymbol(project)
  const rating = buildProjectRating(project)
  const onChain = buildOnChainMetrics(project)
  const addr = contractAddress(project)
  const tags: string[] = []
  if (project.trustBadges.includes('canonical')) tags.push('Canonical')
  if (project.capabilities.tradable.status === 'live') tags.push('Tradable')
  if (project.sectorTags?.length) tags.push(...project.sectorTags.slice(0, 2))
  if (!tags.length) tags.push('Indexed')

  return {
    rank,
    name: project.displayName,
    pair: `${sym} · ${chainLabel(project)}`,
    symbol: sym,
    chain: chainLabel(project),
    slug: project.slug,
    tags,
    aiScore: rating.score,
    signalLabel: runtimeSignalLabel(rating.score, true),
    summary: buildAiSummary(project),
    holders: onChain.holders,
    liquidity: onChain.liquidity,
    volume: onChain.volume,
    growth: UNAVAILABLE,
    growthPositive: undefined,
    sparkline: [],
    provenance: provenanceLabel(project),
    projectHref: `/projects/${project.slug}`,
    radarHref: addr ? `/radar?contract=${addr}` : undefined,
    tradeHref: addr ? `/swap?outputCurrency=${addr}` : '/trade',
  }
}

export function mapHeatmapToTrendingRows(projects: EnrichedProjectRecord[]): HeatmapRow[] {
  return [...projects]
    .sort((a, b) => buildProjectRating(b).score - buildProjectRating(a).score)
    .map((project, index) => {
      const row = buildHeatmapRow(project, index + 1)
      const rating = buildProjectRating(project)
      return {
        rank: row.rank,
        project: row.name,
        symbol: row.symbol,
        momentum: row.momentum > 0 ? row.momentum : 0,
        liquidity: row.liquidity,
        holders: row.holders,
        aiScore: rating.score,
        social: row.social,
        whales: row.whales,
        volume: row.volume,
        slug: project.slug,
        provenance: provenanceLabel(project),
      }
    })
}

export function aggregateTrendingKpis(
  projects: EnrichedProjectRecord[],
  liveEvents: RadarLiveEvent[],
): TrendingKpiItem[] {
  const highConfidence = projects.filter((p) => buildProjectRating(p).confidence >= 70).length
  const newListings = projects.filter((p) => !p.isCanonical).length

  return [
    {
      id: 'projects',
      label: 'Indexed Projects',
      value: String(projects.length),
      delta: '',
      sparkline: [],
    },
    {
      id: 'signals',
      label: 'Runtime Signals',
      value: String(liveEvents.length),
      delta: '',
      sparkline: [],
    },
    {
      id: 'whales',
      label: 'Whale Alerts',
      value: UNAVAILABLE,
      delta: '',
      sparkline: [],
    },
    {
      id: 'listings',
      label: 'Non-Canonical',
      value: String(newListings),
      delta: '',
      sparkline: [],
    },
    {
      id: 'confidence',
      label: 'High Confidence',
      value: String(highConfidence),
      delta: '',
      sparkline: [],
    },
  ]
}

export function buildTrendingDiscoveries(events: RadarLiveEvent[]): AIDiscoveryRow[] {
  return events.slice(0, 8).map((e) => ({
    time: e.timestamp,
    project: e.project,
    event: e.event,
    score: `Signal ${e.confidence}`,
    status: e.severity === 'high' ? 'verified' : 'indexed',
  }))
}

export function buildTrendingWarnings(projects: EnrichedProjectRecord[]): AIWarningRow[] {
  const unavailableMarket = projects.every(
    (p) => buildOnChainMetrics(p).liquidity === UNAVAILABLE,
  )
  const warnings: AIWarningRow[] = [
    { label: 'Whale monitor unavailable', level: 'yellow' },
    { label: 'Smart money feed unavailable', level: 'yellow' },
  ]
  if (unavailableMarket) {
    warnings.push({ label: 'On-chain market metrics unavailable', level: 'orange' })
  }
  return warnings
}

export function buildRuntimeOpportunity(featured?: EnrichedProjectRecord) {
  if (!featured) {
    return {
      score: 0,
      recommendation: 'Unavailable',
      summary: 'No indexed projects for runtime signal.',
      signalLabel: 'Unavailable' as const,
    }
  }
  const opp = buildOpportunityScore(featured)
  return {
    score: opp.score,
    recommendation: opp.recommendation === 'Strong Buy' ? 'Runtime Signal' : opp.recommendation,
    summary: opp.summary,
    signalLabel: runtimeSignalLabel(opp.score, true),
  }
}

export function filterTrendingProjects(
  projects: EnrichedProjectRecord[],
  chip: TrendingFilterChip,
): EnrichedProjectRecord[] {
  if (chip === 'All') return projects

  if (chip === 'AI Verified') {
    return projects.filter(
      (p) => p.trustBadges.includes('canonical') || p.verificationStatus === 'observed',
    )
  }

  if (chip === 'Highest AI Score') {
    return [...projects].sort((a, b) => buildProjectRating(b).score - buildProjectRating(a).score)
  }

  if (chip === 'Whale Activity') {
    return []
  }

  if (chip === 'New Listings') {
    return projects.filter((p) => !p.isCanonical || p.registryStatus === 'partial')
  }

  if (chip === 'BNB') {
    return projects.filter((p) => p.supportedChains.includes(56))
  }

  if (chip === 'Ethereum') {
    return projects.filter((p) => p.supportedChains.includes(1))
  }

  if (chip === 'Gaming') {
    return projects.filter((p) =>
      p.sectorTags?.some((t) => t.toLowerCase().includes('gaming')) ||
      p.displayName.toLowerCase().includes('game'),
    )
  }

  if (chip === 'AI') {
    return projects.filter((p) =>
      p.sectorTags?.some((t) => t.toLowerCase().includes('ai')) ||
      p.capabilities.radar.status === 'live',
    )
  }

  if (chip === 'DeFi') {
    return projects.filter((p) =>
      p.sectorTags?.some((t) => t.toLowerCase().includes('defi')) ||
      p.capabilities.pool.status === 'live' ||
      p.capabilities.farm.status === 'live',
    )
  }

  if (chip === 'Meme') {
    return projects.filter((p) => p.sectorTags?.some((t) => t.toLowerCase().includes('meme')))
  }

  return projects
}
