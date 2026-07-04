import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { LiquidityPositionRow } from 'views/LiquidityStudio/liquidityRuntime/useLiquidityPositions'
import type { TradeAssetRow } from 'views/Trade/tradeRuntime/useTradeSwapRuntime'
import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import type {
  ActivityEvent,
  AIRecommendation,
  AssetRow,
  CollectibleItem,
  FarmPosition,
  LiquidityPosition,
  NotificationItem,
  PoolPosition,
  ReportItem,
} from '../commandCenterData'
import { formatUsd as formatPoolUsd } from 'views/PoolsStudio/poolsRuntime/formatPoolsRuntime'

const TOKEN_COLORS: Record<string, string> = {
  BNB: '#F4C542',
  MARCO: '#D6B445',
  USDT: '#1BE77A',
  KIRI: '#8B7CF6',
  MELEGA: '#D6B445',
}

const UNAVAILABLE = 'Unavailable'

export function formatAssetRows(
  tradeAssets: TradeAssetRow[],
  account?: string,
): AssetRow[] {
  if (!account) return []
  return tradeAssets
    .filter((a) => a.balance && a.balance !== '—' && a.balance !== '0')
    .map((a, i) => ({
      id: a.address ?? `asset-${i}`,
      symbol: a.symbol,
      name: a.symbol,
      amount: a.balance,
      usd: a.usd ?? UNAVAILABLE,
      change24h: 0,
      color: TOKEN_COLORS[a.symbol] ?? '#8B7CF6',
    }))
}

export function formatLiquidityRows(positions: LiquidityPositionRow[]): LiquidityPosition[] {
  return positions.map((p) => ({
    id: p.id,
    pair: p.pairLabel,
    apr: UNAVAILABLE,
    tag: p.isStable ? 'Stable' : 'V2 LP',
    impermanentLoss: UNAVAILABLE,
  }))
}

export function formatPoolPositionRows(cards: PoolPreviewCard[]): PoolPosition[] {
  return cards
    .filter((p) => p.userStaked?.gt(0) || p.pendingReward?.gt(0))
    .slice(0, 4)
    .map((p) => ({
      id: String(p.sousId ?? p.name),
      name: p.name,
      apr: p.apr ?? UNAVAILABLE,
      pending:
        p.pendingReward?.gt(0) && p.rawPool?.earningToken?.decimals
          ? formatPoolUsd(
              getBalanceNumber(p.pendingReward, p.rawPool.earningToken.decimals) *
                (p.rawPool.earningTokenPrice || 0),
            )
          : UNAVAILABLE,
    }))
}

export function formatFarmPositionRows(cards: FarmPreviewCard[]): FarmPosition[] {
  return cards
    .filter((f) => f.userStaked?.gt(0) || f.pendingReward?.gt(0))
    .slice(0, 4)
    .map((f) => ({
      id: String(f.pid ?? f.pair),
      name: f.pair,
      apr: f.apr ?? UNAVAILABLE,
      pending:
        f.pendingReward && f.rawFarm
          ? formatPoolUsd(
              getBalanceNumber(f.pendingReward, f.rawFarm.earningToken.decimals) *
                (f.rawFarm.earningTokenPrice || 0),
            )
          : UNAVAILABLE,
    }))
}

export function formatCollectibleItems(
  records: StaticCollectibleRecord[],
  ownedCount: number,
  account?: string,
): CollectibleItem[] {
  if (!account) return []
  return records.slice(0, 4).map((r) => ({
    id: r.slug,
    title: r.displayName,
    subtitle: r.status === 'live_or_legacy_existing' ? 'Indexed' : 'Planned',
    icon: r.category === 'identity' ? '🛡' : r.category === 'ai_agent_identity' ? '🤖' : '✦',
  }))
}

export function formatTimeAgo(isoOrUnix: string | number): string {
  const ms = typeof isoOrUnix === 'number' ? isoOrUnix * 1000 : Date.parse(isoOrUnix)
  if (!ms || Number.isNaN(ms)) return '—'
  const seconds = Math.floor((Date.now() - ms) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function sumPendingRewardsUsd(pools: PoolPreviewCard[], farms: FarmPreviewCard[]): string {
  let total = 0
  pools.forEach((p) => {
    if (p.pendingReward?.gt(0) && p.rawPool?.earningToken?.decimals) {
      total +=
        getBalanceNumber(p.pendingReward, p.rawPool.earningToken.decimals) *
        (p.rawPool.earningTokenPrice || 0)
    }
  })
  farms.forEach((f) => {
    if (f.pendingReward?.gt(0) && f.rawFarm) {
      total +=
        getBalanceNumber(f.pendingReward, f.rawFarm.earningToken.decimals) *
        (f.rawFarm.earningTokenPrice || 0)
    }
  })
  if (total <= 0) return UNAVAILABLE
  return formatPoolUsd(total)
}

export function countPendingActions(
  poolCards: PoolPreviewCard[],
  farmCards: FarmPreviewCard[],
  recommendations: AIRecommendation[],
): string {
  const claimable =
    poolCards.filter((p) => p.pendingReward?.gt(0)).length +
    farmCards.filter((f) => f.pendingReward?.gt(0)).length
  const total = claimable + Math.min(recommendations.length, 3)
  return String(total || 0)
}
