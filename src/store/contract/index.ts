import BN from 'bignumber.js'
import { isArray } from 'lodash'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import Cache from '@/utils/cache'
import basePairs from '@/config/pairs'
import { getEventsData } from '@/api'
import { nonBigNumberInterception } from '@/utils/tools'
import { ContractState, AppThunkDispatch } from '../types'
import { getMyPositionsData, getTokenSpotPrice, outputDataDeal } from './helper'

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

export const getEventsDataAsync = () => async (dispatch: AppThunkDispatch) => {
  const { data } = await getEventsData()

  if (isArray(data)) {
    const _ = data.map(
      ({
        shortDrfPmrRate = 0,
        shortUsdPmrRate = 0,
        longUsdPmrRate = 0,
        longDrfPmrRate = 0,
        price_change_rate = 0,
        token,
        ...rest
      }: Record<string, any>) => {
        const long = new BN(longDrfPmrRate).plus(longUsdPmrRate)
        const longPmrRate = nonBigNumberInterception(String(long))

        const short = new BN(shortDrfPmrRate).plus(shortUsdPmrRate)
        const shortPmrRate = nonBigNumberInterception(String(short))

        const changeRate = nonBigNumberInterception(String(price_change_rate), 4)

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
