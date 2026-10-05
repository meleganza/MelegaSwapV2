import type { LiquidityPositionRow } from '../liquidityRuntime/useLiquidityPositions'

export const LIQUIDITY_POSITION_PAGE_SIZE = 20

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
  ).sort((left, right) => {
    const byLabel = left.pairLabel.localeCompare(right.pairLabel, undefined, { sensitivity: 'base' })
    if (byLabel !== 0) return byLabel
    const byChain = (left.chainId ?? 0) - (right.chainId ?? 0)
    if (byChain !== 0) return byChain
    return (left.pairAddress ?? left.id).localeCompare(right.pairAddress ?? right.id)
  })
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
