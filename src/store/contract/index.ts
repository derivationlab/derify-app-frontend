import BN from 'bignumber.js'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getEventsData } from '@/api/events'
import { nonBigNumberInterception } from '@/utils/tools'
import Cache from '@/utils/cache'

import { ContractState, AppThunkDispatch } from '../types'
import { basePairs, getMyPositionsData, getTokenSpotPrice, outputDataDeal } from './helper'

const currentPairIndex = Cache.get('currentPairIndex') ?? 0

const initialState: ContractState = {
  pairs: basePairs,
  currentPair: basePairs[currentPairIndex].token,
  myOrders: [],
  myPositions: [],
  pairsLoaded: false,
  myOrdersLoaded: false,
  myPositionsLoaded: false
}

export const getTokenSpotPriceAsync = createAsyncThunk('ContractData/getTokenSpotPriceAsync', async () => {
  const data = await getTokenSpotPrice()
  return data
})

export const getEventsDataAsync = () => (dispatch: AppThunkDispatch) => {
  getEventsData((data) => {
    if (data.length) {
      // console.info(data)
      const _ = data.map(
        ({ shortDrfPmrRate, shortUsdPmrRate, longUsdPmrRate, longDrfPmrRate, price_change_rate, token, ...rest }) => {
          const long1 = new BN(longDrfPmrRate).plus(longUsdPmrRate)
          const long2 = String(long1)
          // const long2 = String(long1.times(100))
          const longPmrRate = nonBigNumberInterception(long2)

          const short1 = new BN(shortDrfPmrRate).plus(shortUsdPmrRate)
          const short2 = String(short1)
          // const short2 = String(short1.times(100))
          const shortPmrRate = nonBigNumberInterception(short2)

          const price = String(price_change_rate)
          const changeRate = nonBigNumberInterception(price, 4)

          const apyMax = Math.max(Number(longPmrRate), Number(shortPmrRate))

          return {
            ...rest,
            apy: apyMax,
            token: token.toLowerCase(),
            longPmrRate,
            shortPmrRate,
            price_change_rate: changeRate
          }
        }
      )

      dispatch(setPairsExtData(_))
    }
  })
}

export const getMyPositionsDataAsync = (trader: string) => async (dispatch: AppThunkDispatch) => {
  const [myPosition, myOrders] = await getMyPositionsData(trader)
  dispatch(setMyOrdData(myOrders ?? []))
  dispatch(setMyPosData(myPosition ?? []))
}

export const contractDataSlice = createSlice({
  name: 'ContractData',
  initialState,
  reducers: {
    setPairsExtData: (state, action) => {
      state.pairs = outputDataDeal(state.pairs, action.payload)
    },
    setCurrentPair: (state, action) => {
      state.currentPair = action.payload
    },
    setMyPosData: (state, action) => {
      state.myPositions = action.payload
      state.myPositionsLoaded = true
    },
    setMyOrdData: (state, action) => {
      state.myOrders = action.payload
      state.myOrdersLoaded = true
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getTokenSpotPriceAsync.fulfilled, (state, action) => {
      state.pairs = outputDataDeal(state.pairs, action.payload)
      state.pairsLoaded = true
    })
  }
})

// Actions
export const { setPairsExtData, setCurrentPair, setMyPosData, setMyOrdData } = contractDataSlice.actions

export default contractDataSlice.reducer
