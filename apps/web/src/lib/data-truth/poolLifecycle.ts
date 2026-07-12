import BigNumber from 'bignumber.js'
import { Token } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/uikit'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { getPoolBlockInfo } from 'views/Pools/helpers'
import { getContractRef, getRemainingRewardsRaw, poolIsLive } from 'views/PoolsStudio/poolsRuntime/formatPoolPresentation'

export interface PoolLifecycleFlags {
  contractVerified: boolean
  started: boolean
  ended: boolean
  rewardBalancePositive: boolean
  rewardPerBlockPositive: boolean
  stakeTokenResolved: boolean
  rewardTokenResolved: boolean
  totalStakedPositive: boolean
  active: boolean
  funded: boolean
  rewarding: boolean
  finished: boolean
  eligibleForDisplay: boolean
}

function tokenPerBlockBn(tokenPerBlock: Pool.DeserializedPool<Token>['tokenPerBlock']): BigNumber {
  if (!tokenPerBlock) return new BigNumber(0)
  if (typeof (tokenPerBlock as BigNumber).times === 'function') return tokenPerBlock as BigNumber
  return new BigNumber(tokenPerBlock as string | number)
}

/** Machine-readable SmartChef / SousChef lifecycle from on-chain pool state. */
export function derivePoolLifecycle(
  pool: Pool.DeserializedPool<Token>,
  currentBlock: number,
): PoolLifecycleFlags {
  const contract = getContractRef(pool)
  const contractVerified = Boolean(contract.address && contract.address.length >= 10)
  const stakeTokenResolved = Boolean(pool.stakingToken?.symbol && pool.stakingToken?.decimals)
  const rewardTokenResolved = Boolean(pool.earningToken?.symbol && pool.earningToken?.decimals)
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  const rewardPerBlockPositive = perBlock.gt(0)

  const staked =
    pool.totalStaked && pool.stakingToken?.decimals
      ? getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
      : 0
  const totalStakedPositive = staked > 0

  const remainingRaw = getRemainingRewardsRaw(pool, currentBlock)
  const rewardBalancePositive = remainingRaw > 0

  let started = true
  let ended = Boolean(pool.isFinished)
  const bonusEndBlock = Number(pool.bonusEndBlock ?? pool.endBlock)
  if (Number.isFinite(bonusEndBlock) && Number.isFinite(currentBlock) && currentBlock > bonusEndBlock) {
    ended = true
  }
  if (pool.sousId !== 0) {
    const { hasPoolStarted, hasPoolEnded } = getPoolBlockInfo(pool, currentBlock)
    started = hasPoolStarted
    ended = ended || hasPoolEnded
  }

  const active = started && !ended && (poolIsLive(pool, currentBlock) || rewardPerBlockPositive)
  const funded = rewardBalancePositive
  const rewarding = active && rewardPerBlockPositive && rewardBalancePositive
  const finished = ended || (!rewardPerBlockPositive && !rewardBalancePositive && started)

  return {
    contractVerified,
    started,
    ended,
    rewardBalancePositive,
    rewardPerBlockPositive,
    stakeTokenResolved,
    rewardTokenResolved,
    totalStakedPositive,
    active,
    funded,
    rewarding,
    finished,
    eligibleForDisplay: contractVerified && stakeTokenResolved && rewardTokenResolved,
  }
}

export interface PoolReconciliation {
  discovered: number
  validContracts: number
  future: number
  active: number
  funded: number
  rewarding: number
  finished: number
  invalid: number
  unresolved: number
}

export function reconcilePoolLifecycle(
  pools: Pool.DeserializedPool<Token>[],
  currentBlock: number,
): PoolReconciliation {
  const tally: PoolReconciliation = {
    discovered: 0,
    validContracts: 0,
    future: 0,
    active: 0,
    funded: 0,
    rewarding: 0,
    finished: 0,
    invalid: 0,
    unresolved: 0,
  }

  pools.forEach((pool) => {
    if (!pool?.earningToken) return
    tally.discovered += 1
    const lc = derivePoolLifecycle(pool, currentBlock)
    if (!lc.contractVerified) {
      tally.invalid += 1
      return
    }
    tally.validContracts += 1
    if (!lc.stakeTokenResolved || !lc.rewardTokenResolved) {
      tally.unresolved += 1
      return
    }
    if (!lc.started) {
      tally.future += 1
      return
    }
    if (lc.rewarding) tally.rewarding += 1
    if (lc.active) tally.active += 1
    if (lc.funded) tally.funded += 1
    if (lc.finished) tally.finished += 1
  })

  return tally
}

export const POOL_HIDDEN_REASON_LABELS: Record<string, string> = {
  POOL_ENDED: 'Rewards concluded',
  INDEXING: 'Pool is starting soon',
  METADATA_INCOMPLETE: 'Token metadata incomplete',
  NEEDS_FUNDING: 'Awaiting reward funding',
  NO_EMISSION: 'No active emission',
  APR_UNAVAILABLE: 'APR unavailable — insufficient stake or price data',
  REWARD_BUDGET_UNAVAILABLE: 'Reward budget unavailable',
  INVALID_CONTRACT: 'Contract could not be verified',
}
