import { describe, expect, it } from 'vitest'
import {
  MARCO_REWARD_REJECTION_MESSAGE,
  PUBLIC_FARM_MINIMUM_TVL_BNB,
  evaluatePublicFarmEligibility,
  estimatePairTvlBnb,
  rejectMarcoReward,
} from '../modules/publicFarmEligibility'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { WBNB_BSC } from '../modules/publicFarmEligibility'

const WBNB = WBNB_BSC
const OTHER = '0x55d398326f99059ff775485246999027b3197955'

function wbnbPair(tvlBnb: number, classification = 'tradeable') {
  // TVL = 2 * (reserveWbnb / 1e18) ⇒ reserveWbnb = tvlBnb/2 * 1e18
  const reserveWbnb = BigInt(Math.round((tvlBnb / 2) * 1e18)).toString()
  return {
    pairAddress: '0x1111111111111111111111111111111111111111',
    token0: WBNB,
    token1: OTHER,
    reserve0: reserveWbnb,
    reserve1: '1000000000000000000',
    classification,
    indexed: true,
    sourceBlock: 123,
  }
}

describe('publicFarmEligibility', () => {
  it('uses 0.25 BNB minimum threshold', () => {
    expect(PUBLIC_FARM_MINIMUM_TVL_BNB).toBe(0.25)
  })

  it('estimates TVL as 2× WBNB reserve', () => {
    expect(estimatePairTvlBnb(wbnbPair(0.5))).toBeCloseTo(0.5, 6)
  })

  it('returns null TVL when pair has no WBNB side', () => {
    expect(
      estimatePairTvlBnb({
        token0: OTHER,
        token1: MARCO_BSC_ADDRESS,
        reserve0: '1',
        reserve1: '1',
      }),
    ).toBeNull()
  })

  it('eligibility pass at exactly 0.25 BNB boundary', () => {
    const result = evaluatePublicFarmEligibility(wbnbPair(0.25))
    expect(result.eligible).toBe(true)
    expect(result.status).toBe('eligible')
    expect(result.missingTvlBnb).toBe(0)
    expect(result.minimumTvlBnb).toBe(0.25)
  })

  it('eligibility fail below 0.25 with exact missing TVL', () => {
    const result = evaluatePublicFarmEligibility(wbnbPair(0.1))
    expect(result.eligible).toBe(false)
    expect(result.status).toBe('below_minimum_tvl')
    expect(result.currentTvlBnb).toBeCloseTo(0.1, 6)
    expect(result.missingTvlBnb).toBeCloseTo(0.15, 6)
  })

  it('rejects MARCO reward with canonical message', () => {
    const bySymbol = rejectMarcoReward('MARCO')
    expect(bySymbol.rejected).toBe(true)
    expect(bySymbol.message).toBe(MARCO_REWARD_REJECTION_MESSAGE)

    const byAddress = rejectMarcoReward(MARCO_BSC_ADDRESS)
    expect(byAddress.rejected).toBe(true)
    expect(byAddress.message).toBe(MARCO_REWARD_REJECTION_MESSAGE)
  })

  it('does not reject non-MARCO reward', () => {
    expect(rejectMarcoReward('USDT').rejected).toBe(false)
    expect(rejectMarcoReward(OTHER).rejected).toBe(false)
  })

  it('marks inactive pairs ineligible', () => {
    const result = evaluatePublicFarmEligibility(wbnbPair(1, 'inactive'))
    expect(result.eligible).toBe(false)
    expect(result.status).toBe('inactive')
  })
})
