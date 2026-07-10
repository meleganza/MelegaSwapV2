import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { VaultKey } from 'state/types'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'

export const POOL_APR_UNAVAILABLE_REASON = 'Pool APR not indexed in current subgraph window'

export function formatPoolTrendingLabel(
  pool: Pool.DeserializedPool<Token>,
  apr?: number,
): { primary: string; secondary: string; accent?: string } {
  let secondary: string
  if (pool.vaultKey === VaultKey.CakeVault) {
    secondary = 'MARCO Locked'
  } else if (pool.vaultKey === VaultKey.CakeFlexibleSideVault) {
    secondary = 'MARCO Flexible'
  } else if (pool.stakingToken?.symbol && pool.earningToken?.symbol) {
    secondary = `${pool.stakingToken.symbol} / ${pool.earningToken.symbol}`
  } else {
    secondary = pool.stakingToken?.symbol ?? 'Pool'
  }
  const hasApr = apr !== undefined && Number.isFinite(apr) && apr > 0
  return {
    primary: 'Top Pool',
    secondary,
    accent: hasApr ? `${apr.toFixed(2)}%` : undefined,
  }
}

/** Ticker/ribbon accent for Top Pool — shows APR when recoverable. */
export function formatPoolTickerAccent(accent?: string): string | undefined {
  if (accent && accent.includes('%')) {
    return `${accent} APR`
  }
  return undefined
}

export function formatPoolMetaLabel(accent?: string): string {
  if (accent && accent.includes('%')) {
    return `APR ${accent}`
  }
  return RUNTIME_UNAVAILABLE_LABEL
}

export function formatFarmTrendingLabel(farm: FarmWithStakedValue, apr?: number): {
  primary: string
  secondary: string
  accent?: string
} {
  const pair = farm.lpSymbol?.replace('-', ' / ') ?? 'Farm'
  return {
    primary: 'Top Farm',
    secondary: pair,
    accent: apr && apr > 0 ? `${apr.toFixed(2)}%` : undefined,
  }
}

export function formatHighestTvlLabel(farms: FarmWithStakedValue[]): { primary: string; secondary: string } | null {
  const sorted = [...farms].filter((f) => f.liquidity?.gt(0)).sort((a, b) => b.liquidity.minus(a.liquidity).toNumber())
  const top = sorted[0]
  if (!top?.lpSymbol) return null
  return { primary: 'Highest TVL', secondary: top.lpSymbol.replace('-', ' / ') }
}
