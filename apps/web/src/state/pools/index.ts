import { createAsyncThunk, createSlice, PayloadAction, isAnyOf } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import keyBy from 'lodash/keyBy'
import poolsConfig, { livePools, livePools8453, livePools137 } from 'config/constants/pools'
import {
  PoolsState,
  SerializedPool,
  SerializedVaultFees,
  SerializedCakeVault,
  PublicIfoData,
  SerializedVaultUser,
  SerializedLockedCakeVault,
  AppThunk,
} from 'state/types'
import { getPoolApr } from 'utils/apr'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import cakeAbi from 'config/abi/cake.json'
import { getCakeVaultAddress, getCakeFlexibleSideVaultAddress } from 'utils/addressHelpers'
import { multicallv2 } from 'utils/multicall'
import { bscTokens } from '@pancakeswap/tokens'
import { isAddress } from 'utils'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { bscRpcProvider, baseRpcProvider, polygonRpcProvider } from 'utils/providers'
import { getPoolsPriceHelperLpFiles } from 'config/constants/priceHelperLps/index'
import fetchFarms from '../farms/fetchFarms'
import getFarmsPrices from '../farms/getFarmsPrices'
import {
  fetchPoolsBlockLimits,
  // fetchPoolsProfileRequirement,
  // fetchPoolsStakingLimits,
  fetchPoolsTotalStaking,
} from './fetchPools'
import {
  fetchPoolsAllowance,
  fetchUserBalances,
  fetchUserPendingRewards,
  fetchUserStakeBalances,
} from './fetchPoolsUser'
import { fetchPublicVaultData, fetchVaultFees, fetchPublicFlexibleSideVaultData } from './fetchVaultPublic'
import { getTokenPricesFromFarm } from './helpers'
import { resetUserState } from '../global/actions'
import { fetchUserIfoCredit, fetchPublicIfoData } from './fetchUserIfo'
import { fetchVaultUser, fetchFlexibleSideVaultUser } from './fetchVaultUser'

export const initialPoolVaultState = Object.freeze({
  totalShares: null,
  totalLockedAmount: null,
  pricePerFullShare: null,
  totalDexTokenInVault: null,
  fees: {
    performanceFee: null,
    callFee: null,
    withdrawalFee: null,
    withdrawalFeePeriod: null,
  },
  userData: {
    isLoading: true,
    userShares: null,
    dexTokenAtLastUserAction: null,
    lastDepositedTime: null,
    lastUserActionTime: null,
    credit: null,
    locked: null,
    lockStartTime: null,
    lockEndTime: null,
    userBoostedShare: null,
    lockedAmount: null,
    currentOverdueFee: null,
    currentPerformanceFee: null,
  },
  creditStartBlock: null,
})

export const initialIfoState = Object.freeze({
  credit: null,
  ceiling: null,
})

const initialState: PoolsState = {
  data: [],
  userDataLoaded: false,
  cakeVault: initialPoolVaultState,
  ifo: initialIfoState,
  // cakeFlexibleSideVault: initialPoolVaultState,
}

export const fetchCakePoolPublicDataAsync = (chainId?: number) => async (dispatch, getState) => {
  const farmsData = getState().farms.data
  const prices = getTokenPricesFromFarm(farmsData)
  const pools = chainId === 137 ? livePools137 : chainId === 8453 ? livePools8453 : poolsConfig
  const cakePool = pools.filter((p) => p.sousId === 0)[0]

  const stakingTokenAddress = isAddress(cakePool.stakingToken.address)
  const stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0

  const earningTokenAddress = isAddress(cakePool.earningToken.address)
  const earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0

  dispatch(
    setPoolPublicData({
      sousId: 0,
      data: {
        stakingTokenPrice,
        earningTokenPrice,
      },
    }),
  )
}

export const fetchCakePoolUserDataAsync = (account: string, chainId: number) => async (dispatch) => {
  const allowanceCall = {
    address: bscTokens.cake.address,
    name: 'allowance',
    params: [account, getCakeVaultAddress(chainId)],
  }
  const balanceOfCall = {
    address: bscTokens.cake.address,
    name: 'balanceOf',
    params: [account],
  }
  const cakeContractCalls = [allowanceCall, balanceOfCall]
  const [[allowance], [stakingTokenBalance]] = await multicallv2({ abi: cakeAbi, calls: cakeContractCalls })

  dispatch(
    setPoolUserData({
      sousId: 0,
      data: {
        allowance: new BigNumber(allowance.toString()).toJSON(),
        stakingTokenBalance: new BigNumber(stakingTokenBalance.toString()).toJSON(),
      },
    }),
  )
}

export const fetchPoolsPublicDataAsync =
  (currentBlockNumber: number, chainId: number) => async (dispatch, getState) => {
    try {
      const pools = chainId === 137 ? livePools137 : chainId === 8453 ? livePools8453 : poolsConfig
      const [blockLimits, totalStakings, currentBlock] = await Promise.all([
        fetchPoolsBlockLimits(chainId),
        fetchPoolsTotalStaking(chainId),
        // fetchPoolsProfileRequirement(),
        currentBlockNumber ? Promise.resolve(currentBlockNumber) : chainId === 56 ? bscRpcProvider.getBlockNumber() : chainId === 137 ? polygonRpcProvider.getBlockNumber() : baseRpcProvider.getBlockNumber(),
      ])

      const blockLimitsSousIdMap = keyBy(blockLimits, 'sousId')
      const totalStakingsSousIdMap = keyBy(totalStakings, 'sousId')

      const priceHelperLpsConfig = getPoolsPriceHelperLpFiles(chainId)

      const activePriceHelperLpsConfig = priceHelperLpsConfig.filter((priceHelperLpConfig) => {
        return (
          pools
            .filter(
              (pool) => pool.earningToken.address.toLowerCase() === priceHelperLpConfig.token.address.toLowerCase(),
            )
            .filter((pool) => {
              const poolBlockLimit = blockLimitsSousIdMap[pool.sousId]
              if (poolBlockLimit) {
                return poolBlockLimit.endBlock > currentBlock
              }
              return false
            }).length > 0
        )
      })

      const poolsWithDifferentFarmToken =
        activePriceHelperLpsConfig.length > 0 ? await fetchFarms(priceHelperLpsConfig, chainId) : []
      const farmsData = getState().farms.data

      const bnbBusdFarm =
        chainId == 56
          ? farmsData.find((farm) => farm.token.symbol === 'BUSD' && farm.quoteToken.symbol === 'WBNB')
          : chainId == 137 ? farmsData.find((farm) => farm.token.symbol === 'USDT' && farm.quoteToken.symbol === 'WMATIC')
            : farmsData.find((farm) => farm.token.symbol === 'USDC' && farm.quoteToken.symbol === 'WETH')

      const farmsWithPricesOfDifferentTokenPools = bnbBusdFarm
        ? getFarmsPrices([bnbBusdFarm, ...poolsWithDifferentFarmToken], chainId)
        : []

      const prices = getTokenPricesFromFarm([...farmsData, ...farmsWithPricesOfDifferentTokenPools])
      
      const liveData = pools.map((pool) => {
        const blockLimit = blockLimitsSousIdMap[pool.sousId]
        const totalStaking = totalStakingsSousIdMap[pool.sousId]
        const isPoolEndBlockExceeded =
          currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
        const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded

        const stakingTokenAddress = isAddress(pool.stakingToken.address)
        const stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0
        const earningTokenAddress = isAddress(pool.earningToken.address)
        const earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0
        
        const apr = !isPoolFinished
          ? getPoolApr(
            stakingTokenPrice,
            earningTokenPrice,
            getBalanceNumber(new BigNumber(totalStaking.totalStaked), pool.stakingToken.decimals),
            parseFloat(pool.tokenPerBlock),
          )
          : 0

        // const profileRequirement = profileRequirements[pool.sousId] ? profileRequirements[pool.sousId] : undefined

        return {
          ...pool,
          ...blockLimit,
          ...totalStaking,
          // profileRequirement,
          stakingTokenPrice,
          earningTokenPrice,
          apr,
          isFinished: isPoolFinished,
        }
      })

      dispatch(setPoolsPublicData(liveData))
    } catch (error) {
      console.error('[Pools Action] error when getting public data', error)
    }
  }

// export const fetchPoolsStakingLimitsAsync = () => async (dispatch, getState) => {
//   const poolsWithStakingLimit = getState()
//     .pools?.data.filter(({ stakingLimit }) => stakingLimit !== null && stakingLimit !== undefined)
//     .map((pool) => pool.sousId)

//   try {
//     const stakingLimits = await fetchPoolsStakingLimits(poolsWithStakingLimit)

//     const stakingLimitData = poolsConfig.map((pool) => {
//       if (poolsWithStakingLimit.includes(pool.sousId)) {
//         return { sousId: pool.sousId }
//       }
//       const { stakingLimit, numberBlocksForUserLimit } = stakingLimits[pool.sousId] || {
//         stakingLimit: BIG_ZERO,
//         numberBlocksForUserLimit: 0,
//       }
//       return {
//         sousId: pool.sousId,
//         stakingLimit: stakingLimit.toJSON(),
//         numberBlocksForUserLimit,
//       }
//     })

//     dispatch(setPoolsPublicData(stakingLimitData))
//   } catch (error) {
//     console.error('[Pools Action] error when getting staking limits', error)
//   }
// }

export const fetchPoolsUserDataAsync = createAsyncThunk<
  { sousId: number; allowance: any; stakingTokenBalance: any; stakedBalance: any; pendingReward: any }[],
  { account: string, chainId: number }
>('pool/fetchPoolsUserData', async ({ account, chainId }, { rejectWithValue }) => {
  try {
    const [allowances, stakingTokenBalances, stakedBalances, pendingRewards] = await Promise.all([
      fetchPoolsAllowance(account, chainId),
      fetchUserBalances(account, chainId),
      fetchUserStakeBalances(account, chainId),
      fetchUserPendingRewards(account, chainId),
    ])

    const pools = chainId === 137 ? livePools137 : chainId === 8453 ? livePools8453 : poolsConfig
    const userData = pools.map((pool) => ({
      sousId: pool.sousId,
      allowance: allowances[pool.sousId],
      stakingTokenBalance: stakingTokenBalances[pool.sousId],
      stakedBalance: stakedBalances[pool.sousId],
      pendingReward: pendingRewards[pool.sousId],
    }))
    return userData
  } catch (e) {
    return rejectWithValue(e)
  }
})

export const updateUserAllowance = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number }
>('pool/updateUserAllowance', async ({ sousId, account, chainId }) => {
  const allowances = await fetchPoolsAllowance(account, chainId)
  return { sousId, field: 'allowance', value: allowances[sousId] }
})

export const updateUserBalance = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number }
>('pool/updateUserBalance', async ({ sousId, account, chainId }) => {
  const tokenBalances = await fetchUserBalances(account, chainId)

  return { sousId, field: 'stakingTokenBalance', value: tokenBalances[sousId] }
})

export const updateUserStakedBalance = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string, chainId: number }
>('pool/updateUserStakedBalance', async ({ sousId, account, chainId }) => {
  const stakedBalances = await fetchUserStakeBalances(account, chainId)
  return { sousId, field: 'stakedBalance', value: stakedBalances[sousId] }
})

export const updateUserPendingReward = createAsyncThunk<
  { sousId: number; field: string; value: any },
  { sousId: number; account: string; chainId: number }
>('pool/updateUserPendingReward', async ({ sousId, account, chainId }) => {
  const pendingRewards = await fetchUserPendingRewards(account, chainId)
  return { sousId, field: 'pendingReward', value: pendingRewards[sousId] }
})

export const fetchCakeVaultPublicData = createAsyncThunk<SerializedLockedCakeVault, { chainId: number }>(
  'cakeVault/fetchPublicData',
  async ({ chainId }) => {
    const publicVaultInfo = await fetchPublicVaultData(chainId)
    return publicVaultInfo
  },
)

export const fetchCakeFlexibleSideVaultPublicData = createAsyncThunk<SerializedCakeVault, { chainId: number }>(
  'cakeFlexibleSideVault/fetchPublicData',
  async ({ chainId }) => {
    const publicVaultInfo = await fetchPublicFlexibleSideVaultData(chainId)
    return publicVaultInfo
  },
)

export const fetchCakeVaultFees = createAsyncThunk<SerializedVaultFees, { chainId: number }>('cakeVault/fetchFees', async ({ chainId }) => {
  const vaultFees = await fetchVaultFees(getCakeVaultAddress(chainId))
  return vaultFees
})

export const fetchCakeFlexibleSideVaultFees = createAsyncThunk<SerializedVaultFees, { chainId: number }>(
  'cakeFlexibleSideVault/fetchFees',
  async ({ chainId }) => {
    const vaultFees = await fetchVaultFees(getCakeFlexibleSideVaultAddress(chainId))
    return vaultFees
  },
)

export const fetchCakeVaultUserData = createAsyncThunk<SerializedVaultUser, { account: string, chainId?: number }>(
  'cakeVault/fetchUser',
  async ({ account, chainId }) => {
    const userData = await fetchVaultUser(account, chainId)
    return userData
  },
)

export const fetchIfoPublicDataAsync = createAsyncThunk<PublicIfoData>('ifoVault/fetchIfoPublicDataAsync', async () => {
  const publicIfoData = await fetchPublicIfoData()
  return publicIfoData
})

export const fetchUserIfoCreditDataAsync = (account: string) => async (dispatch) => {
  try {
    const credit = await fetchUserIfoCredit(account)
    dispatch(setIfoUserCreditData(credit))
  } catch (error) {
    console.error('[Ifo Credit Action] Error fetching user Ifo credit data', error)
  }
}
export const fetchCakeFlexibleSideVaultUserData = createAsyncThunk<SerializedVaultUser, { account: string, chainId?: number }>(
  'cakeFlexibleSideVault/fetchUser',
  async ({ account, chainId }) => {
    const userData = await fetchFlexibleSideVaultUser(account, chainId)
    return userData
  },
)

export const PoolsSlice = createSlice({
  name: 'Pools',
  initialState,
  reducers: {
    updatePoolsUserData: (state, action: PayloadAction<{ sousId: number; field: string; value: any }>) => {
      const { sousId, field, value } = action.payload
      const index = state.data.findIndex((p) => p.sousId === sousId)

      if (index >= 0) {
        state.data[index].userData = {
          ...state.data[index].userData,
          [field]: value,
        }
      }
    },
    setPoolPublicData: (state, action) => {
      const { sousId } = action.payload
      const poolIndex = state.data.findIndex((pool) => pool.sousId === sousId)
      state.data[poolIndex] = {
        ...state.data[poolIndex],
        ...action.payload.data,
      }
    },
    setPoolUserData: (state, action) => {
      const { sousId } = action.payload
      state.data = state.data.map((pool) => {
        if (pool.sousId === sousId) {
          return { ...pool, userDataLoaded: true, userData: action.payload.data }
        }
        return pool
      })
    },
    setPoolsPublicData: (state, action) => {
      const livePoolsData: SerializedPool[] = action.payload
      const livePoolsSousIdMap = keyBy(livePoolsData, 'sousId')

      state.data = livePoolsData;

      // state.data = state.data.map((pool) => {
      //   const livePoolData = livePoolsSousIdMap[pool.sousId]
      //   return { ...pool, ...livePoolData }
      // })
    },
    // IFO
    setIfoUserCreditData: (state, action) => {
      const credit = action.payload
      state.ifo = { ...state.ifo, credit }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state.data = state.data.map(({ userData, ...pool }) => {
        return { ...pool }
      })
      state.userDataLoaded = false
      state.cakeVault = { ...state.cakeVault, userData: initialPoolVaultState.userData }
      // state.cakeFlexibleSideVault = { ...state.cakeFlexibleSideVault, userData: initialPoolVaultState.userData }
    })
    builder.addCase(
      fetchPoolsUserDataAsync.fulfilled,
      (
        state,
        action: PayloadAction<
          { sousId: number; allowance: any; stakingTokenBalance: any; stakedBalance: any; pendingReward: any }[]
        >,
      ) => {
        const userData = action.payload
        const userDataSousIdMap = keyBy(userData, 'sousId')
        state.data = state.data.map((pool) => ({
          ...pool,
          userDataLoaded: true,
          userData: userDataSousIdMap[pool.sousId],
        }))
        state.userDataLoaded = true
      },
    )
    builder.addCase(fetchPoolsUserDataAsync.rejected, (state, action) => {
      console.error('[Pools Action] Error fetching pool user data', action.payload)
    })
    // Vault public data that updates frequently
    builder.addCase(fetchCakeVaultPublicData.fulfilled, (state, action: PayloadAction<SerializedLockedCakeVault>) => {
      state.cakeVault = { ...state.cakeVault, ...action.payload }
    })
    // builder.addCase(
    //   fetchCakeFlexibleSideVaultPublicData.fulfilled,
    //   (state, action: PayloadAction<SerializedCakeVault>) => {
    //     state.cakeFlexibleSideVault = { ...state.cakeFlexibleSideVault, ...action.payload }
    //   },
    // )
    // Vault fees
    builder.addCase(fetchCakeVaultFees.fulfilled, (state, action: PayloadAction<SerializedVaultFees>) => {
      const fees = action.payload
      state.cakeVault = { ...state.cakeVault, fees }
    })
    // builder.addCase(fetchCakeFlexibleSideVaultFees.fulfilled, (state, action: PayloadAction<SerializedVaultFees>) => {
    //   const fees = action.payload
    //   state.cakeFlexibleSideVault = { ...state.cakeFlexibleSideVault, fees }
    // })
    // Vault user data
    builder.addCase(fetchCakeVaultUserData.fulfilled, (state, action: PayloadAction<SerializedLockedVaultUser>) => {
      const userData = action.payload
      state.cakeVault = { ...state.cakeVault, userData }
    })
    // IFO
    builder.addCase(fetchIfoPublicDataAsync.fulfilled, (state, action: PayloadAction<PublicIfoData>) => {
      const { ceiling } = action.payload
      state.ifo = { ...state.ifo, ceiling }
    })
    // builder.addCase(
    //   fetchCakeFlexibleSideVaultUserData.fulfilled,
    //   (state, action: PayloadAction<SerializedVaultUser>) => {
    //     const userData = action.payload
    //     state.cakeFlexibleSideVault = { ...state.cakeFlexibleSideVault, userData }
    //   },
    // )
    // builder.addMatcher(
    //   isAnyOf(
    //     updateUserAllowance.fulfilled,
    //     updateUserBalance.fulfilled,
    //     updateUserStakedBalance.fulfilled,
    //     updateUserPendingReward.fulfilled,
    //   ),
    //   (state, action: PayloadAction<{ sousId: number; field: string; value: any }>) => {
    //     const { field, value, sousId } = action.payload
    //     const index = state.data.findIndex((p) => p.sousId === sousId)

    //     if (index >= 0) {
    //       state.data[index] = { ...state.data[index], userData: { ...state.data[index].userData, [field]: value } }
    //     }
    //   },
    // )
  },
})

// Actions
export const { setPoolsPublicData, setPoolPublicData, setPoolUserData, setIfoUserCreditData } = PoolsSlice.actions

export default PoolsSlice.reducer
