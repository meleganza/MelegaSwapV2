/**
 * Shared yield ranking — Home Top Farms/Pools and Farms/Pools Studio must agree.
 * Sort: TVL → APR → volume proxy → activity. Never invent metrics.
 */
export type YieldTruthSortKeys = {
  sortTvl: number
  sortApr: number
  sortVolume?: number
  sortActivity?: number
}

export function compareYieldTruthDesc(a: YieldTruthSortKeys, b: YieldTruthSortKeys): number {
  return (
    (b.sortTvl || 0) - (a.sortTvl || 0) ||
    (b.sortApr || 0) - (a.sortApr || 0) ||
    (b.sortVolume || 0) - (a.sortVolume || 0) ||
    (b.sortActivity || 0) - (a.sortActivity || 0)
  )
}

export const GLOBAL_DATA_TRUTH_PIPELINE = 'melega-global-data-truth-v1' as const
