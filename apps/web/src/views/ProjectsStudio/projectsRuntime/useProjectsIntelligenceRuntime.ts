import { useCallback, useEffect, useMemo, useState } from 'react'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { dexIndexToEnrichedProjects, buildDexTokenIndex } from 'views/RadarStudio/radarRuntime/buildDexTokenIndex'
import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { getPendingProjectRegistry } from 'registry/projects/pending'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useTokenDataSWR } from 'state/info/hooks'
import { useHolderCount } from 'lib/holder-count'
import { buildProjectLiveMetrics } from 'lib/projects-data/projectLiveMetrics'
import { useTopMoversSnapshot } from 'views/HomeTrade/TopMoversSnapshotContext'
import {
  formatFeaturedChange,
  formatFeaturedLiquidity,
  formatFeaturedPrice,
  formatFeaturedVolume,
  useFeaturedProjectMarkets,
} from 'views/HomeTrade/useFeaturedProjectMarkets'
import { truthDash } from 'lib/data-truth'
import { formatUsdCompact } from 'lib/bsc-indexer/usdValuation'
import { FOUNDER_WBNB_PAIR_ADDRESSES } from 'lib/bsc-indexer/founderWbnbPairs'
import { getCanonicalIndexedAssets } from 'lib/dex-asset-index'
import type { ProjectFilterChip, ProjectMetric, ProjectPreviewCard, ProjectsKpiItem } from '../projectsStudioData'
import {
  aggregateKpis,
  buildFeaturedProject,
  buildMachineProfile,
  filterProjectsByChip,
  mapIndexedAssetToPreviewCard,
  mapPendingToPreviewCard,
  mapProjectToPreviewCard,
} from './formatProjectsRuntime'
import { buildFeaturedProjectIntelligence } from './buildFeaturedProjectIntelligence'
import { buildAiRecommendations } from './buildAiRecommendations'
import { buildProjectHealth } from './buildProjectHealth'
import { buildProjectRating } from './buildProjectRating'
import { buildMarketSources } from './marketSources'
import type { ProjectsRuntimeError } from './projectsRuntimeErrors'
import useProjectsTerminalData from './useProjectsTerminalData'

export type ProjectsRuntimePhase = 'idle' | 'loading' | 'ready' | 'error'

export interface ProjectsAdvisorRow {
  label: string
  value: string
  score: string
  tone: 'green' | 'gold' | 'gray'
}

export interface ProjectsMachinePayload {
  status: ProjectsRuntimePhase
  filter: string
  indexed: number
  pending?: number
  featured?: string
  errors: ProjectsRuntimeError[]
  timestamp: string
  profile?: ReturnType<typeof buildMachineProfile>
}

export interface ProjectsIntelligenceRuntime {
  phase: ProjectsRuntimePhase
  loadingLabel?: string
  filter: ProjectFilterChip
  setFilter: (chip: ProjectFilterChip) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  projects: ProjectPreviewCard[]
  pendingProjects: ProjectPreviewCard[]
  allProjects: EnrichedProjectRecord[]
  featured: ReturnType<typeof buildFeaturedProject>
  kpis: ProjectsKpiItem[]
  advisorRows: ProjectsAdvisorRow[]
  recommendations: ReturnType<typeof buildAiRecommendations>
  health: ReturnType<typeof buildProjectHealth>
  sources: ReturnType<typeof buildMarketSources>
  terminal: ReturnType<typeof useProjectsTerminalData>
  machine: ProjectsMachinePayload
  indexCoverage: { score: number; label: string }
}

function formatPriceUsd(priceUsd?: number): string | undefined {
  if (priceUsd == null || !Number.isFinite(priceUsd) || priceUsd <= 0) return undefined
  if (priceUsd >= 1000) return `$${priceUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (priceUsd >= 1) return `$${priceUsd.toFixed(2)}`
  if (priceUsd >= 0.0001) return `$${priceUsd.toFixed(6)}`.replace(/0+$/, '').replace(/\.$/, '')
  return '$<0.0001'
}

function formatChangePct(pct?: number | null): string | undefined {
  if (pct == null || !Number.isFinite(pct)) return undefined
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

const FOUNDER_PAIR_BY_SLUG: Record<string, string> = {
  mm72: FOUNDER_WBNB_PAIR_ADDRESSES[0],
  eyed: FOUNDER_WBNB_PAIR_ADDRESSES[1],
  'young-degens': FOUNDER_WBNB_PAIR_ADDRESSES[2],
  blion: FOUNDER_WBNB_PAIR_ADDRESSES[3],
}

function patchMetric(metrics: ProjectMetric[], label: string, value: string): ProjectMetric[] {
  if (!value || value === '—' || value === 'Unavailable') return metrics
  let found = false
  const next = metrics.map((m) => {
    if (m.label !== label && !(label === 'Volume' && m.label === 'Volume 24h')) return m
    found = true
    return { ...m, value, tone: 'green' as const }
  })
  return found ? next : next
}

function enrichCardMetrics(
  base: ProjectPreviewCard,
  opts: {
    mover?: { priceUsd?: number; change24h?: { pct?: number | null }; volume24h?: number }
    featured?: import('lib/bsc-indexer/featuredMarkets').FeaturedMarketRow
  },
): ProjectPreviewCard {
  let metrics = base.metrics
  let priceDisplay = base.priceDisplay
  let change24hPct = base.change24hPct
  let change24hDisplay = base.change24hDisplay
  let rankingLayer = base.rankingLayer

  const featured = opts.featured
  if (featured && featured.status !== 'UNAVAILABLE') {
    const price = formatFeaturedPrice(featured)
    if (price && price !== 'Price updating') priceDisplay = price
    const liq = formatFeaturedLiquidity(featured)
    if (liq && liq !== '—') metrics = patchMetric(metrics, 'Liquidity', liq)
    const vol = formatFeaturedVolume(featured)
    if (vol && vol !== '—' && vol !== 'No recent swaps') metrics = patchMetric(metrics, 'Volume', vol)
    const change = formatFeaturedChange(featured)
    if (!change.empty) {
      change24hDisplay = change.text
      change24hPct = featured.changePct
      rankingLayer = rankingLayer ?? 'featured'
    }
  }

  const mover = opts.mover
  if (mover) {
    priceDisplay = formatPriceUsd(mover.priceUsd) ?? priceDisplay
    const pct = mover.change24h?.pct
    const hasOrganicMove = pct != null && Number.isFinite(pct) && Math.abs(pct) > 0.0001
    if (hasOrganicMove) {
      change24hPct = pct
      change24hDisplay = formatChangePct(pct)
      rankingLayer = 'organic'
    }
    if (mover.volume24h != null && mover.volume24h > 0) {
      metrics = patchMetric(metrics, 'Volume', formatUsdCompact(mover.volume24h))
    }
  }

  return {
    ...base,
    metrics,
    priceDisplay,
    change24hPct,
    change24hDisplay,
    rankingLayer,
    pairAddress:
      opts.featured?.pairAddress ?? FOUNDER_PAIR_BY_SLUG[base.slug] ?? base.pairAddress,
  }
}

export function useProjectsIntelligenceRuntime(): ProjectsIntelligenceRuntime {
  const [filter, setFilter] = useState<ProjectFilterChip>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const marcoPrice = usePriceCakeBusd({ forceMainnet: true })
  const { rankedAssets } = useTopMoversSnapshot()
  const { rowsBySlug: featuredBySlug } = useFeaturedProjectMarkets()

  const enriched = useMemo(() => dexIndexToEnrichedProjects(buildDexTokenIndex()), [])

  const primaryBscToken =
    enriched[0]?.resources.tokens.find((t) => t.chainId === 56) ?? enriched[0]?.resources.tokens[0]
  const tokenData = useTokenDataSWR(primaryBscToken?.address)
  const { data: holderCount } = useHolderCount(primaryBscToken?.chainId ?? 56, primaryBscToken?.address)
  const liveMetrics = useMemo(
    () => (enriched[0] ? buildProjectLiveMetrics(enriched[0], tokenData, holderCount) : undefined),
    [enriched, tokenData, holderCount],
  )

  const pendingRecords = useMemo(() => {
    if (typeof window === 'undefined') return []
    return getPendingProjectRegistry()
      .getAll()
      .filter((p) => p.status !== 'archived' && p.status !== 'rejected')
  }, [])

  const sorted = useMemo(
    () => [...enriched].sort((a, b) => buildProjectRating(b).score - buildProjectRating(a).score),
    [enriched],
  )

  const trendingByAddress = useMemo(() => {
    const map = new Map<string, (typeof rankedAssets)[number]>()
    for (const asset of rankedAssets) {
      if (asset.address) map.set(asset.address.toLowerCase(), asset)
    }
    return map
  }, [rankedAssets])

  const cards = useMemo(() => {
    const canonical = sorted.map((project, index) => {
      const base = mapProjectToPreviewCard(
        project,
        index + 1,
        project.slug === enriched[0]?.slug ? liveMetrics : undefined,
      )
      const addr = base.contractAddress?.toLowerCase()
      const mover = addr ? trendingByAddress.get(addr) : undefined
      const featured = featuredBySlug[project.slug] ?? featuredBySlug[base.slug]
      return enrichCardMetrics(base, { mover, featured })
    })

    // Prioritize cards with factual market signals (featured / price / volume).
    canonical.sort((a, b) => {
      const score = (c: ProjectPreviewCard) => {
        let s = 0
        if (c.featured) s += 100
        if (c.priceDisplay && c.priceDisplay !== '—') s += 20
        if (c.change24hDisplay && c.change24hDisplay !== '—') s += 10
        const liq = c.metrics.find((m) => m.label === 'Liquidity')?.value
        if (liq && liq !== '—' && liq !== 'Unavailable') s += 15
        const vol = c.metrics.find((m) => m.label === 'Volume' || m.label === 'Volume 24h')?.value
        if (vol && vol !== '—' && vol !== 'Unavailable') s += 15
        return s
      }
      return score(b) - score(a)
    })
    canonical.forEach((c, i) => {
      c.rank = i + 1
    })

    const registryAddresses = new Set(
      canonical.map((c) => c.contractAddress?.toLowerCase()).filter(Boolean) as string[],
    )

    const indexedExtras = getCanonicalIndexedAssets()
      .map((asset, index) => {
        if (!asset.address || registryAddresses.has(asset.address.toLowerCase())) return null
        const card = mapIndexedAssetToPreviewCard(asset, canonical.length + index + 1)
        if (!card) return null
        const mover = trendingByAddress.get(asset.address.toLowerCase())
        const featured =
          (asset.registrySlug && featuredBySlug[asset.registrySlug]) ||
          featuredBySlug[card.slug] ||
          undefined
        return enrichCardMetrics(card, { mover, featured })
      })
      .filter((c): c is ProjectPreviewCard => Boolean(c))

    const pending = pendingRecords.map((pending, index) =>
      mapPendingToPreviewCard(pending, canonical.length + indexedExtras.length + index + 1),
    )
    return [...canonical, ...indexedExtras, ...pending]
  }, [sorted, pendingRecords, enriched, liveMetrics, trendingByAddress, featuredBySlug])

  const filtered = useMemo(() => {
    const byChip = filterProjectsByChip(cards, sorted, filter)
    const q = searchQuery.trim().toLowerCase()
    if (!q) return byChip
    return byChip.filter((c) => {
      const hay = `${c.name} ${c.symbol ?? ''} ${c.slug} ${c.contractAddress ?? ''} ${c.category}`.toLowerCase()
      return hay.includes(q)
    })
  }, [cards, sorted, filter, searchQuery])

  const featuredProject = sorted[0] ?? enriched[0]
  const priceUsd = featuredProject?.slug === 'melega-dex' ? marcoPrice?.toNumber() : undefined

  const featured = useMemo(() => {
    if (!featuredProject) {
      return {
        name: '—',
        symbol: '—',
        slug: '',
        verified: false,
        tags: [],
        description: 'No projects indexed in the Melega registry.',
        metrics: [],
        projectHref: '/projects',
        hasPriceData: false,
      }
    }
    return buildFeaturedProject(featuredProject, priceUsd, liveMetrics)
  }, [featuredProject, priceUsd, liveMetrics])

  const kpis = useMemo(
    () =>
      aggregateKpis(enriched, pendingRecords.length, {
        display: truthDash(liveMetrics?.holders.display),
        reasonCode: liveMetrics?.holders.reasonCode,
      }),
    [enriched, pendingRecords.length, liveMetrics],
  )
  const advisorRows = useMemo(
    () => buildFeaturedProjectIntelligence(featuredProject, liveMetrics).slice(0, 5),
    [featuredProject, liveMetrics],
  )
  const terminal = useProjectsTerminalData(enriched)

  const recommendations = useMemo(
    () => (featuredProject ? buildAiRecommendations(featuredProject) : []),
    [featuredProject],
  )

  const health = useMemo(
    () => (featuredProject ? buildProjectHealth(featuredProject) : []),
    [featuredProject],
  )

  const sources = useMemo(
    () => (featuredProject ? buildMarketSources(featuredProject, featuredProject.asOf) : []),
    [featuredProject],
  )

  const indexCoverage = useMemo(() => {
    const available = sources.filter((s) => s.available).length
    const total = sources.length || 1
    const score = Math.round((available / total) * 100)
    const label = score >= 80 ? 'Very High' : score >= 50 ? 'Moderate' : 'Low'
    return { score, label }
  }, [sources])

  const machine: ProjectsMachinePayload = useMemo(
    () => ({
      status: 'ready',
      filter,
      indexed: enriched.length,
      pending: pendingRecords.length,
      featured: featuredProject?.slug,
      errors: [],
      timestamp: new Date().toISOString(),
      profile: featuredProject ? buildMachineProfile(featuredProject) : undefined,
    }),
    [filter, enriched.length, pendingRecords.length, featuredProject],
  )

  const pendingCards = useMemo(() => cards.filter((c) => c.registryTier === 'pending'), [cards])

  const setFilterCb = useCallback((chip: ProjectFilterChip) => setFilter(chip), [])
  const setSearchCb = useCallback((q: string) => setSearchQuery(q), [])

  useEffect(() => {
    emitCivilizationEvent('projects_intelligence_refreshed', 'projects', {
      indexed: enriched.length,
      pending: pendingRecords.length,
    })
  }, [enriched.length, pendingRecords.length])

  return {
    phase: 'ready',
    filter,
    setFilter: setFilterCb,
    searchQuery,
    setSearchQuery: setSearchCb,
    projects: filtered,
    pendingProjects: pendingCards,
    allProjects: enriched,
    featured,
    kpis,
    advisorRows,
    recommendations,
    health,
    sources,
    terminal,
    machine,
    indexCoverage,
  }
}
