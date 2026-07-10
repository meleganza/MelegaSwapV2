import { describe, expect, it } from 'vitest'
import { buildPoolGateReport } from '../buildPoolGateReport'
import type { PoolPreviewCard } from '../../poolsStudioData'

function mockCard(overrides: Partial<PoolPreviewCard>): PoolPreviewCard {
  return {
    id: 'sous-1',
    sousId: 1,
    poolType: 'Flexible Pool',
    name: 'MARCO → BNB',
    tokens: ['MARCO', 'BNB'],
    stakeToken: 'MARCO',
    apr: '12.00%',
    sustainableAprDisplay: '12.00%',
    rawApr: 12,
    aprExact: 12,
    status: 'live',
    displayStatus: 'LIVE',
    visibilityStatus: 'VISIBLE',
    rewardToken: 'BNB',
    tvl: '$1.2K',
    rewardBudgetUsd: '$500',
    dailyRewards: '10 / day',
    ...overrides,
  } as PoolPreviewCard
}

describe('buildPoolGateReport', () => {
  it('classifies displayable and hidden pools', () => {
    const { gateAudit, gateSummary } = buildPoolGateReport([
      mockCard({ id: 'live-1' }),
      mockCard({
        id: 'ended-1',
        status: 'ended',
        displayStatus: 'ENDED',
        visibilityStatus: 'HIDDEN',
        hiddenReason: 'POOL_ENDED',
        sustainableAprDisplay: undefined,
      }),
      mockCard({
        id: 'no-apr',
        visibilityStatus: 'HIDDEN',
        hiddenReason: 'INVALID_APR',
        sustainableAprDisplay: undefined,
      }),
    ])

    expect(gateSummary.discovered).toBe(3)
    expect(gateSummary.validLive).toBe(1)
    expect(gateSummary.ended).toBe(1)
    expect(gateSummary.missingApr).toBe(1)
    expect(gateAudit.find((e) => e.poolId === 'live-1')?.displayable).toBe(true)
    expect(gateAudit.find((e) => e.poolId === 'ended-1')?.category).toBe('ended')
  })
})
