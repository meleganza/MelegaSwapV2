/**
 * Factual Pools Total Rewards — 24H aggregation.
 * active pool reward rate × factual active seconds/blocks in rolling 24H,
 * bounded by pool start/end. Does not annualize. Does not invent USD.
 */
import BigNumber from 'bignumber.js'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { Pool } from '@pancakeswap/uikit'
import type { Token } from '@pancakeswap/sdk'

const BLOCKS_PER_DAY = 28800

export type Pool24hRewardSource = {
  sousId: number
  name: string
  rewardSymbol: string
  rewardAmount: number
  rewardUsd: number | null
  priced: boolean
  activeBlocksInWindow: number
  tokenPerBlock: string
}

export type Pools24hRewardsBreakdown = {
  status: 'available' | 'partial' | 'indexing' | 'unavailable' | 'zero'
  pricedUsd: number | null
  displayValue: string
  supporting: string
  byRewardToken: Array<{
    symbol: string
    amount: number
    usd: number | null
    priced: boolean
  }>
  unpricedRewardAmount: number
  unpricedTokenCount: number
  sourcePools: Pool24hRewardSource[]
  sourcePoolCount: number
  sourceBlock: number | null
  updatedAt: string
  methodology: 'reward_rate_x_active_blocks_in_rolling_24h'
  provenance: string
}

type DeserializedPool = Pool.DeserializedPool<Token>

function tokenPerBlockBn(tokenPerBlock: DeserializedPool['tokenPerBlock']): BigNumber {
  if (!tokenPerBlock) return new BigNumber(0)
  if (typeof (tokenPerBlock as BigNumber).times === 'function') return tokenPerBlock as BigNumber
  return new BigNumber(tokenPerBlock as string | number)
}

function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '—'
  if (value === 0) return '$0.00'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}

function isPoolRewarding(pool: DeserializedPool, currentBlock: number | null): boolean {
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!perBlock.gt(0)) return false
  if (pool.isFinished) return false
  const start = pool.startBlock != null ? Number(pool.startBlock) : null
  const end = pool.endBlock != null ? Number(pool.endBlock) : null
  if (currentBlock != null && Number.isFinite(currentBlock)) {
    if (start != null && Number.isFinite(start) && currentBlock < start) return false
    if (end != null && Number.isFinite(end) && end > 0 && currentBlock > end) return false
  }
  return true
}

/** Active blocks for this pool inside [windowStart, windowEnd] inclusive. */
export function activeBlocksInWindow(opts: {
  startBlock: number | null
  endBlock: number | null
  windowStart: number
  windowEnd: number
}): number {
  const { startBlock, endBlock, windowStart, windowEnd } = opts
  if (windowEnd < windowStart) return 0
  let from = windowStart
  let to = windowEnd
  if (startBlock != null && Number.isFinite(startBlock)) from = Math.max(from, startBlock)
  if (endBlock != null && Number.isFinite(endBlock) && endBlock > 0) to = Math.min(to, endBlock)
  return Math.max(0, to - from + 1)
}

export function buildPools24hRewards(input: {
  pools: DeserializedPool[]
  currentBlock?: number | null
  blocksPerDay?: number
  updatedAt?: string
  loading?: boolean
}): Pools24hRewardsBreakdown {
  const updatedAt = input.updatedAt ?? new Date().toISOString()
  const blocksPerDay = input.blocksPerDay ?? BLOCKS_PER_DAY
  const currentBlock = input.currentBlock ?? null

  if (input.loading && (!input.pools || input.pools.length === 0)) {
    return {
      status: 'indexing',
      pricedUsd: null,
      displayValue: 'Indexing…',
      supporting: 'Loading pool emission rates…',
      byRewardToken: [],
      unpricedRewardAmount: 0,
      unpricedTokenCount: 0,
      sourcePools: [],
      sourcePoolCount: 0,
      sourceBlock: currentBlock,
      updatedAt,
      methodology: 'reward_rate_x_active_blocks_in_rolling_24h',
      provenance: 'awaiting pool inventory',
    }
  }

  if (!input.pools?.length) {
    return {
      status: 'unavailable',
      pricedUsd: null,
      displayValue: 'Unavailable',
      supporting: 'No staking pool inventory for 24H rewards',
      byRewardToken: [],
      unpricedRewardAmount: 0,
      unpricedTokenCount: 0,
      sourcePools: [],
      sourcePoolCount: 0,
      sourceBlock: currentBlock,
      updatedAt,
      methodology: 'reward_rate_x_active_blocks_in_rolling_24h',
      provenance: 'empty pool universe',
    }
  }

  const windowEnd = currentBlock != null && Number.isFinite(currentBlock) ? currentBlock : blocksPerDay
  const windowStart = Math.max(0, windowEnd - blocksPerDay + 1)

  const sources: Pool24hRewardSource[] = []
  const bySymbol = new Map<string, { amount: number; usd: number | null; priced: boolean }>()

  for (const pool of input.pools) {
    if (!isPoolRewarding(pool, currentBlock)) continue
    const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
    const decimals = pool.earningToken?.decimals
    if (decimals == null) continue
    const start = pool.startBlock != null ? Number(pool.startBlock) : null
    const end = pool.endBlock != null ? Number(pool.endBlock) : null
    const activeBlocks = activeBlocksInWindow({
      startBlock: start,
      endBlock: end,
      windowStart,
      windowEnd,
    })
    if (activeBlocks <= 0) continue
    const amount = getBalanceNumber(perBlock.times(activeBlocks), decimals)
    if (!Number.isFinite(amount) || amount <= 0) continue
    const symbol = pool.earningToken?.symbol || 'REWARD'
    const price = pool.earningTokenPrice || 0
    const priced = price > 0
    const usd = priced ? amount * price : null
    sources.push({
      sousId: pool.sousId,
      name: `${pool.stakingToken?.symbol || '?'} → ${symbol}`,
      rewardSymbol: symbol,
      rewardAmount: amount,
      rewardUsd: usd,
      priced,
      activeBlocksInWindow: activeBlocks,
      tokenPerBlock: perBlock.toFixed(0),
    })
    const prev = bySymbol.get(symbol) || { amount: 0, usd: 0, priced: false }
    prev.amount += amount
    if (priced && usd != null) {
      prev.usd = (prev.usd ?? 0) + usd
      prev.priced = true
    } else if (!prev.priced) {
      prev.usd = null
    }
    bySymbol.set(symbol, prev)
  }

  const byRewardToken = [...bySymbol.entries()].map(([symbol, v]) => ({
    symbol,
    amount: v.amount,
    usd: v.priced ? v.usd : null,
    priced: v.priced,
  }))

  let pricedUsd = 0
  let hasPriced = false
  let unpricedRewardAmount = 0
  let unpricedTokenCount = 0
  for (const row of byRewardToken) {
    if (row.priced && row.usd != null) {
      pricedUsd += row.usd
      hasPriced = true
    } else {
      unpricedRewardAmount += row.amount
      unpricedTokenCount += 1
    }
  }

  const sourcePoolCount = sources.length
  if (sourcePoolCount === 0) {
    return {
      status: 'zero',
      pricedUsd: 0,
      displayValue: '$0.00',
      supporting: 'No rewarding pools in rolling 24H window',
      byRewardToken: [],
      unpricedRewardAmount: 0,
      unpricedTokenCount: 0,
      sourcePools: [],
      sourcePoolCount: 0,
      sourceBlock: currentBlock,
      updatedAt,
      methodology: 'reward_rate_x_active_blocks_in_rolling_24h',
      provenance: `tokenPerBlock × active blocks · window ${windowStart}-${windowEnd}`,
    }
  }

  if (hasPriced && unpricedTokenCount === 0) {
    return {
      status: 'available',
      pricedUsd,
      displayValue: formatUsd(pricedUsd),
      supporting: `${sourcePoolCount} rewarding pool${sourcePoolCount === 1 ? '' : 's'} · emission × 24H`,
      byRewardToken,
      unpricedRewardAmount: 0,
      unpricedTokenCount: 0,
      sourcePools: sources,
      sourcePoolCount,
      sourceBlock: currentBlock,
      updatedAt,
      methodology: 'reward_rate_x_active_blocks_in_rolling_24h',
      provenance: `tokenPerBlock × active blocks · window ${windowStart}-${windowEnd} · ${updatedAt}`,
    }
  }

  if (hasPriced && unpricedTokenCount > 0) {
    return {
      status: 'partial',
      pricedUsd,
      displayValue: formatUsd(pricedUsd),
      supporting: `Partial · ${unpricedTokenCount} unpriced reward token${unpricedTokenCount === 1 ? '' : 's'}`,
      byRewardToken,
      unpricedRewardAmount,
      unpricedTokenCount,
      sourcePools: sources,
      sourcePoolCount,
      sourceBlock: currentBlock,
      updatedAt,
      methodology: 'reward_rate_x_active_blocks_in_rolling_24h',
      provenance: `priced USD + unpriced token amounts · window ${windowStart}-${windowEnd} · ${updatedAt}`,
    }
  }

  // All unpriced — still show token aggregate status, not Unavailable solely for missing USD
  const top = byRewardToken.sort((a, b) => b.amount - a.amount)[0]
  return {
    status: 'partial',
    pricedUsd: null,
    displayValue: top ? `${top.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${top.symbol}` : '—',
    supporting: `Unpriced · ${sourcePoolCount} pool${sourcePoolCount === 1 ? '' : 's'} emitting`,
    byRewardToken,
    unpricedRewardAmount,
    unpricedTokenCount,
    sourcePools: sources,
    sourcePoolCount,
    sourceBlock: currentBlock,
    updatedAt,
    methodology: 'reward_rate_x_active_blocks_in_rolling_24h',
    provenance: `token-denominated only · window ${windowStart}-${windowEnd} · ${updatedAt}`,
  }
}
