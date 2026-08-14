/**
 * Public Farm Factory fee rules — consume fee-schedule.json via feeSchedule helpers.
 *
 * Public Factory-specific rule (documented, not a silent SSOT rewrite):
 * reward token == MARCO is REJECTED (unsupported). The broader governance
 * schedule still records createFarm.marcoReward → 1.00 BNB for protocol/admin
 * paths; Public Farm Factory never offers that path.
 */
import {
  describeCreateFarmFee,
  MELEGA_TREASURY_FEE_DESTINATION,
  resolveCreateFarmFeeBnb,
  type CreateFeeDisplay,
} from 'config/constants/feeSchedule'
import { rejectMarcoReward } from './publicFarmEligibility'

export const PUBLIC_FARM_FACTORY_FEE_POLICY = {
  schema: 'melega.dex.v1.public-farm-factory-fee-policy',
  marcoReward: 'UNSUPPORTED',
  marcoRewardMessage:
    'MARCO reward farms are protocol-managed and cannot be created through the Public Farm Factory.',
  whenPairContainsMarco: 'FREE',
  otherwise: '0.25 BNB',
  recipient: MELEGA_TREASURY_FEE_DESTINATION,
  recipientLabel: 'MELEGA TREASURY WALLET',
  treasuryRuntime: 'FORBIDDEN',
  consumes: 'apps/web/src/config/constants/fee-schedule.json via feeSchedule.ts',
  note:
    'Does not preserve the public 1 BNB MARCO-reward path. Governance SSOT rule createFarm.marcoReward remains for protocol-managed farms only.',
} as const

export type PublicFarmFactoryFeeResult =
  | {
      ok: false
      rejected: true
      reason: 'MARCO_REWARD_UNSUPPORTED'
      message: string
      recipient: string
    }
  | {
      ok: true
      rejected: false
      fee: CreateFeeDisplay
      feeBnb: string
      isFree: boolean
    }

/** Resolve Public Farm Factory creation fee — rejects MARCO rewards with no bypass. */
export function resolvePublicFarmFactoryFee(input: {
  rewardToken: string | null | undefined
  pairContainsMarco: boolean
}): PublicFarmFactoryFeeResult {
  const marco = rejectMarcoReward(input.rewardToken)
  if (marco.rejected) {
    return {
      ok: false,
      rejected: true,
      reason: 'MARCO_REWARD_UNSUPPORTED',
      message: marco.message!,
      recipient: MELEGA_TREASURY_FEE_DESTINATION,
    }
  }

  const fee = describeCreateFarmFee({
    rewardTokenIsMarco: false,
    pairContainsMarco: input.pairContainsMarco,
  })
  // Defense: never surface the 1.00 BNB MARCO path through Public Factory.
  if (fee.ruleApplied === 'createFarm.marcoReward' || fee.feeBnb === '1.00') {
    return {
      ok: false,
      rejected: true,
      reason: 'MARCO_REWARD_UNSUPPORTED',
      message: PUBLIC_FARM_FACTORY_FEE_POLICY.marcoRewardMessage,
      recipient: MELEGA_TREASURY_FEE_DESTINATION,
    }
  }

  return {
    ok: true,
    rejected: false,
    fee,
    feeBnb: fee.feeBnb,
    isFree: fee.isFree,
  }
}

/** Wei amount for on-chain msg.value (0 or 0.25e18). Null when rejected. */
export function publicFarmFactoryFeeWei(input: {
  rewardToken: string | null | undefined
  pairContainsMarco: boolean
}): bigint | null {
  const resolved = resolvePublicFarmFactoryFee(input)
  if (!resolved.ok) return null
  const bnb = resolveCreateFarmFeeBnb({
    rewardTokenIsMarco: false,
    pairContainsMarco: input.pairContainsMarco,
  })
  if (bnb === '0' || bnb === '0.00') return 0n
  if (bnb === '0.25') return 250000000000000000n
  return null
}
