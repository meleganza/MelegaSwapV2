import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { buildSurfaceEnvelope, type MelegaSurfaceEnvelope } from 'lib/surface-envelope'
import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { getPendingProjectRegistry } from 'registry/projects/pending'
import { formatPendingReviewStatusLabel } from 'registry/projects/pending/updatePendingReview'
import { discoverProjectFromContract, getPendingDiscoverySummary } from 'views/ProjectsStudio/projectsRuntime/discoverProjectFromContract'
import { buildMarketSources } from 'views/ProjectsStudio/projectsRuntime/marketSources'
import type { ContractPreviewData } from '../radarStudioData'
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
  mapPendingToRadarEvent,
  sortRadarEvents,
  type RadarFilterChip,
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

  const enriched = useMemo(() => getAllProjects().map(enrichProject), [])

  const pendingRecords = useMemo(() => {
    if (typeof window === 'undefined') return []
    return getPendingProjectRegistry()
      .getAll()
      .filter((p) => p.status !== 'archived' && p.status !== 'rejected')
  }, [])

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
    const canonical = sorted.map((p, i) => mapProjectToRadarEvent(p, i + 1, liveEvents))
    const pending = pendingRecords.map((p, i) => mapPendingToRadarEvent(p, canonical.length + i + 1))
    const cards = [...canonical, ...pending]
    const filtered = filterRadarEvents(cards, enriched, filter)
    return sortRadarEvents(filtered, filter)
  }, [sorted, liveEvents, enriched, filter, pendingRecords])

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

  const machine: MelegaSurfaceEnvelope = useMemo(() => {
    const reasonCodes: Record<string, string> = {}
    runtimeErrors.forEach((e) => {
      reasonCodes[e.code] = e.message
    })
    return buildSurfaceEnvelope({
      module: 'radar',
      runtime: buildMachinePayload({
        projects: enriched,
        featured,
        opportunity,
        sources,
        liveEvents: filteredLiveEvents,
        errors: runtimeErrors,
        filter,
      }),
      reasonCodes,
      sources: ['registry', 'contract-intelligence'],
    })
  }, [enriched, featured, opportunity, sources, filteredLiveEvents, runtimeErrors, filter])

  const runContractPreview = useCallback(
    (address?: string, chain?: string) => {
      const raw = (address ?? contractInput).trim()
      const chainId = CHAIN_ID_BY_LABEL[chain ?? chainLabel] ?? 56
      const discovery = discoverProjectFromContract(raw, chainId)
      const errors: RadarRuntimeError[] = [...discovery.errors]

      if (!discovery.found || !discovery.project) {
        if (discovery.registryTier === 'pending' && discovery.pending) {
          const pending = discovery.pending
          setRuntimeErrors(errors)
          setContractPreview({
            address: raw ? `${raw.slice(0, 6)}…${raw.slice(-4)}` : 'Unavailable',
            network: chain ?? chainLabel,
            score: pending.health.readiness_score,
            metrics: [
              { label: 'Status', status: 'yellow', description: formatPendingReviewStatusLabel(pending.status) },
              { label: 'Readiness', status: 'yellow', description: `${pending.health.readiness_score}/100` },
            ],
            operationalSummary: getPendingDiscoverySummary(pending),
            provenance: ['Pending registry intake'],
            lastUpdated: pending.updated_at,
            freshness: 'Pending Registry',
            evidenceCount: 1,
            aiVersion: 'Melega Radar Runtime v1',
          })
          setPreviewOpen(true)
          return
        }

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
      } else if (discovery.registryTier === 'pending' && discovery.pending) {
        const pending = discovery.pending
        setRuntimeErrors(discovery.errors)
        setContractPreview({
          address: `${q.slice(0, 6)}…${q.slice(-4)}`,
          network: chainLabel,
          score: pending.health.readiness_score,
          metrics: [
            { label: 'Status', status: 'yellow', description: formatPendingReviewStatusLabel(pending.status) },
            { label: 'Readiness', status: 'yellow', description: `${pending.health.readiness_score}/100` },
          ],
          operationalSummary: getPendingDiscoverySummary(pending),
          provenance: ['Pending registry intake'],
          lastUpdated: pending.updated_at,
          freshness: 'Pending Registry',
          evidenceCount: 1,
          aiVersion: 'Melega Radar Runtime v1',
        })
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
  }
}

export type RadarIntelligenceRuntime = ReturnType<typeof useRadarIntelligenceRuntime>
