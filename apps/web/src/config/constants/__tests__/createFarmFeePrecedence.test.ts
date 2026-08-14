/**
 * Create Farm fee precedence — Founder priority rules exercised via the shared
 * describeCreateFarmFee / resolveCreateFarmFeeBnb helpers (no duplicated rule literals).
 *
 * Priority order (first match wins):
 *   1. Reward token is MARCO           → 1.00 BNB (createFarm.marcoReward)
 *   2. LP pair contains MARCO          → FREE     (createFarm.marcoPairFree)
 *   3. Otherwise                       → 0.25 BNB (createFarm.defaultBnb)
 */
import { describe, expect, it } from 'vitest'
import {
  describeCreateFarmFee,
  MELEGA_TREASURY_FEE_DESTINATION,
  resolveCreateFarmFeeBnb,
} from 'config/constants/feeSchedule'

const TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'

describe('CREATE_FARM_FEE_PRECEDENCE', () => {
  it('treasury destination is the MELEGA TREASURY WALLET', () => {
    expect(MELEGA_TREASURY_FEE_DESTINATION).toBe(TREASURY)
  })

  it('rule 1 wins: reward token MARCO, non-MARCO pair → 1.00 BNB', () => {
    const fee = describeCreateFarmFee({ rewardTokenIsMarco: true, pairContainsMarco: false })
    expect(fee.feeBnb).toBe('1.00')
    expect(fee.display).toBe('1.00 BNB')
    expect(fee.isFree).toBe(false)
    expect(fee.ruleApplied).toBe('createFarm.marcoReward')
    expect(fee.reason).toBe('reward token is MARCO')
    expect(fee.recipient).toBe(TREASURY)
    expect(fee.recipientLabel).toBe('MELEGA TREASURY WALLET')
  })

  it('rule 1 takes precedence over rule 2: reward MARCO + pair contains MARCO still charges 1.00 BNB', () => {
    const fee = describeCreateFarmFee({ rewardTokenIsMarco: true, pairContainsMarco: true })
    expect(fee.feeBnb).toBe('1.00')
    expect(fee.ruleApplied).toBe('createFarm.marcoReward')
    expect(resolveCreateFarmFeeBnb({ rewardTokenIsMarco: true, pairContainsMarco: true })).toBe('1.00')
  })

  it('rule 2: non-MARCO reward, LP pair contains MARCO → FREE', () => {
    const fee = describeCreateFarmFee({ rewardTokenIsMarco: false, pairContainsMarco: true })
    expect(fee.feeBnb).toBe('0')
    expect(fee.display).toBe('FREE')
    expect(fee.isFree).toBe(true)
    expect(fee.ruleApplied).toBe('createFarm.marcoPairFree')
    expect(fee.reason).toBe('LP pair contains MARCO · reward is not MARCO')
  })

  it('rule 3: non-MARCO reward, non-MARCO pair → default 0.25 BNB', () => {
    const fee = describeCreateFarmFee({ rewardTokenIsMarco: false, pairContainsMarco: false })
    expect(fee.feeBnb).toBe('0.25')
    expect(fee.display).toBe('0.25 BNB')
    expect(fee.isFree).toBe(false)
    expect(fee.ruleApplied).toBe('createFarm.defaultBnb')
    expect(fee.reason).toBe('LP pair without MARCO · non-MARCO reward')
  })

  it('resolveCreateFarmFeeBnb matches describeCreateFarmFee.feeBnb for every input combination', () => {
    for (const rewardTokenIsMarco of [true, false]) {
      for (const pairContainsMarco of [true, false]) {
        const input = { rewardTokenIsMarco, pairContainsMarco }
        expect(resolveCreateFarmFeeBnb(input)).toBe(describeCreateFarmFee(input).feeBnb)
      }
    }
  })
})
