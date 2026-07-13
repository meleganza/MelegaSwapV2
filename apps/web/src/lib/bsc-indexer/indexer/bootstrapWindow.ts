import { BOOTSTRAP_DAYS_PRIMARY, BSC_AVG_BLOCK_SECONDS, REORG_SAFETY_BLOCKS } from '../constants'

/** R790 — canonical MARCO/WBNB product bootstrap window (7 rolling days). */
export const BOOTSTRAP_WINDOW_POLICY = {
  periodDays: BOOTSTRAP_DAYS_PRIMARY,
  rationale:
    'MARCO/WBNB trade terminal, trending, and 24H metrics require contiguous indexed coverage for the most recent 7 days of chain history. Older blocks are OUT_OF_SCOPE for product surfaces.',
  endPolicy: 'chain_head_minus_reorg_safety',
  outOfScopeLabel: 'OUT_OF_SCOPE',
} as const

export function estimateBootstrapStartBlock(chainHead: number, bootstrapDays = BOOTSTRAP_DAYS_PRIMARY): number {
  const bootstrapBlocks = Math.floor((bootstrapDays * 86_400) / BSC_AVG_BLOCK_SECONDS)
  return Math.max(0, chainHead - bootstrapBlocks)
}

export function bootstrapWindowBounds(chainHead: number, bootstrapStartBlock: number) {
  const windowFrom = bootstrapStartBlock
  const windowTo = Math.max(windowFrom, chainHead - REORG_SAFETY_BLOCKS)
  return { windowFrom, windowTo, windowBlocks: Math.max(0, windowTo - windowFrom + 1) }
}

export function isBootstrapWindowComplete(
  coveragePercent: number,
  gaps: Array<{ fromBlock: number; toBlock: number }>,
): boolean {
  return coveragePercent >= 99.999 && gaps.length === 0
}
