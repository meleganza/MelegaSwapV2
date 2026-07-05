import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { VaultKey } from 'state/types'
import { FarmWithStakedValue } from '@pancakeswap/farms'

export function formatPoolTrendingLabel(pool: Pool.DeserializedPool<Token>): { primary: string; secondary: string } {
  if (pool.vaultKey === VaultKey.CakeVault) {
    return { primary: 'Top Pool', secondary: 'MARCO Locked' }
  }
  if (pool.vaultKey === VaultKey.CakeFlexibleSideVault) {
    return { primary: 'Top Pool', secondary: 'MARCO Flexible' }
  }
  if (pool.stakingToken?.symbol && pool.earningToken?.symbol) {
    return {
      primary: 'Top Pool',
      secondary: `${pool.stakingToken.symbol} / ${pool.earningToken.symbol}`,
    }
  }
  return { primary: 'Top Pool', secondary: pool.stakingToken?.symbol ?? 'Pool' }
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
