import { useCallback, useMemo, useState } from 'react'
import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { getPendingProjectRegistry } from 'registry/projects/pending'
import { usePriceCakeBusd } from 'state/farms/hooks'
import type { ProjectFilterChip, ProjectPreviewCard, ProjectsKpiItem } from '../projectsStudioData'
import {
  aggregateKpis,
  buildAdvisorRows,
  buildFeaturedProject,
  buildMachineProfile,
  filterProjectsByChip,
  mapPendingToPreviewCard,
  mapProjectToPreviewCard,
} from './formatProjectsRuntime'
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
  tone: 'green' | 'gold'
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
  projects: ProjectPreviewCard[]
  pendingProjects: ProjectPreviewCard[]
  allProjects: ReturnType<typeof enrichProject>[]
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

export function useProjectsIntelligenceRuntime(): ProjectsIntelligenceRuntime {
  const [filter, setFilter] = useState<ProjectFilterChip>('All')
  const marcoPrice = usePriceCakeBusd({ forceMainnet: true })

  const enriched = useMemo(() => getAllProjects().map(enrichProject), [])

  const pendingRecords = useMemo(() => {
    if (typeof window === 'undefined') return []
    return getPendingProjectRegistry()
      .getAll()
      .filter((p) => p.status !== 'archived' && p.status !== 'rejected')
  }, [])

  const sorted = useMemo(
    () =>
      [...enriched].sort(
        (a, b) => buildProjectRating(b).score - buildProjectRating(a).score,
      ),
    [enriched],
  )

  const cards = useMemo(() => {
    const canonical = sorted.map((project, index) => mapProjectToPreviewCard(project, index + 1))
    const pending = pendingRecords.map((pending, index) =>
      mapPendingToPreviewCard(pending, canonical.length + index + 1),
    )
    return [...canonical, ...pending]
  }, [sorted, pendingRecords])

  const filtered = useMemo(
    () => filterProjectsByChip(cards, sorted, filter),
    [cards, sorted, filter],
  )

  const featuredProject = sorted[0] ?? enriched[0]
  const priceUsd = featuredProject?.slug === 'melega-dex' ? marcoPrice?.toNumber() : undefined

  const featured = useMemo(() => {
    if (!featuredProject) {
      return {
        name: 'Unavailable',
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
    return buildFeaturedProject(featuredProject, priceUsd)
  }, [featuredProject, priceUsd])

  const kpis = useMemo(() => aggregateKpis(enriched, pendingRecords.length), [enriched, pendingRecords.length])
  const advisorRows = useMemo(() => buildAdvisorRows(sorted), [sorted])
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

  const pendingCards = useMemo(
    () => cards.filter((c) => c.registryTier === 'pending'),
    [cards],
  )

  const setFilterCb = useCallback((chip: ProjectFilterChip) => setFilter(chip), [])

  return {
    phase: 'ready',
    filter,
    setFilter: setFilterCb,
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
