import { describe, expect, it, beforeEach } from 'vitest'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { enrichProject } from 'registry/projects/discovery'
import { resetPendingProjectRegistryForTests } from 'registry/projects/pending'
import { buildLiveEvents } from 'views/RadarStudio/radarRuntime/buildLiveEvents'
import { buildTrendingMachine } from '../buildTrendingMachine'
import {
  aggregateTrendingKpis,
  buildRuntimeOpportunity,
  filterTrendingProjects,
  mapProjectToTrendingCard,
  mapTierRankedAssetToTrendingCard,
} from '../formatTrendingRuntime'
import { createTrendingRuntimeError } from '../trendingRuntimeErrors'

describe('trendingRuntime', () => {
  const projects = getAllProjects().map(enrichProject)

  beforeEach(() => {
    resetPendingProjectRegistryForTests()
  })

  it('maps tier-ranked asset without Unavailable ticker fields', () => {
    const card = mapTierRankedAssetToTrendingCard(
      {
        symbol: 'MARCO',
        slug: 'marco',
        pairSlug: 'marco-wbnb',
        address: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        chainId: 56,
        displayName: 'MARCO',
        tierStatus: 'EMPTY_VERIFIED',
        priceUsd: 0.12,
        volume24h: 0,
        liquidityScore: 1000,
        tradeCount24h: 0,
        rankingSignals: ['liquidity'],
      },
      1,
    )
    expect(card.signalLabel).toBe('EMPTY_VERIFIED')
    expect(card.volume).toBe('—')
    expect(card.growth).toBe('—')
    expect(card.provenance).toMatch(/Tier Metrics/)
  })

  it('maps registry project to trending card with provenance and links', () => {
    const card = mapProjectToTrendingCard(projects[0], 1)
    expect(card.projectHref).toMatch(/^\/projects\//)
    expect(card.signalLabel).not.toBe('Strong Buy')
    expect(card.holders).toBe('Unavailable')
  })

  it('filters projects by chain chip', () => {
    const bnb = filterTrendingProjects(projects, 'BNB')
    expect(bnb.every((p) => p.supportedChains.includes(56))).toBe(true)
  })

  it('returns empty set for whale activity filter', () => {
    expect(filterTrendingProjects(projects, 'Whale Activity')).toHaveLength(0)
  })

  it('aggregates KPIs without fabricated whale counts', () => {
    const events = buildLiveEvents(projects)
    const kpis = aggregateTrendingKpis(projects, events)
    const whale = kpis.find((k) => k.id === 'whales')
    expect(whale?.value).toBe('Unavailable')
  })

  it('uses Runtime Signal language instead of Strong Buy', () => {
    const opp = buildRuntimeOpportunity(projects[0])
    expect(opp.recommendation).not.toMatch(/strong buy/i)
    expect(opp.signalLabel).toMatch(/Runtime Signal|Indexed|Unavailable/)
  })

  it('exports machine-readable trending payload', () => {
    const card = mapProjectToTrendingCard(projects[0], 1)
    const machine = buildTrendingMachine({
      projects,
      filter: 'All',
      cards: [
        {
          rank: card.rank,
          slug: card.slug ?? '',
          symbol: card.symbol ?? card.name,
          signal: card.signalLabel ?? 'Unavailable',
          provenance: card.provenance ?? 'Registry',
          projectHref: card.projectHref ?? '/projects',
        },
      ],
    })
    expect(machine.schema).toBe('melega.trending-runtime/v1')
    expect(machine.availability.whaleMonitor).toBe('unavailable')
  })

  it('exposes runtime error catalog', () => {
    const err = createTrendingRuntimeError('WHALE_UNAVAILABLE')
    expect(err.message).toMatch(/unavailable/i)
  })
})
