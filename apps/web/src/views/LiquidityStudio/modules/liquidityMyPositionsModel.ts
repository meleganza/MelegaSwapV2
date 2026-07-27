/**
 * LIQUIDITY_MODULE_006 — pure position view helpers (no second scanner).
 */
import type { LiquidityPositionStatus } from './liquidityMyPositionsTokens'
import { LIQUIDITY_MY_POSITIONS_COPY } from './liquidityMyPositionsTokens'

export type LiquidityPositionView = {
  id: string
  pairLabel: string
  token0Symbol: string
  token1Symbol: string
  token0Address?: string
  token1Address?: string
  lpBalanceLabel: string
  valueLabel: string
  poolShareLabel: string
  feesLabel: string
  status: LiquidityPositionStatus
}

export function formatPositionUsd(value?: number | null): string {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) {
    return LIQUIDITY_MY_POSITIONS_COPY.emptyMetric
  }
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export function formatPoolShare(pct?: { toFixed: (d: number) => string } | null): string {
  if (!pct) return LIQUIDITY_MY_POSITIONS_COPY.emptyMetric
  try {
    const n = Number(pct.toFixed(4))
    if (!Number.isFinite(n) || n <= 0) return LIQUIDITY_MY_POSITIONS_COPY.emptyMetric
    return `${n.toFixed(2)}%`
  } catch {
    return LIQUIDITY_MY_POSITIONS_COPY.emptyMetric
  }
}

/**
 * ACTIVE when LP balance exists.
 * PARTIAL when balance exists but value/share unavailable.
 * UNAVAILABLE when no usable balance label.
 */
export function resolvePositionStatus(input: {
  hasLpBalance: boolean
  hasValue: boolean
  hasShare: boolean
}): LiquidityPositionStatus {
  if (!input.hasLpBalance) return 'UNAVAILABLE'
  if (!input.hasValue || !input.hasShare) return 'PARTIAL'
  return 'ACTIVE'
}
