import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { LiquidityPositionRow } from 'views/LiquidityStudio/liquidityRuntime/useLiquidityPositions'
import type { TradeAssetRow } from 'views/Trade/tradeRuntime/useTradeSwapRuntime'
import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import type {
  AIRecommendation,
  AssetRow,
  CollectibleItem,
  FarmPosition,
  LiquidityPosition,
  PoolPosition,
} from '../commandCenterData'

const TOKEN_COLORS: Record<string, string> = {
  BNB: '#F4C542',
  MARCO: '#D6B445',
  USDT: '#1BE77A',
  KIRI: '#8B7CF6',
  MELEGA: '#D6B445',
}

const UNAVAILABLE = 'Unavailable'

/** Local USD formatter — avoid importing Pools Studio runtime (side-effect heavy). */
function formatPoolUsd(value?: number | null): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return UNAVAILABLE
  if (value < 0.01) return `$${value.toFixed(4)}`
  if (value < 1000) return `$${value.toFixed(2)}`
  if (value < 1_000_000) return `$${(value / 1000).toFixed(2)}K`
  return `$${(value / 1_000_000).toFixed(2)}M`
}

type FarmRewardMeta = {
  earningToken?: { decimals?: number } | null
  earningTokenPrice?: number | null
}

function farmRewardMeta(f: FarmPreviewCard): FarmRewardMeta | undefined {
  return f.rawFarm as FarmRewardMeta | undefined
}

/** Section-level portfolio status — never escalate to a global crash. */
export type PortfolioSectionStatus = 'ok' | 'empty' | 'unavailable'

export interface PortfolioSectionResult<T> {
  rows: T[]
  status: PortfolioSectionStatus
  error?: string
}

/**
 * Run a section formatter in isolation. Any throw becomes `unavailable`
 * with empty rows so sibling sections can still render.
 */
export function safePortfolioSection<T>(run: () => T[]): PortfolioSectionResult<T> {
  try {
    const rows = run()
    const list = Array.isArray(rows) ? rows : []
    return { rows: list, status: list.length > 0 ? 'ok' : 'empty' }
  } catch (err) {
    return {
      rows: [],
      status: 'unavailable',
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

function farmPendingUsd(f: FarmPreviewCard): string {
  const meta = farmRewardMeta(f)
  const decimals = meta?.earningToken?.decimals
  if (!f.pendingReward || decimals == null) return UNAVAILABLE
  try {
    return formatPoolUsd(getBalanceNumber(f.pendingReward, decimals) * (meta?.earningTokenPrice || 0))
  } catch {
    return UNAVAILABLE
  }
}

function poolPendingUsd(p: PoolPreviewCard): string {
  const decimals = p.rawPool?.earningToken?.decimals
  if (!p.pendingReward?.gt(0) || decimals == null) return UNAVAILABLE
  try {
    return formatPoolUsd(getBalanceNumber(p.pendingReward, decimals) * (p.rawPool?.earningTokenPrice || 0))
  } catch {
    return UNAVAILABLE
  }
}

export function formatAssetRows(
  tradeAssets: TradeAssetRow[],
  account?: string,
): AssetRow[] {
  if (!account) return []
  const source = Array.isArray(tradeAssets) ? tradeAssets : []
  const out: AssetRow[] = []
  source.forEach((a, i) => {
    try {
      if (!a?.balance || a.balance === '—' || a.balance === '0') return
      out.push({
        id: a.address ?? `asset-${i}`,
        symbol: a.symbol,
        name: a.symbol,
        amount: a.balance,
        usd: a.usd ?? UNAVAILABLE,
        change24h: 0,
        color: TOKEN_COLORS[a.symbol] ?? '#8B7CF6',
      })
    } catch {
      // skip broken asset row
    }
  })
  return out
}

export function formatLiquidityRows(positions: LiquidityPositionRow[]): LiquidityPosition[] {
  const source = Array.isArray(positions) ? positions : []
  const out: LiquidityPosition[] = []
  source.forEach((p) => {
    try {
      out.push({
        id: p.id,
        pair: p.pairLabel,
        apr: UNAVAILABLE,
        tag: p.isStable ? 'Stable' : 'V2 LP',
        impermanentLoss: UNAVAILABLE,
      })
    } catch {
      // skip broken LP row
    }
  })
  return out
}

export function formatPoolPositionRows(cards: PoolPreviewCard[]): PoolPosition[] {
  const source = Array.isArray(cards) ? cards : []
  const out: PoolPosition[] = []
  source
    .filter((p) => {
      try {
        return Boolean(p.userStaked?.gt(0) || p.pendingReward?.gt(0))
      } catch {
        return false
      }
    })
    .slice(0, 4)
    .forEach((p) => {
      try {
        out.push({
          id: String(p.sousId ?? p.name),
          name: p.name,
          apr: p.apr ?? UNAVAILABLE,
          pending: poolPendingUsd(p),
        })
      } catch {
        // skip broken pool row
      }
    })
  return out
}

export function formatFarmPositionRows(cards: FarmPreviewCard[]): FarmPosition[] {
  const source = Array.isArray(cards) ? cards : []
  const out: FarmPosition[] = []
  source
    .filter((f) => {
      try {
        return Boolean(f.userStaked?.gt(0) || f.pendingReward?.gt(0))
      } catch {
        return false
      }
    })
    .slice(0, 4)
    .forEach((f) => {
      try {
        out.push({
          id: String(f.pid ?? f.pair),
          name: f.pair,
          apr: f.apr ?? UNAVAILABLE,
          // Guard earningToken — missing metadata must not crash Command Center.
          pending: farmPendingUsd(f),
        })
      } catch {
        // skip broken farm row
      }
    })
  return out
}

export function formatCollectibleItems(
  records: StaticCollectibleRecord[],
  ownedCount: number,
  account?: string,
): CollectibleItem[] {
  if (!account) return []
  return (Array.isArray(records) ? records : []).slice(0, 4).map((r) => ({
    id: r.slug,
    title: r.displayName,
    subtitle: r.status === 'live_or_legacy_existing' ? 'Indexed' : 'Planned',
    icon: r.category === 'identity' ? '🛡' : r.category === 'ai_agent_identity' ? '🤖' : '✦',
    privileges: [] as string[],
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
  try {
    ;(Array.isArray(pools) ? pools : []).forEach((p) => {
      const decimals = p.rawPool?.earningToken?.decimals
      if (p.pendingReward?.gt(0) && decimals != null) {
        total += getBalanceNumber(p.pendingReward, decimals) * (p.rawPool?.earningTokenPrice || 0)
      }
    })
  } catch {
    // keep partial total from pools
  }
  try {
    ;(Array.isArray(farms) ? farms : []).forEach((f) => {
      const meta = farmRewardMeta(f)
      const decimals = meta?.earningToken?.decimals
      if (f.pendingReward?.gt(0) && decimals != null) {
        total += getBalanceNumber(f.pendingReward, decimals) * (meta?.earningTokenPrice || 0)
      }
    })
  } catch {
    // keep partial total from farms
  }
  if (total <= 0) return UNAVAILABLE
  try {
    return formatPoolUsd(total)
  } catch {
    return UNAVAILABLE
  }
}

export function countPendingActions(
  poolCards: PoolPreviewCard[],
  farmCards: FarmPreviewCard[],
  recommendations: AIRecommendation[],
): string {
  try {
    const claimable =
      (Array.isArray(poolCards) ? poolCards : []).filter((p) => {
        try {
          return Boolean(p.pendingReward?.gt(0))
        } catch {
          return false
        }
      }).length +
      (Array.isArray(farmCards) ? farmCards : []).filter((f) => {
        try {
          return Boolean(f.pendingReward?.gt(0))
        } catch {
          return false
        }
      }).length
    const total = claimable + Math.min((Array.isArray(recommendations) ? recommendations : []).length, 3)
    return String(total || 0)
  } catch {
    return '0'
  }
}
