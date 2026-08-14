import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import keyBy from 'lodash/keyBy'
import type {
  PoolsState,
  PublicIfoData,
  SerializedLockedCakeVault,
  SerializedPool,
  SerializedVaultFees,
  SerializedVaultUser,
} from 'state/types'
import { resetUserState } from '../global/actions'

export const initialPoolVaultState = Object.freeze({
  totalShares: null,
  totalLockedAmount: null,
  pricePerFullShare: null,
  totalDexTokenInVault: null,
  fees: { performanceFee: null, callFee: null, withdrawalFee: null, withdrawalFeePeriod: null },
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

const initialState: PoolsState = {
  data: [],
  userDataLoaded: false,
  cakeVault: initialPoolVaultState,
  ifo: { credit: null, ceiling: null },
}

type PoolUserData = {
  sousId: number
  allowance: unknown
  stakingTokenBalance: unknown
  stakedBalance: unknown
  pendingReward: unknown
}

export const poolsSlice = createSlice({
  name: 'Pools',
  initialState,
  reducers: {
    updatePoolsUserData: (state, action: PayloadAction<{ sousId: number; field: string; value: unknown }>) => {
      const index = state.data.findIndex((pool) => pool.sousId === action.payload.sousId)
      if (index >= 0) {
        state.data[index].userData = { ...state.data[index].userData, [action.payload.field]: action.payload.value }
      }
    },
    setPoolPublicData: (state, action) => {
      const index = state.data.findIndex((pool) => pool.sousId === action.payload.sousId)
      if (index >= 0) state.data[index] = { ...state.data[index], ...action.payload.data }
    },
    setPoolUserData: (state, action) => {
      state.data = state.data.map((pool) =>
        pool.sousId === action.payload.sousId ? { ...pool, userDataLoaded: true, userData: action.payload.data } : pool,
      )
    },
    setPoolsPublicData: (state, action: PayloadAction<SerializedPool[]>) => {
      state.data = action.payload
    },
    setIfoUserCreditData: (state, action) => {
      state.ifo = { ...state.ifo, credit: action.payload }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      state.data = state.data.map(({ userData: _userData, ...pool }) => ({ ...pool }))
      state.userDataLoaded = false
      state.cakeVault = { ...state.cakeVault, userData: initialPoolVaultState.userData }
    })
    builder.addCase('pool/fetchPoolsUserData/fulfilled', (state, action: PayloadAction<PoolUserData[]>) => {
      const userDataBySousId = keyBy(action.payload, 'sousId')
      state.data = state.data.map((pool) => ({
        ...pool,
        userDataLoaded: true,
        userData: userDataBySousId[pool.sousId],
      }))
      state.userDataLoaded = true
    })
    builder.addCase('pool/fetchPoolsUserData/rejected', (_state, action) => {
      console.error('[Pools Action] Error fetching pool user data', action.payload)
    })
    builder.addCase(
      'cakeVault/fetchPublicData/fulfilled',
      (state, action: PayloadAction<SerializedLockedCakeVault>) => {
        state.cakeVault = { ...state.cakeVault, ...action.payload }
      },
    )
    builder.addCase('cakeVault/fetchFees/fulfilled', (state, action: PayloadAction<SerializedVaultFees>) => {
      state.cakeVault = { ...state.cakeVault, fees: action.payload }
    })
    builder.addCase('cakeVault/fetchUser/fulfilled', (state, action: PayloadAction<SerializedVaultUser>) => {
      state.cakeVault = { ...state.cakeVault, userData: action.payload }
    })
    builder.addCase('ifoVault/fetchIfoPublicDataAsync/fulfilled', (state, action: PayloadAction<PublicIfoData>) => {
      state.ifo = { ...state.ifo, ceiling: action.payload.ceiling }
    })
  },
})

export default poolsSlice.reducer
