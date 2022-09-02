import { Dispatch, createSlice } from '@reduxjs/toolkit'

import { getIndicatorData } from '@/api'
import { getBankBDRFPoolData, getStakingDrfPoolData, getPositionChangeFeeRatioData } from './helper'
import { ConstantState } from '../types'

const initialState: ConstantState = {
  DRFPool: '0',
  bBUSDPool: '0',
  indicator: {},
  posFeeRatio: {}
}

export const getPositionChangeFeeRatioDataAsync = () => async (dispatch: Dispatch) => {
  const data = await getPositionChangeFeeRatioData()
  dispatch(setPosFeeRatioData(data))
}

export const getStakingDrfPoolDataAsync = () => async (dispatch: Dispatch) => {
  const data = await getStakingDrfPoolData()
  dispatch(setDRFPoolData(data))
}

export const getIndicatorDataAsync = () => async (dispatch: Dispatch) => {
  const { data } = await getIndicatorData()
  if (data) dispatch(setIndicatorData(data))
}

export const getBankBDRFPoolDataAsync = () => async (dispatch: Dispatch) => {
  const data = await getBankBDRFPoolData()
  dispatch(setbBUSDPoolData(data))
}

export const constantDataSlice = createSlice({
  name: 'ConstantData',
  initialState,
  reducers: {
    setIndicatorData: (state, action) => {
      state.indicator = action.payload
    },
    setbBUSDPoolData: (state, action) => {
      state.bBUSDPool = action.payload
    },
    setDRFPoolData: (state, action) => {
      state.DRFPool = action.payload
    },
    setPosFeeRatioData: (state, action) => {
      state.posFeeRatio = action.payload
    }
  }
})

// Actions
export const { setPosFeeRatioData, setDRFPoolData, setbBUSDPoolData, setIndicatorData } = constantDataSlice.actions

export default constantDataSlice.reducer
