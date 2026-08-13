import { describe, expect, it } from 'vitest'
import { computeFarmAprPercent } from '../modules/publicFarmEconomics'

describe('public farm factual economics', () => {
  it('annualizes the configured daily reward against live pair TVL', () => {
    expect(
      computeFarmAprPercent({
        dailyRewardTokens: 100,
        rewardTokenUsd: 0.5,
        pairTvlBnb: 10,
        bnbUsd: 500,
      }),
    ).toBeCloseTo(365, 8)
  })

  it('fails empty when market inputs are unavailable', () => {
    expect(
      computeFarmAprPercent({
        dailyRewardTokens: 100,
        rewardTokenUsd: null,
        pairTvlBnb: 10,
        bnbUsd: 500,
      }),
    ).toBeNull()
  })

  it('never fabricates an APR for invalid liquidity or price inputs', () => {
    expect(
      computeFarmAprPercent({
        dailyRewardTokens: 100,
        rewardTokenUsd: 0.5,
        pairTvlBnb: 0,
        bnbUsd: 500,
      }),
    ).toBeNull()
  })
})
