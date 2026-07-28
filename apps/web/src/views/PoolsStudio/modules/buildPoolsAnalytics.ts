/**
 * POOLS_MODULE_007 — factual Analytics aggregator.
 * No estimation. No prediction. No mock chart values.
 */

import BigNumber from 'bignumber.js'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { PoolPreviewCard } from '../poolsStudioData'
import { poolsAnalytics } from './poolsAnalyticsTokens'
import type {
  AnalyticsSegment,
  PoolsAnalyticsPanelModel,
  PoolsAnalyticsViewModel,
} from './poolsAnalyticsTypes'

function isSmartChef(card: PoolPreviewCard): boolean {
  return Boolean(card.rawPool) && !card.id.startsWith('amm-')
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

function poolUsd(card: PoolPreviewCard): number | null {
  const pool = card.rawPool
  if (!pool?.stakingToken?.decimals) return null
  const staked = getBalanceNumber(pool.totalStaked ?? new BigNumber(0), pool.stakingToken.decimals)
  const price = pool.stakingTokenPrice || 0
  if (!(price > 0)) return null
  return staked * price
}

export function buildPoolsAnalyticsViewModel(input: {
  portfolioPools: PoolPreviewCard[]
  poolsLoading: boolean
  sourcesFailed?: boolean
  classificationRewarding?: number | null
}): PoolsAnalyticsViewModel {
  const emptyTotals = {
    active: 0,
    ended: 0,
    emergency: 0,
    withdraw: 0,
    rewarding: 0,
    smartChefUniverse: 0,
  }

  if (input.sourcesFailed && !input.portfolioPools.length) {
    return {
      state: 'unavailable',
      panels: emptyPanels('unavailable'),
      liveRegion: 'Analytics unavailable',
      totals: emptyTotals,
    }
  }

  if (input.poolsLoading && !input.portfolioPools.length) {
    return {
      state: 'loading',
      panels: emptyPanels('loading'),
      liveRegion: 'Loading pools analytics',
      totals: emptyTotals,
    }
  }

  const universe = input.portfolioPools.filter(isSmartChef)
  if (!universe.length) {
    return {
      state: 'unavailable',
      panels: emptyPanels('unavailable'),
      liveRegion: 'Analytics unavailable',
      totals: emptyTotals,
    }
  }

  // —— Pool Distribution (mutually exclusive inventory buckets) ——
  let active = 0
  let emergency = 0
  let withdraw = 0
  let ended = 0
  universe.forEach((card) => {
    const isEnded = card.status === 'ended' || card.displayStatus === 'ENDED'
    if (!isEnded) {
      active += 1
      return
    }
    if (card.rawPool?.enableEmergencyWithdraw) {
      emergency += 1
      return
    }
    const hasStake = Boolean(card.rawPool?.totalStaked?.gt?.(0))
    if (hasStake) {
      withdraw += 1
      return
    }
    ended += 1
  })
  const distTotal = active + ended + emergency + withdraw
  const distSegments = [
    segment('active', 'Active', active, distTotal, poolsAnalytics.colors.active),
    segment('ended', 'Ended', ended, distTotal, poolsAnalytics.colors.ended),
    segment('emergency', 'Emergency', emergency, distTotal, poolsAnalytics.colors.emergency),
    segment('withdraw', 'Withdraw', withdraw, distTotal, poolsAnalytics.colors.withdraw),
  ]

  // —— Reward Distribution (token share of live+inventory SmartChef) ——
  const rewardCounts: Record<string, number> = {}
  universe.forEach((card) => {
    const sym = card.rewardToken || card.rawPool?.earningToken?.symbol
    if (!sym || sym === '—') return
    rewardCounts[sym] = (rewardCounts[sym] || 0) + 1
  })
  const rewardEntries = Object.entries(rewardCounts).sort((a, b) => b[1] - a[1])
  const rewardTotal = rewardEntries.reduce((s, [, n]) => s + n, 0)
  const rewardPalette = [poolsAnalytics.gold, poolsAnalytics.green, poolsAnalytics.blue, '#A78BFA', '#FF8A65']
  const rewardSegments = rewardEntries.slice(0, poolsAnalytics.maxRewardTokens).map(([sym, n], i) =>
    segment(sym, sym, n, rewardTotal, rewardPalette[i % rewardPalette.length]),
  )
  const rewardPartial = rewardEntries.length > poolsAnalytics.maxRewardTokens

  // —— Participation ——
  // Unique ecosystem wallet census is not available in runtime → Wallets = —
  const valued: number[] = []
  let unvaluedWithStake = 0
  universe.forEach((card) => {
    const usd = poolUsd(card)
    if (usd != null) valued.push(usd)
    else if (card.rawPool?.totalStaked?.gt?.(0)) unvaluedWithStake += 1
  })
  const avgPoolSize = valued.length ? valued.reduce((a, b) => a + b, 0) / valued.length : null
  const poolsWithStake = universe.filter((c) => c.rawPool?.totalStaked?.gt?.(0)).length
  const avgStake = valued.length ? avgPoolSize : null
  const participationPartial = unvaluedWithStake > 0 || (valued.length > 0 && valued.length < universe.length)

  // —— Pool Health ——
  let healthy = 0
  let partial = 0
  let unavailable = 0
  let rewarding = 0
  universe.forEach((card) => {
    const isRewarding = Boolean(card.lifecycle?.rewarding)
    if (isRewarding) rewarding += 1
    if (card.hiddenReason || card.visibilityStatus === 'HIDDEN' || card.displayStatus === 'INDEXING') {
      unavailable += 1
      return
    }
    const live = card.status === 'live' || card.displayStatus === 'LIVE'
    const usd = poolUsd(card)
    if (live && isRewarding && usd != null) {
      healthy += 1
      return
    }
    if (live) {
      partial += 1
      return
    }
    // Ended / non-live without hidden flag — not counted as healthy
  })
  // Prefer classification rewarding when provided (canonical), else inventory count
  const rewardingCount =
    typeof input.classificationRewarding === 'number' && Number.isFinite(input.classificationRewarding)
      ? input.classificationRewarding
      : rewarding
  // Health metrics are independent factual counts (not a mutual-exclusive pie).
  // Shares are vs SmartChef universe so percentages stay honest.
  const healthSegments = [
    segment('healthy', 'Healthy', healthy, universe.length, poolsAnalytics.colors.healthy),
    segment('partial', 'Partial', partial, universe.length, poolsAnalytics.colors.partial),
    segment('unavailable', 'Unavailable', unavailable, universe.length, poolsAnalytics.colors.unavailable),
    segment('rewarding', 'Rewarding', rewardingCount, universe.length, poolsAnalytics.colors.rewarding),
  ]

  const rewardingPct = share(rewardingCount, active > 0 ? active : universe.length)

  const distPanel: PoolsAnalyticsPanelModel = {
    id: 'pool_distribution',
    title: 'Pool Distribution',
    state: 'ready',
    segments: distSegments,
    stats: distSegments.map((s) => ({
      id: s.id,
      label: s.label,
      value: formatCount(s.count),
      supporting: formatPct(s.sharePct),
    })),
    summary: `${active} active · ${ended + emergency + withdraw} finished`,
  }

  const rewardPanel: PoolsAnalyticsPanelModel = {
    id: 'reward_distribution',
    title: 'Reward Distribution',
    state: rewardTotal === 0 ? 'unavailable' : rewardPartial ? 'partial' : 'ready',
    segments: rewardSegments,
    stats: rewardSegments.map((s) => ({
      id: s.id,
      label: s.label,
      value: formatPct(s.sharePct),
      supporting: `${s.count} pools`,
    })),
    summary:
      rewardTotal === 0
        ? 'Reward token shares unavailable'
        : `${rewardEntries.length} reward token${rewardEntries.length === 1 ? '' : 's'}`,
  }

  const participationPanel: PoolsAnalyticsPanelModel = {
    id: 'participation',
    title: 'Participation',
    state: valued.length === 0 && unvaluedWithStake === 0 ? 'unavailable' : participationPartial ? 'partial' : 'ready',
    segments: [],
    stats: [
      {
        id: 'wallets',
        label: 'Wallets',
        value: '—',
        supporting: 'Unique wallet census unavailable',
      },
      {
        id: 'avg_stake',
        label: 'Average stake',
        value: formatUsd(avgStake),
        supporting: valued.length ? `${valued.length} valued pools` : 'Valuation unavailable',
      },
      {
        id: 'avg_pool',
        label: 'Average pool size',
        value: formatUsd(avgPoolSize),
        supporting: poolsWithStake ? `${poolsWithStake} with stake` : 'No stake locked',
      },
    ],
    summary: valued.length ? `Avg size ${formatUsd(avgPoolSize)}` : 'Participation valuation unavailable',
  }

  const healthPanel: PoolsAnalyticsPanelModel = {
    id: 'pool_health',
    title: 'Pool Health',
    state: unavailable > 0 || partial > 0 ? 'partial' : 'ready',
    segments: healthSegments,
    stats: [
      { id: 'healthy', label: 'Healthy', value: formatCount(healthy) },
      { id: 'partial', label: 'Partial', value: formatCount(partial) },
      { id: 'unavailable', label: 'Unavailable', value: formatCount(unavailable) },
      {
        id: 'rewarding',
        label: 'Rewarding',
        value: formatCount(rewardingCount),
        supporting: formatPct(rewardingPct),
      },
    ],
    summary: `${formatPct(rewardingPct)} of pools rewarding`,
  }

  const panels = [distPanel, rewardPanel, participationPanel, healthPanel]
  const anyPartial = panels.some((p) => p.state === 'partial')
  const anyUnavail = panels.every((p) => p.state === 'unavailable')

  return {
    state: anyUnavail ? 'unavailable' : anyPartial ? 'partial' : 'ready',
    panels,
    liveRegion: `Pools analytics · ${active} active · ${rewardingCount} rewarding`,
    totals: {
      active,
      ended,
      emergency,
      withdraw,
      rewarding: rewardingCount,
      smartChefUniverse: universe.length,
    },
  }
}

function emptyPanels(state: 'loading' | 'unavailable'): PoolsAnalyticsPanelModel[] {
  const titles: PoolsAnalyticsPanelModel['title'][] = [
    'Pool Distribution',
    'Reward Distribution',
    'Participation',
    'Pool Health',
  ]
  const ids: PoolsAnalyticsPanelModel['id'][] = [
    'pool_distribution',
    'reward_distribution',
    'participation',
    'pool_health',
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
