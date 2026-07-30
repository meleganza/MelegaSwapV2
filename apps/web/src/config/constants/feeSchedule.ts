/**
 * Canonical Melega DEX V1 Founder fee schedule — single governance source.
 * Do not scatter fee literals; import from here or fee-schedule.json.
 */

import feeScheduleJson from './fee-schedule.json'

export const MELEGA_FEE_SCHEDULE = feeScheduleJson

export const MELEGA_TREASURY_FEE_DESTINATION =
  MELEGA_FEE_SCHEDULE.treasury.address as `0x${string}`

export const CREATE_TOKEN_FEE_FROM_SCHEDULE = MELEGA_FEE_SCHEDULE.services.createToken.fee

export const FEATURED_FEE_FROM_SCHEDULE = MELEGA_FEE_SCHEDULE.services.featuredProject.fee

export const SMART_ROUTER_FEE_FROM_SCHEDULE = MELEGA_FEE_SCHEDULE.services.smartRouter.fee

export const LIQUIDITY_BUILDER_FEE_FROM_SCHEDULE = MELEGA_FEE_SCHEDULE.services.liquidityBuilder.fee

export function getFounderFeeSchedule() {
  return MELEGA_FEE_SCHEDULE
}

export function assertTreasuryDestination(address: string): boolean {
  return address.toLowerCase() === MELEGA_TREASURY_FEE_DESTINATION.toLowerCase()
}

/** Create Pool fee resolution from Founder schedule. */
export function resolveCreatePoolFeeBnb(stakingTokenIsMarco: boolean): string {
  return stakingTokenIsMarco ? '0' : '0.25'
}

/** Create Farm fee resolution from Founder priority rules. */
export function resolveCreateFarmFeeBnb(input: {
  rewardTokenIsMarco: boolean
  pairContainsMarco: boolean
}): string {
  if (input.rewardTokenIsMarco) return '1.00'
  if (input.pairContainsMarco) return '0'
  return '0.25'
}

export type CreateFeeDisplay = {
  feeBnb: string
  display: string
  reason: string
  ruleApplied: string
  recipient: string
  recipientLabel: string
  isFree: boolean
}

/** Display helper — consumes resolveCreatePoolFeeBnb (no duplicated rule literals). */
export function describeCreatePoolFee(stakingTokenIsMarco: boolean): CreateFeeDisplay {
  const feeBnb = resolveCreatePoolFeeBnb(stakingTokenIsMarco)
  const isFree = feeBnb === '0' || feeBnb === '0.00'
  return {
    feeBnb,
    display: isFree ? 'FREE' : `${feeBnb} BNB`,
    reason: isFree ? 'MARCO staking pool' : 'non-MARCO staking token',
    ruleApplied: isFree ? 'createPool.marcoStakingFree' : 'createPool.defaultBnb',
    recipient: MELEGA_TREASURY_FEE_DESTINATION,
    recipientLabel: 'MELEGA TREASURY WALLET',
    isFree,
  }
}

/** Display helper — consumes resolveCreateFarmFeeBnb priority (first match wins). */
export function describeCreateFarmFee(input: {
  rewardTokenIsMarco: boolean
  pairContainsMarco: boolean
}): CreateFeeDisplay {
  const feeBnb = resolveCreateFarmFeeBnb(input)
  const isFree = feeBnb === '0' || feeBnb === '0.00'
  let ruleApplied = 'createFarm.defaultBnb'
  let reason = 'LP pair without MARCO · non-MARCO reward'
  if (input.rewardTokenIsMarco) {
    ruleApplied = 'createFarm.marcoReward'
    reason = 'reward token is MARCO'
  } else if (input.pairContainsMarco) {
    ruleApplied = 'createFarm.marcoPairFree'
    reason = 'LP pair contains MARCO · reward is not MARCO'
  }
  return {
    feeBnb,
    display: isFree ? 'FREE' : `${feeBnb} BNB`,
    reason,
    ruleApplied,
    recipient: MELEGA_TREASURY_FEE_DESTINATION,
    recipientLabel: 'MELEGA TREASURY WALLET',
    isFree,
  }
}
