/**
 * Multichain My Positions aggregation helpers.
 * One failed/missing chain must not blank the portfolio; union last-good caches per wallet.
 */
import type { PoolsWalletPosition } from 'views/PoolsStudio/modules/poolsMyPositionsTypes'
import type { FarmsWalletPosition } from 'views/FarmsStudio/modules/farmsMyFarmsTypes'

export function unionPositionsByWallet<T extends { positionId: string; chainId: number }>(
  current: T[],
  cachedByChain: Map<number, T[]>,
  activeChainId: number | null,
): T[] {
  const byId = new Map<string, T>()
  for (const [chainId, rows] of cachedByChain) {
    if (activeChainId != null && chainId === activeChainId) continue
    for (const row of rows) byId.set(row.positionId, row)
  }
  for (const row of current) {
    byId.set(row.positionId, row)
  }
  return [...byId.values()].sort((a, b) => {
    if (a.chainId !== b.chainId) return a.chainId - b.chainId
    return a.positionId.localeCompare(b.positionId)
  })
}

export type AggregatedPoolsPositions = {
  positions: PoolsWalletPosition[]
  chainErrors: Array<{ chainId: number; reason: string }>
}

export type AggregatedFarmsPositions = {
  positions: FarmsWalletPosition[]
  chainErrors: Array<{ chainId: number; reason: string }>
}
