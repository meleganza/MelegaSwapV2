/**
 * Global Data Truth Layer — single read facade for Melega DEX surfaces.
 *
 * Does NOT modify Smart Swap, Router, AMM, contracts, treasury, fees, wallet, or Payment Router.
 * Does NOT import view-layer modules (keeps lib → views cycle-free).
 */
export { truthDash, truthNumberOrDash, isMissingTruthValue } from './truthDisplay'
export { compareYieldTruthDesc, GLOBAL_DATA_TRUTH_PIPELINE, type YieldTruthSortKeys } from './yieldTruthRanking'

export {
  resolveFarmLiquidityUsd,
  resolveFarmAprPercent,
  resolvePoolTvlUsd,
  resolvePoolAprPercent,
  resolvePoolVolumeDisplay,
  resolvePoolFeesDisplay,
  farmPairLabel,
  poolPairLabel,
  formatYieldUsdOrUnavailable,
} from './yieldMetricHelpers'

export {
  listNormalizedFarms,
  farmIdentity,
  poolIdentity,
  countNormalizedFarmsByChain,
  poolInventoryCount,
  LIVE_YIELD_CHAIN_IDS,
} from './globalYieldInventory'

export {
  countLiveActiveFarmConfigs,
  countLivePoolConfigs,
  listLiveFarmInventoryPreview,
  listLivePoolInventoryPreview,
  liveInventoryProvenance,
} from './liveInventoryCounts'

export { buildGlobalFarmPreviewCards, mergeFarmPreviewCards } from './farmConfigPreviewCards'
export { buildGlobalPoolPreviewCards, mergePoolPreviewCards, listGeneratedLivePools } from './poolConfigPreviewCards'

export { useCanonicalMarketSnapshot } from 'lib/market-data'

import type { FeaturedMarketRow } from 'lib/bsc-indexer/featuredMarkets'
import { formatUsdCompact, formatUsdPrice } from 'lib/bsc-indexer/usdValuation'
import { truthDash } from './truthDisplay'
import { GLOBAL_DATA_TRUTH_PIPELINE } from './yieldTruthRanking'

export type ProjectTruthMarketView = {
  price: string
  change24h: string
  changePositive?: boolean
  volume: string
  liquidity: string
  marketCap: string
  fdv: string
  transactions: string
  holders: string
  pairAddress?: string
  lastUpdate: string
  status: string
  pipeline: typeof GLOBAL_DATA_TRUTH_PIPELINE
}

function formatPrice(row: FeaturedMarketRow): string {
  if (row.latestPriceUsd != null && row.latestPriceUsd > 0) return formatUsdPrice(row.latestPriceUsd)
  return '—'
}

function formatChange(row: FeaturedMarketRow): { text: string; positive?: boolean; empty: boolean } {
  if (row.changePct == null || !Number.isFinite(row.changePct)) {
    return { text: '—', empty: true }
  }
  const positive = row.changePct >= 0
  const arrow = positive ? '↑' : '↓'
  return { text: `${arrow} ${Math.abs(row.changePct).toFixed(2)}%`, positive, empty: false }
}

/**
 * Build a consumer market view from a Featured indexer row (same SSOT as Home Featured).
 * Missing fields → "—". Never invents.
 */
export function buildProjectTruthMarketFromFeatured(
  row: FeaturedMarketRow | null | undefined,
  opts?: { holders?: string | null; lastUpdate?: string | null },
): ProjectTruthMarketView {
  if (!row || row.status === 'UNAVAILABLE') {
    return {
      price: '—',
      change24h: '—',
      volume: '—',
      liquidity: '—',
      marketCap: '—',
      fdv: '—',
      transactions: '—',
      holders: truthDash(opts?.holders),
      lastUpdate: truthDash(opts?.lastUpdate),
      status: 'UNAVAILABLE',
      pipeline: GLOBAL_DATA_TRUTH_PIPELINE,
    }
  }
  const change = formatChange(row)
  const mcap =
    row.marketCapUsd != null && row.marketCapUsd > 0 ? formatUsdCompact(row.marketCapUsd) : '—'
  const liq = row.liquidityUsd != null && row.liquidityUsd > 0 ? formatUsdCompact(row.liquidityUsd) : '—'
  const vol =
    row.volume24hUsd != null && row.volume24hUsd > 0
      ? formatUsdCompact(row.volume24hUsd)
      : row.volume24hUsd === 0
        ? '$0.00'
        : '—'
  const tx =
    row.tradeCount24h != null && Number.isFinite(row.tradeCount24h) ? String(row.tradeCount24h) : '—'

  return {
    price: formatPrice(row),
    change24h: change.empty ? '—' : change.text,
    changePositive: change.empty ? undefined : change.positive,
    volume: vol,
    liquidity: liq,
    marketCap: mcap,
    fdv: mcap,
    transactions: tx,
    holders: truthDash(opts?.holders),
    pairAddress: row.pairAddress,
    lastUpdate: truthDash(opts?.lastUpdate),
    status: row.status,
    pipeline: GLOBAL_DATA_TRUTH_PIPELINE,
  }
}
