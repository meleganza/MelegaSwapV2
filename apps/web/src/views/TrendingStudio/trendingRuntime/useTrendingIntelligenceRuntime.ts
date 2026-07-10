import { useEffect, useMemo, useState } from 'react'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { dexIndexToEnrichedProjects, buildDexTokenIndex } from 'views/RadarStudio/radarRuntime/buildDexTokenIndex'
import { buildLiveEvents } from 'views/RadarStudio/radarRuntime/buildLiveEvents'
import type { TrendingFilterChip } from '../trendingStudioData'
import { buildTrendingMachine } from './buildTrendingMachine'
import {
  aggregateTrendingKpis,
  buildRuntimeOpportunity,
  buildTrendingDiscoveries,
  buildTrendingWarnings,
  filterTrendingProjects,
  mapHeatmapToTrendingRows,
  mapProjectToTrendingCard,
} from './formatTrendingRuntime'
import { createTrendingRuntimeError } from './trendingRuntimeErrors'

export function useTrendingIntelligenceRuntime() {
  const [filter, setFilter] = useState<TrendingFilterChip>('All')
  const [machineOpen, setMachineOpen] = useState(false)

  const enriched = useMemo(
    () => dexIndexToEnrichedProjects(buildDexTokenIndex()),
    [],
  )
  const liveEvents = useMemo(() => buildLiveEvents(enriched), [enriched])

  const filteredProjects = useMemo(
    () => filterTrendingProjects(enriched, filter),
    [enriched, filter],
  )

  const sorted = useMemo(
    () =>
      [...filteredProjects].sort(
        (a, b) =>
          mapProjectToTrendingCard(b, 0).aiScore - mapProjectToTrendingCard(a, 0).aiScore,
      ),
    [filteredProjects],
  )

  const cards = useMemo(
    () => sorted.map((p, i) => mapProjectToTrendingCard(p, i + 1)),
    [sorted],
  )

  const heatmap = useMemo(() => mapHeatmapToTrendingRows(filteredProjects), [filteredProjects])
  const kpis = useMemo(() => aggregateTrendingKpis(enriched, liveEvents), [enriched, liveEvents])
  const discoveries = useMemo(() => buildTrendingDiscoveries(liveEvents), [liveEvents])
  const warnings = useMemo(() => buildTrendingWarnings(enriched), [enriched])
  const featured = sorted[0]
  const opportunity = useMemo(() => buildRuntimeOpportunity(featured), [featured])

  const runtimeErrors = useMemo(() => {
    const errors = []
    if (!enriched.length) errors.push(createTrendingRuntimeError('NO_PROJECTS'))
    if (filter === 'Whale Activity') errors.push(createTrendingRuntimeError('INSUFFICIENT_DATA'))
    errors.push(createTrendingRuntimeError('WHALE_UNAVAILABLE'))
    errors.push(createTrendingRuntimeError('SMART_MONEY_UNAVAILABLE'))
    return errors
  }, [enriched.length, filter])

  const machine = useMemo(
    () =>
      buildTrendingMachine({
        projects: enriched,
        filter,
        cards: cards.map((c) => ({
          rank: c.rank,
          slug: c.slug ?? '',
          symbol: c.symbol ?? c.name,
          signal: c.signalLabel ?? 'Unavailable',
          provenance: c.provenance ?? 'Registry',
          projectHref: c.projectHref ?? '/projects',
          radarHref: c.radarHref,
        })),
        featured: featured
          ? {
              slug: featured.slug,
              runtimeSignal: opportunity.signalLabel,
              score: opportunity.score,
              confidence: buildRuntimeOpportunity(featured).score,
            }
          : undefined,
      }),
    [enriched, filter, cards, featured, opportunity.signalLabel, opportunity.score],
  )

  const filterEmptyMessage =
    filter === 'Whale Activity'
      ? 'Insufficient Data — whale activity feed is unavailable.'
      : cards.length === 0
        ? 'Insufficient Data — no projects match this filter.'
        : null

  useEffect(() => {
    emitCivilizationEvent('trending_refreshed', 'trending', {
      projectCount: enriched.length,
      cardCount: cards.length,
    })
  }, [enriched.length, cards.length, filter])

  return {
    filter,
    setFilter,
    kpis,
    cards,
    heatmap,
    discoveries,
    warnings,
    opportunity,
    whaleAvailable: false as const,
    smartMoneyAvailable: false as const,
    runtimeErrors,
    machine,
    machineOpen,
    setMachineOpen,
    filterEmptyMessage,
    phase: enriched.length ? ('ready' as const) : ('unavailable' as const),
  }
}

export type TrendingIntelligenceRuntime = ReturnType<typeof useTrendingIntelligenceRuntime>
