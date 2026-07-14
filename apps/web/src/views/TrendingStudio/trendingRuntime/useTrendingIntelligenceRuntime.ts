import { useEffect, useMemo, useState } from 'react'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { dexIndexToEnrichedProjects, buildDexTokenIndex } from 'views/RadarStudio/radarRuntime/buildDexTokenIndex'
import { buildLiveEvents } from 'views/RadarStudio/radarRuntime/buildLiveEvents'
import useDexTrendingRankings from 'views/HomeTrade/useDexTrendingRankings'
import type { TrendingFilterChip } from '../trendingStudioData'
import { buildTrendingMachine } from './buildTrendingMachine'
import {
  aggregateTierTrendingKpis,
  buildRuntimeOpportunity,
  buildTrendingDiscoveries,
  buildTrendingWarnings,
  mapTierRankedAssetToTrendingCard,
  mapTierRankedToHeatmapRows,
} from './formatTrendingRuntime'
import { createTrendingRuntimeError } from './trendingRuntimeErrors'

function filterTierRankedCards<
  T extends { symbol?: string; chain: string; tags: string[]; slug?: string },
>(cards: T[], chip: TrendingFilterChip): T[] {
  if (chip === 'All') return cards
  if (chip === 'BNB') return cards.filter((c) => c.chain.includes('BNB'))
  if (chip === 'AI Verified') {
    return cards.filter((c) => c.tags.some((tag) => tag === 'Canonical' || tag === 'Live Signal'))
  }
  if (chip === 'Highest AI Score') return cards
  if (chip === 'Whale Activity') return []
  if (chip === 'New Listings') {
    return cards.filter((c) => c.tags.includes('Verified Empty'))
  }
  return cards
}

export function useTrendingIntelligenceRuntime() {
  const [filter, setFilter] = useState<TrendingFilterChip>('All')
  const [machineOpen, setMachineOpen] = useState(false)
  const { rankedAssets, trendingEmpty } = useDexTrendingRankings()

  const enriched = useMemo(
    () => dexIndexToEnrichedProjects(buildDexTokenIndex()),
    [],
  )
  const liveEvents = useMemo(() => buildLiveEvents(enriched), [enriched])

  const cards = useMemo(
    () =>
      rankedAssets.map((asset, index) =>
        mapTierRankedAssetToTrendingCard(
          asset,
          index + 1,
          enriched.find((project) =>
            project.resources.tokens.some(
              (token) => token.address?.toLowerCase() === asset.address.toLowerCase(),
            ),
          ),
        ),
      ),
    [rankedAssets, enriched],
  )

  const filteredCards = useMemo(
    () => filterTierRankedCards(cards, filter),
    [cards, filter],
  )

  const heatmap = useMemo(() => mapTierRankedToHeatmapRows(rankedAssets), [rankedAssets])
  const kpis = useMemo(
    () => aggregateTierTrendingKpis(rankedAssets, liveEvents),
    [rankedAssets, liveEvents],
  )
  const discoveries = useMemo(() => buildTrendingDiscoveries(liveEvents), [liveEvents])
  const warnings = useMemo(() => buildTrendingWarnings(enriched), [enriched])
  const featured = filteredCards[0]
  const opportunity = useMemo(
    () =>
      featured
        ? {
            score: featured.signalLabel === 'READY' ? 80 : 40,
            recommendation: featured.signalLabel ?? 'Tier Metrics',
            summary: featured.summary,
            signalLabel: featured.signalLabel ?? 'Tier Metrics',
          }
        : buildRuntimeOpportunity(undefined),
    [featured],
  )

  const runtimeErrors = useMemo(() => {
    const errors = []
    if (trendingEmpty) errors.push(createTrendingRuntimeError('NO_PROJECTS'))
    if (filter === 'Whale Activity') errors.push(createTrendingRuntimeError('INSUFFICIENT_DATA'))
    errors.push(createTrendingRuntimeError('WHALE_UNAVAILABLE'))
    errors.push(createTrendingRuntimeError('SMART_MONEY_UNAVAILABLE'))
    return errors
  }, [trendingEmpty, filter])

  const machine = useMemo(
    () =>
      buildTrendingMachine({
        projects: enriched,
        filter,
        cards: filteredCards.map((c) => ({
          rank: c.rank,
          slug: c.slug ?? '',
          symbol: c.symbol ?? c.name,
          signal: c.signalLabel ?? 'Tier Metrics',
          provenance: c.provenance ?? 'Tier Metrics',
          projectHref: c.projectHref ?? '/projects',
          radarHref: c.radarHref,
        })),
        featured: featured
          ? {
              slug: featured.slug ?? featured.symbol?.toLowerCase() ?? 'unknown',
              runtimeSignal: opportunity.signalLabel,
              score: opportunity.score,
              confidence: opportunity.score,
            }
          : undefined,
      }),
    [enriched, filter, filteredCards, featured, opportunity.signalLabel, opportunity.score],
  )

  const filterEmptyMessage =
    filter === 'Whale Activity'
      ? 'Insufficient Data — whale activity feed is unavailable.'
      : filteredCards.length === 0
        ? 'No tier-ranked assets match this filter yet.'
        : null

  useEffect(() => {
    emitCivilizationEvent('trending_refreshed', 'trending', {
      projectCount: rankedAssets.length,
      cardCount: filteredCards.length,
    })
  }, [rankedAssets.length, filteredCards.length, filter])

  return {
    filter,
    setFilter,
    kpis,
    cards: filteredCards,
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
    phase: rankedAssets.length ? ('ready' as const) : ('unavailable' as const),
  }
}

export type TrendingIntelligenceRuntime = ReturnType<typeof useTrendingIntelligenceRuntime>
