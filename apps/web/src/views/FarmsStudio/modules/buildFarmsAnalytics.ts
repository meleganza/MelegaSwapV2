/**
 * FARMS_MODULE_007 — factual Analytics aggregator.
 * No estimation. No prediction. No mock chart values.
 */

import type { FarmPreviewCard } from '../farmsStudioData'
import { farmsAnalytics } from './farmsAnalyticsTokens'
import type {
  AnalyticsSegment,
  FarmsAnalyticsPanelModel,
  FarmsAnalyticsViewModel,
} from './farmsAnalyticsTypes'

type RawFarm = NonNullable<FarmPreviewCard['rawFarm']> & {
  enableEmergencyWithdraw?: boolean
  earningToken?: { symbol?: string }
  liquidity?: { toNumber?: () => number }
  lpTotalInQuoteToken?: unknown
  quoteTokenPriceBusd?: unknown
  multiplier?: string
  isTokenOnly?: boolean
}

function isLpFarm(card: FarmPreviewCard): boolean {
  const pid = card.pid ?? card.rawFarm?.pid
  if (pid === 0) return false
  if ((card.rawFarm as RawFarm | undefined)?.isTokenOnly) return false
  return Boolean(card.rawFarm)
}

function isFinishedLike(card: FarmPreviewCard): boolean {
  const raw = card.rawFarm as RawFarm | undefined
  return card.status === 'finished' || raw?.multiplier === '0X' || card.cta === 'none'
}

function isActiveLike(card: FarmPreviewCard): boolean {
  return (card.status === 'live' || card.status === 'new' || card.status === 'indexing') && !isFinishedLike(card)
}

function hasLiquidity(card: FarmPreviewCard): boolean {
  const liq = (card.rawFarm as RawFarm | undefined)?.liquidity?.toNumber?.()
  return liq != null && Number.isFinite(liq) && liq > 0
}

function liquidityUsd(card: FarmPreviewCard): number | null {
  const liq = (card.rawFarm as RawFarm | undefined)?.liquidity?.toNumber?.()
  if (liq == null || !Number.isFinite(liq) || liq < 0) return null
  return liq
}

function share(count: number, total: number): number | null {
  if (total <= 0) return null
  return (count / total) * 100
}

function formatCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return String(n)
}

function formatPct(pct: number | null): string {
  if (pct == null || !Number.isFinite(pct)) return '—'
  if (pct === 0) return '0%'
  if (pct < 0.1) return '<0.1%'
  return `${pct.toFixed(pct >= 10 ? 0 : 1)}%`
}

function formatUsd(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  if (value === 0) return '$0.00'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function segment(id: string, label: string, count: number, total: number, color: string): AnalyticsSegment {
  return { id, label, count, sharePct: share(count, total), color }
}

function emptyPanels(state: 'loading' | 'unavailable'): FarmsAnalyticsPanelModel[] {
  const titles: FarmsAnalyticsPanelModel['title'][] = [
    'Farm Distribution',
    'Reward Distribution',
    'Participation',
    'Farm Health',
  ]
  const ids: FarmsAnalyticsPanelModel['id'][] = [
    'farm_distribution',
    'reward_distribution',
    'participation',
    'farm_health',
  ]
  return ids.map((id, i) => ({
    id,
    title: titles[i],
    state,
    segments: [],
    stats: [],
    summary: state === 'loading' ? 'Loading…' : '—',
  }))
}

/** Pure builder — factual counts only. */
export function buildFarmsAnalyticsViewModel(input: {
  portfolioFarms: FarmPreviewCard[]
  farmsLoading: boolean
  sourcesFailed?: boolean
}): FarmsAnalyticsViewModel {
  const emptyTotals = {
    active: 0,
    finished: 0,
    withdraw: 0,
    emergency: 0,
    healthy: 0,
    partial: 0,
    unavailable: 0,
    lpUniverse: 0,
  }

  if (input.sourcesFailed && !input.portfolioFarms.length) {
    return {
      state: 'unavailable',
      panels: emptyPanels('unavailable'),
      liveRegion: 'Analytics unavailable',
      totals: emptyTotals,
    }
  }

  if (input.farmsLoading && !input.portfolioFarms.length) {
    return {
      state: 'loading',
      panels: emptyPanels('loading'),
      liveRegion: 'Loading farms analytics',
      totals: emptyTotals,
    }
  }

  const universe = input.portfolioFarms.filter(isLpFarm)
  if (!universe.length) {
    return {
      state: 'unavailable',
      panels: emptyPanels('unavailable'),
      liveRegion: 'Analytics unavailable',
      totals: emptyTotals,
    }
  }

  // —— Farm Distribution (mutually exclusive inventory buckets) ——
  let active = 0
  let emergency = 0
  let withdraw = 0
  let finished = 0
  universe.forEach((card) => {
    if (!isFinishedLike(card)) {
      active += 1
      return
    }
    const raw = card.rawFarm as RawFarm
    if (raw.enableEmergencyWithdraw) {
      emergency += 1
      return
    }
    if (hasLiquidity(card)) {
      withdraw += 1
      return
    }
    finished += 1
  })
  const distTotal = active + finished + emergency + withdraw
  const distSegments = [
    segment('active', 'Active Farms', active, distTotal, farmsAnalytics.colors.active),
    segment('finished', 'Finished Farms', finished, distTotal, farmsAnalytics.colors.finished),
    segment('withdraw', 'Withdraw-only', withdraw, distTotal, farmsAnalytics.colors.withdraw),
    segment('emergency', 'Emergency', emergency, distTotal, farmsAnalytics.colors.emergency),
  ]

  // —— Reward Distribution ——
  const rewardCounts: Record<string, number> = {}
  universe.forEach((card) => {
    const sym = card.rewardToken || (card.rawFarm as RawFarm)?.earningToken?.symbol
    if (!sym || sym === '—') return
    rewardCounts[sym] = (rewardCounts[sym] || 0) + 1
  })
  const rewardEntries = Object.entries(rewardCounts).sort((a, b) => b[1] - a[1])
  const rewardTotal = rewardEntries.reduce((s, [, n]) => s + n, 0)
  const rewardPalette = [farmsAnalytics.gold, farmsAnalytics.green, farmsAnalytics.blue, '#A78BFA', '#FF8A65']
  const rewardSegments = rewardEntries.slice(0, farmsAnalytics.maxRewardTokens).map(([sym, n], i) =>
    segment(sym, sym, n, rewardTotal, rewardPalette[i % rewardPalette.length]),
  )
  const rewardPartial = rewardEntries.length > farmsAnalytics.maxRewardTokens

  // —— Participation ——
  // Unique farming wallet census is not available in runtime → Active farming wallets = —
  // Average position size requires wallet census → —
  const valued: number[] = []
  let unvaluedWithLiquiditySignal = 0
  universe.forEach((card) => {
    const usd = liquidityUsd(card)
    if (usd != null && usd > 0) valued.push(usd)
    else if ((card.rawFarm as RawFarm)?.lpTotalInQuoteToken && !(card.rawFarm as RawFarm)?.quoteTokenPriceBusd) {
      unvaluedWithLiquiditySignal += 1
    }
  })
  const totalStakedLp = valued.length ? valued.reduce((a, b) => a + b, 0) : null
  const participationPartial = unvaluedWithLiquiditySignal > 0 || (valued.length > 0 && valued.length < universe.length)

  // —— Farm Health ——
  let healthy = 0
  let partial = 0
  let unavailable = 0
  universe.forEach((card) => {
    if (card.status === 'indexing') {
      unavailable += 1
      return
    }
    if (isFinishedLike(card)) {
      const raw = card.rawFarm as RawFarm
      if (raw.enableEmergencyWithdraw) return // counted in emergency panel metric below
      return
    }
    const usd = liquidityUsd(card)
    const rewarding = card.emissionState === 'active'
    if (isActiveLike(card) && rewarding && usd != null) {
      healthy += 1
      return
    }
    if (isActiveLike(card)) {
      partial += 1
    }
  })
  const healthSegments = [
    segment('healthy', 'Healthy', healthy, universe.length, farmsAnalytics.colors.healthy),
    segment('partial', 'Partial', partial, universe.length, farmsAnalytics.colors.partial),
    segment('unavailable', 'Unavailable', unavailable, universe.length, farmsAnalytics.colors.unavailable),
    segment('emergency', 'Emergency', emergency, universe.length, farmsAnalytics.colors.emergency),
  ]

  const distPanel: FarmsAnalyticsPanelModel = {
    id: 'farm_distribution',
    title: 'Farm Distribution',
    state: 'ready',
    segments: distSegments,
    stats: distSegments.map((s) => ({
      id: s.id,
      label: s.label,
      value: formatCount(s.count),
      supporting: formatPct(s.sharePct),
    })),
    summary: `${active} active · ${finished + emergency + withdraw} finished`,
  }

  const rewardPanel: FarmsAnalyticsPanelModel = {
    id: 'reward_distribution',
    title: 'Reward Distribution',
    state: rewardTotal === 0 ? 'unavailable' : rewardPartial ? 'partial' : 'ready',
    segments: rewardSegments,
    stats: rewardSegments.map((s) => ({
      id: s.id,
      label: s.label,
      value: formatPct(s.sharePct),
      supporting: `${s.count} farms`,
    })),
    summary:
      rewardTotal === 0
        ? 'Reward token shares unavailable'
        : `${rewardEntries.length} reward token${rewardEntries.length === 1 ? '' : 's'}`,
  }

  const participationPanel: FarmsAnalyticsPanelModel = {
    id: 'participation',
    title: 'Participation',
    state:
      valued.length === 0 && unvaluedWithLiquiditySignal === 0
        ? 'unavailable'
        : participationPartial
          ? 'partial'
          : 'ready',
    segments: [],
    stats: [
      {
        id: 'wallets',
        label: 'Active farming wallets',
        value: '—',
        supporting: 'Unique wallet census unavailable',
      },
      {
        id: 'total_staked',
        label: 'Total staked LP',
        value: formatUsd(totalStakedLp),
        supporting: valued.length ? `${valued.length} valued farms` : 'Valuation unavailable',
      },
      {
        id: 'avg_position',
        label: 'Average position size',
        value: '—',
        supporting: 'Requires wallet census',
      },
    ],
    summary: valued.length ? `Staked LP ${formatUsd(totalStakedLp)}` : 'Participation valuation unavailable',
  }

  const healthPanel: FarmsAnalyticsPanelModel = {
    id: 'farm_health',
    title: 'Farm Health',
    state: unavailable > 0 || partial > 0 || emergency > 0 ? 'partial' : 'ready',
    segments: healthSegments,
    stats: [
      { id: 'healthy', label: 'Healthy', value: formatCount(healthy) },
      { id: 'partial', label: 'Partial', value: formatCount(partial) },
      { id: 'unavailable', label: 'Unavailable', value: formatCount(unavailable) },
      { id: 'emergency', label: 'Emergency', value: formatCount(emergency) },
    ],
    summary: `${formatCount(healthy)} healthy · ${formatCount(emergency)} emergency`,
  }

  const panels = [distPanel, rewardPanel, participationPanel, healthPanel]
  const anyPartial = panels.some((p) => p.state === 'partial')
  const allUnavail = panels.every((p) => p.state === 'unavailable')

  return {
    state: allUnavail ? 'unavailable' : anyPartial ? 'partial' : 'ready',
    panels,
    liveRegion: `Farms analytics · ${active} active · ${emergency} emergency`,
    totals: {
      active,
      finished,
      withdraw,
      emergency,
      healthy,
      partial,
      unavailable,
      lpUniverse: universe.length,
    },
  }
}
