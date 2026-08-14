import { describe, expect, it } from 'vitest'
import poolsReducer, { setPoolsPublicData } from '..'

describe('pool wallet refresh race', () => {
  it('preserves wallet stake data when a later public refresh completes', () => {
    const publicPool = {
      sousId: 7,
      stakingToken: { symbol: 'MARCO' },
      earningToken: { symbol: 'TOKEN' },
      totalStaked: '1',
    }
    let state = poolsReducer(undefined, setPoolsPublicData([publicPool] as never))
    state = poolsReducer(state, {
      type: 'pool/fetchPoolsUserData/fulfilled',
      payload: [
        {
          sousId: 7,
          allowance: '10',
          stakingTokenBalance: '20',
          stakedBalance: '30',
          pendingReward: '40',
        },
      ],
    })
    state = poolsReducer(state, setPoolsPublicData([{ ...publicPool, totalStaked: '2' }] as never))

    expect(state.userDataLoaded).toBe(true)
    expect(state.data[0].userData).toMatchObject({ stakedBalance: '30', pendingReward: '40' })
    expect(state.data[0].totalStaked).toBe('2')
  })
})
