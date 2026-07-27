/**
 * LIQUIDITY_MODULE_005 — pure Market Snapshot builder (no invention).
 */
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'
import {
  LIQUIDITY_MARKET_SNAPSHOT_COPY,
  type LiquiditySnapshotCardId,
  type LiquiditySnapshotCardState,
} from './liquidityMarketSnapshotTokens'

export type LiquiditySnapshotCardModel = {
  id: LiquiditySnapshotCardId
  label: string
  value: string
  supporting: string
  state: LiquiditySnapshotCardState
  source: string
  timestamp: string | null
  status: 'ok' | 'unavailable' | 'loading'
}

export type LiquidityMarketSnapshotView = {
  cards: LiquiditySnapshotCardModel[]
  phase: 'loading' | 'ready' | 'partial' | 'unavailable'
  fetchedAt: string | null
}

export function formatSnapshotUsd(value?: number | null): string | null {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) return null
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export function countActivePools(pools: ClassifiedAmmPair[]): number {
  return pools.filter(
    (p) => p.active === true && (p.classification === 'tradeable' || p.classification === 'liquidity_present'),
  ).length
}

function card(
  id: LiquiditySnapshotCardId,
  partial: Omit<LiquiditySnapshotCardModel, 'id' | 'label' | 'source'> & { source?: string },
): LiquiditySnapshotCardModel {
  const meta = LIQUIDITY_MARKET_SNAPSHOT_COPY.cards[id]
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

export function buildLiquidityMarketSnapshot(input: {
  protocolLoading: boolean
  protocol?: { liquidityUSD?: number; volumeUSD?: number } | null
  factoryLoading: boolean
  factoryReady: boolean
  factoryUnavailable: boolean
  pools: ClassifiedAmmPair[]
  factoryFreshness?: string | null
  nowIso?: string
}): LiquidityMarketSnapshotView {
  const now = input.nowIso ?? new Date().toISOString()
  const tvlFormatted = formatSnapshotUsd(input.protocol?.liquidityUSD)
  const volFormatted = formatSnapshotUsd(input.protocol?.volumeUSD)

  const tvl = card('tvl', {
    value: input.protocolLoading
      ? LIQUIDITY_MARKET_SNAPSHOT_COPY.loading
      : tvlFormatted ?? LIQUIDITY_MARKET_SNAPSHOT_COPY.emptyMetric,
    supporting: input.protocolLoading
      ? LIQUIDITY_MARKET_SNAPSHOT_COPY.loading
      : tvlFormatted
        ? 'Verified protocol liquidity'
        : LIQUIDITY_MARKET_SNAPSHOT_COPY.unavailable,
    state: input.protocolLoading ? 'loading' : tvlFormatted ? 'available' : 'unavailable',
    timestamp: tvlFormatted ? now : null,
    status: input.protocolLoading ? 'loading' : tvlFormatted ? 'ok' : 'unavailable',
  })

  const activeCount = input.factoryReady ? countActivePools(input.pools) : null
  const activePools = card('activePools', {
    value: input.factoryLoading
      ? LIQUIDITY_MARKET_SNAPSHOT_COPY.loading
      : activeCount != null
        ? String(activeCount)
        : LIQUIDITY_MARKET_SNAPSHOT_COPY.emptyMetric,
    supporting: input.factoryLoading
      ? LIQUIDITY_MARKET_SNAPSHOT_COPY.loading
      : activeCount != null
        ? 'Active tradeable / funded pools'
        : input.factoryUnavailable
          ? LIQUIDITY_MARKET_SNAPSHOT_COPY.unavailable
          : LIQUIDITY_MARKET_SNAPSHOT_COPY.unavailable,
    state: input.factoryLoading ? 'loading' : activeCount != null ? 'available' : 'unavailable',
    timestamp: activeCount != null ? input.factoryFreshness ?? now : null,
    status: input.factoryLoading ? 'loading' : activeCount != null ? 'ok' : 'unavailable',
  })

  const volume24h = card('volume24h', {
    value: input.protocolLoading
      ? LIQUIDITY_MARKET_SNAPSHOT_COPY.loading
      : volFormatted ?? LIQUIDITY_MARKET_SNAPSHOT_COPY.emptyMetric,
    supporting: input.protocolLoading
      ? LIQUIDITY_MARKET_SNAPSHOT_COPY.loading
      : volFormatted
        ? 'Verified 24H swap volume'
        : LIQUIDITY_MARKET_SNAPSHOT_COPY.unavailable,
    state: input.protocolLoading ? 'loading' : volFormatted ? 'available' : 'unavailable',
    timestamp: volFormatted ? now : null,
    status: input.protocolLoading ? 'loading' : volFormatted ? 'ok' : 'unavailable',
  })

  const lpProviders = card('lpProviders', {
    value: LIQUIDITY_MARKET_SNAPSHOT_COPY.emptyMetric,
    supporting: LIQUIDITY_MARKET_SNAPSHOT_COPY.cards.lpProviders.unavailableExplain,
    state: 'unavailable',
    timestamp: null,
    status: 'unavailable',
  })

  const cards = [tvl, activePools, volume24h, lpProviders]
  const available = cards.filter((c) => c.state === 'available').length
  const loading = cards.some((c) => c.state === 'loading')
  let phase: LiquidityMarketSnapshotView['phase'] = 'unavailable'
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
