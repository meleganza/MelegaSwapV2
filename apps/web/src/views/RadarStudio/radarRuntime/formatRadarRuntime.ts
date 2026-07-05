import { CHAIN_LABELS } from 'registry/projects/constants'
import type { PendingProjectRecord } from 'registry/projects/pending/types'
import { formatPendingReviewStatusLabel } from 'registry/projects/pending/updatePendingReview'
import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { buildAiRecommendations } from 'views/ProjectsStudio/projectsRuntime/buildAiRecommendations'
import { buildAiSummary } from 'views/ProjectsStudio/projectsRuntime/buildAiSummary'
import { buildMarketSources } from 'views/ProjectsStudio/projectsRuntime/marketSources'
import { buildOnChainMetrics } from 'views/ProjectsStudio/projectsRuntime/onChainMetrics'
import { buildProjectHealth } from 'views/ProjectsStudio/projectsRuntime/buildProjectHealth'
import { buildProjectRating } from 'views/ProjectsStudio/projectsRuntime/buildProjectRating'
import type {
  ConfidenceBreakdownItem,
  RadarEventCard,
  RadarKpiItem,
  RadarStatusLevel,
  RecentDiscoveryRow,
  RiskMatrixItem,
  SignalType,
  SmartMoneyRow,
  TimelineEvent,
  TopContractRow,
  WarningRow,
  WhaleRow,
} from '../radarStudioData'
import { FILTER_CATEGORIES } from '../radarStudioData'
import type { RadarLiveEvent } from './buildLiveEvents'
import { buildOpportunityScore } from './buildOpportunityScore'

const EMPTY = '—'

function networkLabel(project: EnrichedProjectRecord): string {
  const id = project.supportedChains[0]
  const label = CHAIN_LABELS[id]
  if (label === 'BSC') return 'BNB Chain'
  return label ?? 'Multi-chain'
}

function signalsFromProject(project: EnrichedProjectRecord): SignalType[] {
  const signals: SignalType[] = []
  if (project.capabilities.liquidity.status === 'live') signals.push('Liquidity')
  if (project.capabilities.tradable.status === 'live') signals.push('Contract')
  if (project.socialLinks?.length) signals.push('Social')
  if (project.trustBadges.includes('canonical') || project.verificationStatus === 'observed') {
    signals.push('Audit')
  }
  if (project.capabilities.pool.status === 'live' || project.capabilities.farm.status === 'live') {
    signals.push('Holder Growth')
  }
  return signals.length ? signals : ['Risk']
}

function confidenceBreakdown(project: EnrichedProjectRecord): ConfidenceBreakdownItem[] {
  const health = buildProjectHealth(project)
  const onChain = buildOnChainMetrics(project)
  const rating = buildProjectRating(project)

  const valueFor = (key: string, fallbackAvailable: boolean) => {
    const h = health.find((d) => d.key === key)
    if (!h) return fallbackAvailable ? rating.confidence : 0
    if (h.tone === 'green') return Math.min(96, rating.confidence + 4)
    if (h.tone === 'yellow') return Math.max(40, rating.confidence - 10)
    return 0
  }

  return [
    { label: 'Liquidity', value: onChain.liquidity === EMPTY ? 0 : valueFor('liquidity', false) },
    { label: 'Volume', value: 0 },
    { label: 'Contract', value: valueFor('contract', true) },
    { label: 'Community', value: valueFor('community', Boolean(project.socialLinks?.length)) },
    { label: 'Developer', value: project.docsUrl ? valueFor('documentation', true) : 0 },
    { label: 'Whales', value: 0 },
    { label: 'Momentum', value: 0 },
    { label: 'Social', value: project.socialLinks?.length ? valueFor('community', true) : 0 },
  ]
}

function riskMatrix(project: EnrichedProjectRecord): RiskMatrixItem[] {
  const onChain = buildOnChainMetrics(project)
  const unavailable = (label: string): RiskMatrixItem => ({
    label,
    level: 'yellow',
    tooltip: EMPTY,
  })

  const live = (label: string, tooltip: string, level: RadarStatusLevel = 'green'): RiskMatrixItem => ({
    label,
    level,
    tooltip,
  })

  return [
    onChain.contractVerification === EMPTY
      ? unavailable('Contract')
      : live('Contract', `Registry: ${onChain.contractVerification}`),
    unavailable('Liquidity'),
    unavailable('Taxes'),
    unavailable('Ownership'),
    project.docsUrl ? live('Developer', 'Documentation indexed') : unavailable('Developer'),
    unavailable('Proxy'),
    unavailable('Blacklist'),
    unavailable('Whales'),
    project.socialLinks?.length
      ? live('Community', 'Social channels indexed in registry')
      : unavailable('Community'),
    unavailable('Upgradeability'),
  ]
}

function timelineFromEvents(events: RadarLiveEvent[], symbol: string): TimelineEvent[] {
  return events
    .filter((e) => e.project === symbol)
    .slice(0, 6)
    .map((e) => ({
      timestamp: e.timestamp,
      label: e.event,
      severity: e.severity === 'high' ? 'green' : e.severity === 'medium' ? 'yellow' : ('yellow' as RadarStatusLevel),
      confidence: e.confidence,
    }))
}

export function mapProjectToRadarEvent(
  project: EnrichedProjectRecord,
  rank: number,
  liveEvents: RadarLiveEvent[],
): RadarEventCard {
  const token = project.resources.tokens[0]
  const sym = token?.symbol ?? project.displayName
  const rating = buildProjectRating(project)
  const onChain = buildOnChainMetrics(project)
  const { risk } = deriveRisk(rating.tier)

  const detectionReasons = [
    project.trustBadges.includes('canonical') ? 'Canonical registry project' : null,
    project.capabilities.liquidity.status === 'live' ? 'Liquidity surface live' : null,
    project.websiteUrl ? 'Website indexed' : null,
    onChain.liquidity === EMPTY ? 'Market liquidity unavailable' : null,
  ].filter(Boolean) as string[]

  return {
    id: `evt-${project.slug}`,
    rank,
    name: sym,
    network: networkLabel(project),
    symbol: sym,
    aiConfidence: rating.score,
    summary: buildAiSummary(project),
    signals: signalsFromProject(project),
    liquidity: onChain.liquidity,
    volume: onChain.volume,
    newHolders: onChain.holders,
    whales: EMPTY,
    contractStatus: onChain.contractVerification,
    contractRisk: risk,
    riskLevel: risk,
    freshness: 'Registry',
    lastDetection: project.asOf,
    detectionReasons: detectionReasons.length ? detectionReasons : ['Registry indexed'],
    confidenceBreakdown: confidenceBreakdown(project),
    riskMatrix: riskMatrix(project),
    timeline: timelineFromEvents(liveEvents, sym),
    contractIntel: [],
    riskScore: Math.max(0, 100 - rating.score),
    gasComplexity: EMPTY,
    intelSummary: buildAiSummary(project),
    projectSlug: project.slug,
    contractAddress: token?.address,
    tradeHref: token?.address ? `/trade?outputCurrency=${token.address}` : '/trade',
    projectHref: `/projects/${project.slug}`,
  }
}

function pendingNetworkLabel(chainId: number): string {
  const label = CHAIN_LABELS[chainId]
  if (label === 'BSC') return 'BNB Chain'
  return label ?? 'Multi-chain'
}

export function mapPendingToRadarEvent(pending: PendingProjectRecord, rank: number): RadarEventCard {
  const sym = pending.symbol.available ? (pending.symbol.value ?? 'Unknown') : 'Unknown'
  const score = pending.health.readiness_score

  return {
    id: `pending-${pending.id}`,
    rank,
    name: sym,
    network: pendingNetworkLabel(pending.chain),
    symbol: sym,
    aiConfidence: score,
    summary: `Pending registry profile — ${formatPendingReviewStatusLabel(pending.status)}. Non-canonical until manual promotion.`,
    signals: ['Contract'],
    liquidity: EMPTY,
    volume: EMPTY,
    newHolders: EMPTY,
    whales: EMPTY,
    contractStatus: 'Pending Review',
    contractRisk: 'Pending',
    riskLevel: 'Pending',
    freshness: 'Pending Registry',
    lastDetection: pending.updated_at,
    detectionReasons: ['Pending registry intake', 'Awaiting review'],
    confidenceBreakdown: [{ label: 'Readiness', value: score }],
    riskMatrix: [{ label: 'Canonical', level: 'yellow', tooltip: 'Not canonical' }],
    timeline: [],
    contractIntel: [{ label: 'Status', value: formatPendingReviewStatusLabel(pending.status), status: 'yellow' }],
    riskScore: Math.max(0, 100 - score),
    gasComplexity: EMPTY,
    intelSummary: `Pending contract ${pending.contract.slice(0, 6)}…${pending.contract.slice(-4)}`,
    contractAddress: pending.contract,
    tradeHref: `/trade?outputCurrency=${pending.contract}`,
    projectHref: `/build-studio?contract=${encodeURIComponent(pending.contract)}#build-import`,
    registryTier: 'pending',
    reviewStatus: formatPendingReviewStatusLabel(pending.status),
  }
}

function deriveRisk(tier: string): { risk: string } {
  switch (tier) {
    case 'exceptional':
    case 'strong':
      return { risk: 'Low' }
    case 'active':
    case 'emerging':
      return { risk: 'Medium' }
    case 'high-risk':
      return { risk: 'Elevated' }
    default:
      return { risk: EMPTY }
  }
}

export function aggregateRadarKpis(
  projects: EnrichedProjectRecord[],
  liveEvents: RadarLiveEvent[],
): RadarKpiItem[] {
  const highConfidence = projects.filter((p) => buildProjectRating(p).confidence >= 70).length
  const riskAlerts = projects.reduce((acc, p) => {
    const reds = buildProjectHealth(p).filter((h) => h.tone === 'red').length
    return acc + (reds >= 2 ? 1 : 0)
  }, 0)

  return [
    { id: 'indexed', label: 'Projects Indexed', value: String(projects.length), delta: '', deltaPositive: true },
    { id: 'signals', label: 'AI Signals', value: String(liveEvents.length), delta: '', deltaPositive: true },
    { id: 'whales', label: 'Whale Alerts', value: '0', delta: '', deltaPositive: true },
    {
      id: 'confidence',
      label: 'High Confidence',
      value: String(highConfidence),
      delta: '',
      deltaPositive: true,
    },
    { id: 'risk', label: 'Risk Alerts', value: String(riskAlerts), delta: '', deltaPositive: false },
  ]
}

export function buildRecentDiscoveries(events: RadarLiveEvent[]): RecentDiscoveryRow[] {
  return events.slice(0, 6).map((e) => ({
    time: e.timestamp,
    project: e.project,
    event: e.event,
    confidence: e.confidence,
  }))
}

export function buildHighestConfidence(projects: EnrichedProjectRecord[]) {
  return [...projects]
    .map((p) => {
      const rating = buildProjectRating(p)
      const sym = p.resources.tokens[0]?.symbol ?? p.displayName
      return {
        project: sym,
        confidence: rating.confidence,
        signal: rating.reason.split('.')[0],
      }
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
}

export function buildTopContracts(projects: EnrichedProjectRecord[]): TopContractRow[] {
  return [...projects]
    .map((p, i) => {
      const rating = buildProjectRating(p)
      const sym = p.resources.tokens[0]?.symbol ?? p.displayName
      return {
        rank: i + 1,
        name: sym,
        symbol: sym,
        confidence: rating.confidence,
        signal: p.trustBadges.includes('canonical') ? 'Canonical · Registry' : 'Registry indexed',
      }
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
}

export function buildWarnings(project: EnrichedProjectRecord): WarningRow[] {
  return buildProjectHealth(project).map((h) => ({
    label: h.label,
    level: h.tone === 'green' ? 'green' : h.tone === 'yellow' ? 'yellow' : 'red',
  }))
}

export function buildAiRecommendation(project: EnrichedProjectRecord) {
  const recs = buildAiRecommendations(project)
  const opp = buildOpportunityScore(project)
  const sym = project.resources.tokens[0]?.symbol ?? project.displayName
  const primary = recs[0]
  return {
    title: 'AI Recommendation',
    action: primary?.text.split('—')[0].trim() ?? `Monitor ${sym} registry signals`,
    detail: opp.summary,
    confidence: `${opp.confidence}%`,
  }
}

export const EMPTY_WHALE_ROWS: WhaleRow[] = []
export const EMPTY_SMART_MONEY: SmartMoneyRow[] = []

export type RadarFilterChip = (typeof import('../radarStudioData').RADAR_FILTER_CHIPS)[number] | string

const CHAIN_FILTER_MAP: Record<string, string[]> = {
  BNB: ['BNB Chain', 'BSC', 'BNB Smart Chain'],
  Ethereum: ['Ethereum'],
  Base: ['Base'],
  Polygon: ['Polygon'],
  Solana: ['Solana'],
}

export function filterRadarEvents(
  events: RadarEventCard[],
  projects: EnrichedProjectRecord[],
  chip: RadarFilterChip,
): RadarEventCard[] {
  if (chip === 'All') return events

  const bySlug = new Map(projects.map((p) => [p.slug, p]))

  const chainMatch = CHAIN_FILTER_MAP[chip]
  if (chainMatch) {
    return events.filter((card) => chainMatch.some((c) => card.network.includes(c)))
  }

  if ((FILTER_CATEGORIES as readonly string[]).includes(chip)) {
    return events.filter((card) => {
      const project = card.projectSlug ? bySlug.get(card.projectSlug) : undefined
      if (!project) return false
      return project.sectorTags.some((t) => t.toLowerCase() === chip.toLowerCase())
    })
  }

  return events.filter((card) => {
    const project = [...bySlug.values()].find(
      (p) => (p.resources.tokens[0]?.symbol ?? p.displayName) === card.name,
    )
    if (!project) return false

    switch (chip) {
      case 'AI Verified':
        return project.trustBadges.includes('canonical')
      case 'Trending':
        return card.aiConfidence >= 70
      case 'New':
        return project.phase === 'registered'
      case 'Liquidity':
        return card.signals.includes('Liquidity')
      case 'Contracts':
        return card.signals.includes('Contract')
      case 'Holder Growth':
        return card.signals.includes('Holder Growth')
      default: {
        const sector = project.sectorTags.join(' ').toLowerCase()
        return sector.includes(chip.toLowerCase())
      }
    }
  })
}

export function sortRadarEvents(events: RadarEventCard[], chip: RadarFilterChip): RadarEventCard[] {
  const copy = [...events]
  switch (chip) {
    case 'Highest Rated':
      return copy.sort((a, b) => b.aiConfidence - a.aiConfidence)
    case 'Highest Liquidity':
      return copy.sort((a, b) => {
        const av = a.liquidity === EMPTY ? 0 : parseFloat(a.liquidity.replace(/[^0-9.]/g, '')) || 0
        const bv = b.liquidity === EMPTY ? 0 : parseFloat(b.liquidity.replace(/[^0-9.]/g, '')) || 0
        return bv - av
      })
    case 'Newest':
    case 'Recently Listed':
      return copy.sort((a, b) => b.lastDetection.localeCompare(a.lastDetection))
    case 'Trending':
    default:
      return copy.sort((a, b) => b.aiConfidence - a.aiConfidence)
  }
}

export function filterLiveEvents(events: RadarLiveEvent[], chip: RadarFilterChip): RadarLiveEvent[] {
  if (chip === 'All') return events
  if (chip === 'Whales') return []
  if (chip === 'Liquidity') return events.filter((e) => e.type === 'liquidity')
  if (chip === 'Contracts') return events.filter((e) => e.type === 'contract')
  if (chip === 'AI Verified') return events.filter((e) => e.type === 'verification' || e.type === 'audit')
  return events
}

export const RADAR_RUNTIME_SCHEMA = 'melega.radar-runtime.v1' as const

export function buildMachinePayload(input: {
  projects: EnrichedProjectRecord[]
  featured?: EnrichedProjectRecord
  opportunity: ReturnType<typeof buildOpportunityScore>
  sources: ReturnType<typeof buildMarketSources>
  liveEvents: RadarLiveEvent[]
  errors: import('./radarRuntimeErrors').RadarRuntimeError[]
  filter: string
}) {
  const token = input.featured?.resources.tokens[0]
  return {
    schema: RADAR_RUNTIME_SCHEMA,
    status: 'ready',
    filter: input.filter,
    timestamp: new Date().toISOString(),
    project: input.featured
      ? {
          slug: input.featured.slug,
          upi: input.featured.upi,
          symbol: token?.symbol,
        }
      : null,
    contract: token?.address ?? null,
    opportunity: input.opportunity,
    signals: input.liveEvents.map((e) => ({
      type: e.type,
      project: e.project,
      event: e.event,
      severity: e.severity,
      source: e.source,
      confidence: e.confidence,
      timestamp: e.timestamp,
    })),
    sources: input.sources.map((s) => ({
      key: s.key,
      available: s.available,
      last_update: s.lastUpdate ?? null,
    })),
    errors: input.errors,
    data_source: 'radar-runtime-projects',
  }
}
