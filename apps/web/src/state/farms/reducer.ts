import type { SerializedFarm, SerializedFarmsState } from '@pancakeswap/farms'
import { createSlice, type AnyAction, type PayloadAction } from '@reduxjs/toolkit'
import stringify from 'fast-json-stable-stringify'
import keyBy from 'lodash/keyBy'
import { resetUserState } from '../global/actions'

const initialState: SerializedFarmsState = {
  data: [],
  chainId: null,
  loadArchivedFarmsData: false,
  userDataLoaded: false,
  loadingKeys: {},
}

type FarmUserDataResponse = {
  pid: number
  allowance: string
  tokenBalance: string
  stakedBalance: string
  earnings: string
}

const loadingKey = (action: AnyAction, requestStatus: 'pending' | 'fulfilled' | 'rejected') =>
  stringify({ arg: action.meta?.arg, type: action.type.split(`/${requestStatus}`)[0] })

export const farmsSlice = createSlice({
  name: 'Farms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      state.data = state.data.map((farm) => ({
        ...farm,
        userData: { allowance: '0', tokenBalance: '0', stakedBalance: '0', earnings: '0' },
      }))
      state.userDataLoaded = false
    })
    builder.addCase(
      'farms/fetchInitialFarmsData/fulfilled',
      (state, action: PayloadAction<{ data: SerializedFarm[]; chainId: number }>) => {
        state.data = action.payload.data
        state.chainId = action.payload.chainId
      },
    )
    builder.addCase(
      'farms/fetchFarmsPublicDataAsync/fulfilled',
      (state, action: PayloadAction<[SerializedFarm[], number, number]>) => {
        const [farmPayload, poolLength, regularCakePerBlock] = action.payload
        const farmPayloadPidMap = keyBy(farmPayload, 'pid')
        state.data = state.data.map((farm) => ({ ...farm, ...farmPayloadPidMap[farm.pid] }))
        state.poolLength = poolLength
        state.regularCakePerBlock = regularCakePerBlock
        state.loadingKeys[loadingKey(action, 'fulfilled')] = false
      },
    )
    builder.addCase(
      'farms/fetchFarmUserDataAsync/fulfilled',
      (state, action: PayloadAction<FarmUserDataResponse[]>) => {
        const userDataMap = keyBy(action.payload, 'pid')
        state.data = state.data.map((farm) => {
          const userData = userDataMap[farm.pid]
          return userData ? { ...farm, userData } : farm
        })
        state.userDataLoaded = true
        state.loadingKeys[loadingKey(action, 'fulfilled')] = false
      },
    )
    builder.addCase('farms/fetchFarmsPublicDataAsync/pending', (state, action) => {
      state.loadingKeys[loadingKey(action, 'pending')] = true
    })
    builder.addCase('farms/fetchFarmUserDataAsync/pending', (state, action) => {
      state.loadingKeys[loadingKey(action, 'pending')] = true
    })
    builder.addCase('farms/fetchFarmsPublicDataAsync/rejected', (state, action) => {
      state.loadingKeys[loadingKey(action, 'rejected')] = false
    })
    builder.addCase('farms/fetchFarmUserDataAsync/rejected', (state, action) => {
      state.loadingKeys[loadingKey(action, 'rejected')] = false
    })
  },
})

export default farmsSlice.reducer
