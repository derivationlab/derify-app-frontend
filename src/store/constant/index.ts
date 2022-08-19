import { Dispatch, createSlice } from '@reduxjs/toolkit'

import { getIndicatorData } from '@/api'
import { getBTCAddress, getETHAddress } from '@/utils/addressHelpers'
import {
  getBankBDRFPoolData,
  getStakingDrfPoolData,
  getCurrentPositionsAmountData,
  getPositionChangeFeeRatioData
} from './helper'
import { ConstantState } from '../types'

const initialState: ConstantState = {
  DRFPool: '0',
  bDRFPool: '0',
  indicator: {},
  positions: [],
  posFeeRatio: {}
}

export const getCurrentPositionsAmountDataAsync = () => async (dispatch: Dispatch) => {
  // todo check often pending
  const eth = await getCurrentPositionsAmountData(getETHAddress())
  const btc = await getCurrentPositionsAmountData(getBTCAddress())
  const all = await getCurrentPositionsAmountData('all')
  /**
   long_position_amount: "0"
   short_position_amount: "0"
   */
  dispatch(
    setPositionsData([
      { ...all, token: '' },
      { ...btc, token: getBTCAddress() },
      { ...eth, token: getETHAddress() }
    ])
  )
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
  dispatch(setBDRFPoolData(data))
}

export const constantDataSlice = createSlice({
  name: 'ConstantData',
  initialState,
  reducers: {
    setIndicatorData: (state, action) => {
      state.indicator = action.payload
    },
    setBDRFPoolData: (state, action) => {
      state.bDRFPool = action.payload
    },
    setDRFPoolData: (state, action) => {
      state.DRFPool = action.payload
    },
    setPositionsData: (state, action) => {
      state.positions = action.payload
    },
    setPosFeeRatioData: (state, action) => {
      state.posFeeRatio = action.payload
    }
  }
})

// Actions
export const { setPositionsData, setPosFeeRatioData, setDRFPoolData, setBDRFPoolData, setIndicatorData } =
  constantDataSlice.actions

export default constantDataSlice.reducer
