import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { TraderState } from '../types'
import {
  getTraderAccountData,
  getTraderVariablesData,
  getTraderAsBrokerData,
  getTraderBoundBrokerData,
  getPMRewardData,
  getBondInfoData,
  getStakingInfoData
} from './helper'

const initialState: TraderState = {
  trader: {},
  broker: {},
  brokerBound: {},
  brokerLoaded: false,
  brokerBoundLoaded: false
}

export const getTraderDataAsync = createAsyncThunk('TraderData/getTraderDataAsync', async (trader: string) => {
  const data1 = await getTraderAccountData(trader)
  const data2 = await getTraderVariablesData(trader)
  return { ...data1, ...data2 }
})

export const getBrokerDataAsync = createAsyncThunk('TraderData/getBrokerDataAsync', async (trader: string) => {
  const data = await getTraderAsBrokerData(trader)
  return data
})

export const getBrokerBoundDataAsync = createAsyncThunk(
  'TraderData/getBrokerBoundDataAsync',
  async (trader: string) => {
    const data = await getTraderBoundBrokerData(trader)
    return data
  }
)

export const getPMRewardDataAsync = createAsyncThunk('TraderData/getPMRewardDataAsync', async (trader: string) => {
  const data = await getPMRewardData(trader)
  // console.info(data)
  return data
})

export const getBondInfoDataAsync = createAsyncThunk('TraderData/getBondInfoDataAsync', async (trader: string) => {
  const data = await getBondInfoData(trader)
  // console.info(data)
  return data
})

export const getStakingInfoDataAsync = createAsyncThunk(
  'TraderData/getStakingInfoDataAsync',
  async (trader: string) => {
    const data = await getStakingInfoData(trader)
    // console.info(data)
    return data
  }
)

export const traderDataSlice = createSlice({
  name: 'TraderData',
  initialState,
  reducers: {
    clearTraderInfo: (state) => {
      state.trader = {}
      state.broker = {}
      state.brokerBound = {}
      state.brokerLoaded = false
      state.brokerBoundLoaded = false
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getTraderDataAsync.fulfilled, (state, action) => {
      state.trader = { ...state.trader, ...action.payload }
    })
    builder.addCase(getBrokerDataAsync.pending, (state, action) => {
      state.brokerLoaded = false
    })
    builder.addCase(getBrokerDataAsync.fulfilled, (state, action) => {
      state.broker = action.payload
      state.brokerLoaded = true
    })
    builder.addCase(getBrokerBoundDataAsync.pending, (state, action) => {
      state.brokerBoundLoaded = false
    })
    builder.addCase(getBrokerBoundDataAsync.fulfilled, (state, action) => {
      state.brokerBound = action.payload
      state.brokerBoundLoaded = true
    })
    builder.addCase(getPMRewardDataAsync.fulfilled, (state, action) => {
      state.trader = { ...state.trader, ...action.payload }
    })
    builder.addCase(getBondInfoDataAsync.fulfilled, (state, action) => {
      state.trader = { ...state.trader, ...action.payload }
    })
    builder.addCase(getStakingInfoDataAsync.fulfilled, (state, action) => {
      state.trader = { ...state.trader, ...action.payload }
    })
  }
})

// Actions
export const { clearTraderInfo } = traderDataSlice.actions

export default traderDataSlice.reducer
