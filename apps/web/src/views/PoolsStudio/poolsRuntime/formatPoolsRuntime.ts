import BigNumber from 'bignumber.js'
import { Token } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/uikit'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { PoolCategory } from 'config/constants/types'
import { VaultKey } from 'state/types'
import { getAprData, getPoolBlockInfo } from 'views/Pools/helpers'
import type { PoolAnalyzePreview, PoolPreviewCard, PoolStatus, PoolsKpiItem } from '../poolsStudioData'

const BLOCKS_PER_DAY = 28800

function tokenPerBlockBn(tokenPerBlock: Pool.DeserializedPool<Token>['tokenPerBlock']): BigNumber {
  if (!tokenPerBlock) return new BigNumber(0)
  if (typeof (tokenPerBlock as BigNumber).times === 'function') return tokenPerBlock as BigNumber
  return new BigNumber(tokenPerBlock as string | number)
}

export const formatUsd = (value?: number | null): string => {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export const formatApr = (apr?: number | null): string => {
  if (apr === undefined || apr === null || !Number.isFinite(apr)) return '—'
  return `${apr.toFixed(2)}%`
}

export const formatTokenAmount = (amount?: BigNumber, decimals = 18, symbol?: string): string => {
  if (!amount || amount.isZero()) return '—'
  const n = getBalanceNumber(amount, decimals)
  const text = n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toFixed(2)
  return symbol ? `${text} ${symbol}` : text
}

export function getPoolTypeLabel(pool: Pool.DeserializedPool<Token>): string {
  if (pool.vaultKey === VaultKey.CakeVault) return 'Locked Pool'
  if (pool.vaultKey === VaultKey.CakeFlexibleSideVault) return 'Flexible Pool'
  if (pool.stakingToken?.symbol === 'MARCO' && pool.earningToken?.symbol && pool.earningToken.symbol !== 'MARCO') {
    return 'Reward MARCO Holders'
  }
  if (pool.poolCategory === PoolCategory.COMMUNITY) return 'Community Pool'
  if (pool.poolCategory === PoolCategory.BINANCE) return 'Institutional Pool'
  if (pool.profileRequirement?.required) return 'Private Pool'
  return 'Flexible Pool'
}

export function getPoolDisplayName(pool: Pool.DeserializedPool<Token>): string {
  if (pool.vaultKey === VaultKey.CakeVault) return 'MARCO Locked'
  if (pool.vaultKey === VaultKey.CakeFlexibleSideVault) return 'MARCO Flexible'
  if (pool.sousId === 0 && !pool.vaultKey) return 'MARCO Staking'
  if (pool.stakingToken?.symbol && pool.earningToken?.symbol) {
    return `${pool.stakingToken.symbol} → ${pool.earningToken.symbol}`
  }
  return pool.earningToken?.symbol ? `${pool.earningToken.symbol} Pool` : `Pool #${pool.sousId}`
}

function poolStatus(pool: Pool.DeserializedPool<Token>, currentBlock: number): PoolStatus {
  if (pool.isFinished) return 'ended'
  if (pool.sousId !== 0) {
    const { hasPoolStarted } = getPoolBlockInfo(pool, currentBlock)
    if (!hasPoolStarted) return 'indexing'
  }
  return 'live'
}

export function mapPoolToPreviewCard(
  pool: Pool.DeserializedPool<Token>,
  currentBlock: number,
  performanceFee = 0,
): PoolPreviewCard | null {
  if (!pool?.earningToken?.decimals || !pool?.stakingToken?.decimals) return null

  const { apr } = getAprData(pool, performanceFee)
  const staked = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
  const tvlUsd = staked * (pool.stakingTokenPrice || 0)
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  const dailyRewardTokens = perBlock.gt(0)
    ? getBalanceNumber(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)
    : 0
  const status = poolStatus(pool, currentBlock)

  const analyzePreview: PoolAnalyzePreview = {
    aprHistory: formatApr(apr),
    rewardToken: pool.earningToken.symbol ?? '—',
    emission: perBlock.gt(0) ? `${formatTokenAmount(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)} / day` : '—',
    contract: pool.sousId !== undefined ? `sousId ${pool.sousId}` : 'On-chain',
    risk: pool.vaultKey === VaultKey.CakeVault ? 'Lock period applies' : 'Standard',
    autoCompound: pool.vaultKey ? 'Enabled' : 'Manual',
    estimatedRoi: formatApr(apr),
  }

  return {
    id: pool.vaultKey ? `${pool.vaultKey}` : `sous-${pool.sousId}`,
    sousId: pool.sousId,
    vaultKey: pool.vaultKey,
    poolType: getPoolTypeLabel(pool),
    name: getPoolDisplayName(pool),
    tokens: [pool.stakingToken.symbol, pool.earningToken.symbol].filter(Boolean) as string[],
    apr: status === 'live' ? formatApr(apr) : status === 'indexing' ? '—' : undefined,
    status,
    tvl: formatUsd(tvlUsd),
    liquidity: formatUsd(tvlUsd),
    rewardToken: pool.earningToken.symbol ?? '—',
    dailyRewards: dailyRewardTokens > 0 ? formatTokenAmount(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals) : '—',
    multiplier: pool.userData?.stakedBalance?.gt(0) ? 'Active' : '—',
    participants: staked > 0 ? formatTokenAmount(pool.totalStaked, pool.stakingToken.decimals) : '—',
    cta: status === 'ended' ? 'none' : status === 'indexing' ? 'analyze' : 'stake',
    analyzePreview,
    rawPool: pool,
    userStaked: pool.userData?.stakedBalance,
    pendingReward: pool.userData?.pendingReward,
    poolTypeLabel: getPoolTypeLabel(pool),
  }
}

export function aggregateKpis(
  pools: Pool.DeserializedPool<Token>[],
  featuredName?: string,
): PoolsKpiItem[] {
  let totalStakedUsd = 0
  let totalPending = 0
  let activePools = 0
  let stakerPositions = 0

  pools.forEach((pool) => {
    if (!pool?.stakingToken?.decimals || !pool?.earningToken?.decimals) return
    if (!pool.isFinished) activePools += 1
    const staked = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
    totalStakedUsd += staked * (pool.stakingTokenPrice || 0)
    if (pool.userData?.stakedBalance?.gt(0)) stakerPositions += 1
    if (pool.userData?.pendingReward?.gt(0)) {
      totalPending += getBalanceNumber(pool.userData.pendingReward, pool.earningToken.decimals)
    }
  })

  return [
    { id: 'staked', label: 'Total Staked', value: formatUsd(totalStakedUsd) },
    { id: 'active', label: 'Active Pools', value: String(activePools) },
    { id: 'rewards', label: 'MARCO Rewards Today', value: totalPending > 0 ? formatTokenAmount(new BigNumber(totalPending)) : '—' },
    { id: 'stakers', label: 'Your Positions', value: String(stakerPositions) },
    { id: 'ai', label: 'AI Recommended', value: featuredName ?? '—', gold: true },
  ]
}

export function buildDonutSegments(pools: Pool.DeserializedPool<Token>[]) {
  const colors = ['#D4AF37', '#00E676', '#4DA3FF', '#A78BFA']
  const buckets = [
    { label: '0–1K', max: 1000, value: 0 },
    { label: '1K–10K', max: 10000, value: 0 },
    { label: '10K–100K', max: 100000, value: 0 },
    { label: '100K+', max: Infinity, value: 0 },
  ]

  pools.forEach((pool) => {
    if (!pool?.stakingToken?.decimals) return
    const usd = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals) * (pool.stakingTokenPrice || 0)
    const bucket = buckets.find((b) => usd <= b.max) ?? buckets[buckets.length - 1]
    bucket.value += 1
  })

  const total = buckets.reduce((s, b) => s + b.value, 0) || 1
  return buckets.map((b, i) => ({
    label: b.label,
    value: Math.round((b.value / total) * 100) || (i === 0 ? 100 : 0),
    color: colors[i % colors.length],
  }))
}
