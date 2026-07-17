import BigNumber from 'bignumber.js'
import { Token } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/uikit'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { PoolCategory } from 'config/constants/types'
import { VaultKey } from 'state/types'
import { getPoolBlockInfo } from 'views/Pools/helpers'
import type { PoolPreviewCard } from '../poolsStudioData'
import { formatDisplayAprText, isForbiddenAprDisplay, normalizeAprForDisplay as normalizeAprByVisual } from './poolsAprRules'
import { getAddress } from 'utils/addressHelpers'
import {
  getAddressExplorerUrl,
  getBlockExplorerBaseUrl,
  getTokenExplorerUrl as buildTokenExplorerUrl,
} from 'utils/blockExplorer'

const BLOCKS_PER_DAY = 28800
export const MAX_DISPLAY_APR = 50
const MIN_REWARD_BUDGET_USD = 1

export type PoolVisualType =
  | 'Flexible'
  | '30 Days'
  | '90 Days'
  | '180 Days'
  | '365 Days'
  | 'Auto Compound'
  | 'Fixed Lock'
  | 'Community'
  | 'Official'
  | 'Partner'

export type PoolDisplayStatus = 'LIVE' | 'ENDED' | 'INDEXING'

export type RewardBadge = 'Official' | 'Partner' | 'Community'

export type PoolSafetyRisk = 'Very Low' | 'Low' | 'Medium' | 'High'

function tokenPerBlockBn(tokenPerBlock: Pool.DeserializedPool<Token>['tokenPerBlock']): BigNumber {
  if (!tokenPerBlock) return new BigNumber(0)
  if (typeof (tokenPerBlock as BigNumber).times === 'function') return tokenPerBlock as BigNumber
  return new BigNumber(tokenPerBlock as string | number)
}

function safeBlocksRemaining(pool: Pool.DeserializedPool<Token>, currentBlock: number): number {
  const endBlock = Number(pool.endBlock)
  if (Number.isFinite(endBlock) && Number.isFinite(currentBlock)) {
    if (pool.isFinished) return 0
    const startBlock = Number(pool.startBlock)
    if (Number.isFinite(startBlock) && currentBlock < startBlock) return 0
    return Math.max(endBlock - currentBlock, 0)
  }
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!pool.isFinished && perBlock.gt(0) && (pool.vaultKey || pool.sousId === 0)) {
    return 0
  }
  return 0
}

export function normalizeAprForDisplay(
  rawApr: number,
  pool: Pool.DeserializedPool<Token>,
): { display: string | undefined; exact: number; normalized: number } {
  return normalizeAprByVisual(rawApr, getPoolVisualType(pool), getRewardBadge(pool))
}

export function formatDisplayApr(
  rawApr: number,
  pool: Pool.DeserializedPool<Token>,
  hasRemainingRewards: boolean,
  isLive: boolean,
): { display: string | undefined; exact: number } {
  return formatDisplayAprText(rawApr, getPoolVisualType(pool), hasRemainingRewards && isLive, getRewardBadge(pool))
}

export function getPoolVisualType(pool: Pool.DeserializedPool<Token>): PoolVisualType {
  if (pool.vaultKey === VaultKey.CakeFlexibleSideVault) return 'Auto Compound'
  if (pool.vaultKey === VaultKey.CakeVault) return '365 Days'
  if (pool.poolCategory === PoolCategory.CORE || pool.sousId === 0) return 'Official'
  if (pool.poolCategory === PoolCategory.BINANCE) return 'Partner'
  if (pool.poolCategory === PoolCategory.COMMUNITY) return 'Community'
  return 'Flexible'
}

export function getRewardBadge(pool: Pool.DeserializedPool<Token>): RewardBadge {
  if (pool.poolCategory === PoolCategory.CORE || pool.sousId === 0) return 'Official'
  if (pool.poolCategory === PoolCategory.BINANCE) return 'Partner'
  return 'Community'
}

export function getLockPeriod(pool: Pool.DeserializedPool<Token>): string {
  if (pool.vaultKey === VaultKey.CakeVault) return '365d'
  if (pool.vaultKey === VaultKey.CakeFlexibleSideVault) return 'Flexible'
  if (pool.sousId === 0) return 'Flexible'
  const visual = getPoolVisualType(pool)
  if (visual === '30 Days') return '30d'
  if (visual === '90 Days') return '90d'
  if (visual === '180 Days') return '180d'
  if (visual === '365 Days') return '365d'
  return 'Flexible'
}

export function getCooldown(pool: Pool.DeserializedPool<Token>): string {
  if (pool.vaultKey === VaultKey.CakeVault) return '7 Days'
  return 'None'
}

export function getAutoCompound(pool: Pool.DeserializedPool<Token>): string {
  return pool.vaultKey ? 'Enabled' : 'Manual'
}

export function getRemainingRewardsRaw(
  pool: Pool.DeserializedPool<Token>,
  currentBlock: number,
): number {
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!perBlock.gt(0) || !pool.earningToken?.decimals) return 0
  const blocksRemaining = safeBlocksRemaining(pool, currentBlock)
  if (!Number.isFinite(blocksRemaining) || blocksRemaining <= 0) return 0
  const raw = getBalanceNumber(perBlock.times(blocksRemaining), pool.earningToken.decimals)
  return Number.isFinite(raw) && raw > 0 ? raw : 0
}

export function getRemainingRewards(
  pool: Pool.DeserializedPool<Token>,
  currentBlock: number,
): { label: string; pct: number; tone: 'green' | 'yellow' | 'red'; raw: number } {
  const remaining = getRemainingRewardsRaw(pool, currentBlock)
  const sym = pool.earningToken?.symbol ?? ''
  if (remaining < 0.01) {
    return { label: '—', pct: 0, tone: 'red', raw: 0 }
  }
  const text =
    remaining >= 1_000_000
      ? `${(remaining / 1_000_000).toFixed(2)}M ${sym}`
      : remaining >= 1_000
        ? `${(remaining / 1_000).toFixed(1)}K ${sym}`
        : `${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${sym}`

  const start = pool.startBlock ?? 0
  const end = pool.endBlock ?? 0
  const total = end > start ? end - start : 0
  const blocksRemaining = safeBlocksRemaining(pool, currentBlock)
  const pct =
    total > 0 && Number.isFinite(blocksRemaining)
      ? Math.min(100, Math.max(0, (blocksRemaining / total) * 100))
      : 50
  const tone: 'green' | 'yellow' | 'red' = pct > 50 ? 'green' : pct > 20 ? 'yellow' : 'red'
  return { label: text, pct, tone, raw: remaining }
}

export function getDailyRewardTokens(pool: Pool.DeserializedPool<Token>): number {
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!perBlock.gt(0) || !pool.earningToken?.decimals) return 0
  return getBalanceNumber(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)
}

export function getDailyRewardUsd(pool: Pool.DeserializedPool<Token>): number {
  const daily = getDailyRewardTokens(pool)
  const price = pool.earningTokenPrice || pool.stakingTokenPrice || 0
  return daily * price
}

export function getEstimatedDailyReward(pool: Pool.DeserializedPool<Token>): string {
  const daily = getDailyRewardTokens(pool)
  if (daily <= 0 || !pool.earningToken?.symbol) return '—'
  const sym = pool.earningToken.symbol
  const n = daily >= 1000 ? daily.toLocaleString(undefined, { maximumFractionDigits: 0 }) : daily.toFixed(1)
  return `≈ ${n} ${sym}/day`
}

export function getWeeklyMonthlyRewards(pool: Pool.DeserializedPool<Token>): { weekly: string; monthly: string } {
  const daily = getDailyRewardTokens(pool)
  const sym = pool.earningToken?.symbol ?? ''
  const price = pool.earningTokenPrice || pool.stakingTokenPrice || 0
  if (daily <= 0) return { weekly: '—', monthly: '—' }
  const weeklyUsd = daily * 7 * price
  const monthlyUsd = daily * 30 * price
  const fmt = (usd: number) => {
    if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`
    if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`
    return `$${usd.toFixed(2)}`
  }
  return { weekly: fmt(weeklyUsd), monthly: fmt(monthlyUsd) }
}

export function getRewardBudgetUsd(pool: Pool.DeserializedPool<Token>, currentBlock: number): number {
  const remaining = getRemainingRewardsRaw(pool, currentBlock)
  const price = pool.earningTokenPrice || pool.stakingTokenPrice || 0
  return remaining * price
}

export function formatRewardBudgetUsd(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) return '—'
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`
  return `$${usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function getEstimatedDuration(pool: Pool.DeserializedPool<Token>, currentBlock: number): string {
  const blocksRemaining = safeBlocksRemaining(pool, currentBlock)
  if (!Number.isFinite(blocksRemaining) || blocksRemaining <= 0) return '—'
  const days = Math.ceil(blocksRemaining / BLOCKS_PER_DAY)
  if (!Number.isFinite(days) || days <= 0) return '—'
  return `${days} Days Remaining`
}

export function getPoolSafetyRisk(
  pool: Pool.DeserializedPool<Token>,
  currentBlock: number,
): PoolSafetyRisk {
  const badge = getRewardBadge(pool)
  const { pct } = getRemainingRewards(pool, currentBlock)
  if (badge === 'Official' && pct > 40) return 'Very Low'
  if (badge === 'Official' || (badge === 'Partner' && pct > 30)) return 'Low'
  if (pct > 20) return 'Medium'
  return 'High'
}

export function getRewardSustainability(
  pool: Pool.DeserializedPool<Token>,
  currentBlock: number,
): { level: string; score: number } {
  const { pct } = getRemainingRewards(pool, currentBlock)
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!perBlock.gt(0)) return { level: 'Low', score: 15 }
  if (pct > 60) return { level: 'Very High', score: 92 }
  if (pct > 35) return { level: 'High', score: 72 }
  if (pct > 15) return { level: 'Medium', score: 48 }
  return { level: 'Low', score: 22 }
}

export function poolIsEnabled(pool: Pool.DeserializedPool<Token>): boolean {
  if (pool.isFinished) return false
  return true
}

export function poolIsLive(pool: Pool.DeserializedPool<Token>, currentBlock: number): boolean {
  if (!poolIsEnabled(pool)) return false
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!perBlock.gt(0)) return false
  const remaining = getRemainingRewardsRaw(pool, currentBlock)
  if (!Number.isFinite(remaining) || remaining <= 0) return false
  const price = pool.earningTokenPrice || pool.stakingTokenPrice || 0
  if (price > 0) {
    const budgetUsd = getRewardBudgetUsd(pool, currentBlock)
    if (!Number.isFinite(budgetUsd) || budgetUsd <= MIN_REWARD_BUDGET_USD) return false
  }
  return true
}

export function getPoolDisplayStatus(
  pool: Pool.DeserializedPool<Token>,
  runtimeStatus: PoolPreviewCard['status'],
  currentBlock: number,
): PoolDisplayStatus {
  if (runtimeStatus === 'indexing') return 'INDEXING'
  if (!poolIsLive(pool, currentBlock) || runtimeStatus === 'ended') return 'ENDED'
  return 'LIVE'
}

export function normalizeAddress(value: unknown, chainId = 56): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    if (typeof obj[chainId] === 'string') return obj[chainId] as string
    if (typeof obj[56] === 'string') return obj[56] as string
    if (typeof obj.address === 'string') return obj.address
    if (typeof obj.checksumAddress === 'string') return obj.checksumAddress
    if (typeof obj.value === 'string') return obj.value
    if (obj.address) return normalizeAddress(obj.address, chainId)
  }
  return ''
}

export function getContractRef(pool: Pool.DeserializedPool<Token>, chainId = 56) {
  const rawContract = pool.contractAddress ?? pool.earningToken?.address
  let address = ''
  if (rawContract && typeof rawContract === 'object' && typeof (rawContract as Record<string, string>)[chainId] === 'string') {
    address = getAddress(rawContract as Pool.Address, chainId)
  } else {
    address = normalizeAddress(rawContract, chainId)
  }
  if (!address && pool.sousId === 0) {
    address = normalizeAddress(pool.stakingToken?.address, chainId)
  }
  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : `sousId ${pool.sousId}`
  const explorerUrl = address ? getAddressExplorerUrl(address, chainId) : getBlockExplorerBaseUrl(chainId)
  return { address, explorerUrl, label: short }
}

export function getTokenExplorerUrl(address: unknown, chainId = 56): string {
  const normalized = normalizeAddress(address)
  if (!normalized) return getBlockExplorerBaseUrl(chainId)
  return buildTokenExplorerUrl(normalized, chainId)
}

export function resolvePoolMachineRecommendedAction(card: PoolPreviewCard): 'stake' | 'analyze' | 'none' {
  if (card.displayStatus === 'ENDED' || card.status === 'ended') return 'none'
  if (card.cta === 'stake') return 'stake'
  if (card.cta === 'analyze') return 'analyze'
  return 'none'
}

export function buildPoolMachineV2(card: PoolPreviewCard, chainId = 56) {
  const pool = card.rawPool
  const contract = pool ? getContractRef(pool, chainId) : { address: card.contractAddress ?? '', explorerUrl: card.explorerUrl ?? '', label: card.contractLabel ?? '' }
  return {
    schema: 'melega.pool.v2',
    poolId: card.id,
    stakeToken: card.stakeToken ?? card.tokens[0] ?? '',
    rewardToken: card.rewardToken,
    rawApr: card.rawApr ?? card.aprExact ?? 0,
    sustainableAprDisplay: card.sustainableAprDisplay ?? card.apr,
    aprDisplayReason: card.aprDisplayReason,
    apr: card.aprExact ?? 0,
    aprDisplay: card.apr,
    rewardBudget: card.rewardBudgetUsd,
    remainingRewards: card.remainingRewards,
    poolType: card.visualType ?? card.poolTypeLabel,
    cooldown: card.cooldown,
    lockPeriod: card.lockPeriod,
    contractAddress: contract.address,
    contract: contract.address,
    explorerUrl: contract.explorerUrl,
    healthScore: card.healthScore ?? card.sustainabilityScore,
    visibilityStatus: card.visibilityStatus,
    hiddenReason: card.hiddenReason,
    displayable:
      card.visibilityStatus === 'VISIBLE' &&
      card.status === 'live' &&
      card.displayStatus === 'LIVE' &&
      Boolean(card.sustainableAprDisplay),
    status: card.displayStatus,
    recommendedAction: resolvePoolMachineRecommendedAction(card),
  }
}
