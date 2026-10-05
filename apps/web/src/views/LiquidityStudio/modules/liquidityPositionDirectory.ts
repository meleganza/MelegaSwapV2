import type { LiquidityPositionRow } from '../liquidityRuntime/useLiquidityPositions'

export const LIQUIDITY_POSITION_PAGE_SIZE = 20

function knownPoolTvl(row: LiquidityPositionRow): number | undefined {
  return typeof row.poolTvlUsd === 'number' && Number.isFinite(row.poolTvlUsd) && row.poolTvlUsd >= 0
    ? row.poolTvlUsd
    : undefined
}

function compareText(left: string, right: string): number {
  const a = left.toLocaleLowerCase()
  const b = right.toLocaleLowerCase()
  return a < b ? -1 : a > b ? 1 : 0
}

export function compareLiquidityPositionsByPoolTvl(left: LiquidityPositionRow, right: LiquidityPositionRow): number {
  const leftTvl = knownPoolTvl(left)
  const rightTvl = knownPoolTvl(right)
  if (leftTvl != null && rightTvl == null) return -1
  if (leftTvl == null && rightTvl != null) return 1
  if (leftTvl != null && rightTvl != null && leftTvl !== rightTvl) return rightTvl - leftTvl
  const byLabel = compareText(left.pairLabel, right.pairLabel)
  if (byLabel !== 0) return byLabel
  const byChain = (left.chainId ?? left.pair.token0.chainId ?? 0) - (right.chainId ?? right.pair.token0.chainId ?? 0)
  if (byChain !== 0) return byChain
  return compareText(left.pairAddress ?? left.id, right.pairAddress ?? right.id)
}

function searchablePositionText(row: LiquidityPositionRow): string {
  return [
    row.pairLabel,
    row.pairAddress,
    row.id,
    row.pair.token0.symbol,
    row.pair.token0.name,
    row.pair.token0.address,
    row.pair.token1.symbol,
    row.pair.token1.name,
    row.pair.token1.address,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()
}

/**
 * Keeps every wallet-owned LP reachable without mounting hundreds of cards.
 * Pair identity is exact and chain-local; no cross-chain/token-symbol matching
 * is used to decide ownership.
 */
export function buildLiquidityPositionDirectory(
  positions: LiquidityPositionRow[],
  query: string,
  requestedPage: number,
  pageSize = LIQUIDITY_POSITION_PAGE_SIZE,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filtered = (
    normalizedQuery
      ? positions.filter((position) => searchablePositionText(position).includes(normalizedQuery))
      : [...positions]
  ).sort(compareLiquidityPositionsByPoolTvl)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(Math.max(1, requestedPage), totalPages)
  const start = (page - 1) * pageSize

  return {
    filtered,
    visible: filtered.slice(start, start + pageSize),
    page,
    totalPages,
    totalPositions: positions.length,
    firstVisible: filtered.length ? start + 1 : 0,
    lastVisible: Math.min(start + pageSize, filtered.length),
  }
}
