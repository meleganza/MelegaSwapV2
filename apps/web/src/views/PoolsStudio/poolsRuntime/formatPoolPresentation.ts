import BigNumber from 'bignumber.js'
import { Token } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/uikit'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { PoolCategory } from 'config/constants/types'
import { VaultKey } from 'state/types'
import { getPoolBlockInfo } from 'views/Pools/helpers'
import type { PoolPreviewCard } from '../poolsStudioData'

const BLOCKS_PER_DAY = 28800
export const MAX_DISPLAY_APR = 50

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

export type PoolDisplayStatus = 'LIVE' | 'ENDED' | 'ENDING SOON' | 'NEW' | 'INDEXING'

export type RewardSustainability = 'Very High' | 'High' | 'Medium' | 'Low'

function tokenPerBlockBn(tokenPerBlock: Pool.DeserializedPool<Token>['tokenPerBlock']): BigNumber {
  if (!tokenPerBlock) return new BigNumber(0)
  if (typeof (tokenPerBlock as BigNumber).times === 'function') return tokenPerBlock as BigNumber
  return new BigNumber(tokenPerBlock as string | number)
}

export function getPoolVisualType(pool: Pool.DeserializedPool<Token>): PoolVisualType {
  if (pool.vaultKey === VaultKey.CakeFlexibleSideVault) return 'Auto Compound'
  if (pool.vaultKey === VaultKey.CakeVault) return '365 Days'
  if (pool.poolCategory === PoolCategory.CORE || pool.sousId === 0) return 'Official'
  if (pool.poolCategory === PoolCategory.BINANCE) return 'Partner'
  if (pool.poolCategory === PoolCategory.COMMUNITY) return 'Community'
  return 'Flexible'
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
  if (pool.vaultKey === VaultKey.CakeFlexibleSideVault) return 'None'
  return 'None'
}

export function getRemainingRewards(
  pool: Pool.DeserializedPool<Token>,
  currentBlock: number,
): { label: string; pct: number; tone: 'green' | 'yellow' | 'red' } {
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!perBlock.gt(0) || !pool.earningToken?.decimals) {
    return { label: '—', pct: 0, tone: 'red' }
  }
  const { blocksRemaining } = getPoolBlockInfo(pool, currentBlock)
  const remaining = getBalanceNumber(perBlock.times(blocksRemaining), pool.earningToken.decimals)
  const sym = pool.earningToken.symbol ?? ''
  const text =
    remaining >= 1_000_000
      ? `${(remaining / 1_000_000).toFixed(2)}M ${sym}`
      : remaining >= 1_000
        ? `${(remaining / 1_000).toFixed(1)}K ${sym}`
        : `${remaining.toFixed(2)} ${sym}`

  const start = pool.startBlock ?? 0
  const end = pool.endBlock ?? 0
  const total = end > start ? end - start : 0
  const pct = total > 0 ? Math.min(100, Math.max(0, (blocksRemaining / total) * 100)) : 50
  const tone: 'green' | 'yellow' | 'red' = pct > 50 ? 'green' : pct > 20 ? 'yellow' : 'red'
  return { label: text, pct, tone }
}

export function getEstimatedDailyReward(pool: Pool.DeserializedPool<Token>): string {
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!perBlock.gt(0) || !pool.earningToken?.decimals) return '—'
  const daily = getBalanceNumber(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)
  const sym = pool.earningToken.symbol ?? ''
  const n = daily >= 1000 ? daily.toFixed(1) : daily.toFixed(2)
  return `≈ ${n} ${sym}/day`
}

export function getRewardSustainability(
  pool: Pool.DeserializedPool<Token>,
  currentBlock: number,
): { level: RewardSustainability; score: number } {
  const { pct } = getRemainingRewards(pool, currentBlock)
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  const hasEmission = perBlock.gt(0)
  if (!hasEmission) return { level: 'Low', score: 15 }
  if (pct > 60) return { level: 'Very High', score: 92 }
  if (pct > 35) return { level: 'High', score: 72 }
  if (pct > 15) return { level: 'Medium', score: 48 }
  return { level: 'Low', score: 22 }
}

export function getPoolDisplayStatus(
  pool: Pool.DeserializedPool<Token>,
  runtimeStatus: PoolPreviewCard['status'],
  currentBlock: number,
): PoolDisplayStatus {
  if (runtimeStatus === 'indexing') return 'INDEXING'
  if (runtimeStatus === 'ended') return 'ENDED'
  const { blocksRemaining } = getPoolBlockInfo(pool, currentBlock)
  const start = pool.startBlock ?? 0
  if (start > 0 && currentBlock - start < BLOCKS_PER_DAY * 3) return 'NEW'
  if (blocksRemaining > 0 && blocksRemaining < BLOCKS_PER_DAY * 7) return 'ENDING SOON'
  return 'LIVE'
}

export function getContractRef(pool: Pool.DeserializedPool<Token>, chainId = 56): {
  address: string
  explorerUrl: string
  label: string
} {
  const address = pool.earningToken?.address ?? pool.stakingToken?.address ?? ''
  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : `sousId ${pool.sousId}`
  const explorerUrl = address ? `https://bscscan.com/token/${address}` : `https://bscscan.com`
  return { address, explorerUrl, label: short }
}

export function formatDisplayApr(rawApr: number, pool: Pool.DeserializedPool<Token>): {
  display: string | undefined
  exact: number
} {
  if (!Number.isFinite(rawApr) || rawApr <= 0) return { display: undefined, exact: rawApr }
  if (rawApr > MAX_DISPLAY_APR) return { display: '50%+', exact: rawApr }
  const isMarco =
    pool.vaultKey === VaultKey.CakeVault ||
    pool.vaultKey === VaultKey.CakeFlexibleSideVault ||
    (pool.stakingToken?.symbol === 'MARCO' && pool.sousId === 0)
  if (isMarco && rawApr > 15) return { display: `${Math.min(rawApr, 15).toFixed(2)}%`, exact: rawApr }
  return { display: `${rawApr.toFixed(2)}%`, exact: rawApr }
}

export function buildPoolMachineV2(card: PoolPreviewCard, chainId = 56) {
  const pool = card.rawPool
  const contract = pool ? getContractRef(pool, chainId) : { address: '', explorerUrl: '', label: '' }
  return {
    schema: 'melega.pool.v2',
    poolId: card.id,
    stakeToken: card.stakeToken ?? card.tokens[0] ?? '',
    rewardToken: card.rewardToken,
    apr: card.aprExact ?? parseFloat(card.apr?.replace(/[^0-9.]/g, '') || '0'),
    aprDisplay: card.apr,
    remainingRewards: card.remainingRewards,
    poolType: card.visualType,
    cooldown: card.cooldown,
    lockPeriod: card.lockPeriod,
    contract: contract.address,
    explorerUrl: contract.explorerUrl,
    status: card.displayStatus,
    recommendedAction:
      card.status === 'ended' ? 'none' : card.cta === 'stake' ? 'stake' : card.cta === 'analyze' ? 'analyze' : 'none',
  }
}
