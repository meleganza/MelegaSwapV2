import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { dexIndexToEnrichedProjects, buildDexTokenIndex } from './buildDexTokenIndex'
import { discoverProjectFromContract } from 'views/ProjectsStudio/projectsRuntime/discoverProjectFromContract'
import { buildMarketSources } from 'views/ProjectsStudio/projectsRuntime/marketSources'
import type { ContractPreviewData, RadarFilterChip } from '../radarStudioData'
import { buildContractIntelligence } from './buildContractIntelligence'
import { buildHeatmapRows } from './buildHeatmap'
import { buildLiveEvents } from './buildLiveEvents'
import { buildOpportunityScore } from './buildOpportunityScore'
import {
  aggregateRadarKpis,
  buildAiRecommendation,
  buildHighestConfidence,
  buildMachinePayload,
  buildRecentDiscoveries,
  buildTopContracts,
  buildWarnings,
  EMPTY_SMART_MONEY,
  EMPTY_WHALE_ROWS,
  filterLiveEvents,
  filterRadarEvents,
  mapProjectToRadarEvent,
} from './formatRadarRuntime'
import { createRadarRuntimeError, type RadarRuntimeError } from './radarRuntimeErrors'

const CHAIN_ID_BY_LABEL: Record<string, number> = {
  'BNB Smart Chain': 56,
  Ethereum: 1,
  Base: 8453,
  Polygon: 137,
}

export function useRadarIntelligenceRuntime() {
  const router = useRouter()
  const [filter, setFilter] = useState<RadarFilterChip>('All')
  const [contractInput, setContractInput] = useState('')
  const [chainLabel, setChainLabel] = useState('BNB Smart Chain')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [contractPreview, setContractPreview] = useState<ContractPreviewData | null>(null)
  const [runtimeErrors, setRuntimeErrors] = useState<RadarRuntimeError[]>([])

  const enriched = useMemo(
    () => dexIndexToEnrichedProjects(buildDexTokenIndex()),
    [],
  )

  const liveEvents = useMemo(() => buildLiveEvents(enriched), [enriched])
  const filteredLiveEvents = useMemo(
    () => filterLiveEvents(liveEvents, filter),
    [liveEvents, filter],
  )

  const sorted = useMemo(
    () =>
      [...enriched].sort(
        (a, b) =>
          buildOpportunityScore(b).score - buildOpportunityScore(a).score,
      ),
    [enriched],
  )

  const featured = sorted[0]

  const discoveries = useMemo(() => {
    const cards = sorted.map((p, i) => mapProjectToRadarEvent(p, i + 1, liveEvents))
    return filterRadarEvents(cards, enriched, filter)
  }, [sorted, liveEvents, enriched, filter])

  const kpis = useMemo(() => aggregateRadarKpis(enriched, liveEvents), [enriched, liveEvents])
  const heatmap = useMemo(() => buildHeatmapRows(enriched), [enriched])
  const opportunity = useMemo(
    () => (featured ? buildOpportunityScore(featured) : { score: 0, recommendation: 'Unavailable', confidence: 0, reasons: [], summary: 'No indexed projects.' }),
    [featured],
  )
  const warnings = useMemo(() => (featured ? buildWarnings(featured) : []), [featured])
  const recentDiscoveries = useMemo(() => buildRecentDiscoveries(filteredLiveEvents), [filteredLiveEvents])
  const highestConfidence = useMemo(() => buildHighestConfidence(enriched), [enriched])
  const topContracts = useMemo(() => buildTopContracts(enriched), [enriched])
  const aiRecommendation = useMemo(
    () =>
      featured
        ? buildAiRecommendation(featured)
        : { title: 'AI Recommendation', action: 'Unavailable', detail: 'No indexed projects.', confidence: '—' },
    [featured],
  )
  const sources = useMemo(
    () => (featured ? buildMarketSources(featured, featured.asOf) : []),
    [featured],
  )

  const machine = useMemo(
    () =>
      buildMachinePayload({
        projects: enriched,
        featured,
        opportunity,
        sources,
        liveEvents: filteredLiveEvents,
        errors: runtimeErrors,
        filter,
      }),
    [enriched, featured, opportunity, sources, filteredLiveEvents, runtimeErrors, filter],
  )

  const runContractPreview = useCallback(
    (address?: string, chain?: string) => {
      const raw = (address ?? contractInput).trim()
      const chainId = CHAIN_ID_BY_LABEL[chain ?? chainLabel] ?? 56
      const discovery = discoverProjectFromContract(raw, chainId)
      const errors: RadarRuntimeError[] = [...discovery.errors]

      if (!discovery.found || !discovery.project) {
        errors.push(createRadarRuntimeError('PROJECT_NOT_INDEXED'))
        setRuntimeErrors(errors)
        setContractPreview({
          address: raw ? `${raw.slice(0, 6)}…${raw.slice(-4)}` : 'Unavailable',
          network: chain ?? chainLabel,
          score: 0,
          metrics: [{ label: 'Contract', status: 'yellow', description: 'Unavailable' }],
          operationalSummary: errors.map((e) => e.message).join(' '),
          provenance: [],
          lastUpdated: '—',
          freshness: 'Unavailable',
          evidenceCount: 0,
          aiVersion: 'Melega Radar Runtime v1',
        })
        setPreviewOpen(true)
        return
      }

      const { preview, errors: intelErrors } = buildContractIntelligence(
        discovery.project,
        raw,
        chainId,
      )
      setRuntimeErrors([...errors, ...intelErrors])
      setContractPreview(preview)
      setPreviewOpen(true)
    },
    [contractInput, chainLabel],
  )

  useEffect(() => {
    const q = router.query.contract
    if (typeof q === 'string' && q.startsWith('0x')) {
      setContractInput(q)
      const chainId = CHAIN_ID_BY_LABEL[chainLabel] ?? 56
      const discovery = discoverProjectFromContract(q, chainId)
      if (discovery.found && discovery.project) {
        const { preview, errors: intelErrors } = buildContractIntelligence(discovery.project, q, chainId)
        setRuntimeErrors([...discovery.errors, ...intelErrors])
        setContractPreview(preview)
        setPreviewOpen(true)
      }
    }
  }, [router.query.contract, chainLabel])

  const setFilterCb = useCallback((chip: RadarFilterChip) => setFilter(chip), [])

  return {
    filter,
    setFilter: setFilterCb,
    kpis,
    liveEvents: filteredLiveEvents,
    discoveries,
    heatmap,
    whales: EMPTY_WHALE_ROWS,
    smartMoney: EMPTY_SMART_MONEY,
    walletAccumulation: EMPTY_WHALE_ROWS,
    opportunity,
    warnings,
    recentDiscoveries,
    highestConfidence,
    topContracts,
    aiRecommendation,
    sources,
    machine,
    featured,
    contractInput,
    setContractInput,
    chainLabel,
    setChainLabel,
    previewOpen,
    setPreviewOpen,
    contractPreview,
    runtimeErrors,
    runContractPreview,
    hasRuntimeData: enriched.length > 0,
    intelligenceFeedsAvailable: false as const,
    whaleFeedAvailable: false as const,
    smartMoneyFeedAvailable: false as const,
  }
}

export type RadarIntelligenceRuntime = ReturnType<typeof useRadarIntelligenceRuntime>
