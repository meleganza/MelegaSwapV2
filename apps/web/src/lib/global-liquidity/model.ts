import BigNumber from 'bignumber.js'
import type { GlobalLiquidityPool, GlobalLiquiditySnapshot } from './types'

export function canonicalPoolKey(pool: Pick<GlobalLiquidityPool, 'chainId' | 'pairAddress'>): string {
  return `${pool.chainId}:${pool.pairAddress.toLowerCase()}`
}

export function dedupeGlobalPools(pools: GlobalLiquidityPool[]): GlobalLiquidityPool[] {
  const byKey = new Map<string, GlobalLiquidityPool>()
  for (const pool of pools) if (!byKey.has(canonicalPoolKey(pool))) byKey.set(canonicalPoolKey(pool), pool)
  return [...byKey.values()]
}

export function compareGlobalPoolsByTvl(a: GlobalLiquidityPool, b: GlobalLiquidityPool): number {
  const aKnown = a.tvlUsd != null
  const bKnown = b.tvlUsd != null
  if (aKnown !== bKnown) return bKnown ? 1 : -1
  if (aKnown && bKnown) {
    const valueOrder = new BigNumber(b.tvlUsd as string).comparedTo(a.tvlUsd as string)
    if (valueOrder !== 0) return valueOrder
  }
  const labelOrder = `${a.symbol0}/${a.symbol1}`.localeCompare(`${b.symbol0}/${b.symbol1}`)
  if (labelOrder !== 0) return labelOrder
  if (a.chainId !== b.chainId) return a.chainId - b.chainId
  return a.pairAddress.toLowerCase().localeCompare(b.pairAddress.toLowerCase())
}

export function sortGlobalPoolsByTvl(pools: GlobalLiquidityPool[]): GlobalLiquidityPool[] {
  return [...pools].sort(compareGlobalPoolsByTvl)
}

export function searchGlobalPools(pools: GlobalLiquidityPool[], query: string): GlobalLiquidityPool[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return pools
  return pools.filter((pool) =>
    [
      pool.symbol0,
      pool.symbol1,
      pool.name0,
      pool.name1,
      pool.token0,
      pool.token1,
      pool.pairAddress,
      `${pool.symbol0}/${pool.symbol1}`,
      `${pool.symbol0} / ${pool.symbol1}`,
    ].some((value) => value?.toLowerCase().includes(needle)),
  )
}

export function paginateGlobalPools<T>(rows: T[], page: number, pageSize: number): T[] {
  const safeSize = Math.max(1, Math.floor(pageSize))
  const safePage = Math.max(1, Math.floor(page))
  return rows.slice((safePage - 1) * safeSize, safePage * safeSize)
}

export function aggregateGlobalPricedTvl(pools: GlobalLiquidityPool[]): string {
  return dedupeGlobalPools(pools)
    .filter((pool) => pool.tvlUsd != null && new BigNumber(pool.tvlUsd).isFinite())
    .reduce((total, pool) => total.plus(pool.tvlUsd as string), new BigNumber(0))
    .toFixed()
}

export function displayGlobalTvl(snapshot?: GlobalLiquiditySnapshot | null): string {
  if (!snapshot || snapshot.status !== 'complete') return 'Unavailable'
  const value = new BigNumber(snapshot.totalPricedTvlUsd)
  if (!value.isFinite() || value.isNegative()) return 'Unavailable'
  if (value.gte(1_000_000_000)) return `$${value.div(1_000_000_000).toFixed(2)}B`
  if (value.gte(1_000_000)) return `$${value.div(1_000_000).toFixed(2)}M`
  if (value.gte(1_000)) return `$${value.div(1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}
