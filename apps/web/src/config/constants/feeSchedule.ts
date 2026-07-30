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
