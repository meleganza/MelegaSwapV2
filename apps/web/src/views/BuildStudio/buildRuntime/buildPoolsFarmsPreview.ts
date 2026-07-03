import type { Pool } from '@pancakeswap/uikit'
import type { Token } from '@pancakeswap/sdk'
import { formatApr, formatUsd } from 'views/FarmsStudio/farmsRuntime/formatFarmsRuntime'
import { getPoolTypeLabel, formatApr as formatPoolApr } from 'views/PoolsStudio/poolsRuntime/formatPoolsRuntime'
import { createBuildRuntimeError } from './buildRuntimeErrors'

export interface PoolOrchestrationPreview {
  stakeToken: string
  rewardToken: string
  apr: string
  duration: string
  rewardBudget: string
  lock: string
  poolType: string
  available: boolean
}

export interface FarmOrchestrationPreview {
  lp: string
  reward: string
  apr: string
  budget: string
  multiplier: string
  duration: string
  available: boolean
}

export function buildPoolPreviewFromRuntime(
  pools: Pool.DeserializedPool<Token>[],
): PoolOrchestrationPreview {
  const marcoPool =
    pools.find((p) => p.stakingToken?.symbol === 'MARCO' || p.earningToken?.symbol === 'MARCO') ?? pools[0]

  if (!marcoPool) {
    return {
      stakeToken: 'Unavailable',
      rewardToken: 'Unavailable',
      apr: '—',
      duration: 'Unavailable',
      rewardBudget: 'Unavailable',
      lock: 'Unavailable',
      poolType: 'Unavailable',
      available: false,
    }
  }

  return {
    stakeToken: marcoPool.stakingToken?.symbol ?? 'MARCO',
    rewardToken: marcoPool.earningToken?.symbol ?? 'MARCO',
    apr: marcoPool.apr ? formatPoolApr(marcoPool.apr) : '—',
    duration: marcoPool.poolEndTime ? 'Configured on-chain' : 'Flexible',
    rewardBudget: 'Unavailable',
    lock: marcoPool.isFinished ? 'Ended' : 'Flexible',
    poolType: getPoolTypeLabel(marcoPool),
    available: true,
  }
}

export function buildFarmPreviewFromRuntime(
  farms: Array<{
    lpSymbol?: string
    earningToken?: { symbol?: string }
    apr?: number
    lpRewardsApr?: number
    multiplier?: { toString: () => string }
    liquidity?: { toNumber: () => number }
  }>,
): FarmOrchestrationPreview {
  const live = farms.find((f) => f.multiplier?.toString() !== '0X')
  if (!live) {
    return {
      lp: 'Unavailable',
      reward: 'Unavailable',
      apr: '—',
      budget: 'Unavailable',
      multiplier: '—',
      duration: 'Unavailable',
      available: false,
    }
  }

  const apr = (live.apr ?? 0) + (live.lpRewardsApr ?? 0)
  const tvl = live.liquidity?.toNumber()

  return {
    lp: live.lpSymbol ?? 'LP',
    reward: live.earningToken?.symbol ?? 'MARCO',
    apr: apr > 0 ? formatApr(apr) : '—',
    budget: 'Unavailable',
    multiplier: live.multiplier?.toString() ?? '—',
    duration: 'Unavailable',
    available: true,
  }
}

export function poolsRuntimeErrorIfEmpty(count: number) {
  return count === 0 ? createBuildRuntimeError('POOL_RUNTIME_UNAVAILABLE') : null
}

export function farmsRuntimeErrorIfEmpty(count: number) {
  return count === 0 ? createBuildRuntimeError('FARM_RUNTIME_UNAVAILABLE') : null
}
