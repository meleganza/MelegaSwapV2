import BigNumber from 'bignumber.js'
import { Token } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/uikit'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { PoolCategory } from 'config/constants/types'
import { VaultKey } from 'state/types'
import { getAprData, getPoolBlockInfo } from 'views/Pools/helpers'
import type { PoolAnalyzePreview, PoolPreviewCard, PoolStatus, PoolsKpiItem } from '../poolsStudioData'
import {
  formatDisplayApr,
  getContractRef,
  getCooldown,
  getEstimatedDailyReward,
  getLockPeriod,
  getPoolDisplayStatus,
  getPoolVisualType,
  getRemainingRewards,
  getRewardSustainability,
} from './formatPoolPresentation'

const BLOCKS_PER_DAY = 28800
const MAX_DISPLAY_APR = 50
const MIN_MEANINGFUL_DAILY_REWARD = 0.01

function dailyRewardBudget(pool: Pool.DeserializedPool<Token>): number {
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!perBlock.gt(0) || !pool.earningToken?.decimals) return 0
  return getBalanceNumber(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)
}

function hasMeaningfulRewardBudget(pool: Pool.DeserializedPool<Token>): boolean {
  return dailyRewardBudget(pool) >= MIN_MEANINGFUL_DAILY_REWARD
}

function isAutoStakingMarco(pool: Pool.DeserializedPool<Token>): boolean {
  return (
    pool.vaultKey === VaultKey.CakeVault ||
    pool.vaultKey === VaultKey.CakeFlexibleSideVault ||
    (pool.stakingToken?.symbol === 'MARCO' && pool.sousId === 0)
  )
}

function clampLiveApr(rawApr: number, pool: Pool.DeserializedPool<Token>): number | null {
  if (!Number.isFinite(rawApr) || rawApr <= 0) return null
  if (rawApr > MAX_DISPLAY_APR) return null
  if (isAutoStakingMarco(pool) && rawApr > 12) return Math.min(rawApr, 12)
  return rawApr
}

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

function poolHasDeposits(pool: Pool.DeserializedPool<Token>): boolean {
  return Boolean(pool.totalStaked?.gt(0))
}

function poolHasClaimableRewards(pool: Pool.DeserializedPool<Token>): boolean {
  return Boolean(pool.userData?.pendingReward?.gt(0))
}

function poolHasActiveEmission(pool: Pool.DeserializedPool<Token>): boolean {
  return tokenPerBlockBn(pool.tokenPerBlock).gt(0)
}

function poolRewardPeriodActive(pool: Pool.DeserializedPool<Token>, currentBlock: number): boolean {
  if (pool.vaultKey) return true
  if (!pool.isFinished) {
    const { hasPoolStarted, blocksRemaining } = getPoolBlockInfo(pool, currentBlock)
    return hasPoolStarted || blocksRemaining > 0
  }
  const { blocksRemaining } = getPoolBlockInfo(pool, currentBlock)
  return blocksRemaining > 0
}

function poolStatus(pool: Pool.DeserializedPool<Token>, currentBlock: number): PoolStatus {
  const hasEmission = poolHasActiveEmission(pool)
  const meaningful = hasMeaningfulRewardBudget(pool)
  const hasClaimable = poolHasClaimableRewards(pool)
  const periodActive = poolRewardPeriodActive(pool, currentBlock)

  if ((hasEmission || periodActive || hasClaimable) && meaningful) return 'live'
  if (hasEmission || periodActive) return 'ended'
  if (hasClaimable && meaningful) return 'live'
  if (pool.isFinished) return 'ended'

  if (pool.sousId !== 0) {
    const { hasPoolStarted } = getPoolBlockInfo(pool, currentBlock)
    if (!hasPoolStarted) return 'indexing'
  }
  return 'ended'
}

function estimateAprFromEmission(pool: Pool.DeserializedPool<Token>): number | null {
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!perBlock.gt(0) || !pool.earningToken?.decimals || !pool.stakingToken?.decimals) return null

  const staked = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
  const stakingUsd = staked * (pool.stakingTokenPrice || 0)
  const earningPrice = pool.earningTokenPrice || pool.stakingTokenPrice || 0
  if (stakingUsd <= 0 || earningPrice <= 0) return null

  const dailyReward = getBalanceNumber(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)
  const dailyRewardUsd = dailyReward * earningPrice
  const annualized = (dailyRewardUsd / stakingUsd) * 365 * 100
  return Number.isFinite(annualized) && annualized > 0 ? annualized : null
}

function displayPoolApr(
  pool: Pool.DeserializedPool<Token>,
  apr: number,
  status: PoolStatus,
  currentBlock: number,
): { display: string | undefined; exact: number } {
  if (status === 'indexing') return { display: '—', exact: apr }
  if (status === 'ended') return { display: undefined, exact: apr }
  const formatted = formatDisplayApr(apr, pool)
  if (formatted.display) return formatted
  if (poolHasActiveEmission(pool) || poolRewardPeriodActive(pool, currentBlock)) {
    const estimated = estimateAprFromEmission(pool)
    if (estimated) return formatDisplayApr(estimated, pool)
    return { display: 'Calculating...', exact: estimated ?? 0 }
  }
  return { display: 'Calculating...', exact: apr }
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
  const aprDisplay = displayPoolApr(pool, apr, status, currentBlock)
  const remaining = getRemainingRewards(pool, currentBlock)
  const sustainability = getRewardSustainability(pool, currentBlock)
  const contract = getContractRef(pool)

  const analyzePreview: PoolAnalyzePreview = {
    aprHistory: formatApr(aprDisplay.exact),
    rewardToken: pool.earningToken.symbol ?? '—',
    emission: perBlock.gt(0) ? `${formatTokenAmount(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)} / day` : '—',
    contract: contract.label,
    risk: pool.vaultKey === VaultKey.CakeVault ? 'Lock period applies' : 'Standard',
    autoCompound: pool.vaultKey ? 'Enabled' : 'Manual',
    estimatedRoi: aprDisplay.display ?? formatApr(apr),
  }

  return {
    id: pool.vaultKey ? `${pool.vaultKey}` : `sous-${pool.sousId}`,
    sousId: pool.sousId,
    vaultKey: pool.vaultKey,
    poolType: getPoolTypeLabel(pool),
    name: getPoolDisplayName(pool),
    tokens: [pool.stakingToken.symbol, pool.earningToken.symbol].filter(Boolean) as string[],
    stakeToken: pool.stakingToken.symbol,
    apr: aprDisplay.display,
    aprExact: aprDisplay.exact,
    status,
    displayStatus: getPoolDisplayStatus(pool, status, currentBlock),
    visualType: getPoolVisualType(pool),
    tvl: formatUsd(tvlUsd),
    liquidity: formatUsd(tvlUsd),
    rewardToken: pool.earningToken.symbol ?? '—',
    dailyRewards: dailyRewardTokens > 0 ? formatTokenAmount(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals) : '—',
    estimatedDailyReward: getEstimatedDailyReward(pool),
    remainingRewards: remaining.label,
    remainingRewardsPct: remaining.pct,
    remainingRewardsTone: remaining.tone,
    lockPeriod: getLockPeriod(pool),
    cooldown: getCooldown(pool),
    rewardSustainability: sustainability.level,
    sustainabilityScore: sustainability.score,
    contractAddress: contract.address,
    contractLabel: contract.label,
    explorerUrl: contract.explorerUrl,
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
  featured?: PoolPreviewCard,
  currentBlock = 0,
): PoolsKpiItem[] {
  let totalStakedUsd = 0
  let dailyRewardsUsd = 0
  let activePools = 0
  let stakerPositions = 0

  pools.forEach((pool) => {
    if (!pool?.stakingToken?.decimals || !pool?.earningToken?.decimals) return
    const status = poolStatus(pool, currentBlock)
    if (status === 'live') activePools += 1
    const staked = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
    totalStakedUsd += staked * (pool.stakingTokenPrice || 0)
    if (pool.userData?.stakedBalance?.gt(0)) stakerPositions += 1
    const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
    if (perBlock.gt(0) && status === 'live') {
      const dailyTokens = getBalanceNumber(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)
      dailyRewardsUsd += dailyTokens * (pool.earningTokenPrice || pool.stakingTokenPrice || 0)
    }
  })

  const featuredLabel = featured?.name ?? '—'
  const featuredApr = featured?.apr ? ` · ${featured.apr}` : ''

  return [
    { id: 'tvl', label: 'Total Value Locked', value: formatUsd(totalStakedUsd) },
    { id: 'active', label: 'Active Pools', value: String(activePools) },
    { id: 'daily', label: 'Total Daily Rewards', value: formatUsd(dailyRewardsUsd) },
    { id: 'positions', label: 'Your Active Positions', value: String(stakerPositions) },
    { id: 'featured', label: 'Featured Pool', value: `${featuredLabel}${featuredApr}`, gold: true },
  ]
}

export function listActivePools(cards: PoolPreviewCard[]): {
  activePools: string[]
  sourceMethod: string
} {
  const active = cards.filter((p) => p.status === 'live')
  return {
    activePools: active.map((p) => p.name),
    sourceMethod: 'sous_chef_bonus_end_block_rpc',
  }
}

export function sortPoolsDefault(cards: PoolPreviewCard[]): PoolPreviewCard[] {
  const statusRank: Record<string, number> = { live: 0, indexing: 1, ended: 2 }
  const parseBudget = (card: PoolPreviewCard) => {
    const raw = card.rawPool
    if (!raw) return 0
    return dailyRewardBudget(raw)
  }
  const parseApr = (card: PoolPreviewCard) => {
    if (card.apr === 'Calculating...') return -1
    return parseFloat(card.apr?.replace('%', '') || '0')
  }
  const parseTvl = (v?: string) => parseFloat(v?.replace(/[^0-9.]/g, '') || '0')

  return [...cards].sort((a, b) => {
    const sa = statusRank[a.status] ?? 1
    const sb = statusRank[b.status] ?? 1
    if (sa !== sb) return sa - sb
    const budgetDiff = parseBudget(b) - parseBudget(a)
    if (budgetDiff !== 0) return budgetDiff
    const aprDiff = parseApr(b) - parseApr(a)
    if (aprDiff !== 0) return aprDiff
    return parseTvl(b.tvl) - parseTvl(a.tvl)
  })
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
