/**
 * LIQUIDITY_MODULE_007 — pure Analytics builder (no invention).
 */
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'
import { TransactionType, type Transaction } from 'state/info/types'
import {
  LIQUIDITY_ANALYTICS_COPY,
  type LiquidityAnalyticsCardId,
  type LiquidityAnalyticsCardState,
} from './liquidityAnalyticsTokens'

export type LiquidityAnalyticsCardModel = {
  id: LiquidityAnalyticsCardId
  label: string
  value: string
  supporting: string
  state: LiquidityAnalyticsCardState
  source: string
  timestamp: string | null
  status: 'ok' | 'unavailable' | 'loading'
}

export type LiquidityAnalyticsView = {
  cards: LiquidityAnalyticsCardModel[]
  phase: 'loading' | 'ready' | 'partial' | 'unavailable'
  fetchedAt: string | null
}

export function formatAnalyticsUsd(value?: number | null): string | null {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) return null
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

/** Factual 24H liquidity change only — never invent growth. */
export function formatLiquidityChange(change?: number | null): string | null {
  if (change === undefined || change === null || !Number.isFinite(change)) return null
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}% 24H`
}

export function countPoolDistribution(pools: ClassifiedAmmPair[]) {
  let tradeable = 0
  let funded = 0
  let active = 0
  for (const p of pools) {
    if (p.classification === 'tradeable') tradeable += 1
    if (p.classification === 'liquidity_present') funded += 1
    if (p.active === true && (p.classification === 'tradeable' || p.classification === 'liquidity_present')) {
      active += 1
    }
  }
  return { total: pools.length, active, tradeable, funded }
}

export function countMintBurnActivity(transactions: Transaction[] | undefined | null) {
  if (!transactions) return null
  let adds = 0
  let removes = 0
  for (const tx of transactions) {
    if (tx.type === TransactionType.MINT) adds += 1
    else if (tx.type === TransactionType.BURN) removes += 1
  }
  return { adds, removes, total: adds + removes }
}

function card(
  id: LiquidityAnalyticsCardId,
  partial: Omit<LiquidityAnalyticsCardModel, 'id' | 'label' | 'source'> & { source?: string },
): LiquidityAnalyticsCardModel {
  const meta = LIQUIDITY_ANALYTICS_COPY.cards[id]
  return {
    id,
    label: meta.label,
    source: partial.source ?? meta.source,
    value: partial.value,
    supporting: partial.supporting,
    state: partial.state,
    timestamp: partial.timestamp,
    status: partial.status,
  }
}

export function buildLiquidityAnalytics(input: {
  protocolLoading: boolean
  protocol?: { liquidityUSD?: number; liquidityUSDChange?: number } | null
  factoryLoading: boolean
  factoryReady: boolean
  factoryUnavailable: boolean
  pools: ClassifiedAmmPair[]
  factoryFreshness?: string | null
  activityLoading: boolean
  activityReady: boolean
  activityUnavailable: boolean
  transactions?: Transaction[] | null
  activitySource?: string | null
  nowIso?: string
}): LiquidityAnalyticsView {
  const now = input.nowIso ?? new Date().toISOString()
  const liquidityFormatted = formatAnalyticsUsd(input.protocol?.liquidityUSD)
  const changeFormatted = liquidityFormatted
    ? formatLiquidityChange(input.protocol?.liquidityUSDChange)
    : null

  const growth = card('growth', {
    value: input.protocolLoading
      ? LIQUIDITY_ANALYTICS_COPY.loading
      : liquidityFormatted ?? LIQUIDITY_ANALYTICS_COPY.emptyMetric,
    supporting: input.protocolLoading
      ? LIQUIDITY_ANALYTICS_COPY.loading
      : liquidityFormatted
        ? changeFormatted ?? 'Current verified liquidity'
        : LIQUIDITY_ANALYTICS_COPY.unavailable,
    state: input.protocolLoading ? 'loading' : liquidityFormatted ? 'available' : 'unavailable',
    timestamp: liquidityFormatted ? now : null,
    status: input.protocolLoading ? 'loading' : liquidityFormatted ? 'ok' : 'unavailable',
  })

  const dist = input.factoryReady ? countPoolDistribution(input.pools) : null
  const distribution = card('distribution', {
    value: input.factoryLoading
      ? LIQUIDITY_ANALYTICS_COPY.loading
      : dist
        ? String(dist.active)
        : LIQUIDITY_ANALYTICS_COPY.emptyMetric,
    supporting: input.factoryLoading
      ? LIQUIDITY_ANALYTICS_COPY.loading
      : dist
        ? `Tradeable ${dist.tradeable} · Funded ${dist.funded} · Total ${dist.total}`
        : input.factoryUnavailable
          ? LIQUIDITY_ANALYTICS_COPY.unavailable
          : LIQUIDITY_ANALYTICS_COPY.unavailable,
    state: input.factoryLoading ? 'loading' : dist ? 'available' : 'unavailable',
    timestamp: dist ? input.factoryFreshness ?? now : null,
    status: input.factoryLoading ? 'loading' : dist ? 'ok' : 'unavailable',
  })

  const activityCounts = input.activityReady ? countMintBurnActivity(input.transactions ?? []) : null
  const activity = card('activity', {
    value: input.activityLoading
      ? LIQUIDITY_ANALYTICS_COPY.loading
      : activityCounts
        ? String(activityCounts.total)
        : LIQUIDITY_ANALYTICS_COPY.emptyMetric,
    supporting: input.activityLoading
      ? LIQUIDITY_ANALYTICS_COPY.loading
      : activityCounts
        ? `${activityCounts.adds} adds · ${activityCounts.removes} removes`
        : LIQUIDITY_ANALYTICS_COPY.unavailable,
    state: input.activityLoading ? 'loading' : activityCounts ? 'available' : 'unavailable',
    timestamp: activityCounts ? now : null,
    status: input.activityLoading ? 'loading' : activityCounts ? 'ok' : 'unavailable',
    source: input.activitySource ?? LIQUIDITY_ANALYTICS_COPY.cards.activity.source,
  })

  const providers = card('providers', {
    value: LIQUIDITY_ANALYTICS_COPY.emptyMetric,
    supporting: LIQUIDITY_ANALYTICS_COPY.cards.providers.unavailableExplain,
    state: 'unavailable',
    timestamp: null,
    status: 'unavailable',
  })

  const cards = [growth, distribution, activity, providers]
  const available = cards.filter((c) => c.state === 'available').length
  const loading = cards.some((c) => c.state === 'loading')
  let phase: LiquidityAnalyticsView['phase'] = 'unavailable'
  if (loading && available === 0) phase = 'loading'
  else if (available === cards.length) phase = 'ready'
  else if (available > 0) phase = 'partial'
  else phase = 'unavailable'

  return {
    cards,
    phase,
    fetchedAt: available > 0 || input.factoryFreshness ? input.factoryFreshness ?? now : null,
  }
}
