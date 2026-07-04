import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { resolvePoolCardActions } from '../poolsViewActions'
import type { PoolPreviewCard } from '../../poolsStudioData'

const basePool: PoolPreviewCard = {
  id: 'pool-1',
  name: 'MARCO Pool',
  tokens: ['MARCO'],
  apr: '12%',
  tvl: '$1M',
  liquidity: '$1M',
  rewardToken: 'MARCO',
  multiplier: '1x',
  dailyRewards: '100',
  status: 'live',
  cta: 'stake',
  poolTypeLabel: 'Flexible',
}

describe('pools view actions', () => {
  it('shows stake + unstake + claim when user has position and rewards', () => {
    const pool = {
      ...basePool,
      userStaked: new BigNumber(10),
      pendingReward: new BigNumber(2),
    }
    expect(resolvePoolCardActions(pool, '0xabc')).toEqual(['stake', 'unstake', 'claim', 'analyze'])
  })

  it('shows coming soon for finished pools', () => {
    expect(resolvePoolCardActions({ ...basePool, cta: 'none', status: 'coming-soon' }, '0xabc')).toEqual(['coming-soon'])
  })

  it('hides unstake/claim without wallet', () => {
    const pool = { ...basePool, userStaked: new BigNumber(5), pendingReward: new BigNumber(1) }
    expect(resolvePoolCardActions(pool, undefined)).toEqual(['stake', 'analyze'])
  })
})
