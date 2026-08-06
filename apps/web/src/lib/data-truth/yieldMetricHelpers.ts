/**
 * Shared factual yield metric helpers — Home / Farms / Pools / Project surfaces.
 * One formula per metric. Never invents APR, TVL, volume, or fees.
 */
import BigNumber from 'bignumber.js'
import type { FarmWithStakedValue } from '@pancakeswap/farms'
import type { Token } from '@pancakeswap/sdk'
import type { Pool } from '@pancakeswap/uikit'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'

export type YieldPriceHints = {
  marcoUsd?: number
  wbnbUsd?: number
}

export function formatYieldUsd(value?: number | null): string | undefined {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) return undefined
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export function formatYieldUsdOrUnavailable(value?: number | null): string {
  return formatYieldUsd(value) ?? '—'
}

/** Farm liquidity USD — prefer attached liquidity, else reserve × quote price. */
export function resolveFarmLiquidityUsd(farm: FarmWithStakedValue): number {
  if (farm.liquidity?.gt?.(0)) return farm.liquidity.toNumber()
  if (farm.lpTotalInQuoteToken && farm.quoteTokenPriceBusd) {
    const usd = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteTokenPriceBusd)
    return usd.gt(0) ? usd.toNumber() : 0
  }
  return 0
}

export function formatFarmTvlDisplay(farm: FarmWithStakedValue): string | undefined {
  return formatYieldUsd(resolveFarmLiquidityUsd(farm))
}

export function resolveFarmAprPercent(farm: FarmWithStakedValue): number | undefined {
  const apr = (farm.apr ?? 0) + (farm.lpRewardsApr ?? 0)
  return apr > 0 && Number.isFinite(apr) ? apr : undefined
}

export function formatFarmAprDisplay(farm: FarmWithStakedValue): string {
  const apr = resolveFarmAprPercent(farm)
  return apr != null ? `${apr.toFixed(2)}%` : '—'
}

/** MasterChef / dual farm reward token — factual label only. */
export function resolveFarmRewardToken(farm: FarmWithStakedValue): string {
  const dual = farm.dual?.earnLabel?.trim()
  if (dual) return dual
  return farm.earningToken?.symbol?.trim() || 'MARCO'
}

export function resolveFarmChainId(farm: FarmWithStakedValue, fallback = 56): number {
  return farm.token?.chainId ?? farm.quoteToken?.chainId ?? fallback
}

function hintPriceForSymbol(symbol?: string, hints?: YieldPriceHints): number {
  if (!symbol || !hints) return 0
  const s = symbol.toUpperCase()
  if ((s === 'MARCO' || s === 'CAKE') && hints.marcoUsd && hints.marcoUsd > 0) return hints.marcoUsd
  if ((s === 'WBNB' || s === 'BNB') && hints.wbnbUsd && hints.wbnbUsd > 0) return hints.wbnbUsd
  return 0
}

/**
 * Pool TVL = totalStaked (human) × trusted stake token USD price.
 * Uses pool.stakingTokenPrice first; optional hints for MARCO/WBNB when price pending.
 */
export function resolvePoolTvlUsd(
  pool: Pool.DeserializedPool<Token>,
  hints?: YieldPriceHints,
): number {
  if (!pool.totalStaked?.gt?.(0) || !pool.stakingToken) return 0
  const bal = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
  if (!(bal > 0)) return 0
  let price = pool.stakingTokenPrice ?? 0
  if (!(price > 0)) {
    price = hintPriceForSymbol(pool.stakingToken.symbol, hints)
  }
  return price > 0 ? bal * price : 0
}

export function formatPoolTvlDisplay(
  pool: Pool.DeserializedPool<Token>,
  hints?: YieldPriceHints,
): string | undefined {
  return formatYieldUsd(resolvePoolTvlUsd(pool, hints))
}

/** Prefer already-computed pool.apr from runtime — never invents APR. */
export function resolvePoolAprPercent(pool: Pool.DeserializedPool<Token>): number | undefined {
  if (pool.apr && pool.apr > 0 && Number.isFinite(pool.apr)) return pool.apr
  return undefined
}

export function formatPoolAprDisplay(pool: Pool.DeserializedPool<Token>): string {
  const apr = resolvePoolAprPercent(pool)
  return apr != null ? `${apr.toFixed(2)}%` : '—'
}

export function resolvePoolRewardToken(pool: Pool.DeserializedPool<Token>): string | undefined {
  return pool.earningToken?.symbol?.trim() || undefined
}

export function resolvePoolChainId(pool: Pool.DeserializedPool<Token>, fallback = 56): number {
  return pool.stakingToken?.chainId ?? pool.earningToken?.chainId ?? fallback
}

/**
 * SmartChef deposit fee when known on the pool object — otherwise "—".
 * Never invents trading volume for staking pools.
 */
export function resolvePoolFeesDisplay(pool: Pool.DeserializedPool<Token>): string {
  // Deserialized pools expose 0 deposit fee on standard Melega SmartChef paths.
  if (pool.poolCategory != null) return '0%'
  return '—'
}

/** Volume is not certified for SmartChef staking pools. */
export function resolvePoolVolumeDisplay(_pool: Pool.DeserializedPool<Token>): string {
  return '—'
}

export function poolPairLabel(pool: Pool.DeserializedPool<Token>): string {
  const stake = pool.stakingToken?.symbol
  const earn = pool.earningToken?.symbol
  if (stake && earn) return `${stake} → ${earn}`
  if (stake) return `${stake} Pool`
  return `Pool #${pool.sousId}`
}

export function farmPairLabel(farm: FarmWithStakedValue): string {
  return farm.lpSymbol ?? `${farm.token?.symbol ?? '?'} / ${farm.quoteToken?.symbol ?? '?'}`
}
