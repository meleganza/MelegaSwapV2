import { describe, expect, it } from 'vitest'
import { resetUserState } from 'state/global/actions'
import farmsReducer from 'state/farms/reducer'
import poolsReducer from 'state/pools/reducer'

describe('Wave 2 lightweight Farms and Pools reducers', () => {
  it('preserves farm initialization, public data, user data and reset semantics', () => {
    const farm = {
      pid: 7,
      lpSymbol: 'MARCO-BNB LP',
      userData: { allowance: '0', tokenBalance: '0', stakedBalance: '0', earnings: '0' },
    }
    const initialized = farmsReducer(undefined, {
      type: 'farms/fetchInitialFarmsData/fulfilled',
      payload: { data: [farm], chainId: 56 },
    })
    expect(initialized.chainId).toBe(56)
    expect(initialized.data).toHaveLength(1)

    const withPublicData = farmsReducer(initialized, {
      type: 'farms/fetchFarmsPublicDataAsync/fulfilled',
      payload: [[{ pid: 7, multiplier: '3X' }], 12, 4],
      meta: { arg: { chainId: 56, pids: [7] } },
    })
    expect(withPublicData.data[0]).toMatchObject({ pid: 7, multiplier: '3X' })
    expect(withPublicData.poolLength).toBe(12)
    expect(withPublicData.regularCakePerBlock).toBe(4)

    const withUserData = farmsReducer(withPublicData, {
      type: 'farms/fetchFarmUserDataAsync/fulfilled',
      payload: [{ pid: 7, allowance: '1', tokenBalance: '2', stakedBalance: '3', earnings: '4' }],
      meta: { arg: { chainId: 56, pids: [7] } },
    })
    expect(withUserData.userDataLoaded).toBe(true)
    expect(withUserData.data[0].userData?.stakedBalance).toBe('3')

    const reset = farmsReducer(withUserData, resetUserState({ chainId: 56 }))
    expect(reset.userDataLoaded).toBe(false)
    expect(reset.data[0].userData?.stakedBalance).toBe('0')
  })

  it('preserves pool public data, user data, vault data and reset semantics', () => {
    const pool = {
      sousId: 4,
      stakingToken: { symbol: 'MARCO' },
      earningToken: { symbol: 'EYED' },
    }
    const withPools = poolsReducer(undefined, { type: 'Pools/setPoolsPublicData', payload: [pool] })
    expect(withPools.data).toHaveLength(1)

    const withUserData = poolsReducer(withPools, {
      type: 'pool/fetchPoolsUserData/fulfilled',
      payload: [{ sousId: 4, allowance: '1', stakingTokenBalance: '2', stakedBalance: '3', pendingReward: '4' }],
    })
    expect(withUserData.userDataLoaded).toBe(true)
    expect(withUserData.data[0].userData?.pendingReward).toBe('4')

    const withVault = poolsReducer(withUserData, {
      type: 'cakeVault/fetchPublicData/fulfilled',
      payload: { totalShares: '12', totalDexTokenInVault: '24' },
    })
    expect(withVault.cakeVault.totalShares).toBe('12')

    const reset = poolsReducer(withVault, resetUserState({ chainId: 56 }))
    expect(reset.userDataLoaded).toBe(false)
    expect(reset.data[0].userData).toBeUndefined()
  })
})
