import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { resolveFarmCardActions } from '../farmsViewActions'
import type { FarmPreviewCard } from '../../farmsStudioData'

const baseFarm: FarmPreviewCard = {
  id: 'farm-1',
  pair: 'BNB / MARCO',
  tokens: ['BNB', 'MARCO'],
  apr: '24%',
  status: 'live',
  tvl: '$500K',
  liquidity: '$500K',
  dailyRewards: '50',
  multiplier: '2x',
  cta: 'stake',
}

describe('farms view actions', () => {
  it('shows stake withdraw claim analyze for active position', () => {
    const farm = {
      ...baseFarm,
      userStaked: new BigNumber(3),
      pendingReward: new BigNumber(1),
    }
    expect(resolveFarmCardActions(farm, '0xabc')).toEqual(['stake', 'withdraw', 'claim', 'analyze'])
  })

  it('shows analyze only for indexing farms', () => {
    expect(resolveFarmCardActions({ ...baseFarm, status: 'indexing', cta: 'analyze' }, '0xabc')).toEqual(['analyze'])
  })

  it('hides withdraw without wallet even when staked', () => {
    const farm = { ...baseFarm, userStaked: new BigNumber(2) }
    expect(resolveFarmCardActions(farm, null)).toEqual(['stake', 'analyze'])
  })
})
